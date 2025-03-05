import { ApiProperty } from '@nestjs/swagger';

export class YouTubeUrlDto {
  @ApiProperty({
    example:
      'https://www.youtube.com/watch?v=3SDBTVcBUVs&list=RD3SDBTVcBUVs&start_radio=1',
  })
  url: string;
}

export class YouTubeSearchDto {
  @ApiProperty({
    example: 'Nồi chiên không dầu',
  })
  keyword: string;

  @ApiProperty({ required: false, example: 20 })
  maxResults?: number;
}

export class YouTubeVideoResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };

  @ApiProperty()
  viewCount: number;

  @ApiProperty()
  likeCount: number;

  @ApiProperty()
  commentCount: number;

  @ApiProperty()
  favoriteCount: number;

  @ApiProperty()
  averageInteraction: number;
}