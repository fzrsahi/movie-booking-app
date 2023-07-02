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
    const seatsToBook = await this.prisma.seats.findMany({
      where: {
        movieId,
        seatNumber: { in: seats },
      },
      include: {
        Movie: {
          select: {
            ageRating: true,
          },
        },
      },
    });

    const movieRatings = seatsToBook.map((seat) => seat.Movie.ageRating);

    if (user.age < movieRatings[0]) {
      throw new BadRequestException(
        'Failed to book seats. Age requirement not met.ordersorders',
      );
    }

    const alreadyBookedSeats = seatsToBook.filter((seat) => seat.book === true);

    if (alreadyBookedSeats.length) {
      throw new BadRequestException(
        'Failed to book seats. Some seats are already booked.',
      );
    }

    try {
      const updateSeats = await this.prisma.seats.updateMany({
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

      return {
        success: true,
        message: 'Success Book Ticket',
        movieId,
        seatsBook: seats,
      };
    } catch (error) {
      throw error;
    }
  }
}
