import { Client, LocalAuth } from "whatsapp-web.js";
import { generate } from "qrcode-terminal";
import { replyToUser } from "../mastra/agents";
import QRCode from "qrcode";

export const initializeWhatsappClient = () => {
  const client = new Client({
    puppeteer: { headless: true },
    authStrategy: new LocalAuth(),
  });

  // Generate QR code for first-time connection
  client.on("qr", (qr) => {
    console.log("Scan this QR code with your WhatsApp:");
    // generate(qr, { small: true });

    QRCode.toString(
      qr,
      { type: "terminal", innerWidth: 40, innerHeight: 40, scale: 2 },
      function (err: Error, QRcode: string) {
        if (err) {
          console.error("Error generating QR code:", err);
          return;
        }
        console.log(QRcode);
      },
    );
  });

  // Notify when connected
  client.on("ready", () => {
    console.log("WhatsApp client is ready!");
  });

  // Listen for new messages
  client.on("message_create", async (msg) => {
    console.log("Message received:", msg.body);

    const messageText = msg.body?.toLowerCase() || "";
    const referencesTanaka = messageText.includes("tanaka");

    // Only answer if Tanaka is referenced
    if (referencesTanaka) {
      try {
        const response = await replyToUser({
          query: msg.body,
          userDetails: msg.from,
        });

        console.log("Agent reply:", response);
        await msg.reply(response);
      } catch (error) {
        console.error("Failed to get AI reply:", error);
        await msg.reply(
          "Sorry, I encountered an error processing your message.",
        );
      }
    }
  });

  // Initialize WhatsApp client
  client.initialize();

  return client;
};
