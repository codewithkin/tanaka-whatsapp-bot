import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import storage from '../mastra/storage';
import { HelpersService } from 'src/helpers/helpers.service';
import { OrdersService } from 'src/orders/orders.service';
import { ProductsService } from 'src/products/products.service';
import { PrismaService } from 'src/prisma/prisma.service';

const prismaService = new PrismaService();

const ordersService = new OrdersService(prismaService);
const productsService = new ProductsService(prismaService);
const helpersService = new HelpersService(ordersService, productsService);

const dbAgent = new Agent({
  name: 'DbAgent',
  model: 'openai/gpt-4o',

  instructions: `
You are DbAgent, an AI assistant specialized in managing and interacting with the Accessories World database.
Accessories World is a computer and phone accessories supplier located at 51 Second Street, Mutare, Zimbabwe.

You have access to the following tools:

- generateRandomIdTool: Generates a random UUID string
- createOrderTool: Creates a new customer order
- getOrderDetailsTool: Fetches order details for a user
- listAllOrdersTool: Lists all orders
- deleteOrderTool: Deletes an order
- getProductDetailsTool: Fetches details for a product
- listAllProductsTool: Lists all products

Always use the relevant tool by name to perform tasks.  

Always return structured JSON responses (no extra explanations), like:
{
  "status": "success",
  "data": ...
}

If an operation fails, respond with:
{
  "status": "error",
  "message": "Error details..."
}
`,

  tools: helpersService.getAllTools(),
});

export default dbAgent;
