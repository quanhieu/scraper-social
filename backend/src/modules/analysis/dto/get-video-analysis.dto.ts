import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { LLM_TYPE, LOCALE, TYPE_INPUT } from 'src/utils';

export class GetVideoAnalysisDto {
  @ApiProperty({
    description: 'Input text or URL to analyze',
    required: true,
    type: String,
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  @IsNotEmpty()
  @IsString()
  input: string;

  @ApiProperty({
    description: 'Analysis ID',
    required: true,
    type: String,
    example: '123',
  })
  @IsNotEmpty()
  @IsString()
  analysisId: string;

  // @ApiProperty({
  //   description: 'Input search type',
  //   required: true,
  //   enum: TYPE_INPUT,
  //   type: String,
  //   example: TYPE_INPUT.YOUTUBE,
  // })
  // @IsNotEmpty()
  // @IsString()
  // inputSearchType: keyof typeof TYPE_INPUT;

  @ApiProperty({
    description: 'Locale for analysis',
    required: false,
    enum: LOCALE,
    default: LOCALE.VI,
    example: LOCALE.VI,
  })
  @IsOptional()
  @IsString()
  locale?: keyof typeof LOCALE;

  // @ApiProperty({
  //   description: 'AI model to use for analysis',
  //   required: false,
  //   enum: LLM_TYPE,
  //   example: LLM_TYPE.OPENAI,
  // })
  // @IsOptional()
  // @IsString()
  // model?: keyof typeof LLM_TYPE;

  @ApiProperty({
    description: 'Password for analysis',
    required: true,
    type: String,
    example: 'password123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  //   @ApiProperty({
  //     description: 'Page number',
  //     required: false,
  //     type: Number,
  //     example: 1,
  //   })
  //   @IsOptional()
  //   @IsNumber()
  //   page?: number;

  //   @ApiProperty({
  //     description: 'Limit number of videos to return',
  //     required: false,
  //     type: Number,
  //     example: 10,
  //   })
  //   @IsOptional()
  //   @IsNumber()
  //   limit?: number;

  // [viewCount, likeCount, commentCount, favoriteCount, averageInteraction] => sort by DESC or ASC
  @ApiProperty({
    description: 'Sort by',
    required: false,
    type: Object,
    example: {
      viewCount: 'DESC',
      likeCount: 'ASC',
      commentCount: 'ASC',
      favoriteCount: 'DESC',
      averageInteraction: 'ASC',
    },
  })
  @IsOptional()
  @IsObject()
  sort?: Record<string, string>;
}
