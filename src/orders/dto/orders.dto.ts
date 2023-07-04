import { IsArray, IsNotEmpty } from 'class-validator';

export class cancelOrderDto {
  @IsNotEmpty()
  @IsArray()
  ticketsId: string[];
}
