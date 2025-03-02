import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video, VideoDocument, PlatformType } from './schemas/video.schema';
import { YouTubeApiService } from './services/youtube-api.service';
import { TikTokScraperService } from './services/tiktok-scraper.service';
import { SearchVideosDto } from './dtos/search-videos.dto';
import { ParsersService } from '../parsers/parsers.service';
import { AIModelType } from '../parsers/dtos/parse-link.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { plainToInstance } from 'class-transformer';
import { VideoResponseDto } from './dtos/video-response.dto';

// Define a common video interface for both platforms
interface VideoData {
  videoId: string;
  title: string;
  description: string;
  url: string;
  platform: PlatformType;
  channelTitle: string;
  channelId: string;
  publishedAt: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  engagementRate: number;
  keywords?: string[];
}

@Injectable()
export class SocialListeningService {
  private readonly logger = new Logger(SocialListeningService.name);

  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    private readonly youtubeApiService: YouTubeApiService,
    private readonly tiktokScraperService: TikTokScraperService,
    private readonly parsersService: ParsersService,
  ) {}

  async searchVideos(
    searchVideosDto: SearchVideosDto,
  ): Promise<VideoResponseDto[]> {
    this.logger.log(
      `Searching videos with criteria: ${JSON.stringify(searchVideosDto)}`,
    );

    let keywords = searchVideosDto.keywords || [];
    let query = searchVideosDto.query || '';

    // If URL is provided but no keywords, parse the URL to extract keywords
    if (searchVideosDto.url && (!keywords.length || !query)) {
      const parseResult = await this.parsersService.parseLink({
        url: searchVideosDto.url,
        aiModel: AIModelType.CHATGPT,
      });

      keywords = parseResult.keywords;
      query = keywords.join(' ');
    }

    // If no query is provided, use keywords as query
    if (!query && keywords.length) {
      query = keywords.join(' ');
    }

    if (!query) {
      throw new Error(
        'No search criteria provided. Please provide a URL, keywords, or a search query.',
      );
    }

    // Search videos on YouTube
    const youtubeVideos = await this.searchYouTubeVideos(query);

    // Search videos on TikTok
    const tiktokVideos = await this.searchTikTokVideos(query);

    // Combine results and save to database
    const allVideos: VideoData[] = [...youtubeVideos, ...tiktokVideos];

    // Save videos to database
    const savedVideos = await Promise.all(
      allVideos.map(async (video) => {
        // Check if video already exists
        const existingVideo = await this.videoModel.findOne({
          videoId: video.videoId,
          platform: video.platform,
        });

        if (existingVideo) {
          // Update existing video with new data
          existingVideo.viewCount = video.viewCount;
          existingVideo.likeCount = video.likeCount;
          existingVideo.commentCount = video.commentCount;
          existingVideo.shareCount = video.shareCount;
          existingVideo.engagementRate = video.engagementRate;

          return existingVideo.save();
        } else {
          // Create new video
          const newVideo = new this.videoModel({
            ...video,
            keywords,
          });

          return newVideo.save();
        }
      }),
    );
    // Transform to DTO
    const responseVideos: VideoResponseDto[] = savedVideos.map((video) => {
      const videoObject = video.toObject();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const transformed = plainToInstance(VideoResponseDto, videoObject, {
        excludeExtraneousValues: true,
      }) as VideoResponseDto;
      return transformed;
    });

    return responseVideos;
  }

  async getVideos(
    paginationDto: PaginationDto,
  ): Promise<{ videos: VideoResponseDto[]; total: number }> {
    const { page, limit } = paginationDto;

    const [videos, total] = await Promise.all([
      this.videoModel
        .find()
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.videoModel.countDocuments(),
    ]);

    return {
      videos: videos.map(
        (video) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          plainToInstance(VideoResponseDto, video.toObject(), {
            excludeExtraneousValues: true,
          }) as VideoResponseDto,
      ),
      total,
    };
  }

  async getVideoById(id: string): Promise<VideoResponseDto> {
    const video = await this.videoModel.findById(id);

    if (!video) {
      throw new Error(`Video with ID ${id} not found`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return plainToInstance(VideoResponseDto, video.toObject(), {
      excludeExtraneousValues: true,
    }) as VideoResponseDto;
  }

  private async searchYouTubeVideos(query: string): Promise<VideoData[]> {
    try {
      const searchResults = await this.youtubeApiService.searchVideos(query);
      const videoIds = searchResults.map((item) => item.videoId);

      if (!videoIds.length) {
        return [];
      }

      return (await this.youtubeApiService.getVideoDetails(
        videoIds,
      )) as VideoData[];
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error searching YouTube videos: ${errorMessage}`);
      return [];
    }
  }

  private async searchTikTokVideos(query: string): Promise<VideoData[]> {
    try {
      const searchResults = await this.tiktokScraperService.searchVideos(query);
      const videoUrls = searchResults.map((item) => item.url);

      if (!videoUrls.length) {
        return [];
      }

      return (await this.tiktokScraperService.getVideoDetails(
        videoUrls,
      )) as VideoData[];
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error searching TikTok videos: ${errorMessage}`);
      return [];
    }
  }
}
