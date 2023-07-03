import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceDto, BalanceWithdrawalDto } from './dto';
import { JwtGuard } from 'src/auth/guard';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';

@UseGuards(JwtGuard)
@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  getBalance(@GetUser() user: User) {
    return this.balanceService.getBalance(user);
  }

  @Post()
  addBalance(@GetUser() user: User, @Body() dto: BalanceDto) {
    return this.balanceService.addBalance(dto, user);
  }

  @Post('withdraw')
  balanceWithdrawal(@GetUser() user: User, @Body() dto: BalanceWithdrawalDto) {
    return this.balanceService.balanceWithdrawal(dto, user);
  }
}
