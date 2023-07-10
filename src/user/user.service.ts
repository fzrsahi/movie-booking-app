import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async getCurrentUserLogin(user: User) {
    const userData = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        balance: true,
      },
    });
    delete userData.hash;
    return {
      statusCode: 200,
      message: `Success Fetch ${user.username} data `,
      data: userData,
    };
  }

  async getTickets(user: User) {
    try {
      const ticketsData = await this.prisma.tickets.findMany({
        where: {
          userId: user.id,
          isCancel: false,
        },
        include: {
          Seats: {
            include: {
              Movie: true,
            },
          },
        },
      });

      return {
        statusCode: 200,
        message: `Success Fetch ${user.username} Data`,
        length: ticketsData.length,
        data: ticketsData,
      };
    } catch (error) {
      throw error;
    }
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
