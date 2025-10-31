import { Hono } from "hono";
import { products } from "./routes/products.route";
import { orders } from "./routes/orders.routes";
import { initializeWhatsappClient } from "./controllers/whatsapp";

const app = new Hono();

// intialize whatsapp client
initializeWhatsappClient();

app.route('/products', products);
app.route('/orders', orders);

export default app;