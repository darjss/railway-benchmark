import { Elysia } from "elysia";
import { db } from "./db";

const app = new Elysia()
	.get("/", () => {
		return {
			message: "Hello Elysia",
		};
	})
	.get("/benchmark", async () => {

		const start = performance.now();
		const result = await db.query.ProductsTable.findMany({
			limit: 5,
			with: {
				category: true,
				brand: true,
				images: true,
			},
		});
		const end = performance.now();
		console.log(`Time taken: ${end - start} milliseconds`);
		return {
			local: result,
      time: end - start,
		};
	})
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
