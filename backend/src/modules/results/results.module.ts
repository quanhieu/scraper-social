import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Result, ResultSchema } from './entities/result.schema';
import { ResultsService } from './results.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Result.name, schema: ResultSchema }]),
  ],
  providers: [ResultsService],
  exports: [ResultsService],
})
export class ResultsModule {}
