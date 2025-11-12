import { desc, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { db } from "./db";
import { ProductsTable } from "./db/schema";

const app = new Elysia()
	.get("/", () => {
		return {
			message: "Hello Elysia",
		};
	})
	.get("/benchmark", async () => {
		const requestStart = performance.now();
		console.info("[/benchmark] request started");

		const productsQueryStart = performance.now();
		// Optimized query using Drizzle relation query builder
		const products = await db.query.ProductsTable.findMany({
			where: eq(ProductsTable.status, "active"),
			orderBy: desc(ProductsTable.createdAt),
			limit: 5,
			columns: {
				id: true,
				name: true,
				price: true,
				status: true,
			},
			with: {
				category: {
					columns: {
						id: true,
						name: true,
					},
				},
				brand: {
					columns: {
						id: true,
						name: true,
					},
				},
				images: {
					columns: {
						id: true,
						url: true,
						isPrimary: true,
					},
					orderBy: (images, { desc }) => [desc(images.isPrimary)],
					limit: 3,
				},
			},
		});
		const productsQueryDuration = performance.now() - productsQueryStart;
		console.info(
			`[/benchmark] products query finished in ${productsQueryDuration.toFixed(
				2,
			)}ms (count=${products.length})`,
		);

		const requestDuration = performance.now() - requestStart;
		console.info(
			`[/benchmark] request completed in ${requestDuration.toFixed(2)}ms`,
		);
		return {
			local: products,
			time: requestDuration,
		};
	})
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
