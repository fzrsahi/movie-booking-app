import { IsNotEmpty, IsNumber } from 'class-validator';

export class BalanceDto {
  @IsNotEmpty()
  @IsNumber()
  balance: number;
}

export class BalanceWithdrawalDto {
  @IsNotEmpty()
  @IsNumber()
  withdrawal: number;
}
