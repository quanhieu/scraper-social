import { Module } from '@nestjs/common';
import { ScraperSocialService } from './scraper-social.service';
import { ScraperController } from 'src/modules/scraper-social/scraper-social.controller';

@Module({
  providers: [ScraperSocialService],
  // controllers: [ScraperController],
  exports: [ScraperSocialService],
})
export class ScraperSocialModule {}
