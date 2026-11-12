import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import { auth } from "@/lib/auth/server";

export const { GET, POST, PUT, DELETE, PATCH } = auth.handler();


