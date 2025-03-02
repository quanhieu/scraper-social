import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ParsersService } from './parsers.service';
import { ParseLinkDto } from './dtos/parse-link.dto';
import { ParseResultDto } from './dtos/parse-result.dto';
import { ApiResponseDto } from '../common/dtos/api-response.dto';

@Controller('parse-link')
@UseGuards(AuthGuard('api-key'))
export class ParsersController {
  constructor(private readonly parsersService: ParsersService) {}

  @Post()
  async parseLink(
    @Body() parseLinkDto: ParseLinkDto,
  ): Promise<ApiResponseDto<ParseResultDto>> {
    try {
      const result = await this.parsersService.parseLink(parseLinkDto);
      return ApiResponseDto.success(result, 'Link parsed successfully');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return ApiResponseDto.error(errorMessage);
    }
  }
}
