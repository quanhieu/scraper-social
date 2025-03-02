import { IsOptional, IsPositive, IsInt, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  limit: number = 10;
}
