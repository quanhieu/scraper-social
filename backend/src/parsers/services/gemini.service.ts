import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async analyzeContent(
    content: string,
  ): Promise<{ keywords: string[]; summary: string }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `Analyze this content and extract product-related keywords. Also provide a brief summary.
      Format your response as JSON with "keywords" (array of strings) and "summary" (string) fields.
      Content: ${content}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]) as {
          keywords: string[];
          summary: string;
        };
        return parsedData;
      }

      throw new Error('Failed to parse JSON response from Gemini');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error analyzing content with Gemini: ${errorMessage}`);
      throw new Error(`Failed to analyze content: ${errorMessage}`);
    }
  }
}
