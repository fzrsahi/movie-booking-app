import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MovieService } from './movie.service';

@Controller('/movies')
export class MovieController {
  constructor(private movieService: MovieService) {}

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
