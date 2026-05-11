import client from './client';

export interface ReviewItem {
  reviewId: number;
  rating: number;
  content: string;
  createdAt: string;
}

export const reviewApi = {
  getReviewList: async (programId: number): Promise<ReviewItem[]> => {
    const res = await client.get(`/api/programs/${programId}/reviews`);
    return res.data.data;
  },
};
