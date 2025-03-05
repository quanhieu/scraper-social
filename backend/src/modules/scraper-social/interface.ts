export interface ITikTokVideoInfo {
  region: string;
  title: string;
  avatar: string;
  author: string;
  username: string;
  comment: string;
  views: string;
  cover: string;
  like: string;
  bookmark: string;
  published: string;
  video: string;
  video_wm: string;
  video_hd: string;
  music: string;
  duration: string;
}

export interface IYouTubeVideoInfo {
  title: string;
  author: string;
  description: string;
  duration: string;
  quality: string;
  views: string;
  upload: string;
  thumbnail: string;
  video: string;
}

export interface IYouTubeChannelInfo {
  authorName: string;
  authorAvatar: string;
  videoId: string;
}

export interface IYouTubeSearchResult {
  video: IYouTubeVideoInfo[];
  channel: IYouTubeChannelInfo[];
}

export interface IYouTubeMusicInfo {
  title: string;
  author: string;
  description: string;
  duration: string;
  views: string;
  upload: string;
  thumbnail: string;
  audio: string;
  audio_2: string;
}

export interface IFacebookVideoInfo {
  resolution: string;
  thumbnail: string;
  url: string;
  shouldRender: boolean;
}

export interface IInstagramVideoInfo {
  status: boolean;
  data: {
    thumbnail: string;
    url: string;
  }[];
}

export interface ITwitterInfo {
  content_type: string;
  url: string;
  height: string;
  width: string;
  bitrate?: number | undefined;
}

export interface IGoogleSearchResult {
  related: string[];
  title?: string | undefined;
  type?: string | undefined;
  description?: string | undefined;
  articles: {
    title: string;
    description: string;
    header: string;
    url: string;
    iconBase64?: string | undefined;
    thumbnail?: string | undefined;
    gif?: string | undefined;
    footer?: string | undefined;
  }[];
}
