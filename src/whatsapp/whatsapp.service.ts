import { Injectable } from '@nestjs/common';
import { Client } from 'whatsapp-web.js';

@Injectable()
export class WhatsappService {
  initializeClient() {
    const client = new Client();

    client.on('qr', (qr) => {
      // Kin here: you should scan this code with your phone to connect WhatsApp
      console.log('QR RECEIVED', qr);
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
