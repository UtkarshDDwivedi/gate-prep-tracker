import { sql, ensureDbSchema } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { GateTrackerApp } from "@/components/GateTrackerApp";
import { Subject } from "@/components/MonthlySubjectsCard";

export const instant = false;

export default async function Home() {
  let initialSubjects: Subject[] = [];

  try {
    await ensureDbSchema();
    const session = await auth.getSession();
    const userId = session?.data?.user?.id;

    // Unauthenticated users see zero subjects
    if (userId) {
      const result = await sql`
        SELECT 
          s.id,
          s.title,
          s.icon,
          s.total_lectures,
          s.completed_lectures,
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
      initialSubjects = result as unknown as Subject[];
    }
  } catch {
    // Unauthenticated users or prerendering: always default to zero subjects
    initialSubjects = [];
  }

  return <GateTrackerApp initialSubjects={initialSubjects} />;
}
