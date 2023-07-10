import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getCurrentUserLogin(@GetUser() user: User) {
    return this.userService.getCurrentUserLogin(user);
  }

  @Get('tickets')
  getTickets(@GetUser() user: User) {
    return this.userService.getTickets(user);
  }

  @Get('tickets/:id')
  getTicketsById(@GetUser() user: User, @Param() ticketsId) {
    return this.userService.getTicketsById(user, ticketsId.id);
  }
}
