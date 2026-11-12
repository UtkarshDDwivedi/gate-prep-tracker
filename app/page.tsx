import { sql, ensureDbSchema } from "@/lib/db";
import { GateTrackerApp } from "@/components/GateTrackerApp";
import { Subject } from "@/components/MonthlySubjectsCard";

export const instant = false;

export default async function Home() {
  let initialSubjects: Subject[] = [];

  try {
    await ensureDbSchema();
    const result = await sql`
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
    initialSubjects = result as unknown as Subject[];
  } catch (err: unknown) {
    console.error("Failed to load initial subjects from database:", err);
  }

  return <GateTrackerApp initialSubjects={initialSubjects} />;
}
