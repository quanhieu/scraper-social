import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialListeningController } from './social-listening.controller';
import { SocialListeningService } from './social-listening.service';
import { Video, VideoSchema } from './schemas/video.schema';
import { YouTubeApiService } from './services/youtube-api.service';
import { TikTokScraperService } from './services/tiktok-scraper.service';
import { ParsersModule } from '../parsers/parsers.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    ParsersModule,
  ],
  controllers: [SocialListeningController],
  providers: [SocialListeningService, YouTubeApiService, TikTokScraperService],
})
export class SocialListeningModule {}
