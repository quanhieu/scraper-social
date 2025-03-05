import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { YouTubeVideoInfo } from './interface';
import { YouTubeUrlDto, YouTubeVideoResponseDto } from './dto/youtube.dto';

@ApiTags('YouTube')
@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Post('video-info')
  @ApiOperation({ summary: 'Get YouTube video information by URL' })
  @ApiBody({ type: YouTubeUrlDto })
  @ApiResponse({
    status: 200,
    description: 'Video information retrieved successfully',
    type: YouTubeVideoResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid YouTube URL provided' })
  @ApiResponse({
    status: 500,
    description: 'Server error during API request',
  })
  async getVideoInfo(
    @Body('url') url: string,
  ): Promise<YouTubeVideoInfo | null> {
    return this.youtubeService.getVideoInfoByUrl(url);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search YouTube videos by keyword' })
  @ApiQuery({ name: 'keyword', required: true, type: String })
  @ApiQuery({ name: 'maxResults', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Videos retrieved successfully',
    type: [YouTubeVideoResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters provided' })
  @ApiResponse({
    status: 500,
    description: 'Server error during API request',
  })
  async searchVideos(
    @Query('keyword') keyword: string,
    @Query('maxResults') maxResults?: number,
  ): Promise<YouTubeVideoInfo[]> {
    return this.youtubeService.searchVideos(keyword, maxResults);
  }
}
