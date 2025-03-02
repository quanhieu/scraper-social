import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { PlatformType } from '../schemas/video.schema';

interface TikTokVideo {
  videoId: string;
  title: string;
  url: string;
  channelTitle: string;
  description?: string;
  channelId?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  platform?: PlatformType;
  publishedAt?: Date;
  engagementRate?: number;
}

@Injectable()
export class TikTokScraperService {
  private readonly logger = new Logger(TikTokScraperService.name);

  async searchVideos(query: string, maxResults = 10): Promise<TikTokVideo[]> {
    this.logger.log(`Searching TikTok videos for query: ${query}`);
    let browser: puppeteer.Browser | undefined;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.goto(
        `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`,
        {
          waitUntil: 'networkidle2',
          timeout: 60000,
        },
      );

      // Wait for videos to load
      await page.waitForSelector('.tiktok-x6y88p-DivItemContainerV2', {
        timeout: 10000,
      });

      // Extract video data
      const videos = await page.evaluate((max) => {
        const items = Array.from(
          document.querySelectorAll('.tiktok-x6y88p-DivItemContainerV2'),
        );
        return items.slice(0, max).map((item) => {
          const link = item.querySelector('a')?.href || '';
          const videoId = link.split('/').pop() || '';
          const title =
            item.querySelector('.tiktok-j2a19r-SpanText')?.textContent || '';
          const channelTitle =
            item.querySelector('.tiktok-2zn17h-SpanUniqueId')?.textContent ||
            '';

          return {
            videoId,
            title,
            url: link,
            channelTitle,
          };
        });
      }, maxResults);

      return videos as TikTokVideo[];
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error searching TikTok videos: ${errorMessage}`);
      throw new Error(`Failed to search TikTok videos: ${errorMessage}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async getVideoDetails(videoUrls: string[]): Promise<TikTokVideo[]> {
    this.logger.log(`Getting details for ${videoUrls.length} TikTok videos`);
    let browser: puppeteer.Browser | undefined;
    const results: TikTokVideo[] = [];

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      for (const url of videoUrls) {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Extract video details
        const videoData = await page.evaluate(() => {
          const videoId = window.location.pathname.split('/').pop() || '';
          const title =
            document.querySelector('.tiktok-j2a19r-SpanText')?.textContent ||
            '';
          const description =
            document.querySelector('.tiktok-1ejylhp-DivContainer')
              ?.textContent || '';
          const channelTitle =
            document.querySelector('.tiktok-2zn17h-SpanUniqueId')
              ?.textContent || '';
          const channelId = channelTitle.replace('@', '');
          const viewCountText =
            document.querySelector('.tiktok-1xiuanb-StrongVideoCount')
              ?.textContent || '0';
          const likeCountText =
            document.querySelector('.tiktok-1xiuanb-StrongVideoLikeCount')
              ?.textContent || '0';
          const commentCountText =
            document.querySelector('.tiktok-1xiuanb-StrongVideoCommentCount')
              ?.textContent || '0';
          const shareCountText =
            document.querySelector('.tiktok-1xiuanb-StrongVideoShareCount')
              ?.textContent || '0';

          // Convert counts from format like "1.2M" or "1.2B" to numbers
          const parseCount = (text: string) => {
            if (!text) return 0;
            const num = parseFloat(text.replace(/[^0-9.]/g, ''));
            if (text.includes('K')) return num * 1000;
            if (text.includes('M')) return num * 1000000;
            if (text.includes('B')) return num * 1000000000;
            return num;
          };

          const viewCount = parseCount(viewCountText);
          const likeCount = parseCount(likeCountText);
          const commentCount = parseCount(commentCountText);
          const shareCount = parseCount(shareCountText);

          return {
            videoId,
            title,
            description,
            channelTitle,
            channelId,
            viewCount,
            likeCount,
            commentCount,
            shareCount,
          };
        });

        results.push({
          ...(videoData as TikTokVideo),
          url,
          platform: PlatformType.TIKTOK,
          publishedAt: new Date(), // TikTok doesn't easily expose publish date via scraping
          engagementRate: this.calculateEngagementRate(
            videoData.viewCount,
            videoData.likeCount,
            videoData.commentCount,
            videoData.shareCount,
          ),
        });

        await page.close();
      }

      return results;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting TikTok video details: ${errorMessage}`);
      throw new Error(`Failed to get TikTok video details: ${errorMessage}`);
    } finally {
      if (browser) {
        await browser.close();
      }
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
