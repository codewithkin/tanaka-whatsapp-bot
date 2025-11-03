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

    if (process.env.NODE_ENV === "development") {
      // Render QR in terminal (works locally)
      QRCode.toString(qr, { type: "terminal", small: true }, (err, qrCode) => {
        if (err) {
          console.error("Error generating terminal QR code:", err);
          return;
        }

        // Wrap in code fences to prevent line breaking in logs
        console.log("```");
        console.log(qrCode);
        console.log("```");
      });
    } else {
      // In production, generate a Data URL and log it
      QRCode.toDataURL(qr, (err, url) => {
        if (err) {
          console.error("Error generating QR code URL:", err);
          return;
        }

        console.log("QR code (open this in your browser to scan):");
        console.log("```");
        console.log(url);
        console.log("```");
      });
    }
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
