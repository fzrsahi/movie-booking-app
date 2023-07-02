import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TicketDto } from './dto';

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  async getSeat(movieId: number) {
    const seats = await this.prisma.movie.findUnique({
      where: {
        id: movieId,
      },
      include: {
        seats: {
          orderBy: {
            seatNumber: 'asc',
          },
        },
      },
    });

    return seats;
  }

  async bookSeats(user: User, movieId: number, seats: number[]) {
    const balanceData = await this.prisma.balance.findUnique({
      where: {
        userId: user.id,
      },
    });

    const balance = balanceData.balance;
    console.log({ balance });

    const seatsToBook = await this.prisma.seats.findMany({
      where: {
        movieId,
        seatNumber: { in: seats },
      },
      include: {
        Movie: {
          select: {
            ageRating: true,
            price: true,
          },
        },
      },
    });

    const movieRatings = seatsToBook.map((seat) => seat.Movie.ageRating);

    const seatPrice = seatsToBook.map((seat) => seat.Movie.price);
    const totalSeatPrice = seatPrice.reduce((acc, curr) => acc + curr, 0);

    console.log({ totalSeatPrice, seatPrice });

    if (user.age < movieRatings[0]) {
      throw new BadRequestException(
        'Failed to book seats. Age requirement not met',
      );
    }

    const alreadyBookedSeats = seatsToBook.filter((seat) => seat.book === true);

    if (alreadyBookedSeats.length) {
      throw new BadRequestException(
        'Failed to book seats. Some seats are already booked.',
      );
    }

    if (balance < totalSeatPrice) {
      throw new BadRequestException(
        'Failed to book seats. Insufficient balance.',
      );
    }

    try {
      await this.prisma.seats.updateMany({
        where: {
          movieId,
          seatNumber: {
            in: seats,
          },
          book: false,
        },
        data: {
          book: true,
          userId: user.id,
        },
      });

      const updateBalance = balance - totalSeatPrice;
      await this.prisma.balance.update({
        where: {
          userId: user.id,
        },
        data: {
          balance: updateBalance,
        },
      });

      await this.prisma.orders.create({
        data: {
          userId: user.id,
          movieId,
          seats,
          total: totalSeatPrice,
          cancel: false,
        },
      });

      return {
        success: true,
        message: `Success Book Ticket Number ${seats}`,
        movieId,
        totalPrice: totalSeatPrice,
        currentBalance: updateBalance,
        seatsBook: seats,
      };
    } catch (error) {
      throw error;
    }
  }
}
