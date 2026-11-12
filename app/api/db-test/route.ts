import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    void request;
    const result = await sql`SELECT 1 as connected, current_database() as database, version() as version`;
    return NextResponse.json({
      status: "ok",
      service: "postgres",
      branch: process.env.NEON_BRANCH,
      branchId: process.env.NEON_BRANCH_ID,
      result: result[0],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "error", service: "postgres", error: message },
      { status: 500 }
    );
  }
}
