export interface AnalysisResponse {
  _id: string;
  locale: string;
  model: string | null;
  input: string;
  __v: number;
  createdAt: string;
  inputType: string;
  productName: string;
  updatedAt: string;
}

export interface VideoResponse {
  _id: string;
  analysisId: string;
  productName: string;
  rawInput: string;
  inputSearchType: string;
  locale: string;
  title: string;
  description: string;
  thumbnails: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  averageInteraction: number;
  videoUrl: string;
  createdAt: string;
  __v: number;
  updatedAt: string;
}
