import { ApiProperty } from '@nestjs/swagger';

// DTO for request body
class ScrapeProductDto {
  @ApiProperty({
    description: 'URL of the product to scrape',
    example: 'https://www.example.com/product',
  })
  url: string;
}

// DTO for response
class ScrapeProductResponseDto {
  @ApiProperty({
    description: 'The extracted product title',
    example: 'Product Name XYZ',
  })
  productName: string;

  @ApiProperty({
    description: 'AI analysis results from different models',
    example: {
      'gpt-3.5-turbo': 'Product Name',
      'gemini-2': 'Product Name',
      'deepseek-chat': 'Product Name',
    },
  })
  aiResults: Record<string, string>;
}

export { ScrapeProductDto, ScrapeProductResponseDto };
