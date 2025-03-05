import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import {
  SearchItem,
  VideoItem,
  YouTubeVideoInfo,
  YouTubeVideoInfoDetail,
} from 'src/modules/youtube/interface';
import { PREFIX_SEARCH } from 'src/utils';
@Injectable()
export class YoutubeService {
  private youtube;

  constructor(private configService: ConfigService) {
    this.youtube = google.youtube({
      version: 'v3',
      auth: this.configService.get('youtube.apiKey'),
    });
  }

  private extractVideoId(url: string): string | null {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  async getVideoInfoByUrl(url: string): Promise<YouTubeVideoInfo | null> {
    const videoId = this.extractVideoId(url);
    console.log('videoId', videoId);

    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'statistics'],
        id: [videoId],
      });

      const video: YouTubeVideoInfoDetail['items'][0] = response.data.items[0];
      if (!video) return null;

      // TODO: Calculate Average Interaction
      // const averageInteraction =
      //   (Number(video?.statistics?.viewCount) +
      //     Number(video?.statistics?.likeCount) +
      //     Number(video?.statistics?.commentCount) +
      //     Number(video?.statistics?.favoriteCount)) /
      //   4;

      const viewCount = Number(video.statistics.viewCount || 0);
      const likeCount = Number(video.statistics.likeCount || 0);
      const commentCount = Number(video.statistics.commentCount || 0);
      const favoriteCount = Number(video.statistics.favoriteCount || 0);

      // Calculate Average Interaction
      const totalInteractions = likeCount + commentCount + favoriteCount;
      const averageInteraction =
        viewCount > 0 ? totalInteractions / viewCount : 0;

      return {
        id: video?.id,
        title: video?.snippet?.title,
        description: video?.snippet?.description,
        thumbnails: {
          default: video?.snippet?.thumbnails?.default?.url,
          medium: video?.snippet?.thumbnails?.medium?.url,
          high: video?.snippet?.thumbnails?.high?.url,
        },
        viewCount: viewCount,
        likeCount: likeCount,
        commentCount: commentCount,
        favoriteCount: favoriteCount,
        averageInteraction: averageInteraction,
      };
    } catch (error) {
      throw new Error(`Failed to fetch video details: ${error.message}`);
    }
  }

  async searchVideos(
    keyword: string,
    maxResults = 20,
    prefixSearch: string = PREFIX_SEARCH.REVIEW,
  ): Promise<YouTubeVideoInfo[]> {
    try {
      const prefix = PREFIX_SEARCH[prefixSearch] || PREFIX_SEARCH.REVIEW;

      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        q: `"${prefix} ${keyword}"`,
        maxResults,
        type: ['video'],
      });

      const videoIds = searchResponse.data.items
        .map((item: SearchItem) => item?.id?.videoId)
        .filter(Boolean)
        .join(',');

      if (!videoIds) {
        return [];
      }

      const videoResponse = await this.youtube.videos.list({
        part: ['snippet', 'statistics'],
        id: [videoIds],
      });

      const result: YouTubeVideoInfo[] = videoResponse.data.items.map(
        (video: VideoItem | YouTubeVideoInfoDetail['items'][0]) => {
          const viewCount = Number(video.statistics.viewCount || 0);
          const likeCount = Number(video.statistics.likeCount || 0);
          const commentCount = Number(video.statistics.commentCount || 0);
          const favoriteCount = Number(video.statistics.favoriteCount || 0);

          // Calculate Average Interaction
          const totalInteractions = likeCount + commentCount + favoriteCount;
          const averageInteraction =
            viewCount > 0 ? totalInteractions / viewCount : 0;

          return {
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnails: {
              default: video.snippet.thumbnails.default.url,
              medium: video.snippet.thumbnails.medium.url,
              high: video.snippet.thumbnails.high.url,
            },
            viewCount,
            likeCount,
            commentCount,
            favoriteCount,
            averageInteraction,
            videoUrl: `https://www.youtube.com/watch?v=${video?.id}`,
          };
        },
      );

      return result;
    } catch (error) {
      throw new Error(`Failed to search videos: ${error.message}`);
    }
  }
}
