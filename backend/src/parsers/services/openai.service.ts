import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface OpenAIResponseData {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
  }

  async analyzeContent(
    content: string,
  ): Promise<{ keywords: string[]; summary: string }> {
    try {
      const response = await axios.post<OpenAIResponseData>(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content:
                'You are a content analyzer. Extract key product-related keywords and provide a summary.',
            },
            {
              role: 'user',
              content: `Analyze this content and extract product-related keywords. Also provide a brief summary.
              Format your response as JSON with "keywords" (array of strings) and "summary" (string) fields.
              Content: ${content}`,
            },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const result = response.data.choices[0].message.content;
      return JSON.parse(result) as { keywords: string[]; summary: string };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error analyzing content with OpenAI: ${errorMessage}`);
      throw new Error(`Failed to analyze content: ${errorMessage}`);
    }
  }
}
