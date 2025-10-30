import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { PrismaService } from './prisma/prisma.service';
import { AgentsService } from './agents/agents.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [WhatsappModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, PrismaService, AgentsService],
})
export class AppModule {}
