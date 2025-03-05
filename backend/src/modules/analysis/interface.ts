export interface ProductDetails {
  name: string;
  price: string;
  description: string;
  category: string;
  brand: string;
  rawResponse?: string;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  viewCount?: number;
  favoriteCount?: number;
  videoUrl?: string;
  thumbnails?: string;
}

export interface AiResults {
  [key: string]: ProductDetails[];
}
