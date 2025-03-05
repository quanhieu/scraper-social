import { Module } from '@nestjs/common';
import { OpenRouterService } from './openrouter.service';
import { ResultsModule } from 'src/modules/results/results.module';
import { ScraperModule } from 'src/modules/scraper/scraper.module';
import { OpenAiProviderModule } from 'src/modules/open-ai/open-ai.module';
import { GeminiProviderModule } from 'src/modules/gemini/gemini.module';

@Module({
  imports: [
    ResultsModule,
    ScraperModule,
    OpenAiProviderModule,
    GeminiProviderModule,
  ],
  providers: [OpenRouterService],
  // controllers: [OpenRouterController],
  exports: [OpenRouterService],
})
export class OpenRouterModule {}
