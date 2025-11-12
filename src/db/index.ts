import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type DB = PostgresJsDatabase<typeof schema>;

export const client = postgres(process.env.DATABASE_URL!, {
	max: 10,
	idle_timeout: 30,
	connect_timeout: 5,
	prepare: false,
	transform: postgres.camel,
});
export const db = drizzle(client, { schema });
