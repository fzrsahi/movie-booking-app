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
    const balance = await this.prisma.balance.findUnique({
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

    const balanceInRp = this.toRupiah(balance.balance);

    return {
      statusCode: 200,
      message: 'Success Get User Balance',
      balance: balanceInRp,
      data: balance,
    };
  }

  async addBalance(dto: BalanceDto, user: User) {
    try {
      const balance = await this.prisma.balance.findUnique({
        where: {
          userId: user.id,
        },
      });

      const updateBalance = await this.prisma.balance.update({
        where: {
          userId: user.id,
        },
        data: {
          balance: balance.balance + dto.balance,
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

      const rupiah = this.toRupiah(dto.balance);
      const currentBalance = this.toRupiah(updateBalance.balance);

      return {
        statusCode: 201,
        message: `Success Add ${rupiah} to your balance!`,
        addedBalance: rupiah,
        currentBalance,
        data: updateBalance,
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

    if (currentBalance - dto.withdrawal < 0) {
      throw new BadRequestException('insufficient balance');
    }

    const maximumWithdrawal = this.calculateMaximumWithdrawal(currentBalance);
    let withdrawalAmount = dto.withdrawal;

    let messageWarning;
    if (dto.withdrawal > maximumWithdrawal) {
      withdrawalAmount = 500000;
      messageWarning =
        'The maximum amount that can be withdrawn is Min(current balance, 500.000) for each withdrawal.';
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

      const withdrawalAmountInRp = this.toRupiah(withdrawalAmount);
      const currentBalanceInRp = this.toRupiah(balanceWithdrawal.balance);

      return {
        statusCode: 201,
        message: `Successfully Withdraw Balance by amount ${withdrawalAmountInRp}`,
        currentBalance: currentBalanceInRp,
        messageWarning,
        data: balanceWithdrawal,
      };
    } catch (error) {
      throw error;
    }
  }

  toRupiah(number: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(number);
  }

  calculateMaximumWithdrawal(currentBalance: number) {
    const maximumWithdrawal = Math.min(currentBalance, 500000);
    return maximumWithdrawal;
  }
}
