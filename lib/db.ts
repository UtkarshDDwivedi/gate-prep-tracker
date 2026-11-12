import dns from "node:dns";
if (dns && typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

import { neon } from "@neondatabase/serverless";

const dbUrl =
  process.env.DATABASE_URL ||
  "postgres://placeholder:placeholder@localhost:5432/placeholder";

export const sql = neon(dbUrl);

let initialized = false;

export async function ensureDbSchema() {
  if (initialized) return;

  await sql`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default_user',
      title TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'laptop',
      total_lectures INTEGER NOT NULL DEFAULT 30,
      completed_lectures INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS subject_monthly_plans (
      id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      month TEXT NOT NULL, -- e.g. '2026-11', '2026-12', '2027-01'
      is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(subject_id, month)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS lecture_logs (
      id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      log_date DATE NOT NULL DEFAULT CURRENT_DATE,
      lectures_completed INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // Seed default subjects from mockup if none exist
  const existing = await sql`SELECT count(*)::int as count FROM subjects`;
  if (existing[0]?.count === 0) {
    const s1 = "sub-os";
    const s2 = "sub-cprog";
    const s3 = "sub-dsa";
    const s4 = "sub-algo";

    await sql`
      INSERT INTO subjects (id, user_id, title, icon, total_lectures, completed_lectures)
      VALUES 
        (${s1}, 'default_user', 'Operating Systems', 'laptop', 45, 28),
        (${s2}, 'default_user', 'C Programming', 'code', 20, 12),
        (${s3}, 'default_user', 'Data Structures', 'layers', 35, 10),
        (${s4}, 'default_user', 'Algorithms', 'graph', 30, 8);
    `;

    await sql`
      INSERT INTO subject_monthly_plans (id, subject_id, month, is_urgent)
      VALUES
        ('plan-os-nov', ${s1}, '2026-11', true),
        ('plan-c-nov', ${s2}, '2026-11', true),
        ('plan-dsa-nov', ${s3}, '2026-11', false),
        ('plan-algo-nov', ${s4}, '2026-11', false),
        -- Carry-over examples for Dec & Jan if needed
        ('plan-dsa-dec', ${s3}, '2026-12', true),
        ('plan-algo-dec', ${s4}, '2026-12', true);
    `;
  }

  initialized = true;
}
