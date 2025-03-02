import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class SearchVideosDto {
  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid URL' })
  url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsString()
  query?: string;
}
