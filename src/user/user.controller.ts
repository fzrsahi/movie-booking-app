import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtGuard)
@Controller('users')
@ApiTags("Users")
@ApiBearerAuth('JWTAUTH')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getCurrentUserLogin(@GetUser() user: User) {
    return this.userService.getUserData(user);
  }

  @Get('tickets/:id')
  getTicketsById(@GetUser() user: User, @Param("id") ticketsId : string) {
    return this.userService.getTicketsById(user, ticketsId);
  }
}
