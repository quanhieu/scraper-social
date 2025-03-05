import { PartialType } from '@nestjs/swagger';
import { CreateScraperSocialDto } from './create-scraper-social.dto';

export class UpdateScraperSocialDto extends PartialType(CreateScraperSocialDto) {}
