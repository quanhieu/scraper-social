import { Controller, Post, Body, Get } from '@nestjs/common';
import { OpenRouterService } from './openrouter.service';
import { ScraperService } from '../scraper/scraper.service';
import { ResultsService } from '../results/results.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ScrapeProductDto, ScrapeProductResponseDto } from './dto/scraper.dto';
import { AiResults } from 'src/modules/openrouter/interface';

@ApiTags('OpenRouter')
@Controller('openrouter')
export class OpenRouterController {
  constructor(
    private readonly openRouterService: OpenRouterService,
    private readonly scraperService: ScraperService,
    private readonly resultsService: ResultsService,
  ) {}

  @Post('scrape-product')
  @ApiOperation({ summary: 'Scrape and analyze a product from a URL' })
  @ApiBody({ type: ScrapeProductDto })
  @ApiResponse({
    status: 200,
    description: 'Product successfully scraped and analyzed',
    type: ScrapeProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid URL provided' })
  @ApiResponse({
    status: 500,
    description: 'Server error during scraping or analysis',
  })
  async scrapeAndAnalyze(@Body('url') url: string) {
    const productName = await this.scraperService.scrapeProductTitle(url);
    const prompt = `Extract the product name from the following title: "${productName}". Return only the product name.`;

    // const models = ['gpt-4o-mini', 'gemini-2.0-flash-lite', 'deepseek-chat'];
    const models = ['gpt-4o-mini'];
    const aiResults: AiResults = {};

    for (const model of models) {
      // Sanitize model name for MongoDB (replace dots with underscores)
      const sanitizedModelName = model.replace(/\./g, '_');
      aiResults[sanitizedModelName] = [
        {
          name: await this.openRouterService.queryLLM(model, prompt),
          price: 'N/A',
          description: 'N/A',
          category: 'N/A',
          brand: 'N/A',
        },
      ];
    }

    await this.resultsService.saveResult(url, productName, aiResults);

    return { productName, aiResults };
  }

  @Post('scrape-product-by-llms-and-scraper')
  @ApiOperation({ summary: 'Scrape and analyze a product from a URL' })
  @ApiBody({ type: ScrapeProductDto })
  @ApiResponse({
    status: 200,
    description: 'Product successfully scraped and analyzed',
    type: ScrapeProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid URL provided' })
  @ApiResponse({
    status: 500,
    description: 'Server error during scraping or analysis',
  })
  async scrapeAndAnalyzeByLLMs(@Body('url') url: string) {
    const productData = await this.scraperService.scrapeProduct(url);

    // const models = ['gpt-4o-mini', 'gemini-2.0-flash-lite', 'deepseek-chat'];
    const models = ['gemini-2.0-flash-lite'];

    const aiResults: AiResults =
      await this.openRouterService.extractProductDetails(productData, models);

    await this.resultsService.saveResult(url, productData.title, aiResults);

    return { productData, aiResults };
  }

  @Post('scrape-product-by-llms-only')
  @ApiOperation({ summary: 'Scrape and analyze a product from a URL' })
  @ApiBody({ type: ScrapeProductDto })
  @ApiResponse({
    status: 200,
    description: 'Product successfully scraped and analyzed',
    type: ScrapeProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid URL provided' })
  @ApiResponse({
    status: 500,
    description: 'Server error during scraping or analysis',
  })
  async scrapeAndAnalyzeByLLMsOnly(@Body('url') url: string) {
    // const models = ['gpt-4o-mini', 'gemini-2.0-flash-lite', 'deepseek-chat'];
    const models = ['gemini-2.0-flash-lite'];

    const { productName, aiResults } =
      await this.openRouterService.extractProductDetailsByLLMsOnly(url, models);

    await this.resultsService.saveResult(url, productName, aiResults);

    return { productName, aiResults };
  }

  @Get('results')
  @ApiOperation({ summary: 'Get all saved scraping and analysis results' })
  @ApiResponse({
    status: 200,
    description: 'List of all saved results',
  })
  async getResults() {
    return this.resultsService.getAllResults();
  }
}
