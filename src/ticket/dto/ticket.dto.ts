import { IsNotEmpty } from 'class-validator';

export class TicketDto {
  @IsNotEmpty()
  seatNumber: number | number[];
}
