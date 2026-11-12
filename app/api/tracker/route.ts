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
      const { title, icon = "laptop", totalLectures, completedLectures = 0, month, isUrgent = false } = body;
      const id = "sub-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);

      await sql`
        INSERT INTO subjects (id, user_id, title, icon, total_lectures, completed_lectures)
        VALUES (${id}, ${userId}, ${title}, ${icon}, ${Number(totalLectures)}, ${Number(completedLectures)})
      `;

      if (Number(completedLectures) > 0) {
        const logId = "log-init-" + id;
        await sql`
          INSERT INTO lecture_logs (id, subject_id, lectures_completed, log_date, created_at)
          VALUES (${logId}, ${id}, ${Number(completedLectures)}, CURRENT_DATE, NOW())
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

    if (action === "log_lecture") {
      const { subjectId, delta = 1 } = body;
      
      // Update subject completed lectures clamped between 0 and total_lectures
      await sql`
        UPDATE subjects 
        SET completed_lectures = GREATEST(0, LEAST(total_lectures, completed_lectures + ${Number(delta)}))
        WHERE id = ${subjectId} AND user_id = ${userId}
      `;

      // Also record in lecture logs
      const logId = "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
      await sql`
        INSERT INTO lecture_logs (id, subject_id, lectures_completed)
        VALUES (${logId}, ${subjectId}, ${Number(delta)})
      `;

      const updated = await sql`
        SELECT completed_lectures, total_lectures 
        FROM subjects 
        WHERE id = ${subjectId} AND user_id = ${userId}
      `;

      return NextResponse.json({ status: "ok", subject: updated[0] });
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
