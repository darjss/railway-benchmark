import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
	path: ".env",
});

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./src/db/migrations",
	// DOCS: https://orm.drizzle.team/docs/guides/d1-http-with-drizzle-kit
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
