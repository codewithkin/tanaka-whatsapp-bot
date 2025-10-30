export class CreateOrderDto {
  orderProducts: {
    productName: string;
    quantity: number;
  }[];

  userDetails: string;

  totalPrice: number;
}
