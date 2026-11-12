import dns from "node:dns";
import { createNeonAuth } from "@neon/auth/next/server";

// Ensure IPv4 is prioritized for upstream requests on dual-stack environments (Windows / local networks)
dns.setDefaultResultOrder("ipv4first");

if (!process.env.NEON_AUTH_BASE_URL) {
  throw new Error("NEON_AUTH_BASE_URL environment variable is missing");
}

if (!process.env.NEON_AUTH_COOKIE_SECRET) {
  throw new Error("NEON_AUTH_COOKIE_SECRET environment variable is missing");
}

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET,
  },
});
