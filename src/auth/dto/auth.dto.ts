import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  hash: string;

  @IsNotEmpty()
  birth: string;

  @IsNumber()
  @IsOptional()
  age?: number;
}

// export class userDto {
//   @IsString()
//   @IsNotEmpty()
//   username: string;

//   @IsString()
//   @IsNotEmpty()
//   hash: string;
// }
