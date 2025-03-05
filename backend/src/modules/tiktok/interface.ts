export interface TiktokAccessTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface TiktokUserAccessTokenResponse {
  access_token: string;
  expires_in: number;
  open_id: string;
  refresh_token: string;
  refresh_expires_in: number;
  scope: string;
  token_type: string;
}

export interface TikTokVideoInfo {
  id: string;
  title: string;
  cover_image_url: string;
  share_url: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
}

export interface TikTokVideoResponse {
  data: TikTokVideoInfo;
}

export interface TikTokSearchResponse {
  data: TikTokVideoInfo[];
}
