import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LLM_TYPE, LOCALE } from 'src/utils';

export class GetAnalysisDto {
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
}
