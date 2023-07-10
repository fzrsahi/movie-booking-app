import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, UserLoginDto } from './dto';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}
  async createUser(dto: CreateUserDto) {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(dto.hash, saltOrRounds);
    const age = this.getAge(dto.birth);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          username: dto.username,
          email: dto.email,
          birth: dto.birth,
          age,
          hash,
          balance: {
            create: {
              balance: 0,
            },
          },
        },
      });

      console.log({ user });

      delete user.hash;
      return {
        statusCode: 201,
        message: 'User Created',
        data: user,
      };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (e.code === 'P2002') {
          throw new ForbiddenException(
            'There is a unique constraint violation, a new user cannot be created with this email or this username',
          );
        }
      }
      throw e;
    }
  }

  async userLogin(dto: UserLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });

    try {
      if (!user) throw new ForbiddenException('Account Not Found!');
      const pwMatches = await bcrypt.compare(dto.hash, user.hash);
      if (!pwMatches) throw new ForbiddenException('Account Not Found!');
      delete user.hash;
      const token = await this.signToken(user.id, user.email);
      return {
        statusCode: 200,
        message: 'Log In!',
        data: user,
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  async signToken(id: string, email: string): Promise<string> {
    const payload = { sub: id, email };
    return this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: this.config.get('SECRET_TOKEN'),
    });
  }
}
