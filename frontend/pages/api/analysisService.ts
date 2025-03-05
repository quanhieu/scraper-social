import apiClient from "./api";
import { AnalysisResponse, VideoResponse } from "./interface";

const api = {
  analysis: "/analysis",
  video: "/analysis/video",
};

export const getAnalysis = async (
  input: string,
  password: string,
  locale?: string
): Promise<AnalysisResponse> => {
  try {
    const response = await apiClient.get<AnalysisResponse>(api.analysis, {
      params: { input, locale, password },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching analysis:", error);
    throw error;
  }
};

export const getVideo = async (
  input: string,
  analysisId: string,
  password: string,
  sortOptions?: Record<string, "ASC" | "DESC">,
  locale?: string
): Promise<VideoResponse[]> => {
  try {
    const response = await apiClient.get<VideoResponse[]>(api.video, {
      params: { input, analysisId, locale, password, ...sortOptions },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching video:", error);
    throw error;
  }
};
