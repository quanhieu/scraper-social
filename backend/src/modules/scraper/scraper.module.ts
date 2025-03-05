import { forwardRef, Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { OpenRouterModule } from 'src/modules/openrouter/openrouter.module';

@Module({
  imports: [forwardRef(() => OpenRouterModule)],
  providers: [ScraperService],
  exports: [ScraperService],
})
export class ScraperModule {}
