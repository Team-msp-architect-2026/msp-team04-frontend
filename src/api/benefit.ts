import client from './client';

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

export type MatchStatus = 'APPLICABLE' | 'CONDITION_CHECK' | 'NOT_ELIGIBLE';

export interface BenefitMaster {
  id: number;
  benefitName: string;
  benefitType: string | null;
  supportAmount: number | null;
  supportDescription: string | null;
  applyLink: string | null;
  minAge: number | null;
  maxAge: number | null;
  conditionDescription: string | null;
  region: string | null;
}

export interface BenefitMatch {
  matchId: number;
  benefitId: number;
  benefitName: string;
  benefitType: string | null;
  expectedMonthlySaving: number | null;
  matchStatus: MatchStatus;
  applyLink: string | null;
  supportDescription: string | null;
  conditionDescription: string | null;
  region: string | null;
}

export interface BenefitSummary {
  childId: number;
  childName: string;
  profileCompleted: boolean;
  totalBenefitCount: number;
  applicableCount: number;
  conditionCheckCount: number;
  estimatedMonthlySaving: number;
  summaryMessage: string;
  officialCheckMessage: string;
  benefits: BenefitMatch[];
}

export async function fetchBenefits(): Promise<BenefitMaster[]> {
  const res = await client.get<ApiResponse<BenefitMaster[]>>('/api/benefits');
  return res.data.data ?? [];
}

export async function fetchBenefitMatches(childId: number): Promise<BenefitMatch[]> {
  const res = await client.get<ApiResponse<BenefitMatch[]>>('/api/benefits/matches', {
    params: { childId },
  });

  return res.data.data ?? [];
}

export async function recalculateBenefits(childId: number): Promise<BenefitMatch[]> {
  const res = await client.post<ApiResponse<BenefitMatch[]>>(
    '/api/benefits/matches/recalculate',
    null,
    {
      params: { childId },
    },
  );

  return res.data.data ?? [];
}

export async function fetchBenefitSummary(childId: number): Promise<BenefitSummary> {
  const res = await client.get<ApiResponse<BenefitSummary>>('/api/benefits/summary', {
    params: { childId },
  });

  return res.data.data;
}
