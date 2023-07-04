import { Injectable, NotFoundException } from '@nestjs/common';

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
    });

    return {
      statusCode: 200,
      length: movies.length,
      total: totalCount,
      data: movies,
    };
  }

  async getMovieById(movieId: number) {
    const movie = await this.prisma.movie.findFirst({
      where: {
        id: movieId,
      },
    });

    if (!movie) throw new NotFoundException();
    delete movie.id;
    return movie;
  }
}
