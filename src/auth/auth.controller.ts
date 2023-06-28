import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async createUser(@Body() dto: CreateUserDto) {
    const saltOrRounds = 10;
    const salt = await bcrypt.genSalt();
    const password = salt + dto.hash + salt;
    const hash = await bcrypt.hash(password, saltOrRounds);

    const age = this.getAge(dto.birth);

    const CreateUserDto: CreateUserDto = {
      username: dto.email,
      email: dto.email,
      birth: dto.birth,
      age: age,
      hash,
    };

    return this.authService.createUser(CreateUserDto);
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
}
