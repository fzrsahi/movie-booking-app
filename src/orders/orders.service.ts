import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { cancelOrderDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrdersByUserId(user: User) {
    // const orders: any = await this.prisma.seats.findMany({
    //   where: {
    //     userId: user.id,
    //   },
    //   include: {
    //     Movie: {
    //       select: {
    //         title: true,
    //       },
    //     },
    //   },
    // });

    const orders = await this.prisma.orders.findMany({
      where: {
        userId: user.id,
      },
      include: {
        seats: true,
      },
    });

    orders.forEach((order) => {
      delete order.userId;
    });

    return {
      statusCode: 200,
      message: `Success Get All Of ${user.id} Order History `,
      length: orders.length,
      orderHistory: orders,
    };
  }

  async cancelOrder(user: User, seatsNumber: number[], movieId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;

    const seats = await this.prisma.seats.findMany({
      where: {
        userId: user.id,
        seatNumber: {
          in: seatsNumber,
        },
        movieId,
      },
    });

    seats.forEach((seat) => {
      if (!seat.book) {
        throw new BadRequestException(
          'Sorry, the following tickets have been canceled',
        );
      }
    });

    const movie = await this.prisma.movie.findFirst({
      where: {
        id: movieId,
      },
    });

    const userData = await this.prisma.balance.findUnique({
      where: {
        userId: user.id,
      },
    });

    const currentBalance = userData.balance;
    const seatsPrices = movie.price * seatsNumber.length;

    const newBalance = currentBalance + seatsPrices;

    try {
      await this.prisma.seats.updateMany({
        where: {
          userId: user.id,
          seatNumber: {
            in: seatsNumber,
          },
          movieId,
        },
        data: {
          book: false,
          cancelAt: formattedDate,
          userId: null,
        },
      });

      await this.prisma.balance.update({
        where: {
          userId: user.id,
        },
        data: {
          balance: newBalance,
        },
      });

      return {
        statusCode: 201,
        message: `Success Cancel Seats Number ${seatsNumber}`,
      };
    } catch (error) {
      throw error;
    }
  }
}
