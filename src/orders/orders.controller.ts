import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { OrdersService } from './orders.service';
import { cancelOrderDto } from './dto';

@UseGuards(JwtGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Get(':id')
  getOrderById(@GetUser() user, @Param('id') orderId: string) {
    return this.orderService.getOrderById(user, orderId);
  }

  @Get()
  getOrderByUserId(@GetUser() user: User) {
    return this.orderService.getOrdersByUserId(user);
  }

  @Delete('cancel/:id')
  cancelOrder(
    @GetUser() user: User,
    @Body() ticketsId: cancelOrderDto,
    @Param('id', ParseIntPipe) movieId: number,
  ) {
    return this.orderService.cancelOrder(
      user,
      ticketsId.ticketsSeatNumber,
      movieId,
    );
  }
}
