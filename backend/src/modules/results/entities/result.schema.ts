import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ProductDetails } from 'src/modules/openrouter/interface';

export type ResultDocument = Result & Document;

@Schema({ timestamps: true })
export class Result {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ type: Map, of: Object })
  aiResults: Record<string, ProductDetails[]>;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ResultSchema = SchemaFactory.createForClass(Result);
