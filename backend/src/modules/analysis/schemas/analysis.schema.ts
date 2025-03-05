import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TYPE_INPUT, LLM_TYPE, LOCALE } from 'src/utils';

@Schema({ timestamps: true })
export class Analysis {
  @Prop({ required: true })
  input: string;

  @Prop({ required: true })
  rawInput: string;

  @Prop({ required: true, enum: TYPE_INPUT })
  inputType: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: false, enum: LOCALE })
  locale?: string;

  @Prop({ required: false, enum: LLM_TYPE })
  model?: string;

  // @Prop({ type: Map, of: Object })
  // aiAnalysis: Record<string, ProductDetails[]>;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const AnalysisSchema = SchemaFactory.createForClass(Analysis);
export type AnalysisDocument = Analysis & Document;
