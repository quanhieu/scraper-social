import { IsArray, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ParseResultDto {
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @IsNotEmpty()
  @IsString()
  summary: string;
}
