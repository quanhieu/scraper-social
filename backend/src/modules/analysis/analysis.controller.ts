import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnalysisService } from './analysis.service';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';
import { ConfigService } from '@nestjs/config';
import { GetAnalysisDto } from './dto/get-analysis.dto';
import { GetVideoAnalysisDto } from './dto/get-video-analysis.dto';

@ApiTags('Analysis')
@Controller('analysis')
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly configService: ConfigService,
  ) {}

  // @Post()
  // create(@Body() createAnalysisDto: CreateAnalysisDto) {
  //   return this.analysisService.create(createAnalysisDto);
  // }

  @Get()
  findAll(@Query() query: GetAnalysisDto) {
    const password = this.configService.get('password.password');
    if (password !== query.password) {
      throw new UnauthorizedException('Password is incorrect');
    }

    return this.analysisService.findAll(
      query.input,
      query.locale,
      // query.model,
    );
  }

  @Get('video')
  findAllVideo(@Query() query: GetVideoAnalysisDto) {
    const password = this.configService.get('password.password');
    if (password !== query.password) {
      throw new UnauthorizedException('Password is incorrect');
    }

    return this.analysisService.findAllVideo(
      query.input,
      query.analysisId,
      query.locale,
      query.sort,
      // query.inputSearchType,
      // query.model,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('sort') sort?: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // const password = this.configService.get('PASSWORD');
    // if (password !== '123456') {
    //   throw new UnauthorizedException('Password is incorrect');
    // }

    const sortBy = sort.map((item) => {
      return {
        [item?.field]: item?.order ? 'DESC' : 'ASC',
      };
    });
    const pageNumber = page || 1;
    const limitNumber = limit || 10;
    return this.analysisService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.analysisService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.analysisService.remove(+id);
  }
}
