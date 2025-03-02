import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PlatformType } from '../schemas/video.schema';

interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    channelTitle: string;
    channelId: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

interface YouTubeSearchResponse {
  items: Array<{
    id: { videoId: string };
    snippet: {
      title: string;
      description: string;
      channelTitle: string;
      channelId: string;
      publishedAt: string;
    };
  }>;
}

interface YouTubeVideoResponse {
  items: YouTubeVideo[];
}

interface VideoResult {
  videoId: string;
  title: string;
  description: string;
  url: string;
  platform: PlatformType;
  channelTitle: string;
  channelId: string;
  publishedAt: Date;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  engagementRate?: number;
}

@Injectable()
export class YouTubeApiService {
  private readonly logger = new Logger(YouTubeApiService.name);
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('YOUTUBE_API_KEY') || '';
  }

  async searchVideos(query: string, maxResults = 10): Promise<VideoResult[]> {
    try {
      const response = await axios.get<YouTubeSearchResponse>(
        'https://www.googleapis.com/youtube/v3/search',
        {
          params: {
            key: this.apiKey,
            q: query,
            part: 'snippet',
            maxResults,
            type: 'video',
            order: 'relevance',
          },
        },
      );

      return response.data.items.map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: new Date(item.snippet.publishedAt),
        platform: PlatformType.YOUTUBE,
      }));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error searching YouTube videos: ${errorMessage}`);
      throw new Error(`Failed to search YouTube videos: ${errorMessage}`);
    }
  }

  async getVideoDetails(videoIds: string[]): Promise<VideoResult[]> {
    try {
      const response = await axios.get<YouTubeVideoResponse>(
        'https://www.googleapis.com/youtube/v3/videos',
        {
          params: {
            key: this.apiKey,
            id: videoIds.join(','),
            part: 'snippet,statistics',
          },
        },
      );

      return response.data.items.map((item) => ({
        videoId: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        url: `https://www.youtube.com/watch?v=${item.id}`,
        platform: PlatformType.YOUTUBE,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: new Date(item.snippet.publishedAt),
        viewCount: parseInt(item.statistics.viewCount, 10) || 0,
        likeCount: parseInt(item.statistics.likeCount, 10) || 0,
        commentCount: parseInt(item.statistics.commentCount, 10) || 0,
        shareCount: 0, // YouTube API doesn't provide share count
        engagementRate: this.calculateEngagementRate(
          parseInt(item.statistics.viewCount, 10) || 0,
          parseInt(item.statistics.likeCount, 10) || 0,
          parseInt(item.statistics.commentCount, 10) || 0,
          0,
        ),
      }));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting YouTube video details: ${errorMessage}`);
      throw new Error(`Failed to get YouTube video details: ${errorMessage}`);
    }
  }

  private calculateEngagementRate(
    viewCount: number,
    likeCount: number,
    commentCount: number,
    shareCount: number,
  ): number {
    if (viewCount === 0) return 0;
    return ((likeCount + commentCount + shareCount) / viewCount) * 100;
  }
}
