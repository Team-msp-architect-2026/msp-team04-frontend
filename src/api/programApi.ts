import client from './client';

export type ProgramStatus = 'RECRUITING' | 'CLOSED';
export type ProgramScreenFilter =
  | 'ALL'
  | 'URGENT'
  | 'FREE'
  | 'ONLINE'

export interface ProgramListParams {
  status?: ProgramStatus;
  category?: string;
  region?: string;
  filter?: ProgramScreenFilter;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ProgramListItem {
  id: number;
  name: string;
  institutionName: string | null;
  category: string;
  programType: string | null;
  price: number | null;
  isFree: boolean;
  isPublic: boolean | null;
  targetAgeMin: number | null;
  targetAgeMax: number | null;
  maxCapacity: number | null;
  remainCapacity: number | null;
  isRecruiting: boolean;
  region: string | null;
  detailAddress: string | null;
  imageUrl: string | null;
  classType: string | null;
  classTime: string | null;
  operationStart: string | null;
  operationEnd: string | null;
  deadlineDate: string | null;
  ratingAvg: number | null;
  reviewCount: number | null;
  description: string | null;
  curriculum: string | null;
  contactPhone: string | null;
  contactUrl: string | null;
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

export interface HomeProgramsResponse {
  freePrograms: ProgramListItem[];
  urgentPrograms: ProgramListItem[];
  onlinePrograms: ProgramListItem[];
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
      filter: params.filter,
      sort: params.sort,
    },
  });

  return response.data;
};

export const getHomePrograms = async (): Promise<ApiResponse<HomeProgramsResponse>> => {
  const response = await client.get<ApiResponse<HomeProgramsResponse>>('/programs/home');

  return response.data;
};
