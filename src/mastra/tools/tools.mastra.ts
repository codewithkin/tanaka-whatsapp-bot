import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import dbAgent from "../agents/db.agent";
import { prisma } from "../../db/prisma";

const generateRandomId = (): string => uuidv4();

const createOrder = async (orderData: {
  userDetails: string;
  totalPrice: number;
  orderProducts: { productName: string; quantity: number }[];
}) => {
  return prisma.order.create({
    data: {
      totalPrice: orderData.totalPrice,
      userDetails: orderData.userDetails,
      products: {
        create: orderData.orderProducts.map((op) => ({
          product: {
            connect: { name: op.productName },
          },
          quantity: op.quantity,
        })),
      },
    },
    include: {
      products: {
        include: { product: true },
      },
    },
  });
};

const getOrderDetails = async (userDetails: string) => {
  return prisma.order.findUnique({
    where: { userDetails },
    include: {
      products: {
        include: { product: true },
      },
    },
  });
};

const listAllOrders = async () => {
  return prisma.order.findMany({
    include: {
      products: {
        include: { product: true },
      },
    },
  });
};

const deleteOrder = async (userDetails: string) => {
  return prisma.order.delete({
    where: { userDetails },
  });
};

/* -------------------- PRODUCTS -------------------- */
const getProductDetails = async (name: string) => {
  return prisma.product.findUnique({
    where: { name },
  });
};

const listAllProducts = async () => {
  return prisma.product.findMany();
};

/* -------------------- TOOLS -------------------- */

export const generateRandomIdTool = createTool({
  id: "generate-random-id",
  description: "Generates a random UUID string",
  inputSchema: z.object({}),
  outputSchema: z.object({ id: z.string() }),
  execute: async () => ({ id: generateRandomId() }),
});

export const createOrderTool = createTool({
  id: "create-order",
  description: "Creates a new order in the system",
  inputSchema: z.object({
    userDetails: z.string(),
    totalPrice: z.number(),
    orderProducts: z.array(
      z.object({
        productName: z.string(),
        quantity: z.number(),
      }),
    ),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    order: z.any(),
  }),
  execute: async ({ context }) => {
    const order = await createOrder(context);
    return { success: true, order };
  },
});

export const getOrderDetailsTool = createTool({
  id: "get-order-details",
  description: "Fetches details for a specific order by user details",
  inputSchema: z.object({ userDetails: z.string() }),
  outputSchema: z.object({ order: z.any() }),
  execute: async ({ context }) => {
    const order = await getOrderDetails(context.userDetails);
    return { order };
  },
});

export const listAllOrdersTool = createTool({
  id: "list-all-orders",
  description: "Fetches all existing orders",
  inputSchema: z.object({}),
  outputSchema: z.object({ orders: z.array(z.any()) }),
  execute: async () => {
    const orders = await listAllOrders();
    return { orders };
  },
});

export const deleteOrderTool = createTool({
  id: "delete-order",
  description: "Deletes an order by user details",
  inputSchema: z.object({ userDetails: z.string() }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    await deleteOrder(context.userDetails);
    return { success: true, message: "Order deleted successfully" };
  },
});

export const getProductDetailsTool = createTool({
  id: "get-product-details",
  description: "Fetches details for a specific product by name",
  inputSchema: z.object({ name: z.string() }),
  outputSchema: z.object({ product: z.any() }),
  execute: async ({ context }) => {
    const product = await getProductDetails(context.name);
    return { product };
  },
});

export const listAllProductsTool = createTool({
  id: "list-all-products",
  description: "Lists all products from the database",
  inputSchema: z.object({}),
  outputSchema: z.object({ products: z.array(z.any()) }),
  execute: async () => {
    const products = await listAllProducts();
    return { products };
  },
});

export const callDbAgentTool = createTool({
  id: "call-db-agent",
  description: "Calls the DbAgent to handle database operations",
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.object({ result: z.any() }),
  execute: async ({ mastra }: any) => {
    const result = await dbAgent.generate(mastra.query);
    return result.text;
  },
});

export const allTools = [
  generateRandomIdTool,
  createOrderTool,
  getOrderDetailsTool,
  listAllOrdersTool,
  deleteOrderTool,
  getProductDetailsTool,
  listAllProductsTool,
  callDbAgentTool,
];
