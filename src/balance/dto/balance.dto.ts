import { IsNotEmpty, IsNumber } from 'class-validator';

export class BalanceDto {
  @IsNotEmpty()
  @IsNumber()
  balance: bigint;
}

export class BalanceWithdrawalDto {
  @IsNotEmpty()
  @IsNumber()
  withdrawal: bigint;
}
