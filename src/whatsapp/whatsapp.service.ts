import { Injectable } from '@nestjs/common';
import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsappService {
  onModuleInit() {
    this.initializeClient();
  }

  initializeClient() {
    const client = new Client({
      puppeteer: { headless: true },
    });

    client.on('qr', (qr) => {
      // Kin here: you should scan this code with your phone to connect WhatsApp
      qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
      console.log('Client is ready!');
    });

    client.on('message', (msg) => {
      if (msg.body == '!ping') {
        msg.reply('pong');
      }
    });

    client.initialize();
  }
}
