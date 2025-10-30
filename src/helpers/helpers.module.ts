import { Module } from '@nestjs/common';
import { OrdersService } from 'src/orders/orders.service';
import { ProductsService } from 'src/products/products.service';

@Module({
  imports: [OrdersService, ProductsService],
})
export class HelpersModule {}
