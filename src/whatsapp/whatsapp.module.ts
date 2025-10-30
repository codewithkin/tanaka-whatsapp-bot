import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { AgentsService } from 'src/agents/agents.service';

@Module({
  controllers: [WhatsappController],
  providers: [WhatsappService, AgentsService],
})
export class WhatsappModule {}
