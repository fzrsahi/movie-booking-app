import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { SearchQueryDto } from './dto';

@Injectable()
export class MovieService {
  constructor(private prisma: PrismaService) {}

  async searchMovies(query: SearchQueryDto) {
    const querySplit = query.title.split(' ');
    const modifiedString = querySplit.join(' | ');

    try {
      const movies = await this.prisma.movie.findMany({
        where: {
          title: {
            search: modifiedString,
          },
        },
      });

      return {
        statusCode: 200,
        message: 'Success Search Movies',
        data: movies,
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllMovies(page: number, limit: number) {
    try {
      const skip: number = (page - 1) * limit;
      const totalCount = await this.prisma.movie.count();
      const movies = await this.prisma.movie.findMany({
        take: limit,
        skip,
        include: {
          _count: true,
        },
      });

      const totalPage = Math.ceil(totalCount / limit);

      return {
        statusCode: 200,
        message: 'Success Fetch All Movies',
        page,
        length: movies.length,
        totalData: totalCount,
        totalPage,
        data: movies,
      };
    } catch (error) {
      throw error;
    }
  }

  async getMovieById(movieId: number) {
    const movie = await this.prisma.movie.findFirst({
      where: {
        id: movieId,
      },
    });

    if (!movie) throw new NotFoundException();
    delete movie.id;
    return {
      statusCode: 200,
      message: `Success Get Movie id : ${movieId} Details`,
      data: movie,
    };
  }
}
