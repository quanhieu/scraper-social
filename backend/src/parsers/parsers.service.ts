import { Injectable, Logger } from '@nestjs/common';
import { ContentScraperService } from './services/content-scraper.service';
import { OpenAIService } from './services/openai.service';
import { GeminiService } from './services/gemini.service';
import { ParseLinkDto, AIModelType } from './dtos/parse-link.dto';
import { ParseResultDto } from './dtos/parse-result.dto';

@Injectable()
export class ParsersService {
  private readonly logger = new Logger(ParsersService.name);

  constructor(
    private readonly scraperService: ContentScraperService,
    private readonly openaiService: OpenAIService,
    private readonly geminiService: GeminiService,
  ) {}

  async parseLink(parseLinkDto: ParseLinkDto): Promise<ParseResultDto> {
    const { url, aiModel } = parseLinkDto;
    this.logger.log(`Parsing link: ${url} using ${aiModel}`);

    // Determine content type and scrape accordingly
    let content: string;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      content = await this.scraperService.scrapeYouTubeVideo(url);
    } else if (url.includes('tiktok.com')) {
      content = await this.scraperService.scrapeTikTokVideo(url);
    } else {
      content = await this.scraperService.scrapeWebsite(url);
    }

    // Analyze content using selected AI model
    let analysis: { keywords: string[]; summary: string };
    if (aiModel === AIModelType.CHATGPT) {
      analysis = await this.openaiService.analyzeContent(content);
    } else {
      analysis = await this.geminiService.analyzeContent(content);
    }

    return {
      url,
      keywords: analysis.keywords,
      summary: analysis.summary,
    };
  }
}
