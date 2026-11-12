import { NextRequest, NextResponse } from "next/server";
import { sql, ensureDbSchema } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    void request;
    await ensureDbSchema();

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
      GROUP BY s.id
      ORDER BY s.created_at ASC
    `;

    return NextResponse.json({
      status: "ok",
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
    const body = await request.json();
    const { action } = body;

    if (action === "create_subject") {
      const { title, icon = "laptop", totalLectures, completedLectures = 0, month, isUrgent = false } = body;
      const id = "sub-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);

      await sql`
        INSERT INTO subjects (id, title, icon, total_lectures, completed_lectures)
        VALUES (${id}, ${title}, ${icon}, ${Number(totalLectures)}, ${Number(completedLectures)})
      `;

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
        WHERE id = ${subjectId}
      `;

      // Also record in lecture logs
      const logId = "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
      await sql`
        INSERT INTO lecture_logs (id, subject_id, lectures_completed)
        VALUES (${logId}, ${subjectId}, ${Number(delta)})
      `;

      const updated = await sql`SELECT completed_lectures, total_lectures FROM subjects WHERE id = ${subjectId}`;
      return NextResponse.json({ status: "ok", subject: updated[0] });
    }

    if (action === "toggle_urgent") {
      const { subjectId, month, isUrgent } = body;
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
      const planId = "plan-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);

      await sql`
        INSERT INTO subject_monthly_plans (id, subject_id, month, is_urgent)
        VALUES (${planId}, ${subjectId}, ${month}, ${Boolean(isUrgent)})
        ON CONFLICT (subject_id, month) DO UPDATE SET is_urgent = EXCLUDED.is_urgent
      `;

      return NextResponse.json({ status: "ok" });
    }

    if (action === "remove_from_month") {
      const { subjectId, month } = body;
      await sql`
        DELETE FROM subject_monthly_plans 
        WHERE subject_id = ${subjectId} AND month = ${month}
      `;
      return NextResponse.json({ status: "ok" });
    }

    if (action === "delete_subject") {
      const { subjectId } = body;
      await sql`DELETE FROM subjects WHERE id = ${subjectId}`;
      return NextResponse.json({ status: "ok" });
    }

    return NextResponse.json({ status: "error", error: "Unknown action" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ status: "error", error: message }, { status: 500 });
  }
}

