import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class TicketDto {
  @ApiProperty({example : [1,2,3]})
  @IsNotEmpty()
  @IsArray()
  seatNumber: number[];
}
