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

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get('seat/:id')
  getSeat(@Param('id', ParseIntPipe) movieId: number) {
    return this.ticketService.getSeat(movieId);
  }

  @UseGuards(JwtGuard)
  @Post('seat/:id')
  bookSeat(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) movieId,
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
