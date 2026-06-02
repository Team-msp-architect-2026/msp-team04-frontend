import client from './client';

export type ProgramStatus = 'RECRUITING' | 'CLOSED';

export interface ProgramListParams {
  status?: ProgramStatus;
  category?: string;
  region?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ProgramListItem {
  id: number;
  name: string;
  category: string;
  price: number | null;
  isFree: boolean;
  maxCapacity: number | null;
  remainCapacity: number | null;
  isRecruiting: boolean;
  region: string | null;
  detailAddress: string | null;
  imageUrl: string | null;
  classType: string | null;
  deadlineDate: string | null;
  ratingAvg: number | null;
  reviewCount: number | null;
}

export interface ProgramPage {
  content: ProgramListItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

export const getPrograms = async (
  params: ProgramListParams = {},
): Promise<ApiResponse<ProgramPage>> => {
  const response = await client.get<ApiResponse<ProgramPage>>('/programs', {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 50,
      status: params.status,
      category: params.category,
      region: params.region,
      sort: params.sort,
    },
  });

  return response.data;
};
