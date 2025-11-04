import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../db/prisma";

/* -------------------- HELPERS -------------------- */

const generateRandomId = (): string => uuidv4();

/* -------------------- ORDERS -------------------- */

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
      products: { include: { product: true } },
    },
  });
};

const getOrderDetails = async (userDetails: string) =>
  prisma.order.findFirst({
    where: { userDetails },
    include: { products: { include: { product: true } } },
  });

const listAllOrders = async () =>
  prisma.order.findMany({
    include: { products: { include: { product: true } } },
  });

const deleteOrder = async (userDetails: string) =>{
  // Find the order first
  const order = await prisma.order.findFirst({
    where: {userDetails}
  });

  if(!order) {
    return {
      message: "Order doesn't exist, it must have already been deleted"
    }
  }

  return prisma.order.delete({ where: { id: order.id } });
}

/* -------------------- PRODUCTS -------------------- */

const getProductDetails = async (name: string) =>
  prisma.product.findUnique({ where: { name } });

const getProductById = async (id: string) =>
  prisma.product.findUnique({ where: { id } });

const listAllProducts = async () => prisma.product.findMany();

const createProduct = async (data: {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  imageUrl: string;
}) => {
  return prisma.product.create({ data });
};

const updateProduct = async (
  id: string,
  data: Partial<{
    name: string;
    description?: string;
    price?: number;
    stock?: number;
    imageUrl?: string;
  }>,
) => {
  return prisma.product.update({ where: { id }, data });
};

const deleteProduct = async (id: string) => {
  return prisma.product.delete({ where: { id } });
};

/* -------------------- TOOLS -------------------- */

export const generateRandomIdTool = createTool({
  id: "generate-random-id",
  description: "Generates a random UUID string",
  inputSchema: z.object({}),
  outputSchema: z.object({ id: z.string() }),
  execute: async () => ({ id: generateRandomId() }),
});

/* ===== ORDERS ===== */

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

/* ===== PRODUCTS ===== */

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

export const getProductByIdTool = createTool({
  id: "get-product-by-id",
  description: "Fetches a single product by its unique ID",
  inputSchema: z.object({ id: z.string() }),
  outputSchema: z.object({ product: z.any() }),
  execute: async ({ context }) => {
    const product = await getProductById(context.id);
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

export const createProductTool = createTool({
  id: "create-product",
  description: "Creates a new product in the system",
  inputSchema: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.number().nonnegative(),
    stock: z.number().int().nonnegative().optional(),
    imageUrl: z.string().url(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    product: z.any(),
  }),
  execute: async ({ context }) => {
    const product = await createProduct(context);
    return { success: true, product };
  },
});

export const updateProductTool = createTool({
  id: "update-product",
  description: "Updates an existing product by ID",
  inputSchema: z.object({
    id: z.string(),
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    price: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),
    imageUrl: z.string().url().optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    updatedProduct: z.any(),
  }),
  execute: async ({ context }) => {
    const updatedProduct = await updateProduct(context.id, context);
    return { success: true, updatedProduct };
  },
});

export const deleteProductTool = createTool({
  id: "delete-product",
  description: "Deletes a product by its unique ID",
  inputSchema: z.object({ id: z.string() }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    await deleteProduct(context.id);
    return { success: true, message: "Product deleted successfully" };
  },
});

/* ===== EXPORT ALL TOOLS ===== */

export const allTools = [
  generateRandomIdTool,
  createOrderTool,
  getOrderDetailsTool,
  listAllOrdersTool,
  deleteOrderTool,
  getProductDetailsTool,
  getProductByIdTool,
  listAllProductsTool,
  createProductTool,
  updateProductTool,
  deleteProductTool,
];
