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

export type MonthlyBudgetCode = 'FREE' | '0-10' | '10-20' | '20+' | 'ANY';
export type TransportTypeCode = 'WALK' | 'CAR';
export type MoveTimeCode = '10MIN' | '10-20MIN' | '20MIN+' | 'ANY';
export type OnlinePreferenceCode = 'ONLINE_OK' | 'OFFLINE_ONLY' | 'ANY';
export type ClassTypeCode =
  | 'SMALL'
  | 'MEDIUM'
  | 'INDIVIDUAL'
  | 'ONLINE'
  | 'VISIT';

export interface RecommendationFilterData {
  ageGroup: string;
  region: string;
  budget: string;
  travelMode: string;
  travelTime: string;
  onlineOption: string;
  classType: string;
  concerns: string[];
  subjectDetails: string[];
}

export interface PreferenceRequest {
  childId: number;
  region: string;
  monthlyBudget: MonthlyBudgetCode;
  transportType: TransportTypeCode;
  moveTime: MoveTimeCode;
  onlinePreference: OnlinePreferenceCode;
  classType: ClassTypeCode;
  concerns: string[];
  subjectDetails: string[];
}

export interface SavePreferenceResponse {
  preferenceId: number;
}

export interface ScoreBreakdown {
  scoreDistance: number | null;
  scoreBudget: number | null;
  scoreAge: number | null;
  scoreKeyword: number | null;
  scoreClassType: number | null;
  scoreRecruiting: number | null;
  scoreReview: number | null;
  totalScore: number | null;
  reasonCodes?: string[] | null;
}

export interface RecommendationItem {
  recommendationId: number;
  programId: number;
  title: string;
  category: string;
  region: string | null;
  price: number;
  isFree: boolean;
  classType: string | null;
  isRecruiting: boolean;
  imageUrl: string | null;
  rankNo: number;
  isTop3: boolean;
  recommendReason: string;
  scoreBreakdown: ScoreBreakdown;
}

export interface AiRecommendationItem {
  recommendationId: number;
  userId: number;
  childId: number;
  preferenceId: number;
  programId: number;
  totalScore: number | null;
  scoreDistance: number | null;
  scoreBudget: number | null;
  scoreAge: number | null;
  scoreKeyword: number | null;
  scoreClassType: number | null;
  scoreRecruiting: number | null;
  scoreReview: number | null;
  rankNo: number;
  recommendReason: string;
  isTop3: boolean;
  createdAt: string;
}

export interface Top3CompareItem {
  programId: number;
  reason: string;
  highlightTag: string;
}

export interface Top3CompareResponse {
  commonSummary: string;
  items: Top3CompareItem[];
  source: string;
}

export interface ProgramReasonResponse {
  matchScore: number;
  reasonList: string[];
  source: string;
}

export interface NextRecommendExplainItem {
  programId: number;
  title: string;
  explainMessage: string;
  highlightTag: string;
}

export interface NextRecommendExplainResponse {
  message: string;
  items: NextRecommendExplainItem[];
  source: string;
}

const monthlyBudgetMap: Record<string, MonthlyBudgetCode> = {
  무료: 'FREE',
  '0~10만원': '0-10',
  '10~20만원': '10-20',
  '20만원+': '20+',
  무관: 'ANY',
};

const transportTypeMap: Record<string, TransportTypeCode> = {
  도보: 'WALK',
  차량: 'CAR',
};

const moveTimeMap: Record<string, MoveTimeCode> = {
  '10분 이내': '10MIN',
  '10~20분': '10-20MIN',
  '20분+': '20MIN+',
  무관: 'ANY',
};

const onlinePreferenceMap: Record<string, OnlinePreferenceCode> = {
  온라인: 'ONLINE_OK',
  오프라인: 'OFFLINE_ONLY',
  무관: 'ANY',
};

const classTypeMap: Record<string, ClassTypeCode> = {
  '소규모 (5명 이하)': 'SMALL',
  '중규모 (6~10명)': 'MEDIUM',
  '1:1 개인': 'INDIVIDUAL',
  온라인: 'ONLINE',
  '방문 수업': 'VISIT',
};

function requireMappedValue<T extends string>(
  label: string,
  value: string,
  map: Record<string, T>,
): T {
  const mapped = map[value];

  if (!mapped) {
    throw new Error(`${label} 값이 올바르지 않습니다: ${value}`);
  }

  return mapped;
}

export function buildPreferenceRequest(
  childId: number,
  filterData: RecommendationFilterData,
): PreferenceRequest {
  if (!childId) {
    throw new Error('추천 선호도 저장에는 childId가 필요합니다.');
  }

  return {
  childId,
  region: filterData.region,
  monthlyBudget: requireMappedValue('예산', filterData.budget, monthlyBudgetMap),
  transportType: requireMappedValue('이동수단', filterData.travelMode, transportTypeMap),
  moveTime: requireMappedValue('이동시간', filterData.travelTime, moveTimeMap),
  onlinePreference: requireMappedValue(
    '온라인 선호도',
    filterData.onlineOption,
    onlinePreferenceMap,
  ),
  classType: requireMappedValue('수업 형태', filterData.classType, classTypeMap),

  concerns: filterData.concerns,
  subjectDetails: filterData.subjectDetails,
};
}

export const recommendationApi = {
  savePreference: async (request: PreferenceRequest): Promise<number> => {
    const response = await client.post<ApiResponse<SavePreferenceResponse>>(
      '/api/recommendation-preferences',
      request,
    );

    return response.data.data.preferenceId;
  },

  getRecommendations: async (
    childId: number,
    preferenceId: number,
    page = 0,
    size = 10,
  ): Promise<PageResponse<RecommendationItem>> => {
    const response = await client.get<ApiResponse<PageResponse<RecommendationItem>>>(
      '/api/recommend',
      {
        params: {
          childId,
          preferenceId,
          page,
          size,
        },
      },
    );

    return response.data.data;
  },

  getTop3Recommendations: async (
    preferenceId: number,
  ): Promise<AiRecommendationItem[]> => {
    const response = await client.get<ApiResponse<AiRecommendationItem[]>>(
      `/api/recommendations/${preferenceId}/top3`,
    );

    return response.data.data;
  },

  compareTop3: async (preferenceId: number): Promise<Top3CompareResponse> => {
    const response = await client.post<ApiResponse<Top3CompareResponse>>(
      '/api/ai/recommend/top3/compare',
      null,
      {
        params: { preferenceId },
      },
    );

    return response.data.data;
  },

  getProgramReason: async (
    programId: number,
    params: { preferenceId?: number | null; childId?: number | null },
  ): Promise<ProgramReasonResponse> => {
    const response = await client.get<ApiResponse<ProgramReasonResponse>>(
      `/api/programs/${programId}/ai-reason`,
      {
        params: {
          preferenceId: params.preferenceId ?? undefined,
          childId: params.childId ?? undefined,
        },
      },
    );

    return response.data.data;
  },

  explainNextRecommend: async (
    applicationId: number,
  ): Promise<NextRecommendExplainResponse> => {
    const response = await client.post<ApiResponse<NextRecommendExplainResponse>>(
      '/api/ai/recommend/next/explain',
      null,
      {
        params: { applicationId },
      },
    );

    return response.data.data;
  },
};
