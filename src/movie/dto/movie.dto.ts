import { ApiProperty } from "@nestjs/swagger";

export class SearchQueryDto {
  @ApiProperty()
  title: string;
}
