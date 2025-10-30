import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prismaService: PrismaService) {}

  create(createOrderDto: CreateOrderDto) {
    return this.prismaService.order.create({
      data: {
        totalPrice: createOrderDto.totalPrice,
        userDetails: createOrderDto.userDetails,
        products: {
          create: createOrderDto.orderProducts.map((op) => ({
            product: {
              connect: { name: op.productName },
            },
            quantity: op.quantity,
          })),
        },
      },
      include: {
        products: {
          include: { product: true },
        },
      },
    });
  }

  findAll() {
    return this.prismaService.order.findMany({
      include: {
        products: {
          include: { product: true },
        },
      },
    });
  }

  findOne(userDetails: string) {
    return this.prismaService.order.findUnique({
      where: { userDetails },
      include: {
        products: {
          include: { product: true },
        },
      },
    });
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(userDetails: string) {
    return this.prismaService.order.delete({
      where: { userDetails },
    });
  }
}
