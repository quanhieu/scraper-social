import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ProductInfo } from 'src/modules/openrouter/interface';
import { OpenRouterService } from 'src/modules/openrouter/openrouter.service';
import { IProductTraceByLLMtInfo } from 'src/modules/scraper/interface';
import { LOCALE, LOCALE_MAP, OPEN_AI_MODEL, TYPE_INPUT } from 'src/utils';
@Injectable()
export class ScraperService {
  constructor(private openRouter: OpenRouterService) {}

  async scrapeProductTitle(url: string): Promise<string> {
    try {
      const { data } = await axios.get<string>(url, { timeout: 10000 });
      const $ = cheerio.load(data);
      const title = $('title').first().text();

      if (!title) {
        throw new InternalServerErrorException(
          'Could not extract product name.',
        );
      }

      return title.trim();
    } catch (error) {
      console.error('Error scraping website:', error);
      throw new InternalServerErrorException(
        'Failed to scrape website content.',
      );
    }
  }

  async scrapeProduct(
    url: string,
  ): Promise<{ title: string; metaDescription: string; content: string }> {
    try {
      const { data } = await axios.get(url, { timeout: 15000 });
      const $ = cheerio.load(data);

      // Extract title and meta description
      const title = $('title').first().text().trim();
      // eslint-disable-next-line prettier/prettier
      const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';

      // Extract main text content
      const mainContent = $('body').text().replace(/\s+/g, ' ').trim();

      return {
        title,
        metaDescription,
        content: mainContent.slice(0, 2000), // Limit to avoid overloading LLMs
      };
    } catch (error) {
      console.error('Error scraping website:', error);
      throw new InternalServerErrorException(
        'Failed to scrape website content.',
      );
    }
  }

  async traceProductInfo(url: string): Promise<IProductTraceByLLMtInfo> {
    const prompt = `Give me info in this link, no nonsense and return json format
    link: ${url}
    
    Format the response strictly as:
    {
      "productName": "Product Name",
      "price": "Product Price (if available)",
      "description": "Short description of the product",
      "brand": "Brand name (if available)",
      "likeCount": "video Like count",
      "commentCount": 'video comment count';
      "shareCount": 'video share count';
      "viewCount": 'video view count';
      "favoriteCount": 'video favorite count';
      "videoUrl": 'video url',
      "thumbnails": 'thumbnail of video'
    }
    `;

    const aiResults = await this.openRouter.queryLLMByGeminiProvider(prompt);
    // const parsedResults = JSON.parse(aiResults);
    const jsonString = aiResults
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    const parsedResults: IProductTraceByLLMtInfo = JSON.parse(jsonString);

    return {
      productName: parsedResults.productName,
      price: parsedResults.price,
      description: parsedResults.description,
      brand: parsedResults.brand,
      likeCount: parsedResults.likeCount,
      commentCount: parsedResults.commentCount,
      shareCount: parsedResults.shareCount,
      viewCount: parsedResults.viewCount,
      favoriteCount: parsedResults.favoriteCount,
      videoUrl: parsedResults.videoUrl,
      thumbnails: parsedResults.thumbnails,
    };
  }

  async cleanInputProductInfo(input: string): Promise<string> {
    const prompt = `Help me clean return product name base on below input, no nonsense and return json format
    input: ${input}
    
    Format the response strictly as:
    {
      "name": "Product Name",
    }
    `;

    const aiResults = await this.openRouter.queryLLMByGeminiProvider(prompt);
    const parsedResults = JSON.parse(aiResults) as { name?: string };

    return parsedResults?.name || '';
  }

