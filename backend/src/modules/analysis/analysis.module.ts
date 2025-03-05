import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { ScraperSocialModule } from 'src/modules/scraper-social/scraper-social.module';
import { ScraperModule } from 'src/modules/scraper/scraper.module';
import {
  Analysis,
  AnalysisSchema,
} from 'src/modules/analysis/schemas/analysis.schema';
import { Scraper, ScraperSchema } from './schemas/scraper.schema';
import { YoutubeModule } from 'src/modules/youtube/youtube.module';

@Module({
  imports: [
    YoutubeModule,
    ScraperSocialModule,
    ScraperModule,
    MongooseModule.forFeature([
      { name: Analysis.name, schema: AnalysisSchema },
      { name: Scraper.name, schema: ScraperSchema },
    ]),
  ],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
