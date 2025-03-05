export interface YouTubeVideoInfo {
  id?: string;
  title: string;
  description: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };
  viewCount: number;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  averageInteraction?: number;
  videoUrl?: string;
}

export type VideoItem = {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
    favoriteCount?: string;
  };
};

export type SearchItem = {
  id?: {
    videoId?: string;
  };
};

export interface YouTubeVideoInfoDetail {
  kind: string;
  etag: string;
  items: YouTubeVideo[];
  pageInfo: PageInfo;
}

interface YouTubeVideo {
  kind: string;
  etag: string;
  id: string;
  snippet: VideoSnippet;
  statistics: VideoStatistics;
}

interface VideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: VideoThumbnails;
  channelTitle: string;
  tags: string[];
  categoryId: string;
  liveBroadcastContent: string;
  localized: VideoLocalized;
  defaultAudioLanguage: string;
}

interface VideoThumbnails {
  default: Thumbnail;
  medium: Thumbnail;
  high: Thumbnail;
  standard: Thumbnail;
  maxres: Thumbnail;
}

interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

interface VideoLocalized {
  title: string;
  description: string;
}

interface VideoStatistics {
  viewCount: string;
  likeCount: string;
  favoriteCount: string;
  commentCount: string;
}

interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}
