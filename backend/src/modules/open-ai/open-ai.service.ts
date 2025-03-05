import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import OpenAI from 'openai';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OpenAiProviderService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      // baseURL: 'https://openrouter.ai/api/v1',
      // apiKey: this.configService.get<string>('openrouter.apiKey'),
      apiKey: this.configService.get<string>('openai.apiKey'),
    });
  }

  async generateCompletion(model: string, prompt: string) {
    const completion = await this.openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      // headers: {
      //   'HTTP-Referer': 'your_site_url',
      //   'X-Title': 'your_site_name',
      // },
    });

    return completion.choices[0].message.content;
  }

  async generateCompletionWithInternet(model: string, prompt: string) {
    try {
      const url = 'https://api.openai.com/v1/completions';

      const headers = {
        Authorization: `Bearer ${this.configService.get<string>('openai.apiKey')}`,
        'Content-Type': 'application/json',
      };
      const response = await axios.post(
        url,
        {
          model: model,
          prompt: prompt,
        },
        {
          headers,
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response.data;
    } catch (error) {
      console.error('Error querying OpenAI:', error);

      throw new InternalServerErrorException(
        'Failed to fetch response from OpenAI.',
      );
    }
  }

  // TODO: open ai can't connect to internet
  // 1. need crawler to get data from internet and return to open ai
  // 2. or use perplexity.ai
}
