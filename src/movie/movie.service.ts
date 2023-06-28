import { Injectable, NotFoundException } from '@nestjs/common';
import { throwError } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MovieService {
  constructor(private prisma: PrismaService) {}

  async getAllMovies(page: number, limit: number) {
    const skip: number = (page - 1) * limit;
    const totalCount = await this.prisma.movie.count();
    const movies = await this.prisma.movie.findMany({
      take: limit,
      skip,
      select: {
        id_: true,
        title: true,
        description: true,
        price: true,
        releaseDate: true,
        ageRating: true,
        poster: true,
      },
    });

    return {
      success: true,
      length: movies.length,
      total: totalCount,
      data: movies,
    };
  }

  async getMovieById(movieId: number) {
    const movie = await this.prisma.movie.findFirst({
      where: {
        id_: movieId,
      },
    });

    if (!movie) throw new NotFoundException();
    delete movie.id;
    return movie;
  }
}
