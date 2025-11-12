import { desc, eq, inArray } from "drizzle-orm";
import { Elysia } from "elysia";
import { db } from "./db";
import {
	BrandsTable,
	CategoriesTable,
	ProductImagesTable,
	ProductsTable,
} from "./db/schema";

const app = new Elysia()
	.get("/", () => {
		return {
			message: "Hello Elysia",
		};
	})
	.get("/benchmark", async () => {
		const start = performance.now();

		// Optimized query with explicit joins - fetch products first
		const products = await db
			.select({
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
			})
			.from(ProductsTable)
			.leftJoin(
				CategoriesTable,
				eq(ProductsTable.categoryId, CategoriesTable.id),
			)
			.leftJoin(BrandsTable, eq(ProductsTable.brandId, BrandsTable.id))
			.where(eq(ProductsTable.status, "active"))
			.orderBy(desc(ProductsTable.createdAt))
			.limit(5);

		// Batch fetch all images in a single query to avoid N+1
		const productIds = products.map((p) => p.id);
		const images =
			productIds.length > 0
				? await db
						.select({
							id: ProductImagesTable.id,
							productId: ProductImagesTable.productId,
							url: ProductImagesTable.url,
							isPrimary: ProductImagesTable.isPrimary,
						})
						.from(ProductImagesTable)
						.where(inArray(ProductImagesTable.productId, productIds))
						.orderBy(desc(ProductImagesTable.isPrimary))
				: [];

		// Group images by productId
		const imagesByProductId = new Map<number, typeof images>();
		for (const image of images) {
			if (!imagesByProductId.has(image.productId)) {
				imagesByProductId.set(image.productId, []);
			}
			imagesByProductId.get(image.productId)!.push(image);
		}

		// Combine products with their images
		const result = products.map((product) => ({
			...product,
			images: (imagesByProductId.get(product.id) || [])
				.slice(0, 3)
				.map((img) => ({
					id: img.id,
					url: img.url,
					isPrimary: img.isPrimary,
				})),
		}));

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
