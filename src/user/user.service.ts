import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async getUserData(user: User) {
    const userData = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        balance: {
          select: {
            balance: true,
          },
        },
        Tickets: {
          select: {
            id: true,
            bookAt: true,
            cancelAt: true,
            isCancel: true,
            Seats: {
              select: {
                id: true,
                isBook: true,
                Movie: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const balance = userData.balance.balance.toString();

    delete userData.balance.balance;
    delete userData.hash;
    return {
      statusCode: 200,
      message: `Success Fetch ${user.username} data `,
      data: { ...userData, balance },
    };
  }

  async getTicketsById(user: User, ticketsId: string) {
    const tickets = await this.prisma.tickets.findUnique({
      where: {
        id: ticketsId,
      },
      include: {
        Seats: {
          include: {
            Movie: true,
          },
        },
        User: true,
      },
    });

    delete tickets.User.hash;

    return {
      statusCode: 200,
      message: `Success Fetch ${user.username} data`,
      data: tickets,
    };
  }
}
