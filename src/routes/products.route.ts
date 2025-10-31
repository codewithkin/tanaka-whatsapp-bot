import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../db/prisma";

export const products = new Hono();

/* -------------------- Validation Schemas -------------------- */

const createProductSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative().optional(),
  imageUrl: z.string().url(),
});

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
});

/* -------------------- Routes -------------------- */

/** @POST /products */
products.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = createProductSchema.parse(body);

    const newProduct = await prisma.product.create({
      data: parsed,
    });

    return c.json(newProduct, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400);
    }
    return c.json({ error: "Failed to create product" }, 500);
  }
});

/** @GET /products */
products.get("/", async (c) => {
  try {
    const allProducts = await prisma.product.findMany();
    return c.json(allProducts);
  } catch (error) {
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

/** @GET /products/:id */
products.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) return c.json({ error: "Product not found" }, 404);

    return c.json(product);
  } catch (error) {
    return c.json({ error: "Failed to fetch product" }, 500);
  }
});

/** @PATCH /products/:id */
products.patch("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const parsed = updateProductSchema.parse(body);

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: parsed,
    });

    return c.json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400);
    }
    return c.json({ error: "Failed to update product" }, 500);
  }
});

/** @DELETE /products/:id */
products.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    await prisma.product.delete({
      where: { id },
    });

    return c.json({ message: "Product deleted successfully" });
  } catch (error) {
    return c.json({ error: "Failed to delete product" }, 500);
  }
});
