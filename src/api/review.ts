import client from './client';

export interface ReviewItem {
  reviewId: number;
  rating: number;
  content: string;
  createdAt: string;
}

export interface ReviewKeywordResponse {
  programId: number;
  reviewCount: number;
  ratingAverage: number | null;
  positiveKeywords: string[];
  negativeKeywords: string[];
  summary: string;
  source: string;
}

export const reviewApi = {
  getReviewList: async (programId: number): Promise<ReviewItem[]> => {
    const res = await client.get(`/api/programs/${programId}/reviews`);
    return res.data.data;
  },

  getReviewKeywords: async (
    programId: number,
  ): Promise<ReviewKeywordResponse> => {
    const res = await client.get(
      `/api/programs/${programId}/reviews/ai-keywords`,
    );
    return res.data.data;
  },
};
