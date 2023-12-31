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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtGuard)
@ApiBearerAuth('JWTAUTH')
@ApiTags("Orders")
@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Get(':id')
  getOrderById(@GetUser() user, @Param('id') orderId: string) {
    return this.orderService.getOrderById(user, orderId);
  }

  @Get()
  getOrderByUserId(@GetUser() user: User) {
    return this.orderService.getUserOrders(user);
  }

  @Delete('cancel')
  cancelOrder(@GetUser() user: User, @Body() ticketsId: cancelOrderDto) {
    return this.orderService.cancelOrder(user, ticketsId.ticketsId);
  }
}
