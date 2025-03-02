import {
  IsArray,
  IsDate,
  IsEnum,
  IsNumber,
  IsString,
  IsUrl,
} from 'class-validator';
import { PlatformType } from '../schemas/video.schema';

export class VideoResponseDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsUrl()
  url: string;

  @IsString()
  videoId: string;

  @IsEnum(PlatformType)
  platform: PlatformType;

  @IsString()
  channelTitle: string;

  @IsString()
  channelId: string;

  @IsDate()
  publishedAt: Date;

  @IsNumber()
  viewCount: number;

  @IsNumber()
  likeCount: number;

  @IsNumber()
  commentCount: number;

  @IsNumber()
  shareCount: number;

  @IsNumber()
  engagementRate: number;

  @IsArray()
  @IsString({ each: true })
  keywords: string[];
}
