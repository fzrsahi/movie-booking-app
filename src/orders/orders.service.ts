import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrdersByUserId(user: User) {
    const orders = await this.prisma.orders.findMany({
      where: {
        userId: user.id,
      },
      include: {
        User: {
          select: {
            username: true,
          },
        },
        Movie: {
          select: {
            title: true,
            price: true,
            releaseDate: true,
          },
        },
      },
    });

    return {
      success: true,
      message: `Success Get All Of ${user.id} Order History `,
      length: orders.length,
      orderHistory: orders,
    };
  }

  async cancelOrder(user: User) {
    console.log(user);
  }
}
