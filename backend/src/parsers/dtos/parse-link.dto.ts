import { IsUrl, IsEnum, IsNotEmpty } from 'class-validator';

export enum AIModelType {
  CHATGPT = 'chatgpt',
  GEMINI = 'gemini',
}

export class ParseLinkDto {
  @IsNotEmpty()
  @IsUrl({}, { message: 'Please provide a valid URL' })
  url: string;

  @IsNotEmpty()
  @IsEnum(AIModelType, { message: 'AI model must be either chatgpt or gemini' })
  aiModel: AIModelType;
}
