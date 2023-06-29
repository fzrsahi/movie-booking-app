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
    });

    return user;
  }
}
