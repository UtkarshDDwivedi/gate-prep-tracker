import { NextRequest, NextResponse } from "next/server";
import { sql, ensureDbSchema } from "@/lib/db";
import { auth } from "@/lib/auth/server";

async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const session = await auth.getSession();
    if (session?.data?.user?.id) {
      return session.data.user.id;
    }
  } catch {
    // unauthenticated context
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    void request;
    await ensureDbSchema();
    const userId = await getAuthenticatedUserId();

    // Unauthenticated users see zero subjects
    if (!userId) {
      return NextResponse.json({
        status: "ok",
        authenticated: false,
        subjects: [],
      });
    }

    const subjects = await sql`
      SELECT 
        s.id,
        s.title,
        s.icon,
        s.total_lectures,
        s.completed_lectures,
        (s.is_completed OR s.completed_lectures >= s.total_lectures) as is_completed,
        COALESCE(s.teacher, '') as teacher,
        s.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'month', p.month,
              'is_urgent', p.is_urgent
            )
          ) FILTER (WHERE p.month IS NOT NULL),
          '[]'
        ) as monthly_plans
      FROM subjects s
      LEFT JOIN subject_monthly_plans p ON s.id = p.subject_id
      WHERE s.user_id = ${userId}
      GROUP BY s.id
      ORDER BY s.created_at ASC
    `;

    return NextResponse.json({
      status: "ok",
      authenticated: true,
      userId,
      subjects,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ status: "error", error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDbSchema();
    const userId = await getAuthenticatedUserId();

    // Reject mutations from unauthenticated users with 401
    if (!userId) {
      return NextResponse.json(
        {
          status: "error",
          error: "Authentication required. Please sign in to manage your GATE preparation subjects.",
          code: "UNAUTHENTICATED",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === "create_subject") {
      const {
        title,
        icon = "laptop",
        totalLectures,
        completedLectures = 0,
        teacher = "",
        month,
        isUrgent = false,
        isCompleted = false,
        date,
      } = body;
      const id = "sub-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
      const isComp = Boolean(isCompleted || Number(completedLectures) >= Number(totalLectures));
      const finalCompleted = isComp ? Number(totalLectures) : Number(completedLectures);

      await sql`
        INSERT INTO subjects (id, user_id, title, icon, total_lectures, completed_lectures, is_completed, teacher)
        VALUES (${id}, ${userId}, ${title}, ${icon}, ${Number(totalLectures)}, ${finalCompleted}, ${isComp}, ${String(teacher || "").trim()})
      `;

      if (finalCompleted > 0) {
        const logId = "log-init-" + id;
        const targetDate = (date && typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) ? date : null;
        await sql`
          INSERT INTO lecture_logs (id, subject_id, lectures_completed, log_date, created_at)
          VALUES (${logId}, ${id}, ${finalCompleted}, COALESCE(${targetDate}::date, (NOW() AT TIME ZONE 'Asia/Kolkata')::date), NOW())
        `;
      }

      if (month) {
        const planId = "plan-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
        await sql`
          INSERT INTO subject_monthly_plans (id, subject_id, month, is_urgent)
          VALUES (${planId}, ${id}, ${month}, ${Boolean(isUrgent)})
          ON CONFLICT (subject_id, month) DO UPDATE SET is_urgent = EXCLUDED.is_urgent
        `;
      }

      return NextResponse.json({ status: "ok", id });
    }

    if (action === "toggle_subject_completed") {
      const { subjectId, completed, date } = body;
      const isComp = Boolean(completed);

      const current = await sql`
        SELECT completed_lectures, total_lectures 
        FROM subjects 
        WHERE id = ${subjectId} AND user_id = ${userId}
      `;
      if (current.length === 0) {
        return NextResponse.json({ status: "error", error: "Subject not found" }, { status: 404 });
      }

      const sub = current[0];
      const oldCompleted = Number(sub.completed_lectures);
      const total = Number(sub.total_lectures);
      const newCompleted = isComp ? total : (oldCompleted >= total ? 0 : oldCompleted);

      await sql`
        UPDATE subjects 
        SET is_completed = ${isComp},
            completed_lectures = ${newCompleted}
        WHERE id = ${subjectId} AND user_id = ${userId}
      `;

      const diff = newCompleted - oldCompleted;
      if (diff !== 0) {
        const targetDate = (date && typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) ? date : null;
        const logId = "log-toggle-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
        await sql`
          INSERT INTO lecture_logs (id, subject_id, lectures_completed, log_date, created_at)
          VALUES (${logId}, ${subjectId}, ${diff}, COALESCE(${targetDate}::date, (NOW() AT TIME ZONE 'Asia/Kolkata')::date), NOW())
        `;
      }

      return NextResponse.json({ status: "ok", completedLectures: newCompleted });
    }

    if (action === "log_lecture") {
      const { subjectId, delta = 1, date } = body;
      const numDelta = Number(delta);

      const current = await sql`
        SELECT completed_lectures, total_lectures 
        FROM subjects 
        WHERE id = ${subjectId} AND user_id = ${userId}
      `;
      if (current.length === 0) {
        return NextResponse.json({ status: "error", error: "Subject not found" }, { status: 404 });
      }

      const sub = current[0];
      const oldCompleted = Number(sub.completed_lectures);
      const total = Number(sub.total_lectures);
      const newCompleted = Math.max(0, Math.min(total, oldCompleted + numDelta));
      const actualDelta = newCompleted - oldCompleted;

      if (actualDelta !== 0) {
        const isComp = newCompleted >= total;
        await sql`
          UPDATE subjects 
          SET completed_lectures = ${newCompleted},
              is_completed = ${isComp}
          WHERE id = ${subjectId} AND user_id = ${userId}
        `;

        const targetDate = (date && typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) ? date : null;
        const logId = "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
        await sql`
          INSERT INTO lecture_logs (id, subject_id, lectures_completed, log_date, created_at)
          VALUES (${logId}, ${subjectId}, ${actualDelta}, COALESCE(${targetDate}::date, (NOW() AT TIME ZONE 'Asia/Kolkata')::date), NOW())
        `;
      }

      return NextResponse.json({ status: "ok", completedLectures: newCompleted });
    }

    if (action === "toggle_urgent") {
      const { subjectId, month, isUrgent } = body;

      // Ensure subject belongs to user
      const owns = await sql`SELECT id FROM subjects WHERE id = ${subjectId} AND user_id = ${userId}`;
      if (owns.length === 0) {
        return NextResponse.json({ status: "error", error: "Subject not found" }, { status: 404 });
      }

      const planId = "plan-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
      await sql`
        INSERT INTO subject_monthly_plans (id, subject_id, month, is_urgent)
        VALUES (${planId}, ${subjectId}, ${month}, ${Boolean(isUrgent)})
        ON CONFLICT (subject_id, month) DO UPDATE SET is_urgent = EXCLUDED.is_urgent
      `;

      return NextResponse.json({ status: "ok" });
    }

    if (action === "add_to_month") {
      const { subjectId, month, isUrgent = false } = body;

      const owns = await sql`SELECT id FROM subjects WHERE id = ${subjectId} AND user_id = ${userId}`;
      if (owns.length === 0) {
        return NextResponse.json({ status: "error", error: "Subject not found" }, { status: 404 });
      }

      const planId = "plan-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
      await sql`
        INSERT INTO subject_monthly_plans (id, subject_id, month, is_urgent)
        VALUES (${planId}, ${subjectId}, ${month}, ${Boolean(isUrgent)})
        ON CONFLICT (subject_id, month) DO NOTHING
      `;

      return NextResponse.json({ status: "ok" });
    }

    if (action === "remove_from_month") {
      const { subjectId, month } = body;
      await sql`
        DELETE FROM subject_monthly_plans 
        WHERE subject_id = ${subjectId} AND month = ${month}
        AND subject_id IN (SELECT id FROM subjects WHERE user_id = ${userId})
      `;
      return NextResponse.json({ status: "ok" });
    }

    if (action === "update_subject") {
      const { subjectId, title, icon, totalLectures, completedLectures, teacher, date } = body;
      const newTotal = parseInt(String(totalLectures), 10);
      if (!subjectId || isNaN(newTotal) || newTotal < 1) {
        return NextResponse.json(
          { status: "error", error: "Total lectures must be at least 1" },
          { status: 400 }
        );
      }

      const current = await sql`
        SELECT completed_lectures, is_completed, title, icon, teacher
        FROM subjects
        WHERE id = ${subjectId} AND user_id = ${userId}
      `;
      if (current.length === 0) {
        return NextResponse.json({ status: "error", error: "Subject not found" }, { status: 404 });
      }

      const existing = current[0];
      const oldCompleted = Number(existing.completed_lectures);
      const reqCompleted = completedLectures !== undefined ? parseInt(String(completedLectures), 10) : oldCompleted;
      const newCompleted = Math.max(0, Math.min(newTotal, isNaN(reqCompleted) ? 0 : reqCompleted));
      const isComp = newCompleted >= newTotal;
      const newTitle = title ? String(title).trim() : existing.title;
      const newIcon = icon ? String(icon).trim() : existing.icon;
      const newTeacher = teacher !== undefined ? String(teacher).trim() : (existing.teacher || "");

      await sql`
        UPDATE subjects
        SET total_lectures = ${newTotal},
            completed_lectures = ${newCompleted},
            is_completed = ${isComp},
            title = ${newTitle},
            icon = ${newIcon},
            teacher = ${newTeacher}
        WHERE id = ${subjectId} AND user_id = ${userId}
      `;

      // Log difference in lecture_logs so history reflects user's actual progress
      const diff = newCompleted - oldCompleted;
      if (diff !== 0) {
        const targetDate = (date && typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) ? date : null;
        const logId = "log-edit-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
        await sql`
          INSERT INTO lecture_logs (id, subject_id, lectures_completed, log_date, created_at)
          VALUES (${logId}, ${subjectId}, ${diff}, COALESCE(${targetDate}::date, (NOW() AT TIME ZONE 'Asia/Kolkata')::date), NOW())
        `;
      }

      return NextResponse.json({ status: "ok" });
    }

    if (action === "delete_subject") {
      const { subjectId } = body;
      await sql`DELETE FROM subjects WHERE id = ${subjectId} AND user_id = ${userId}`;
      return NextResponse.json({ status: "ok" });
    }

    return NextResponse.json({ status: "error", error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ status: "error", error: message }, { status: 500 });
  }
}
