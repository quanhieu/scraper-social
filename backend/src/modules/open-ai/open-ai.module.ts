import { Module } from '@nestjs/common';
import { OpenAiProviderService } from './open-ai.service';

@Module({
  providers: [OpenAiProviderService],
  exports: [OpenAiProviderService],
})
export class OpenAiProviderModule {}
