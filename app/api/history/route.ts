import { NextRequest, NextResponse } from "next/server";
import { sql, ensureDbSchema } from "@/lib/db";
import { auth } from "@/lib/auth/server";

export async function GET(request: NextRequest) {
  try {
    void request;
    await ensureDbSchema();

    let userId: string | null = null;
    try {
      const session = await auth.getSession();
      if (session?.data?.user?.id) {
        userId = session.data.user.id;
      }
    } catch {
      // unauthenticated
    }

    if (!userId) {
      return NextResponse.json({
        status: "ok",
        authenticated: false,
        days: [],
        stats: null,
      });
    }

    const { searchParams } = new URL(request.url);
    const tzParam = searchParams.get("tz") || "Asia/Kolkata";
    const safeTz = /^[A-Za-z0-9_/+-]+$/.test(tzParam) ? tzParam : "Asia/Kolkata";

    // Check if any subjects have discrepancies between completed_lectures and lecture_logs
    const subjectsDiscrepancies = await sql`
      SELECT s.id, s.completed_lectures, s.created_at, COALESCE(SUM(l.lectures_completed), 0)::int as logged_sum
      FROM subjects s
      LEFT JOIN lecture_logs l ON s.id = l.subject_id
      WHERE s.user_id = ${userId}
      GROUP BY s.id, s.completed_lectures, s.created_at
      HAVING COALESCE(SUM(l.lectures_completed), 0) != s.completed_lectures
    `;

    for (const sub of subjectsDiscrepancies) {
      const diff = Number(sub.completed_lectures) - Number(sub.logged_sum);
      if (diff !== 0) {
        const isBackfill = Number(sub.logged_sum) === 0;
        const logId = (isBackfill ? "log-init-" : "log-sync-") + sub.id + "-" + Date.now();
        if (isBackfill) {
          await sql`
            INSERT INTO lecture_logs (id, subject_id, lectures_completed, log_date, created_at)
            VALUES (${logId}, ${sub.id}, ${diff}, (${sub.created_at}::timestamptz AT TIME ZONE ${safeTz})::date, ${sub.created_at})
          `;
        } else {
          await sql`
            INSERT INTO lecture_logs (id, subject_id, lectures_completed, log_date, created_at)
            VALUES (${logId}, ${sub.id}, ${diff}, (NOW() AT TIME ZONE ${safeTz})::date, NOW())
          `;
        }
      }
    }

    // Query daily logs grouped by local calendar date and subject
    const rawLogs = await sql`
      SELECT 
        TO_CHAR(COALESCE(l.log_date, (l.created_at AT TIME ZONE ${safeTz})::date), 'YYYY-MM-DD') as date_str,
        l.subject_id,
        s.title as subject_title,
        s.icon as subject_icon,
        SUM(l.lectures_completed)::int as count
      FROM lecture_logs l
      JOIN subjects s ON l.subject_id = s.id
      WHERE s.user_id = ${userId}
      GROUP BY date_str, l.subject_id, s.title, s.icon
      HAVING SUM(l.lectures_completed) > 0
      ORDER BY date_str ASC, s.title ASC
    `;

    // Group logs by date
    const daysMap = new Map<string, {
      date: string;
      totalLectures: number;
      subjects: Array<{
        subjectId: string;
        title: string;
        icon: string;
        count: number;
      }>;
    }>();

    for (const row of rawLogs) {
      const d = row.date_str as string;
      if (!daysMap.has(d)) {
        daysMap.set(d, {
          date: d,
          totalLectures: 0,
          subjects: [],
        });
      }
      const dayEntry = daysMap.get(d)!;
      dayEntry.totalLectures += Number(row.count);
      dayEntry.subjects.push({
        subjectId: row.subject_id,
        title: row.subject_title,
        icon: row.subject_icon,
        count: Number(row.count),
      });
    }

    // Convert map to sorted array (starting from the very first day)
    const sortedDays = Array.from(daysMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Assign Day numbers (Day 1, Day 2, etc.)
    const days = sortedDays.map((d, index) => ({
      ...d,
      dayNumber: index + 1,
    }));

    // Calculate overall stats
    const totalDays = days.length;
    const totalLectures = days.reduce((sum, d) => sum + d.totalLectures, 0);
    const dailyAverage = totalDays > 0 ? (totalLectures / totalDays).toFixed(1) : "0";
    const firstDate = days.length > 0 ? days[0].date : null;
    const lastDate = days.length > 0 ? days[days.length - 1].date : null;

    let bestDay: { date: string; count: number; dayNumber: number } | null = null;
    for (const d of days) {
      if (!bestDay || d.totalLectures > bestDay.count) {
        bestDay = { date: d.date, count: d.totalLectures, dayNumber: d.dayNumber };
      }
    }

    return NextResponse.json({
      status: "ok",
      authenticated: true,
      userId,
      days,
      stats: {
        totalDays,
        totalLectures,
        dailyAverage,
        firstDate,
        lastDate,
        bestDay,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ status: "error", error: message }, { status: 500 });
  }
}

