import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResultDocument } from 'src/modules/results/entities/result.schema';
import { Result } from './entities/result.schema';
import { AiResults } from 'src/modules/openrouter/interface';
@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
  ) {}

  async saveResult(url: string, productName: string, aiResults: AiResults) {
    return this.resultModel.create({ url, productName, aiResults });
  }

  async getAllResults() {
    return this.resultModel.find().sort({ createdAt: -1 }).exec();
  }
}
