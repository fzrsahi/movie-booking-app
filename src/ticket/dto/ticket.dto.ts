import { IsArray, IsNotEmpty } from 'class-validator';

export class TicketDto {
  @IsNotEmpty()
  @IsArray()
  seatNumber: number[];
}
