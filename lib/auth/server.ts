import dns from "node:dns";
import { createNeonAuth } from "@neon/auth/next/server";

// Ensure IPv4 is prioritized for upstream requests on dual-stack environments (Windows / local networks)
if (dns && typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const baseUrl =
  process.env.NEON_AUTH_BASE_URL ||
  "https://placeholder.neonauth.tech/neondb/auth";

const cookieSecret =
  process.env.NEON_AUTH_COOKIE_SECRET ||
  "placeholder-cookie-secret-min-32-chars-long";

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
  },
});
