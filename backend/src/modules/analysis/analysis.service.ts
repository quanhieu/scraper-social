import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import {
  detectInputType,
  LLM_TYPE,
  LOCALE,
  TYPE_INPUT,
  cleanNumericValue,
} from 'src/utils';
import { ScraperSocialService } from 'src/modules/scraper-social/scraper-social.service';
import {
  ITikTokVideoInfo,
  IYouTubeVideoInfo,
} from 'src/modules/scraper-social/interface';
import { ScraperService } from 'src/modules/scraper/scraper.service';
import { IProductTraceByLLMtInfo } from 'src/modules/scraper/interface';
import { ProductInfo } from 'src/modules/openrouter/interface';
import { Analysis } from 'src/modules/analysis/schemas/analysis.schema';
import { AnalysisDocument } from 'src/modules/analysis/schemas/analysis.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Scraper, ScraperDocument } from './schemas/scraper.schema';
import { YoutubeService } from 'src/modules/youtube/youtube.service';
import { YouTubeVideoInfo } from 'src/modules/youtube/interface';
@Injectable()
export class AnalysisService {
  constructor(
    // schema
    @InjectModel(Analysis.name) private analysisModel: Model<AnalysisDocument>,
    @InjectModel(Scraper.name) private scraperModel: Model<ScraperDocument>,

    // service
    private readonly youtubeService: YoutubeService,
    private readonly scraperSocialService: ScraperSocialService,
    private readonly scraperService: ScraperService,
  ) {}

  create(createAnalysisDto: AnalysisDocument) {
    return this.analysisModel.create(createAnalysisDto);
  }

  findByInput(
    input: string,
    locale?: keyof typeof LOCALE,
    model?: keyof typeof LLM_TYPE,
  ) {
    return this.analysisModel.findOne({ input, locale, model });
  }

  async findAll(
    input: string,
    locale?: keyof typeof LOCALE,
    model?: keyof typeof LLM_TYPE,
  ) {
    try {
      // Step 1: check analysis exist
      let productName: string = '';
      const validAnalysis = await this.findByInput(input, locale, model);
      if (validAnalysis) {
        return validAnalysis;
      }

      // Step 2: analysis product
      const inputType = detectInputType(input);
      let productInfo:
        | YouTubeVideoInfo
        | IYouTubeVideoInfo
        | ITikTokVideoInfo
        | IProductTraceByLLMtInfo
        | null = null;

      if (inputType === TYPE_INPUT.YOUTUBE) {
        productInfo =
          await this.scraperSocialService.getYouTubeVideoInfo(input);
        // const videoInfo2 = await this.youtubeService.getVideoInfoByUrl(input);

        productName = productInfo.title;
      }

      if (inputType === TYPE_INPUT.TIKTOK) {
        productInfo = await this.scraperSocialService.getTikTokVideoInfo(input);
        productName = productInfo.title;
      }

      if (inputType === TYPE_INPUT.WEBSITE) {
        try {
          const productTitle =
            await this.scraperService.scrapeProductTitle(input);
          const productInfo = await this.scraperService.scrapeProduct(input);
          console.log(productTitle, productInfo);

          productName = productTitle;
        } catch {
          productInfo = await this.scraperService.traceProductInfo(input);
          productName = productInfo.productName;
        }
      }
      console.log(productInfo);

      if (inputType === TYPE_INPUT.TEXT) {
        productName = input;
      }

      // use llm to clean input -> update later if need
      const productNameFormatted =
        await this.scraperService.cleanInputProductInfo(productName);
      console.log('\n\nproductNameFormatted=========== ', productNameFormatted);
      productName = productNameFormatted;

      // search done and save to db
      const analysis = await this.analysisModel.findOneAndUpdate(
        { input, locale, model },
        {
          input,
          inputType,
          productName,
          ...(locale && { locale }),
          ...(model && { model }),
        },
        { upsert: true, new: true },
      );

      // Step 3: Fetch video
      this.fetchVideo(
        input,
        productName,
        analysis.id,
        inputType as keyof typeof TYPE_INPUT,
        locale,
        model,
      );

      return analysis;
    } catch (error) {
      console.error('Error finding all:', error);

      throw new InternalServerErrorException('Failed to find all.');
    }
  }

