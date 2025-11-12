import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type DB = PostgresJsDatabase<typeof schema>;

export const client = postgres(process.env.DATABASE_URL!, {
	max: 20, // Increased pool size for Railway's multi-instance environment
	idle_timeout: 60, // Increased to keep connections alive longer
	connect_timeout: 10, // Increased timeout for Railway network latency
	prepare: false,
	transform: postgres.camel,
	ssl: process.env.DATABASE_URL?.includes("railway") ? "require" : undefined, // Enable SSL for Railway
	max_lifetime: 60 * 30, // 30 minutes - keep connections alive longer
});
export const db = drizzle(client, { schema });
