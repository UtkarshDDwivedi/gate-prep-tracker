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
      is_completed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    ALTER TABLE subjects ADD COLUMN IF NOT EXISTS is_completed BOOLEAN NOT NULL DEFAULT FALSE;
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

  initialized = true;
}
