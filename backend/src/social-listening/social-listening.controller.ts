import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SocialListeningService } from './social-listening.service';
import { SearchVideosDto } from './dtos/search-videos.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { ApiResponseDto } from '../common/dtos/api-response.dto';
import { VideoResponseDto } from './dtos/video-response.dto';

@Controller()
@UseGuards(AuthGuard('api-key'))
export class SocialListeningController {
  constructor(
    private readonly socialListeningService: SocialListeningService,
  ) {}

  @Post('search-videos')
  async searchVideos(
    @Body() searchVideosDto: SearchVideosDto,
  ): Promise<ApiResponseDto<VideoResponseDto[]>> {
    try {
      const videos =
        await this.socialListeningService.searchVideos(searchVideosDto);
      return ApiResponseDto.success(videos, 'Videos searched successfully');
    } catch (error: unknown) {
      return ApiResponseDto.error(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  @Get('videos')
  async getVideos(
    @Query() paginationDto: PaginationDto,
  ): Promise<ApiResponseDto<{ videos: VideoResponseDto[]; total: number }>> {
    try {
      const result = await this.socialListeningService.getVideos(paginationDto);
      return ApiResponseDto.success(result, 'Videos retrieved successfully');
    } catch (error: unknown) {
      return ApiResponseDto.error(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  @Get('video/:id')
  async getVideoById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<VideoResponseDto>> {
    try {
      const video = await this.socialListeningService.getVideoById(id);
      return ApiResponseDto.success(video, 'Video retrieved successfully');
    } catch (error) {
      return ApiResponseDto.error(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }
}
