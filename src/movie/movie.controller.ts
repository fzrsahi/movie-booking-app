import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { SearchQueryDto } from './dto';

@Controller('/movies')
export class MovieController {
  constructor(private movieService: MovieService) {}

  @Get('search')
  searchMovies(@Query() query: SearchQueryDto) {
    if (!query.title) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Please Add The Movie Title',
      });
    }

    return this.movieService.searchMovies(query);
  }

  @Get()
  getAllMovie(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.movieService.getAllMovies(page, limit);
  }

  @Get(':id')
  getMovieById(@Param('id', ParseIntPipe) movieId) {
    return this.movieService.getMovieById(movieId);
  }
}
