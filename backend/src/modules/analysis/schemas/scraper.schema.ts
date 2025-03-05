import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LLM_TYPE, TYPE_INPUT } from 'src/utils';
import { LOCALE } from 'src/utils';

@Schema({ timestamps: true })
export class Scraper {
  @Prop({ type: Types.ObjectId, required: true })
  analysisId: string;

  @Prop({ type: String, required: true })
  productName: string;

  @Prop({ type: String, required: true })
  rawInput: string;

  @Prop({ required: true, enum: TYPE_INPUT })
  inputSearchType: string;

  @Prop({ required: false, enum: LOCALE })
  locale?: string;

  @Prop({ required: false, enum: LLM_TYPE })
  model?: string;

  @Prop({ type: String, default: '' })
  title: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: Object, default: {} })
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };

  @Prop({ type: Number, default: 0 })
  viewCount: number;

  @Prop({ type: Number, default: 0 })
  likeCount: number;

  @Prop({ type: Number, default: 0 })
  commentCount: number;

  @Prop({ type: Number, default: 0 })
  favoriteCount: number;

  @Prop({ type: Number, default: 0 })
  averageInteraction?: number;

  @Prop({ type: String, default: '' })
  videoUrl: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ScraperSchema = SchemaFactory.createForClass(Scraper);
export type ScraperDocument = Scraper & Document;
