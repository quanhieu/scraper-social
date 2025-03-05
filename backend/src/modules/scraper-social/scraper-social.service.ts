import { Injectable } from '@nestjs/common';
import { ttdl, ytsearch, ytmp4, igdl, fbdl, ytmp3 } from 'ruhend-scraper';
import { tiktokdl, twitter, googleit } from '@bochilteam/scraper';
import { Builder, By, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
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

export interface TikTokSearchResult {
  title: string;
  views: string;
  likes: string;
  comments: string;
  shares: string;
}

@Injectable()
export class ScraperSocialService {
  private driver: WebDriver;

  constructor() {
    const options = new chrome.Options();
    options.addArguments('--headless'); // Chạy trình duyệt ở chế độ không hiển thị
    this.driver = new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  }

  async onModuleInit() {
    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(
        new chrome.Options()
          .headless()
          .addArguments([
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--remote-debugging-port=9222',
            '--disable-software-rasterizer',
          ]),
      )
      .build();
  }

  // search Tiktok
  async tiktokSearchScrapeData(keyword: string): Promise<TikTokSearchResult[]> {
    const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(keyword)}`;
    await this.driver.get(searchUrl);

    // Cuộn trang để tải thêm video
    let lastHeight = await this.driver.executeScript(
      'return document.body.scrollHeight',
    );
    while (true) {
      await this.driver.executeScript(
        'window.scrollTo(0, document.body.scrollHeight);',
      );
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Chờ 2 giây để nội dung tải
      const newHeight = await this.driver.executeScript(
        'return document.body.scrollHeight',
      );
      if (newHeight === lastHeight) {
        break;
      }
      lastHeight = newHeight;
    }

    // Lấy danh sách các video
    const videos = await this.driver.findElements(
      By.css('div[data-e2e="search_top-item-list"]'),
    );

    const results: TikTokSearchResult[] = [];
    for (const video of videos) {
      try {
        const title = await video
          .findElement(By.css('a div div:nth-child(2) > div > h3'))
          .getText();
        const stats = await video.findElements(
          By.css('a div div:nth-child(2) > div > div > strong'),
        );
        const [views, likes, comments, shares] = await Promise.all<string>(
          stats.map((stat) =>
            stat ? (stat.getText() as Promise<string>) : Promise.resolve('0'),
          ),
        );

        results.push({
          title,
          views,
          likes,
          comments,
          shares,
        });
      } catch (error) {
        console.error('Error extracting video data:', error);
      }
    }

    await this.driver.quit();
    return results;
  }

  // TikTok info
  async getTikTokVideoInfo(url: string): Promise<ITikTokVideoInfo> {
    try {
      const data = await ttdl(url);
      return data as ITikTokVideoInfo;
    } catch (error) {
      throw new Error(`Failed to fetch TikTok video info: ${error.message}`);
    }
  }

  async getTikTokVideoInfoV2(url: string): Promise<any> {
    try {
      const data = await tiktokdl(url);
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch TikTok video info: ${error.message}`);
    }
  }

  // YouTube info
  async getYouTubeVideoInfo(url: string): Promise<IYouTubeVideoInfo> {
    try {
      const data = await ytmp4(url);
      return data as IYouTubeVideoInfo;
    } catch (error) {
      throw new Error(`Failed to fetch YouTube video info: ${error.message}`);
    }
  }

  // YouTube search
  async searchYouTube(query: string): Promise<IYouTubeSearchResult> {
    try {
      const { video, channel } = await ytsearch(query);
      return { video, channel };
    } catch (error) {
      throw new Error(`Failed to search YouTube: ${error.message}`);
    }
  }

  // YouTube Music Info
  async getYouTubeMusicInfo(url: string): Promise<IYouTubeMusicInfo> {
    try {
      const data = await ytmp3(url);
      return data as IYouTubeMusicInfo;
    } catch (error) {
      throw new Error(`Failed to fetch YouTube music info: ${error.message}`);
    }
  }

  // Instagram Media
  async getInstagramMedia(url: string): Promise<IInstagramVideoInfo> {
    try {
      const res = await igdl(url);
      return res as IInstagramVideoInfo;
    } catch (error) {
      throw new Error(`Failed to fetch Instagram media: ${error.message}`);
    }
  }

  // Facebook Media
  async getFacebookMedia(url: string): Promise<IFacebookVideoInfo[]> {
    try {
      const res = await fbdl(url);
      const rep = await res?.data;
      return rep as IFacebookVideoInfo[];
    } catch (error) {
      throw new Error(`Failed to fetch Facebook media: ${error.message}`);
    }
  }

  // Google search
  async googleSearch(query: string): Promise<IGoogleSearchResult> {
    try {
      const res = await googleit(query);
      return res as IGoogleSearchResult;
    } catch (error) {
      throw new Error(`Failed to search Google: ${error.message}`);
    }
  }

  // Twitter Media
  async getTwitterMedia(url: string): Promise<ITwitterInfo[]> {
    try {
      const res = await twitter(url);
      return res as ITwitterInfo[];
    } catch (error) {
      throw new Error(`Failed to fetch Twitter media: ${error.message}`);
    }
  }
}
