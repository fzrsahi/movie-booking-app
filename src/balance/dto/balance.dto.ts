import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class BalanceDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  balance: bigint;
}

export class BalanceWithdrawalDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  withdrawal: bigint;
}
