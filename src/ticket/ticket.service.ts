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

  // async bookSeats(user: User, movieId: number, seats: number[]) {
  //   const balanceData = await this.prisma.balance.findUnique({
  //     where: {
  //       userId: user.id,
  //     },
  //   });

  //   const balance = balanceData.balance;

  //   const seatsToBook = await this.prisma.seats.findMany({
  //     where: {
  //       movieId,
  //       seatNumber: { in: seats },
  //     },
  //     include: {
  //       Movie: {
  //         select: {
  //           ageRating: true,
  //           price: true,
  //         },
  //       },
  //     },
  //   });

  //   const movieRatings = seatsToBook.map((seat) => seat.Movie.ageRating);

  //   const seatPrice = seatsToBook.map((seat) => seat.Movie.price);
  //   const totalSeatPrice = seatPrice.reduce((acc, curr) => acc + curr, 0);

  //   if (user.age < movieRatings[0]) {
  //     throw new HttpException(
  //       {
  //         statusCode: 400,
  //         message: 'Failed to book seats. Age requirement not met',
  //         ageError: true,
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }

  //   const alreadyBookedSeats = seatsToBook.filter((seat) => seat.book === true);

  //   if (alreadyBookedSeats.length) {
  //     throw new HttpException(
  //       {
  //         statusCode: 400,
  //         message: 'Failed to book seats. Some seats are already booked.',
  //         seatsFullError: true,
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }

  //   if (balance < totalSeatPrice) {
  // throw new HttpException(
  //   {
  //     statusCode: 400,
  //     message: 'Failed to book seats. Insufficient balance',
  //     insufficientBalanceError: true,
  //   },
  //   HttpStatus.BAD_REQUEST,
  // );
  //   }

  //   const date = new Date();
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, '0');
  //   const day = String(date.getDate()).padStart(2, '0');
  //   const hours = String(date.getHours()).padStart(2, '0');
  //   const minutes = String(date.getMinutes()).padStart(2, '0');
  //   const seconds = String(date.getSeconds()).padStart(2, '0');
  //   const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  //   const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;

  //   try {
  //     await this.prisma.seats.updateMany({
  //       where: {
  //         movieId,
  //         seatNumber: {
  //           in: seats,
  //         },
  //         book: false,
  //       },
  //       data: {
  //         book: true,
  //         userId: user.id,
  //       },
  //     });

  //     const updateBalance = balance - totalSeatPrice;
  //     await this.prisma.balance.update({
  //       where: {
  //         userId: user.id,
  //       },
  //       data: {
  //         balance: updateBalance,
  //       },
  //     });

  //     const seatsId = seatsToBook.map((seatId) => {
  //       return seatId.id;
  //     });

  //     await this.prisma.seats.deleteMany({
  //       where: {
  //         id: {
  //           in: seatsId,
  //         },
  //       },
  //     });

  //     const orders = await this.prisma.orders.create({
  //       data: {
  //         userId: user.id,
  //         movieId,
  //         seats: {
  // create: seats.map((seatBook) => ({
  //   seatNumber: seatBook,
  //   book: true,
  //   movieId: movieId,
  //   userId: user.id,
  //   bookAt: formattedDate,
  // })),
  //         },
  //         total: totalSeatPrice,
  //       },
  //       select: {
  //         id: true,
  //       },
  //     });

  // return {
  //   statusCode: 201,
  //   message: `Success Book Ticket Number ${seats}`,
  //   movieId,
  //   totalPrice: totalSeatPrice,
  //   currentBalance: updateBalance,
  //   ordersId: orders,
  //   seatsBook: seats,
  // };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

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

    const userBalance = userData.balance.balance;
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

    const updateBalance = userBalance - totalMoviePrice;

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
