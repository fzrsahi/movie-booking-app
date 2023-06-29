import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, UserLoginDto } from './dto/';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async createUser(@Body() dto: CreateUserDto) {
    return this.authService.createUser(dto);
  }

  @HttpCode(200)
  @Post('signin')
  userLogin(@Body() dto: UserLoginDto) {
    return this.authService.userLogin(dto);
  }
}
