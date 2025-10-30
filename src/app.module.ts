import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { PrismaService } from './prisma/prisma.service';
import { AgentsService } from './agents/agents.service';
import { ConfigModule } from '@nestjs/config';
import { HelpersService } from './helpers/helpers.service';
import { AgentsModule } from './agents/agents.module';
import { HelpersModule } from './helpers/helpers.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    WhatsappModule,
    ConfigModule.forRoot(),
    AgentsModule,
    HelpersModule,
    ProductsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, AgentsService, HelpersService],
})
export class AppModule {}
