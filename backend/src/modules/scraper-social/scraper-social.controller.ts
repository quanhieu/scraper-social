import { Controller, Get, Query } from '@nestjs/common';
import {
  ScraperSocialService,
  TikTokSearchResult,
} from './scraper-social.service';
import {
  IYouTubeVideoInfo,
  ITikTokVideoInfo,
  IYouTubeSearchResult,
  IYouTubeMusicInfo,
  IFacebookVideoInfo,
  IInstagramVideoInfo,
  ITwitterInfo,
  IGoogleSearchResult,
} from './interface';
import { ApiQuery } from '@nestjs/swagger';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperSocialService) {}

  @Get('tiktok/info')
  @ApiQuery({
    name: 'url',
    description: 'The URL of the TikTok video',
    example:
      'https://www.tiktok.com/@duyluandethuong/video/7418467301294345480?q=gt5%20pro%20huawei&t=1741010299353',
  })
  async getTikTokVideoInfo(
    @Query('url') url: string,
  ): Promise<ITikTokVideoInfo> {
    return this.scraperService.getTikTokVideoInfo(url);
  }

  // @Get('tiktok/search')
  // @ApiQuery({
  //   name: 'keyword',
  //   description: 'The keyword to search for on TikTok',
  //   example: 'Nồi chiên không dầu',
  // })
  // async tiktokSearchScrapeData(
  //   @Query('keyword') keyword: string,
  // ): Promise<TikTokSearchResult[]> {
  //   return this.scraperService.tiktokSearchScrapeData(keyword);
  // }

  @Get('youtube/info')
  @ApiQuery({
    name: 'url',
    description: 'The URL of the YouTube video',
    example: 'https://www.youtube.com/watch?v=SYq0kH7IA6g',
  })
  async getYouTubeVideoInfo(
    @Query('url') url: string,
  ): Promise<IYouTubeVideoInfo> {
    return this.scraperService.getYouTubeVideoInfo(url);
  }

  @Get('youtube/search')
  @ApiQuery({
    name: 'query',
    description: 'The query to search for on YouTube',
    example: 'Xiaomi watch',
  })
  async searchYouTube(
    @Query('query') query: string,
  ): Promise<IYouTubeSearchResult> {
    return this.scraperService.searchYouTube(query);
  }

  @Get('youtube/music/info')
  @ApiQuery({
    name: 'url',
    description: 'The URL of the YouTube music',
    example:
      'https://music.youtube.com/watch?v=Z1D26z9l8y8&list=RDTMAK5uy_nilrsVWxrKskY0ZUpVZ3zpB0u4LwWTVJ4',
  })
  async getYouTubeMusicInfo(
    @Query('url') url: string,
  ): Promise<IYouTubeMusicInfo> {
    return this.scraperService.getYouTubeMusicInfo(url);
  }

  @Get('instagram/info')
  @ApiQuery({
    name: 'url',
    description: 'The URL of the Instagram media',
    example: 'https://www.instagram.com/reels/DFNm0KfJYHV/',
  })
  async getInstagramMedia(
    @Query('url') url: string,
  ): Promise<IInstagramVideoInfo> {
    return this.scraperService.getInstagramMedia(url);
  }

  @Get('facebook/info')
  @ApiQuery({
    name: 'url',
    description: 'The URL of the Facebook media',
    example: 'https://www.facebook.com/watch?v=1321597085730307',
  })
  async getFacebookMedia(
    @Query('url') url: string,
  ): Promise<IFacebookVideoInfo[]> {
    return this.scraperService.getFacebookMedia(url);
  }

  @Get('google/search')
  @ApiQuery({
    name: 'query',
    description: 'The query to search for on Google',
    example: 'Nồi chiên không dầu',
  })
  async googleSearch(
    @Query('query') query: string,
  ): Promise<IGoogleSearchResult> {
    return this.scraperService.googleSearch(query);
  }

  @Get('twitter/info')
  @ApiQuery({
    name: 'url',
    description: 'The URL of the Twitter media',
    example: 'https://twitter.com/i/status/1741010299353',
  })
  async getTwitterMedia(@Query('url') url: string): Promise<ITwitterInfo[]> {
    return this.scraperService.getTwitterMedia(url);
  }
}
