import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../db/prisma";

export const orders = new Hono();

/* -------------------- Validation Schemas -------------------- */

const orderProductSchema = z.object({
  productName: z.string(),
  quantity: z.number().min(1),
});

const createOrderSchema = z.object({
  userDetails: z.string(),
  totalPrice: z.number().nonnegative(),
  orderProducts: z.array(orderProductSchema).min(1),
});

const updateOrderSchema = z.object({
  totalPrice: z.number().optional(),
  orderProducts: z.array(orderProductSchema).optional(),
});

/* -------------------- Routes -------------------- */

/** @POST /orders */
orders.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = createOrderSchema.parse(body);

    const newOrder = await prisma.order.create({
      data: {
        userDetails: parsed.userDetails,
        totalPrice: parsed.totalPrice,
        products: {
          create: parsed.orderProducts.map((op) => ({
            product: {
              connect: { name: op.productName },
            },
            quantity: op.quantity,
          })),
        },
      },
      include: {
        products: { include: { product: true } },
      },
    });

    return c.json(newOrder, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400);
    }
    return c.json({ error: "Failed to create order" }, 500);
  }
});

/** @GET /orders */
orders.get("/", async (c) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        products: { include: { product: true } },
      },
    });
    return c.json(orders);
  } catch (error) {
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
});

/** @GET /orders/:userDetails */
orders.get("/:userDetails", async (c) => {
  try {
    const userDetails = c.req.param("userDetails");

    const order = await prisma.order.findUnique({
      where: { userDetails },
      include: {
        products: { include: { product: true } },
      },
    });

    if (!order) return c.json({ error: "Order not found" }, 404);

    return c.json(order);
  } catch (error) {
    return c.json({ error: "Failed to fetch order" }, 500);
  }
});

/** @PATCH /orders/:id */
orders.patch("/:id", async (c) => {
  try {
    const id = c.req.param("id") as string;
    const body = await c.req.json();
    const parsed = updateOrderSchema.parse(body);

    // Note: Adjust logic based on actual model schema (if 'id' is unique key)
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: parsed,
      include: {
        products: { include: { product: true } },
      },
    });

    return c.json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400);
    }
    return c.json({ error: "Failed to update order" }, 500);
  }
});

/** @DELETE /orders/:userDetails */
orders.delete("/:userDetails", async (c) => {
  try {
    const userDetails = c.req.param("userDetails");

    await prisma.order.delete({
      where: { userDetails },
    });

    return c.json({ message: "Order deleted successfully" });
  } catch (error) {
    return c.json({ error: "Failed to delete order" }, 500);
  }
});
