import { Injectable } from '@nestjs/common';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { OrdersService } from 'src/orders/orders.service';
import { ProductsService } from 'src/products/products.service';
import { v4 as uuidv4 } from 'uuid';
import dbAgent from 'src/agents/agents/db.agent';

@Injectable()
export class HelpersService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
  ) {}

  generateRandomId(): string {
    return uuidv4();
  }

  /* --- ORDERS --- */
  async createOrder(orderData: any) {
    return this.ordersService.create(orderData);
  }

  async getOrderDetails(userDetails: string) {
    return this.ordersService.findOne(userDetails);
  }

  async listAllOrders() {
    return this.ordersService.findAll();
  }

  async deleteOrder(userDetails: string) {
    return this.ordersService.remove(userDetails);
  }

  /* --- PRODUCTS --- */
  async getProductDetails(name: string) {
    return this.productsService.findOne(name);
  }

  async listAllProducts() {
    return this.productsService.findAll();
  }

  generateRandomIdTool = createTool({
    id: 'generate-random-id',
    description: 'Generates a random UUID string',
    inputSchema: z.object({}),
    outputSchema: z.object({ id: z.string() }),
    execute: async () => {
      const id = this.generateRandomId();
      return { id };
    },
  });

  createOrderTool = createTool({
    id: 'create-order',
    description: 'Creates a new order in the system',
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
      const order = await this.createOrder(context);
      return { success: true, order };
    },
  });

  getOrderDetailsTool = createTool({
    id: 'get-order-details',
    description: 'Fetches details for a specific order by user details',
    inputSchema: z.object({
      userDetails: z.string(),
    }),
    outputSchema: z.object({
      order: z.any(),
    }),
    execute: async ({ context }) => {
      const order = await this.getOrderDetails(context.userDetails);
      return { order };
    },
  });

  listAllOrdersTool = createTool({
    id: 'list-all-orders',
    description: 'Fetches all existing orders',
    inputSchema: z.object({}),
    outputSchema: z.object({
      orders: z.array(z.any()),
    }),
    execute: async () => {
      const orders = await this.listAllOrders();
      return { orders };
    },
  });

  deleteOrderTool = createTool({
    id: 'delete-order',
    description: 'Deletes an order by user details',
    inputSchema: z.object({
      userDetails: z.string(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
    execute: async ({ context }) => {
      await this.deleteOrder(context.userDetails);
      return { success: true, message: 'Order deleted successfully' };
    },
  });

  getProductDetailsTool = createTool({
    id: 'get-product-details',
    description: 'Fetches details for a specific product by name',
    inputSchema: z.object({
      name: z.string(),
    }),
    outputSchema: z.object({
      product: z.any(),
    }),
    execute: async ({ context }) => {
      const product = await this.getProductDetails(context.name);
      return { product };
    },
  });

  listAllProductsTool = createTool({
    id: 'list-all-products',
    description: 'Lists all products from the database',
    inputSchema: z.object({}),
    outputSchema: z.object({
      products: z.array(z.any()),
    }),
    execute: async () => {
      const products = await this.listAllProducts();
      return { products };
    },
  });

  // assume dbAgent is already instantiated
  callDbAgentTool = createTool({
    id: 'call-db-agent',
    description: 'Call the DbAgent to handle database operations',
    inputSchema: z.object({
      query: z.string(),
    }),
    outputSchema: z.object({
      result: z.any(),
    }),
    execute: async ({ context }) => {
      // send the query to DbAgent
      const result = await dbAgent.generate(context.query);
      return { result };
    },
  });

  getAllTools() {
    return [
      this.generateRandomIdTool,
      this.createOrderTool,
      this.getOrderDetailsTool,
      this.listAllOrdersTool,
      this.deleteOrderTool,
      this.getProductDetailsTool,
      this.listAllProductsTool,
    ];
  }
}
