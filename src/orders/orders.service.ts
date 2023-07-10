import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { cancelOrderDto } from './dto';

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
            name: true,
          },
        },
        ticket: {
          select: {
            Seats: true,
            isCancel: true,
            cancelAt: true,
          },
        },
        Movie: {
          select: {
            title: true,
          },
        },
      },
    });

    return {
      statusCode: 200,
      message: `Success Get All Of ${user.id} Order History `,
      length: orders.length,
      data: orders,
    };
  }

  async cancelOrder(user: User, ticketsId: string[]) {
    try {
      const userData = await this.prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          balance: {
            select: {
              balance: true,
            },
          },
          orders: {
            select: {
              ticket: {
                where: {
                  id: {
                    in: ticketsId,
                  },
                },
              },
              Movie: {
                select: {
                  price: true,
                },
              },
            },
          },
        },
      });

      const seatsId = userData.orders.flatMap((seat) => {
        return seat.ticket.map((seat) => seat.seatsId);
      });

      const seatsPrice = userData.orders.flatMap((seat) => {
        return seat.Movie.price;
      });

      const updateTickets = await this.prisma.tickets.updateMany({
        where: {
          id: {
            in: ticketsId,
          },
        },
        data: {
          isCancel: true,
          cancelAt: new Date(),
        },
      });

      const updateSeats = await this.prisma.seats.updateMany({
        where: {
          id: {
            in: seatsId,
          },
        },
        data: {
          isBook: false,
        },
      });
      const moviePrice = seatsPrice[0] * ticketsId.length;
      const userBalance = userData.balance.balance;

      const updateBalance = userBalance + moviePrice;

      const updateUserBalance = await this.prisma.balance.update({
        where: {
          userId: user.id,
        },
        data: {
          balance: updateBalance,
        },
      });
      return {
        statusCode: 201,
        message: `Success Cancel Seats`,
        data: updateUserBalance,
      };
    } catch (error) {
      return error;
    }
  }

  async getOrderById(user: User, orderId: string) {
    try {
      const order = await this.prisma.orders.findUnique({
        where: {
          id: orderId,
        },
        include: {
          User: true,
          Movie: true,
          ticket: true,
        },
      });

      return {
        statusCode: 200,
        message: `Success Get ${user.name} order ${orderId} details`,
        data: order,
      };
    } catch (error) {
      throw error;
    }
  }
}
