import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BalanceDto, BalanceWithdrawalDto } from './dto';
import { User } from '@prisma/client';

@Injectable()
export class BalanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getBalance(user: User) {
    try {
      const userBalance = await this.prisma.balance.findUnique({
        where: {
          userId: user.id,
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      });

      const balanceInRp = this.toRupiah(userBalance.balance);
      const balance = userBalance.balance.toString();

      return {
        statusCode: 200,
        message: 'Success Get User Balance',
        balance: balanceInRp,
        data: { ...userBalance, balance },
      };
    } catch (error) {
      return error;
    }
  }

  async addBalance(dto: BalanceDto, user: User) {
    try {
      const userBalance = await this.prisma.balance.findUnique({
        where: {
          userId: user.id,
        },
      });

      const updateBalance = await this.prisma.balance.update({
        where: {
          userId: user.id,
        },
        data: {
          balance: userBalance.balance + BigInt(dto.balance),
        },
        select: {
          balance: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      });

      const balance = this.balanceToString(updateBalance.balance);

      const rupiah = this.toRupiah(dto.balance);
      const currentBalance = this.toRupiah(updateBalance.balance);

      return {
        statusCode: 201,
        message: `Success Add ${rupiah} to your balance!`,
        addedBalance: rupiah,
        currentBalance,
        data: { ...updateBalance, balance },
      };
    } catch (error) {
      throw error;
    }
  }

  async balanceWithdrawal(dto, user) {
    const balance = await this.prisma.balance.findUnique({
      where: {
        userId: user.id,
      },
    });
    const currentBalance = balance.balance;

    const toWithdrawn = BigInt(dto.withdrawal);

    if (currentBalance - toWithdrawn < 0) {
      throw new BadRequestException('insufficient balance');
    }

    const maximumWithdrawal = this.calculateMaximumWithdrawal(currentBalance);

    let withdrawalAmount = toWithdrawn;

    let messageWarning;
    if (toWithdrawn > maximumWithdrawal) {
      withdrawalAmount = BigInt(500000);
      messageWarning =
        'The maximum amount that can be withdrawn is  Rp.500.000,00 for each withdrawal.';
    }

    const updatedBalance = currentBalance - withdrawalAmount;
    if (updatedBalance < 0) {
      throw new BadRequestException('insufficient balance');
    }

    try {
      const balanceWithdrawal = await this.prisma.balance.update({
        where: {
          userId: user.id,
        },
        data: {
          balance: updatedBalance,
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      });

      const balance = this.balanceToString(balanceWithdrawal.balance);
      delete balanceWithdrawal.balance;
      const withdrawalAmountInRp = this.toRupiah(withdrawalAmount);

      return {
        statusCode: 201,
        message: `Successfully Withdraw Balance by amount ${withdrawalAmountInRp}`,
        messageWarning,
        data: { ...balanceWithdrawal, balance },
      };
    } catch (error) {
      throw error;
    }
  }

  toRupiah(number: bigint) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(number);
  }

  calculateMaximumWithdrawal(currentBalance: bigint): bigint {
    const maximumWithdrawal = BigInt(Math.min(Number(currentBalance), 500000));
    return maximumWithdrawal;
  }

  balanceToString(balance: bigint) {
    return balance.toString();
  }
}
