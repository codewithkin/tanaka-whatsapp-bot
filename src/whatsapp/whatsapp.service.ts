import { Injectable } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { AgentsService } from 'src/agents/agents.service';

@Injectable()
export class WhatsappService {
  constructor(private readonly agentsService: AgentsService) {}

  onModuleInit() {
    this.initializeClient();
  }

  initializeClient() {
    const client = new Client({
      puppeteer: { headless: true },
      authStrategy: new LocalAuth(),
    });

    client.on('qr', (qr) => {
      // Kin here: you should scan this code with your phone to connect WhatsApp
      qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
      console.log('Client is ready!');
    });

    client.on('message_create', async (msg) => {
      console.log('Message received: ', msg.body);

      const needsHelp = msg.body && msg.body.toLowerCase().includes('help');

      // Simple keyword check to trigger agent response
      if (needsHelp) {
        const response = await this.agentsService.replyToUser({
          query: msg.body,
          userDetails: msg.from,
        });

        console.log('Reply: ', response);

        msg.reply(response);
      }
    });

    client.initialize();
  }
}
