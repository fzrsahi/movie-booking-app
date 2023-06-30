import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
  Body,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';
import { TicketDto } from './dto';

@Controller('ticket')
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
    @Body() seatNumber: TicketDto,
  ) {
    console.log({ user, movieId, seatNumber });
  }
}