  async fetchVideoByOpenAiProvider(
    input: string,
    inputType: keyof typeof TYPE_INPUT,
    locale?: keyof typeof LOCALE,
    modelDetail: string = OPEN_AI_MODEL.GPT_4O_MINI,
  ): Promise<ProductInfo[]> {
    try {
      let prompt = '';
      const localeMap = locale ? LOCALE_MAP[locale] : LOCALE_MAP.VI;

      if (inputType === TYPE_INPUT.TIKTOK) {
        prompt = `help me find video tiktok review ${input}, and locale '${localeMap}', and no nonsense and return json format
      
        Format the response strictly as:
        {
          "products": [
            {
              "name": "Product Name",
              "price": "Product Price (if available)",
              "description": "Short description of the product",
              "brand": "Brand name (if available)",
              "likeCount": "video Like count",
              "commentCount": "video comment count",
              "shareCount": "video share count",
              "viewCount": "video view count",
              "favoriteCount": "video favorite count",
              "videoUrl": "video url",
              "thumbnails": "thumbnail of video",
              "cover": "image cover of video"
            }
          ]
        }
      `;
      }

      if (
        inputType === TYPE_INPUT.YOUTUBE ||
        inputType === TYPE_INPUT.TEXT ||
        inputType === TYPE_INPUT.WEBSITE
      ) {
        prompt = `help me find video youtube review ${input}, and locale '${localeMap}', and no nonsense and return json format
      
        Format the response strictly as:
        {
          "products": [
            {
              "name": "Product Name",
              "price": "Product Price (if available)",
              "description": "Short description of the product",
              "brand": "Brand name (if available)",
              "likeCount": "video Like count",
              "commentCount": "video comment count",
              "shareCount": "video share count",
              "viewCount": "video view count",
              "favoriteCount": "video favorite count",
              "videoUrl": "video url",
              "thumbnails": "thumbnail of video",
              "cover": "image cover of video"
            }
          ]
        }
      `;
      }

      console.log('prompt ', prompt);
      const aiResults = await this.openRouter.queryLLMByOpenAiProvider(
        modelDetail,
        prompt,
      );

      const jsonString = aiResults
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      console.log('jsonString ', jsonString);

      const parsedResults: {
        products: ProductInfo[];
      } = JSON.parse(jsonString);

      // Convert Partial<ProductInfo>[] to ProductInfo[] by ensuring all required fields are present
      const result = parsedResults.products.map((product) => ({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        brand: product.brand || '',
        likeCount: product.likeCount || 0,
        commentCount: product.commentCount || 0,
        shareCount: product.shareCount || 0,
        viewCount: product.viewCount || 0,
        favoriteCount: product.favoriteCount || 0,
        videoUrl: product.videoUrl || '',
        thumbnails: product.thumbnails || '',
        cover: product.cover || '',
      }));

      return result;
    } catch (error) {
      console.error('Error fetching video:', error);
      return [];
    }
  }

  async fetchVideoByGeminiProvider(
    input: string,
    inputType: keyof typeof TYPE_INPUT,
    locale?: keyof typeof LOCALE,
  ): Promise<ProductInfo[]> {
    try {
      let prompt = '';
      const localeMap = locale ? LOCALE_MAP[locale] : LOCALE_MAP.VI;

      // Note: tiktok not support
      if (inputType === TYPE_INPUT.TIKTOK) {
        // throw new BadRequestException('Tiktok not support');
        return [];
      }

      if (
        inputType === TYPE_INPUT.YOUTUBE ||
        inputType === TYPE_INPUT.TEXT ||
        inputType === TYPE_INPUT.WEBSITE
      ) {
        prompt = `help me find video youtube review ${input}, and locale '${localeMap}', and no nonsense and return json format
      
        Format the response strictly as:
        {
          "products": [
            {
              "name": "Product Name",
              "price": "Product Price (if available)",
              "description": "Short description of the product",
              "brand": "Brand name (if available)",
              "likeCount": "video Like count",
              "commentCount": "video comment count",
              "shareCount": "video share count",
              "viewCount": "video view count",
              "favoriteCount": "video favorite count",
              "videoUrl": "video url",
              "thumbnails": "thumbnail of video",
              "cover": "image cover of video"
            }
          ]
        }
      `;
      }

      console.log('prompt ', prompt);
      const aiResults = await this.openRouter.queryLLMByGeminiProvider(prompt);

      const jsonString = aiResults
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      console.log('jsonString ', jsonString);

      const parsedResults: {
        products: ProductInfo[];
      } = JSON.parse(jsonString);

      const result = parsedResults.products.map((product) => ({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        brand: product.brand || '',
        likeCount: product.likeCount || 0,
        commentCount: product.commentCount || 0,
        shareCount: product.shareCount || 0,
        viewCount: product.viewCount || 0,
        favoriteCount: product.favoriteCount || 0,
        videoUrl: product.videoUrl || '',
        thumbnails: product.thumbnails || '',
        cover: product.cover || '',
      }));

      return result;
    } catch (error) {
      console.error('Error fetching video:', error);
      return [];
    }
  }
}
