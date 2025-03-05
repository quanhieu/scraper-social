import { Controller, Post, Body, Get, Query, Res, Req } from '@nestjs/common';
import { TiktokService } from './tiktok.service';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';

class TikTokUrlDto {
  url: string;
}

class TikTokSearchDto {
  keyword: string;
  maxCount?: number;
}

@ApiTags('TikTok')
@Controller('tiktok')
export class TiktokController {
  constructor(private readonly tiktokService: TiktokService) {}

  @Post('video-info')
  @ApiOperation({ summary: 'Get TikTok video information by URL' })
  @ApiBody({ type: TikTokUrlDto })
  @ApiResponse({
    status: 200,
    description: 'Video information retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid TikTok URL provided' })
  @ApiResponse({
    status: 500,
    description: 'Server error during API request',
  })
  async getVideoInfo(@Body('url') url: string): Promise<any> {
    return this.tiktokService.getVideoInfoByUrl(url);
  }

  @Post('search')
  @ApiOperation({ summary: 'Search TikTok videos by keyword' })
  @ApiBody({ type: TikTokSearchDto })
  @ApiResponse({
    status: 200,
    description: 'Videos retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters provided' })
  @ApiResponse({
    status: 500,
    description: 'Server error during API request',
  })
  async searchVideos(@Body() searchDto: TikTokSearchDto): Promise<any> {
    return this.tiktokService.searchVideoByKeyword(
      searchDto.keyword,
      searchDto.maxCount || 20,
    );
  }

  // @Get('auth')
  // @ApiOperation({ summary: 'Get TikTok authorization URL' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Authorization URL generated successfully',
  // })
  // async getAuthUrl(@Res({ passthrough: true }) res: Response) {
  //   const { url, csrfState } = this.tiktokService.generateAuthUrl();

  //   // Set CSRF state as a cookie for validation when the user is redirected back
  //   res.cookie('csrfState', csrfState, {
  //     httpOnly: true,
  //     maxAge: 60000, // 1 minute expiry
  //     sameSite: 'lax',
  //     secure: process.env.NODE_ENV === 'production',
  //   });

  //   return { url };
  // }

  // @Get('callback')
  // @ApiOperation({ summary: 'Handle TikTok authorization callback' })
  // @ApiQuery({ name: 'code', required: true, type: String })
  // @ApiQuery({ name: 'state', required: true, type: String })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Authorization successful',
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Invalid state or authorization code',
  // })
  // async handleCallback(
  //   @Query('code') code: string,
  //   @Query('state') state: string,
  //   @Req() req: any,
  // ) {
  //   // Validate CSRF state to prevent CSRF attacks
  //   const storedState = req.cookies.csrfState;
  //   if (!storedState || storedState !== state) {
  //     return { success: false, message: 'Invalid state parameter' };
  //   }

  //   try {
  //     // Exchange the code for an access token
  //     const tokenResponse = await this.tiktokService.exchangeCodeForToken(code);

  //     // Clear the CSRF cookie
  //     req.res.clearCookie('csrfState');

  //     return {
  //       success: true,
  //       message: 'Authorization successful',
  //       access_token: tokenResponse.access_token,
  //       open_id: tokenResponse.open_id,
  //       expires_in: tokenResponse.expires_in,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message || 'Failed to exchange authorization code',
  //     };
  //   }
  // }
}
