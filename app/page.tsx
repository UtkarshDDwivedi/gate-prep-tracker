import { sql } from "@/lib/db";
import { auth } from "@/lib/auth/server";

export const instant = false;

interface DbQueryResult {
  connected: number;
  database: string;
  version: string;
}

export default async function Home() {
  let dbStatus: { connected: boolean; database?: string; version?: string; error?: string } = {
    connected: false,
  };

  try {
    const result = await sql`SELECT 1 as connected, current_database() as database, version() as version`;
    if (result && result.length > 0) {
      const row = result[0] as unknown as DbQueryResult;
      dbStatus = {
        connected: true,
        database: row.database,
        version: row.version,
      };
    }
  } catch (err: unknown) {
    dbStatus = {
      connected: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  const authStatus: { active: boolean; baseUrl?: string; userEmail?: string | null; error?: string } = {
    active: false,
    baseUrl: process.env.NEON_AUTH_BASE_URL,
    userEmail: null,
  };

  try {
    const session = await auth.getSession();
    authStatus.active = true;
    authStatus.userEmail = session.data?.user?.email ?? null;
  } catch (err: unknown) {
    authStatus.error = err instanceof Error ? err.message : String(err);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 sm:p-12 font-sans">
      <main className="max-w-3xl mx-auto flex flex-col gap-8">
        <header className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight">GATE Prep Tracker</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Powered by Neon Serverless Postgres &amp; Neon Managed Better Auth
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Postgres Card */}
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Lakebase Postgres</h2>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  dbStatus.connected
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                }`}
              >
                {dbStatus.connected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <dl className="text-sm space-y-1.5 text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <dt>Branch:</dt>
                <dd className="font-mono text-xs text-zinc-900 dark:text-zinc-200">
                  {process.env.NEON_BRANCH || "unknown"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Database:</dt>
                <dd className="font-mono text-xs text-zinc-900 dark:text-zinc-200">
                  {dbStatus.database || "neondb"}
                </dd>
              </div>
              {dbStatus.error && (
                <div className="text-xs text-rose-600 mt-2">{dbStatus.error}</div>
              )}
            </dl>
          </div>

          {/* Auth Card */}
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Neon Auth</h2>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  authStatus.active
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                }`}
              >
                {authStatus.active ? "Ready" : "Inactive"}
              </span>
            </div>
            <dl className="text-sm space-y-1.5 text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <dt>Provider:</dt>
                <dd className="font-mono text-xs text-zinc-900 dark:text-zinc-200">Managed Better Auth</dd>
              </div>
              <div className="flex justify-between">
                <dt>Session:</dt>
                <dd className="font-mono text-xs text-zinc-900 dark:text-zinc-200">
                  {authStatus.userEmail ?? "Unauthenticated"}
                </dd>
              </div>
              {authStatus.error && (
                <div className="text-xs text-rose-600 mt-2">{authStatus.error}</div>
              )}
            </dl>
          </div>
        </section>

        <section className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <h3 className="font-semibold mb-2">Service Test Endpoints</h3>
          <ul className="text-sm space-y-2 font-mono">
            <li>
              <a
                href="/api/db-test"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                /api/db-test
              </a>{" "}
              - Neon Postgres query status
            </li>
            <li>
              <a
                href="/api/auth-test"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                /api/auth-test
              </a>{" "}
              - Neon Auth session endpoint
            </li>
            <li>
              <span className="text-zinc-500">/api/auth/*</span> - Neon Managed Better Auth handler
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
