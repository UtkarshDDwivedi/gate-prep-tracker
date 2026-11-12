import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

export async function GET(request: NextRequest) {
  try {
    void request;
    const session = await auth.getSession();
    return NextResponse.json({
      status: "ok",
      service: "neon-auth",
      baseUrl: process.env.NEON_AUTH_BASE_URL,
      session: session.data ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "error", service: "neon-auth", error: message },
      { status: 500 }
    );
  }
}
