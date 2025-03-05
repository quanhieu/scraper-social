export interface ProductDetails {
  name: string;
  price: string;
  description: string;
  category: string;
  brand: string;
  rawResponse?: string;
}

export interface AiResults {
  [key: string]: ProductDetails[];
}

export interface ProductInfo {
  id?: string;
  title?: string;
  description?: string;
  thumbnails?:
    | {
        default: string;
        medium: string;
        high: string;
      }
    | string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  videoUrl?: string;
  name?: string;
  price?: string;
  brand?: string;
  shareCount?: number;
  cover?: string;
}
