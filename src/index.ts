import { Elysia } from "elysia";
import { db } from "./db";
import { ProductsTable, CategoriesTable, BrandsTable, ProductImagesTable } from "./db/schema";
import { eq, desc } from "drizzle-orm";

const app = new Elysia()
	.get("/", () => {
		return {
			message: "Hello Elysia",
		};
	})
	.get("/benchmark", async () => {
		const start = performance.now();
		
		// Optimized query with explicit joins and better indexing
		const result = await db.select({
			id: ProductsTable.id,
			name: ProductsTable.name,
			price: ProductsTable.price,
			status: ProductsTable.status,
			category: {
				id: CategoriesTable.id,
				name: CategoriesTable.name,
			},
			brand: {
				id: BrandsTable.id,
				name: BrandsTable.name,
			},
			images: db.select({
				id: ProductImagesTable.id,
				url: ProductImagesTable.url,
				isPrimary: ProductImagesTable.isPrimary,
			})
			.from(ProductImagesTable)
			.where(eq(ProductImagesTable.productId, ProductsTable.id))
			.orderBy(desc(ProductImagesTable.isPrimary))
			.limit(3),
		})
		.from(ProductsTable)
		.leftJoin(CategoriesTable, eq(ProductsTable.categoryId, CategoriesTable.id))
		.leftJoin(BrandsTable, eq(ProductsTable.brandId, BrandsTable.id))
		.where(eq(ProductsTable.status, 'active'))
		.orderBy(desc(ProductsTable.createdAt))
		.limit(5);

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
