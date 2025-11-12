import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type DB = PostgresJsDatabase<typeof schema>;

export const client = postgres(process.env.DATABASE_URL!, {
	max: 20,
	idle_timeout: 60,
	connect_timeout: 10,
	prepare: false,
});
export const db = drizzle(client, { schema });