  saveVideos(
    rawInput: string,
    productName: string,
    analysisId: string,
    videos: ProductInfo[],
    inputSearchType: keyof typeof TYPE_INPUT,
    locale?: keyof typeof LOCALE,
    model?: keyof typeof LLM_TYPE,
  ) {
    try {
      const scrapers = videos.map((video) => {
        // Create a deep copy to avoid modifying the original
        const deepCopyVideo = JSON.parse(JSON.stringify(video));
        if (deepCopyVideo?.thumbnails) {
          delete deepCopyVideo.thumbnails;
        }

        return {
          productName: productName,
          rawInput: rawInput,
          inputSearchType,
          analysisId: new ObjectId(analysisId),
          title: video?.name || video?.title || '',
          description: video?.description || '',
          videoUrl: video?.videoUrl || '',
          thumbnails:
            typeof video.thumbnails === 'string'
              ? video.thumbnails
              : video.thumbnails?.high || video.thumbnails?.default || '',
          viewCount: cleanNumericValue(video.viewCount),
          likeCount: cleanNumericValue(video.likeCount),
          commentCount: cleanNumericValue(video.commentCount),
          favoriteCount: cleanNumericValue(video.favoriteCount),
          ...(locale && { locale }),
          ...(model && { model }),
        };
      });

      return this.scraperModel.insertMany(scrapers);
    } catch (error) {
      console.error('Error saving videos:', error);

      throw new InternalServerErrorException('Failed to save videos.');
    }
  }

  async fetchVideo(
    rawInput: string,
    productName: string,
    analysisId: string,
    inputSearchType: keyof typeof TYPE_INPUT,
    locale?: keyof typeof LOCALE,
    model?: keyof typeof LLM_TYPE,
  ) {
    try {
      const videoList: ProductInfo[] = [];

      // default fetching youtube
      const fetchVideoYoutube = await this.youtubeService.searchVideos(
        productName,
        50,
      );
      await this.saveVideos(
        rawInput,
        productName,
        analysisId,
        fetchVideoYoutube,
        inputSearchType,
        locale,
        model,
      );

      // if (inputSearchType === TYPE_INPUT.YOUTUBE && model === LLM_TYPE.GEMINI) {
      // }
      const fetchVideoYoutubeLLM =
        await this.scraperService.fetchVideoByGeminiProvider(
          productName,
          inputSearchType,
          locale as keyof typeof LOCALE,
        );
      videoList.push(...fetchVideoYoutubeLLM);

      if (inputSearchType === TYPE_INPUT.TIKTOK && model === LLM_TYPE.GEMINI) {
        // TODO: fetch video from tiktok
      }

      if (
        inputSearchType === TYPE_INPUT.YOUTUBE &&
        model === LLM_TYPE.CHATGPT
      ) {
        // const fetchVideoYoutube =
        //   await this.scraperService.fetchVideoByOpenAiProvider(
        //     productName,
        //     inputSearchType,
        //     locale as keyof typeof LOCALE,
        //   );
        // videoList.push(...fetchVideoYoutube);
      }

      // default fetch video tiktok
      // TODO: need to setup open ai key with permission access to internet
      const fetchVideoTiktok =
        await this.scraperService.fetchVideoByOpenAiProvider(
          productName,
          TYPE_INPUT.TIKTOK as keyof typeof TYPE_INPUT,
          locale as keyof typeof LOCALE,
        );
      videoList.push(...fetchVideoTiktok);

      // Note: chatgpt can search video on youtube and tiktok OK throw perplexity.ai

      // save all result to db
      await this.saveVideos(
        rawInput,
        productName,
        analysisId,
        videoList,
        inputSearchType,
        locale,
        model,
      );

      // if all feature done
      // update query to redis to cache and response result to client

      return videoList;
    } catch (error) {
      console.error('Error fetching video:', error);

      throw new InternalServerErrorException('Failed to fetch video.');
    }
  }

  async findAllVideo(
    input: string,
    analysisId: string,
    locale?: keyof typeof LOCALE,
    sort?: Record<string, string>,
    // inputSearchType: keyof typeof TYPE_INPUT,
    // model?: keyof typeof LLM_TYPE,
  ): Promise<ScraperDocument[]> {
    try {
      // check exist in redis

      const query: any = {
        $or: [{ inputSearch: input }, { rawInput: input }],
        analysisId: new ObjectId(analysisId),
        // inputSearchType,
      };
      if (locale) {
        query.locale = locale;
      }

      const sortOptions = {};
      if (sort) {
        Object.keys(sort).forEach((key) => {
          sortOptions[key] = sort[key].toUpperCase() === 'DESC' ? -1 : 1;
        });
      }

      // if (model) {
      //   query.model = model;
      // }

      // const skip = (page - 1) * limit;
      // const videoList = await this.scraperModel
      //   .find(query)
      //   .skip(skip)
      //   .limit(limit);

      const videoList = await this.scraperModel.find(query).sort(sortOptions);
      return videoList;
    } catch (error) {
      console.error('Error fetching video:', error);

      throw new InternalServerErrorException('Failed to fetch video.');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} analysis`;
  }

  update(id: number) {
    return `This action updates a #${id} analysis`;
  }

  remove(id: number) {
    return `This action removes a #${id} analysis`;
  }
}
