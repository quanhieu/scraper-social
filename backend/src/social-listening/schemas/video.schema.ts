import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum PlatformType {
  YOUTUBE = 'youtube',
  TIKTOK = 'tiktok',
}

@Schema({ timestamps: true })
export class Video {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  videoId: string;

  @Prop({ required: true, enum: PlatformType })
  platform: PlatformType;

  @Prop({ required: true })
  channelTitle: string;

  @Prop({ required: true })
  channelId: string;

  @Prop({ required: true })
  publishedAt: Date;

  @Prop({ required: true, default: 0 })
  viewCount: number;

  @Prop({ required: true, default: 0 })
  likeCount: number;

  @Prop({ required: true, default: 0 })
  commentCount: number;

  @Prop({ default: 0 })
  shareCount: number;

  @Prop()
  engagementRate: number;

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop({ type: Object, default: {} })
  additionalMetadata: Record<string, any>;
}

export type VideoDocument = Video & Document;
export const VideoSchema = SchemaFactory.createForClass(Video);
