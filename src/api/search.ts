import client from './client';

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}

export interface SearchProgramItem {
  id: number;
  name: string;
  institutionName: string | null;
  category: string;
  description: string | null;
  price: number;
  isFree: boolean;
  maxCapacity: number | null;
  remainCapacity: number | null;
  isRecruiting: boolean;
  region: string | null;
  detailAddress: string | null;
  imageUrl: string | null;
  classType: string | null;
  targetAgeMin: number | null;
  targetAgeMax: number | null;
  deadlineDate: string | null;
  ratingAvg: number;
  reviewCount: number;
  tags: string[];
  matchScore: number;
}

export interface RecentSearchItem {
  id: number;
  keyword: string;
  searchedAt: string;
}

export type AiSearchSuggestionSource = 'RECENT' | 'PERSONAL' | 'GLOBAL';

export interface AiSearchSuggestionItem {
  id: number;
  keyword: string;
  source: AiSearchSuggestionSource;
  createdAt: string;
}

export const searchApi = {
  async searchPrograms(keyword: string, page = 0, size = 10) {
    const response = await client.get<ApiResponse<PageResponse<SearchProgramItem>>>(
      '/api/search',
      {
        params: {
          keyword,
          page,
          size,
        },
      },
    );

    return response.data.data;
  },

  async getRecentSearches() {
    const response = await client.get<ApiResponse<RecentSearchItem[]>>(
      '/api/search/recent',
    );

    return response.data.data;
  },

  async getSearchSuggestions() {
    const response = await client.get<ApiResponse<AiSearchSuggestionItem[]>>(
      '/api/search/suggestions',
    );

    return response.data.data;
  },

  async deleteRecentSearches() {
    await client.delete<ApiResponse<null>>('/api/search/recent');
  },
};
