import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import {
  TikTokSearchResponse,
  TiktokUserAccessTokenResponse,
  TikTokVideoInfo,
  TikTokVideoResponse,
} from 'src/modules/tiktok/interface';
import { TiktokAccessTokenResponse } from 'src/modules/tiktok/interface';

@Injectable()
export class TiktokService {
  constructor(private readonly configService: ConfigService) {}

  generateAuthUrl(): string {
    const csrfState = Math.random().toString(36).substring(2);

    const clientKey = this.configService.get('tiktok.clientKey') || '';
    const redirectUri = this.configService.get('tiktok.redirectUri') || '';

    let url = 'https://www.tiktok.com/v2/auth/authorize/';
    url += `?client_key=${encodeURIComponent(clientKey)}`;
    // url += '&scope=user.info.basic';
    url += '&response_type=code';
    url += `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    url += `&state=${csrfState}`;

    return url;
  }

  private async getClientAccessToken(): Promise<string> {
    try {
      const formData = {
        client_key: this.configService.get('tiktok.clientKey') || '',
        client_secret: this.configService.get('tiktok.clientSecret') || '',
        grant_type: 'authorization_code',
        redirect_uri: this.generateAuthUrl(),
      };

      const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';

      const params = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        params.append(key, value);
      });

      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache',
        },
      });

      const result: TiktokAccessTokenResponse = response.data;

      return result?.access_token;
    } catch (error) {
      throw new Error(`Failed to obtain client access token: ${error.message}`);
    }
  }

  private extractVideoId(url: string): string | null {
    const regex = /\/video\/(\d+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  async getVideoInfoByUrl(url: string): Promise<TikTokVideoInfo> {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid TikTok video URL');
    }

    try {
      const tiktokAccessToken = await this.getClientAccessToken();
      const apiUrl = 'https://open.tiktokapis.com/v2/video/query/';

      const response = await axios.post<TikTokVideoResponse>(
        apiUrl,
        {
          filters: {
            video_ids: [videoId],
          },
          fields: [
            'id',
            'title',
            'cover_image_url',
            'share_url',
            'like_count',
            'comment_count',
            'share_count',
            'view_count',
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${tiktokAccessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch video info: ${error.message}`);
    }
  }

  async searchVideoByKeyword(
    keyword: string,
    maxCount: number = 20,
  ): Promise<TikTokVideoInfo[]> {
    try {
      const tiktokAccessToken = await this.getClientAccessToken();
      const searchApiUrl =
        'https://open.tiktokapis.com/v2/research/video/query/';

      const response = await axios.post<TikTokSearchResponse>(
        searchApiUrl,
        {
          query: {
            and: [
              {
                operation: 'CONTAINS',
                field_name: 'video_description',
                field_values: [keyword],
              },
            ],
          },
          max_count: maxCount,
          fields: [
            'id',
            'title',
            'cover_image_url',
            'share_url',
            'like_count',
            'comment_count',
            'share_count',
            'view_count',
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${tiktokAccessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to search videos: ${error.message}`);
    }
  }

  /**
   * Exchange authorization code for an access token
   * @param code The authorization code received from TikTok
   * @returns The access token response
   */
  async exchangeCodeForToken(
    code: string,
  ): Promise<TiktokUserAccessTokenResponse> {
    try {
      const clientKey = this.configService.get('tiktok.clientKey') || '';
      const clientSecret = this.configService.get('tiktok.clientSecret') || '';
      const redirectUri = this.configService.get('tiktok.redirectUri') || '';

      const params = new URLSearchParams();
      params.append('client_key', clientKey);
      params.append('client_secret', clientSecret);
      params.append('code', code);
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', redirectUri);

      const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data as TiktokUserAccessTokenResponse;
    } catch (error) {
      throw new Error(`Failed to exchange code for token: ${error.message}`);
    }
  }

  private async tiktokRedirectUrl(myDomain: string): Promise<string> {
    const clientKey = this.configService.get('tiktok.clientKey') || '';
    const scope = this.configService.get('tiktok.scope') || '';
    const redirectUri = this.configService.get('tiktok.redirectUri') || '';
    const state = this.configService.get('tiktok.state') || '1231231232';

    const authAccessUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${scope}&response_type=code&redirect_uri=${redirectUri}&state=${state}`;
    const response = await axios.get(authAccessUrl);
    const authorizationCode = response.data.code;

    const redirectUrl = `${myDomain}/?code=${authorizationCode}&state=${state}`;
    return redirectUrl;
  }

  private async getTikTokAccessTokenV2(
    authorizationCode: string,
  ): Promise<string> {
    try {
      const domain =
        this.configService.get('domain') || 'http://localhost:3000';
      const redirectUri = `${domain}/auth/tiktok/callback`;

      const url = 'https://open.tiktokapis.com/v2/oauth/token/';
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      const data = new URLSearchParams({
        client_key: this.configService.get('tiktok.clientKey') || '',
        client_secret: this.configService.get('tiktok.clientSecret') || '',
        code: authorizationCode,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      });

      const response = await axios.post(url, data.toString(), { headers });
      return response.data.access_token as string;
    } catch (error) {
      throw new Error(`Failed to obtain TikTok access token: ${error.message}`);
    }
  }

  async queryVideos(keyword: string, maxCount: number = 10): Promise<any> {
    const authorizationCode =
      this.configService.get('tiktok.authorizationCode') || '';

    const accessToken = await this.getTikTokAccessTokenV2(authorizationCode);
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const fields = [
      'display_name',
      'bio_description',
      'avatar_url',
      'is_verified',
      'follower_count',
      'following_count',
      'likes_count',
      'video_count',
    ];

    const query = {
      query: {
        and: [
          { operation: 'EQ', field_name: 'keyword', field_values: [keyword] },
        ],
      },
      max_count: maxCount,
    };

    const params = new URLSearchParams();
    params.append('fields', fields.join(','));

    try {
      const apiUrl = 'https://open.tiktokapis.com/v2/research/video/query/';
      const response = await axios.post(
        `${apiUrl}?${params.toString()}`,
        query,
        { headers },
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to query videos: ${error.message}`);
    }
  }
}
