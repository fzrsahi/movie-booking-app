import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';
import { TicketDto } from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('tickets')
@ApiTags('Tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get('seat/:movie_id')
  getSeat(@Param('movie_id', ParseIntPipe) movieId: number) {
    return this.ticketService.getSeat(movieId);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWTAUTH')
  @Post('seat/:movie_id')
  bookSeat(
    @GetUser() user: User,
    @Param('movie_id', ParseIntPipe) movieId : number,
    @Body() dto: TicketDto,
  ) {
    if (!dto.seatNumber.length) {
      throw new BadRequestException('Array Tidak Boleh Kosong');
    }

    if (dto.seatNumber.length > 6) {
      throw new BadRequestException(
        'Sorry, you can only order a maximum of 6 tickets',
      );
    }
    return this.ticketService.bookSeats(user, movieId, dto.seatNumber);
  }
}
