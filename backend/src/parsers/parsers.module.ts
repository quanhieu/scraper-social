import { Module } from '@nestjs/common';
import { ParsersController } from './parsers.controller';
import { ParsersService } from './parsers.service';
import { ContentScraperService } from './services/content-scraper.service';
import { OpenAIService } from './services/openai.service';
import { GeminiService } from './services/gemini.service';

@Module({
  controllers: [ParsersController],
  providers: [
    ParsersService,
    ContentScraperService,
    OpenAIService,
    GeminiService,
  ],
  exports: [ParsersService],
})
export class ParsersModule {}
