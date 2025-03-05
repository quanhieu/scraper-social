import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GeminiService } from 'src/modules/gemini/gemini.service';
import { OpenAiProviderService } from 'src/modules/open-ai/open-ai.service';
import { AiResults } from 'src/modules/openrouter/interface';

@Injectable()
export class OpenRouterService {
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(
    private configService: ConfigService,
    private openAiProviderService: OpenAiProviderService,
    private geminiProviderService: GeminiService,
  ) {}

  async queryLLM(model: string, prompt: string): Promise<string> {
    try {
      const apiKey = this.configService.get<string>('openrouter.apiKey');

      const body = {
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      };

      const response = await axios.post<any>(
        this.baseUrl,
        JSON.stringify(body),
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(response);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return (
        response?.data?.choices[0]?.message?.content ?? 'No response from model'
      );
    } catch (error) {
      console.error('Error querying OpenRouter:', error);

      throw new InternalServerErrorException(
        'Failed to fetch response from OpenRouter.',
      );
    }
  }

  async queryLLMByOpenAiProvider(
    model: string,
    prompt: string,
  ): Promise<string> {
    try {
      const response = await this.openAiProviderService.generateCompletion(
        model,
        prompt,
      );

      return response ?? 'No response from model';
    } catch (error) {
      console.error('Error querying OpenAI:', error);

      throw new InternalServerErrorException(
        'Failed to fetch response from OpenAI.',
      );
    }
  }

  async queryLLMByGeminiProvider(prompt: string): Promise<string> {
    try {
      return this.geminiProviderService.generateContent(JSON.stringify(prompt));
    } catch (error) {
      console.error('Error querying Gemini:', error);

      throw new InternalServerErrorException(
        'Failed to fetch response from Gemini.',
      );
    }
  }

  async extractProductDetails(
    productData: { title: string; metaDescription: string; content: string },
    models: string[],
  ): Promise<AiResults> {
    const prompt = `Extract product details from the given data and return it in JSON format.
    If there are multiple products, return them as a list.
    
    For each product, extract:
    - Title: ${productData.title}
    - Meta Description: ${productData.metaDescription}
    - Content: ${productData.content}
    
    Format the response strictly as:
    {
      "products": [
        {
          "name": "Product Name",
          "price": "Product Price (if available)",
          "description": "Short description of the product",
          "category": "Product category (if available)",
          "brand": "Brand name (if available)"
        }
      ]
    }
    `;

    // get response from all models
    // const aiResults = {};
    // for (const model of models) {
    //   aiResults[model] = await this.queryLLMByOpenAiProvider(model, prompt);
    // }

    // Get response from Gemini
    const aiResults = await this.queryLLMByGeminiProvider(prompt);

    try {
      const jsonString = aiResults
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      const parsedResults: {
        products: any[];
      } = JSON.parse(jsonString);

      // Sanitize model name for MongoDB (replace dots with underscores)
      const sanitizedModelName = models[0].replace(/\./g, '_');

      if (parsedResults.products && Array.isArray(parsedResults.products)) {
        const products = parsedResults?.products.map((product) => ({
          name: product.name || 'N/A',
          price: product.price || 'N/A',
          description: product.description || 'N/A',
          category: product.category || 'N/A',
          brand: product.brand || 'N/A',
        }));

        return {
          [sanitizedModelName]: products,
        };
      }

      return {
        [sanitizedModelName]: [
          {
            name: 'Parsing error',
            price: 'N/A',
            description: 'Failed to parse AI response',
            category: 'N/A',
            brand: 'N/A',
            rawResponse: aiResults,
          },
        ],
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw AI response:', aiResults);

      // Sanitize model name for MongoDB (replace dots with underscores)
      const sanitizedModelName = models[0].replace(/\./g, '_');

      return {
        [sanitizedModelName]: [
          {
            name: 'Parsing error',
            price: 'N/A',
            description: 'Failed to parse AI response',
            category: 'N/A',
            brand: 'N/A',
            rawResponse: aiResults,
          },
        ],
      };
    }
  }

  async extractProductDetailsByLLMsOnly(
    url: string,
    models: string[],
  ): Promise<{
    productName: string;
    aiResults: AiResults;
  }> {
    const prompt = `Extract product details from the content found at the following URL: ${url}.
    Analyze the content and return a structured JSON response containing only **actual product names** and their details.
    
    ### Content Sources:
    - **Website**: Extract product names from product listings, descriptions, and metadata.
    - **YouTube**: Identify product names mentioned in the **video title, description, captions, and spoken content**. **Do not return the video title itself unless it is explicitly a product name.**
    - **TikTok**: Identify product names from the **video caption, description, and spoken content**. **Avoid using the video title unless it clearly contains a product name.**
    
    ### Extraction Rules:
    - **Ensure "productName" contains only the name of a product.**
    - **If no explicit product name is found, return "productName": using the title.**
    - Extract additional product details (if available), such as price, category, and brand.
    
    ### Output Format (JSON):
    {
      "productName": "Actual Product Name or title of the video",
      "products": [
        {
          "name": "Product Name",
          "price": "Product Price (if available)",
          "description": "Short description of the product",
          "category": "Product category (if available)",
          "brand": "Brand name (if available)"
        }
      ]
    }
    `;

    // Get response from Gemini
    const aiResults = await this.queryLLMByGeminiProvider(prompt);

    try {
      const jsonString = aiResults
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      const parsedResults: {
        productName: string;
        products: any[];
      } = JSON.parse(jsonString);

      // Sanitize model name for MongoDB (replace dots with underscores)
      const sanitizedModelName = models[0].replace(/\./g, '_');

      if (parsedResults.products && Array.isArray(parsedResults.products)) {
        const products = parsedResults?.products.map((product) => ({
          name: product.name || 'N/A',
          price: product.price || 'N/A',
          description: product.description || 'N/A',
          category: product.category || 'N/A',
          brand: product.brand || 'N/A',
        }));

        return {
          productName: parsedResults.productName || 'N/A',
          aiResults: {
            [sanitizedModelName]: products,
          },
        };
      }

      return {
        productName: 'Parsing error',
        aiResults: {
          [sanitizedModelName]: [
            {
              name: 'Parsing error',
              price: 'N/A',
              description: 'Failed to parse AI response',
              category: 'N/A',
              brand: 'N/A',
              rawResponse: aiResults,
            },
          ],
        },
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw AI response:', aiResults);

      // Sanitize model name for MongoDB (replace dots with underscores)
      const sanitizedModelName = models[0].replace(/\./g, '_');

      return {
        productName: 'Parsing error',
        aiResults: {
          [sanitizedModelName]: [
            {
              name: 'Parsing error',
              price: 'N/A',
              description: 'Failed to parse AI response',
              category: 'N/A',
              brand: 'N/A',
              rawResponse: aiResults,
            },
          ],
        },
      };
    }
  }
}
