import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
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

    return {
      statusCode: 200,
      message: `Success Get MovieId ${movieId} seats`,
      seats,
    };
  }

  async bookSeats(user: User, movieId: number, seats: number[]) {
    const balanceData = await this.prisma.balance.findUnique({
      where: {
        userId: user.id,
      },
    });

    const balance = balanceData.balance;

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

    if (user.age < movieRatings[0]) {
      throw new HttpException(
        {
          statusCode: 400,
          message: 'Failed to book seats. Age requirement not met',
          ageError: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const alreadyBookedSeats = seatsToBook.filter((seat) => seat.book === true);

    if (alreadyBookedSeats.length) {
      throw new HttpException(
        {
          statusCode: 400,
          message: 'Failed to book seats. Some seats are already booked.',
          seatsFullError: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (balance < totalSeatPrice) {
      throw new HttpException(
        {
          statusCode: 400,
          message: 'Failed to book seats. Insufficient balance',
          insufficientBalanceError: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;

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

      await this.prisma.seats.deleteMany({
        where: {
          userId: user.id,
          movieId,
        },
      });

      await this.prisma.orders.create({
        data: {
          userId: user.id,
          movieId,
          seats: {
            create: seats.map((seatBook) => ({
              seatNumber: seatBook,
              book: true,
              movieId: movieId,
              userId: user.id,
              bookAt: formattedDate,
            })),
          },
          total: totalSeatPrice,
        },
      });

      return {
        statusCode: 201,
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
