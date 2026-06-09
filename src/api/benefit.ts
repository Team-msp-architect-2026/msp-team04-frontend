import { tokenStorage } from './tokenStorage';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────
export interface BenefitMaster {
  id: number;
  benefitName: string;
  benefitType: string;
  supportAmount: number;
  supportDescription: string;
  applyLink: string;
  minAge: number;
  maxAge: number;
  conditionDescription: string;
  region: string;
}

export interface BenefitMatch {
  matchId: number;
  benefitId: number;
  benefitName: string;
  benefitType: string;
  expectedMonthlySaving: number;
  matchStatus: string;
  applyLink: string;
  supportDescription: string;
}

// ─────────────────────────────────────────────
// API 함수
// ─────────────────────────────────────────────
async function authHeaders() {
  const token = await tokenStorage.getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchBenefits(): Promise<BenefitMaster[]> {
  const res = await fetch(`${BASE_URL}/api/benefits`, {
    headers: await authHeaders(),
  });
  const json = await res.json();
  return json.data;
}

export async function fetchBenefitMatches(childId: number): Promise<BenefitMatch[]> {
  const res = await fetch(`${BASE_URL}/api/benefits/matches?childId=${childId}`, {
    headers: await authHeaders(),
  });
  const json = await res.json();
  console.log('matches 응답:', JSON.stringify(json.data?.slice(0, 3)));
  return json.data ?? [];
}

export async function recalculateBenefits(childId: number): Promise<void> {
  await fetch(`${BASE_URL}/api/benefits/matches/recalculate?childId=${childId}`, {
    method: 'POST',
    headers: await authHeaders(),
  });
}