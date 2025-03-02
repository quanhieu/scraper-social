import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ContentScraperService {
  private readonly logger = new Logger(ContentScraperService.name);

  async scrapeWebsite(url: string): Promise<string> {
    this.logger.log(`Scraping content from ${url}`);
    let browser;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await (browser as puppeteer.Browser).newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      // Extract text content from the page
      const content = await page.evaluate(() => {
        // Remove script and style elements
        const scripts = document.querySelectorAll('script, style');
        scripts.forEach((script) => script.remove());

        // Get text from body
        return document.body.innerText;
      });

      return content;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error scraping website: ${errorMessage}`);
      throw new Error(`Failed to scrape website: ${errorMessage}`);
    } finally {
      if (browser) {
        await (browser as puppeteer.Browser).close();
      }
    }
  }

  async scrapeYouTubeVideo(url: string): Promise<string> {
    this.logger.log(`Scraping YouTube video content from ${url}`);
    let browser;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await (browser as puppeteer.Browser).newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      // Extract video title and description
      const content = await page.evaluate(() => {
        const title = document.querySelector('h1.title')?.textContent || '';
        const description =
          document.querySelector('#description-inline-expander')?.textContent ||
          '';
        return `${title}\n\n${description}`;
      });

      return content;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error scraping YouTube video: ${errorMessage}`);
      throw new Error(`Failed to scrape YouTube video: ${errorMessage}`);
    } finally {
      if (browser) {
        await (browser as puppeteer.Browser).close();
      }
    }
  }

  async scrapeTikTokVideo(url: string): Promise<string> {
    this.logger.log(`Scraping TikTok video content from ${url}`);
    let browser;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await (browser as puppeteer.Browser).newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      // Extract video caption
      const content = await page.evaluate(() => {
        const caption =
          document.querySelector('.tiktok-1ejylhp-DivContainer.e11995xo0')
            ?.textContent || '';
        return caption;
      });

      return content;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error scraping TikTok video: ${errorMessage}`);
      throw new Error(`Failed to scrape TikTok video: ${errorMessage}`);
    } finally {
      if (browser) {
        await (browser as puppeteer.Browser).close();
      }
    }
  }
}
