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
    return userData;
  }

  async getTickets(user: User) {
    try {
      const ticketsData = await this.prisma.seats.findMany({
        where: {
          userId: user.id,
          book: true,
        },
        include: {
          Movie: {
            select: {
              title: true,
            },
          },
        },
      });

      return {
        statusCode: 200,
        message: `Success Fetch ${user.username} Data`,
        total: ticketsData.length,
        data: ticketsData,
      };
    } catch (error) {
      throw error;
    }
  }
}
