import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class cancelOrderDto {
  @ApiProperty({ example: ['a2220515-4bb8-46a6-aac1-93d5eb2d64da'] })
  @IsNotEmpty()
  @IsArray()
  ticketsId: string[];
}
