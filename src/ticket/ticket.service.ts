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
      data: seats,
    };
  }

  async bookSeats(user: User, movieId: number, seats: number[]) {
    const userData = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        age: true,
        balance: true,
      },
    });

    const movieData = await this.prisma.movie.findUnique({
      where: {
        id: movieId,
      },
      include: {
        seats: true,
      },
    });

    const userBalance: bigint = userData.balance.balance;
    const userAge = userData.age;

    const moviePrice = movieData.price;
    const movieRating = movieData.ageRating;

    const totalMoviePrice = moviePrice * seats.length;

    if (userAge < movieRating) {
      throw new HttpException(
        {
          statusCode: 400,
          message: 'Failed to book seats. Age requirement not met',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (userBalance < totalMoviePrice) {
      throw new HttpException(
        {
          statusCode: 400,
          message: 'Failed to book seats. Insufficient balance',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const updateBalance = userBalance - BigInt(totalMoviePrice);
    console.log(updateBalance);

    try {
      const updateSeats = [];
      for (const seat of seats) {
        let seatMovie = movieData.seats.find(
          (movieSeat) => movieSeat.seatNumber === seat,
        );
        if (!seatMovie) {
          const seatMovie = await this.prisma.seats.create({
            data: {
              isBook: true,
              seatNumber: seat,
              movieId,
            },
            select: {
              id: true,
            },
          });
          updateSeats.push(seatMovie);
          continue;
        }
        const updateSeatMovie = await this.prisma.seats.update({
          where: {
            id: seatMovie.id,
          },
          data: {
            isBook: true,
            seatNumber: seat,
            movieId,
          },
          select: {
            id: true,
          },
        });
        updateSeats.push(updateSeatMovie);
      }

      const updateUserBalance = await this.prisma.balance.update({
        where: {
          userId: user.id,
        },
        data: {
          balance: updateBalance,
        },
      });

      const createOrder = await this.prisma.orders.create({
        data: {
          total: totalMoviePrice,
          userId: user.id,
          movieId,
          ticket: {
            create: updateSeats.map((seat) => ({
              isCancel: false,
              seatsId: seat.id,
              userId: user.id,
              bookAt: new Date(),
            })),
          },
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
        statusCode: 201,
        message: `Success Book Seats Number ${seats} `,
        total: totalMoviePrice,
        data: createOrder,
      };
    } catch (error) {
      throw error;
    }
  }
}
