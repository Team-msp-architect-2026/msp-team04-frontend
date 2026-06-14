import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  fetchBenefitProfile,
  fetchBenefitSummary,
  recalculateBenefits,
  type BenefitMatch,
  type BenefitProfile,
  type BenefitSummary,
  type MatchStatus,
} from '../../api/benefit';
import { getPrograms, type ProgramListItem } from '../../api/programApi';

interface ChildInfo {
  name: string;
  age: number;
  concerns: string[];
}

interface AiReportScreenProps {
  childInfo: ChildInfo;
  childId?: number | null;
  userName?: string;
  onBack: () => void;
  onSelectProgram?: () => void;
  onSelectBenefit?: () => void;
  onSelectFreePrograms?: () => void;
}

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface ReportSubsidyItem {
  id: number;
  title: string;
  desc: string;
  tag: string;
  amount: string;
  monthlyAmount: number;
  icon: IconName;
  iconBg: string;
  status: MatchStatus;
}

interface ReportFreeProgramItem {
  id: number;
  title: string;
  org: string;
  date: string;
  region: string;
  reason: string;
  imageUrl: string | null;
  score: number;
  deadlineTime: number;
}

const DEFAULT_PROGRAM_IMAGE = require('../../../assets/default-program.png');

const PALETTE = {
  bg: '#F5F6F8',
  card: '#FFFFFF',
  text: '#17191D',
  subText: '#6B7280',
  muted: '#9AA1AC',
  border: '#EEF0F3',
  softBorder: '#E8EDF3',
  yellow: '#FFF8D8',
  yellowDark: '#8A6A00',
  blue: '#EEF3FF',
  blueDark: '#4D5FD2',
  green: '#F2FBF6',
  greenDark: '#228251',
  purple: '#F5F3FF',
  purpleDark: '#5F52C8',
  black: '#17191D',
};

const CONCERN_KEYWORDS: Record<string, string[]> = {
  미술: ['미술', '그림', '드로잉', '공예', '창의', '아트', '만들기', '예술'],
  음악: ['음악', '악기', '노래', '리듬', '피아노', '동요', '합창'],
  체육: ['체육', '운동', '축구', '농구', '태권도', '발레', '댄스', '신체', '놀이'],
  독서: ['독서', '책', '논술', '글쓰기', '문해', '동화', '그림책'],
  영어: ['영어', '외국어', '스토리텔링', 'english'],
  과학: ['과학', '실험', '탐구', '로봇', '코딩', 'sw', '메이커'],
  수학: ['수학', '사고력', '연산', '논리'],
  자연: ['자연', '생태', '숲', '환경', '체험', '농장'],
  사회성: ['사회성', '또래', '관계', '소통', '협동', '놀이'],
  돌봄: ['돌봄', '방과후', '방학', '양육', '보육'],
  예체능: ['미술', '음악', '체육', '예술', '공예', '댄스', '발레'],
  학습: ['독서', '논술', '수학', '영어', '과학', '학습', '코딩'],
};

function normalizeText(value?: string | null) {
  return (value ?? '').replace(/\s+/g, '').toLowerCase();
}

function formatWon(value?: number | null) {
  const safeValue = value ?? 0;
  return safeValue.toLocaleString('ko-KR');
}

function formatSubsidyAmount(value?: number | null) {
  if (!value || value <= 0) {
    return '공식 확인';
  }

  return `월 ${formatWon(value)}원`;
}

function formatBenefitStatus(status: MatchStatus) {
  if (status === 'APPLICABLE') return '신청 가능';
  if (status === 'CONDITION_CHECK') return '조건 확인';
  return '확인 필요';
}

function getBenefitIcon(type?: string | null): { icon: IconName; iconBg: string } {
  const normalized = normalizeText(type);

  if (normalized.includes('voucher') || normalized.includes('바우처')) {
    return { icon: 'card-outline', iconBg: '#F2F7FF' };
  }

  if (normalized.includes('education') || normalized.includes('교육')) {
    return { icon: 'school-outline', iconBg: '#F4F7FB' };
  }

  if (normalized.includes('free') || normalized.includes('무료')) {
    return { icon: 'gift-outline', iconBg: '#F4FBF7' };
  }

  return { icon: 'cash-outline', iconBg: '#FFF7E0' };
}

function toReportSubsidyItem(match: BenefitMatch): ReportSubsidyItem {
  const { icon, iconBg } = getBenefitIcon(match.benefitType);

  return {
    id: match.matchId,
    title: match.benefitName,
    desc:
      match.supportDescription?.trim() ||
      match.conditionDescription?.trim() ||
      '세부 자격과 제출 서류는 공식 사이트에서 확인이 필요해요.',
    tag: formatBenefitStatus(match.matchStatus),
    amount: formatSubsidyAmount(match.expectedMonthlySaving),
    monthlyAmount: match.expectedMonthlySaving ?? 0,
    icon,
    iconBg,
    status: match.matchStatus,
  };
}

function getRegionKeywords(profile: BenefitProfile | null) {
  return [
    profile?.district?.trim() ?? '',
    profile?.region?.trim() ?? '',
  ].filter(Boolean);
}

function getProgramDeadlineTime(program: ProgramListItem) {
  if (!program.deadlineDate) {
    return Number.MAX_SAFE_INTEGER;
  }

  const time = new Date(`${program.deadlineDate}T00:00:00`).getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

function formatDeadline(program: ProgramListItem) {
  if (!program.deadlineDate) {
    return '상시';
  }

  const date = new Date(`${program.deadlineDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return '상시';
  }

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `~ ${month}.${day}`;
}

function buildProgramSearchText(program: ProgramListItem) {
  return normalizeText(
    [
      program.name,
      program.category,
      program.description,
      program.institutionName,
      program.region,
      program.detailAddress,
      program.classType,
      program.curriculum,
    ]
      .filter(Boolean)
      .join(' '),
  );
}

function concernMatchesProgram(concern: string, programText: string) {
  const normalizedConcern = normalizeText(concern);
  const keywordGroup = CONCERN_KEYWORDS[concern] ?? CONCERN_KEYWORDS[normalizedConcern] ?? [];
  const candidates = [concern, ...keywordGroup]
    .map(normalizeText)
    .filter(Boolean);

  return candidates.some(keyword => programText.includes(keyword));
}

function getMatchedConcerns(program: ProgramListItem, concerns: string[]) {
  const programText = buildProgramSearchText(program);

  return concerns
    .filter(concern => concern && concern.trim())
    .filter(concern => concernMatchesProgram(concern, programText));
}

function regionMatchesProgram(program: ProgramListItem, profile: BenefitProfile | null) {
  const regionKeywords = getRegionKeywords(profile);
  if (regionKeywords.length === 0) return false;

  const programRegionText = normalizeText([program.region, program.detailAddress].filter(Boolean).join(' '));

  return regionKeywords.some(region => {
    const normalizedRegion = normalizeText(region);
    return normalizedRegion && programRegionText.includes(normalizedRegion);
  });
}

function buildFreeProgramReason(
  program: ProgramListItem,
  matchedConcerns: string[],
  profile: BenefitProfile | null,
) {
  const reasons: string[] = [];
  const district = profile?.district?.trim();
  const region = profile?.region?.trim();

  if (district && normalizeText(program.region).includes(normalizeText(district))) {
    reasons.push(`${district} 기준`);
  } else if (region && normalizeText(program.region).includes(normalizeText(region))) {
    reasons.push(`${region} 기준`);
  } else if (regionMatchesProgram(program, profile)) {
    reasons.push('거주지 인근');
  }

  if (matchedConcerns.length > 0) {
    reasons.push(`${matchedConcerns.slice(0, 2).join(', ')} 관심분야`);
  }

  if (reasons.length === 0) {
    reasons.push('모집중 무료 프로그램');
  }

  return reasons.join(' · ');
}

function toReportFreeProgramItem(
  program: ProgramListItem,
  concerns: string[],
  profile: BenefitProfile | null,
): ReportFreeProgramItem {
  const matchedConcerns = getMatchedConcerns(program, concerns);
  const regionMatched = regionMatchesProgram(program, profile);
  const deadlineTime = getProgramDeadlineTime(program);

  const score =
    (regionMatched ? 50 : 0) +
    matchedConcerns.length * 20 +
    (program.isRecruiting ? 10 : 0) +
    (program.isFree || program.price === 0 ? 10 : 0) +
    (deadlineTime !== Number.MAX_SAFE_INTEGER ? 5 : 0);

  return {
    id: program.id,
    title: program.name,
    org: program.institutionName ?? program.region ?? '운영기관 확인 필요',
    date: formatDeadline(program),
    region: program.region ?? '지역 확인 필요',
    reason: buildFreeProgramReason(program, matchedConcerns, profile),
    imageUrl: program.imageUrl,
    score,
    deadlineTime,
  };
}

function mergePrograms(...groups: ProgramListItem[][]) {
  const merged = new Map<number, ProgramListItem>();

  groups.flat().forEach(program => {
    if (!merged.has(program.id)) {
      merged.set(program.id, program);
    }
  });

  return Array.from(merged.values());
}

async function fetchRegionalFreePrograms(profile: BenefitProfile | null) {
  const primaryRegion = profile?.district?.trim() || profile?.region?.trim() || '';
  const broadRegion = profile?.region?.trim() || '';
  const groups: ProgramListItem[][] = [];

  if (primaryRegion) {
    const response = await getPrograms({
      status: 'RECRUITING',
      filter: 'FREE',
      region: primaryRegion,
      page: 0,
      size: 50,
    });
    groups.push(response.data?.content ?? []);
  }

  if (broadRegion && broadRegion !== primaryRegion) {
    const response = await getPrograms({
      status: 'RECRUITING',
      filter: 'FREE',
      region: broadRegion,
      page: 0,
      size: 50,
    });
    groups.push(response.data?.content ?? []);
  }

  return mergePrograms(...groups)
    .filter(program => program.isRecruiting)
    .filter(program => program.isFree || program.price === 0);
}

function rankFreePrograms(
  programs: ProgramListItem[],
  concerns: string[],
  profile: BenefitProfile | null,
) {
  return programs
    .map(program => toReportFreeProgramItem(program, concerns, profile))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.deadlineTime !== b.deadlineTime) return a.deadlineTime - b.deadlineTime;
      return b.id - a.id;
    })
;
}

function calculateReportScore(
  profile: BenefitProfile | null,
  summary: BenefitSummary | null,
  freeProgramCount: number,
) {
  let score = 0;

  if (profile?.completed) score += 40;
  if ((summary?.benefits?.length ?? 0) > 0) score += 35;
  if (freeProgramCount > 0) score += 25;

  return Math.max(score, profile?.completed ? 70 : 0);
}

export default function AiReportScreen({
  childInfo,
  childId,
  onBack,
  onSelectProgram,
  onSelectBenefit,
  onSelectFreePrograms,
}: AiReportScreenProps) {
  const [expandedSubsidy, setExpandedSubsidy] = useState<number | null>(null);
  const [showAllSubsidies, setShowAllSubsidies] = useState(false);
  const [profile, setProfile] = useState<BenefitProfile | null>(null);
  const [summary, setSummary] = useState<BenefitSummary | null>(null);
  const [subsidies, setSubsidies] = useState<ReportSubsidyItem[]>([]);
  const [freePrograms, setFreePrograms] = useState<ReportFreeProgramItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadReport = useCallback(async () => {
    if (!childId) {
      setProfile(null);
      setSummary(null);
      setSubsidies([]);
      setFreePrograms([]);
      setErrorMessage('자녀 정보 등록 후 AI 육아 종합 분석을 확인할 수 있어요.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const nextProfile = await fetchBenefitProfile();
      setProfile(nextProfile);

      await recalculateBenefits(childId);

      const nextSummary = await fetchBenefitSummary(childId);
      setSummary(nextSummary);

      const nextSubsidies = (nextSummary.benefits ?? [])
        .filter(match => match.matchStatus !== 'NOT_ELIGIBLE')
        .map(toReportSubsidyItem);
      setSubsidies(nextSubsidies);

      const freeProgramCandidates = await fetchRegionalFreePrograms(nextProfile);
      setFreePrograms(rankFreePrograms(freeProgramCandidates, childInfo.concerns ?? [], nextProfile));
    } catch (error) {
      console.error('AI report load failed:', error);
      setProfile(null);
      setSummary(null);
      setSubsidies([]);
      setFreePrograms([]);
      setErrorMessage('분석 리포트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [childId, childInfo.concerns]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const reportScore = useMemo(
    () => calculateReportScore(profile, summary, freePrograms.length),
    [profile, summary, freePrograms.length],
  );

  const reportChips: Array<{
    label: string;
    icon: IconName;
    bg: string;
    color: string;
  }> = [
    {
      label: `지원금 ${subsidies.length}건`,
      icon: 'cash-outline',
      bg: PALETTE.yellow,
      color: PALETTE.yellowDark,
    },
    {
      label: `무료 프로그램 ${freePrograms.length}건`,
      icon: 'gift-outline',
      bg: PALETTE.blue,
      color: PALETTE.blueDark,
    },
    {
      label: 'AI 추천 준비중',
      icon: 'sparkles-outline',
      bg: PALETTE.purple,
      color: PALETTE.purpleDark,
    },
  ];

  const confirmedSaving = subsidies
    .filter(item => item.status === 'APPLICABLE')
    .reduce((sum, item) => sum + item.monthlyAmount, 0);

  const potentialSaving = subsidies
    .filter(item => item.status === 'CONDITION_CHECK')
    .reduce((sum, item) => sum + item.monthlyAmount, 0);

  const conditionCheckCount = subsidies.filter(
    item => item.status === 'CONDITION_CHECK',
  ).length;

  const savingRows = [
    {
      label: '신청 가능 지원금',
      value: `${summary?.applicableCount ?? 0}건`,
    },
    {
      label: '조건 확인 필요',
      value: `${conditionCheckCount}건`,
    },
    ...(potentialSaving > 0
      ? [{
          label: '조건 확인 시 추가 가능',
          value: `월 ${formatWon(potentialSaving)}원`,
        }]
      : []),
    {
      label: '지역 무료 프로그램',
      value: `${freePrograms.length}건`,
    },
  ];

  const visibleSubsidies = showAllSubsidies
    ? subsidies
    : subsidies.slice(0, 3);

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SafeAreaView edges={['top']} style={s.safeArea}>
        <View style={s.header}>
          <TouchableOpacity
            style={s.headerSide}
            onPress={onBack}
            activeOpacity={0.72}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={25} color="#191919" />
          </TouchableOpacity>

          <Text style={s.headerTitle}>AI 육아 종합 분석 리포트</Text>

          <View style={s.headerSide} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.heroCard}>
          <Text style={s.heroTitle}>
            {childInfo.name}에게 맞는{'\n'}육아 지원 혜택을 찾았어요!
          </Text>

          <View style={s.scoreCard}>
            <View style={s.scoreCircleOuter}>
              <View style={s.scoreCircleInner}>
                <Text style={s.scoreText}>{reportScore}%</Text>
              </View>
            </View>

            <View style={s.scoreInfo}>
              <Text style={s.scoreTitle}>맞춤 분석 기준 충족도</Text>
              <Text style={s.scoreDesc}>
                지원금 진단 정보와{'\n'}아이 관심분야를 기준으로 분석했어요.
              </Text>
            </View>
          </View>

          <View style={s.chipRow}>
            {reportChips.map(chip => (
              <View
                key={chip.label}
                style={[s.chip, { backgroundColor: chip.bg }]}
              >
                <Ionicons name={chip.icon} size={13} color={chip.color} />
                <Text style={[s.chipText, { color: chip.color }]}>
                  {chip.label}
                </Text>
              </View>
            ))}
          </View>

          {profile?.region && (
            <View style={s.profileBasisCard}>
              <Ionicons name="location-outline" size={15} color={PALETTE.subText} />
              <Text style={s.profileBasisText}>
                {profile.region}
                {profile.district ? ` ${profile.district}` : ''} · {childInfo.concerns.length > 0 ? childInfo.concerns.join(', ') : '관심분야 없음'} 기준
              </Text>
            </View>
          )}
        </View>

        {errorMessage ? (
          <View style={s.errorCard}>
            <Ionicons name="alert-circle-outline" size={20} color="#B45309" />
            <Text style={s.errorText}>{errorMessage}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={loadReport} activeOpacity={0.74}>
              <Text style={s.retryBtnText}>다시 불러오기</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              1. 받을 수 있는 지원금{' '}
              <Text style={s.sectionCountYellow}>{subsidies.length}건</Text>
            </Text>

            <TouchableOpacity
              style={s.moreBtn}
              activeOpacity={0.72}
              onPress={onSelectBenefit}
            >
              <Text style={s.moreBtnText}>전체보기</Text>
              <Ionicons name="chevron-forward" size={13} color={PALETTE.muted} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={s.loadingCard}>
              <ActivityIndicator />
              <Text style={s.loadingText}>지원금 정보를 불러오는 중이에요.</Text>
            </View>
          ) : subsidies.length === 0 ? (
            <View style={s.emptyCard}>
              <Ionicons name="cash-outline" size={22} color={PALETTE.muted} />
              <Text style={s.emptyTitle}>표시할 지원금이 아직 없어요.</Text>
              <Text style={s.emptyText}>진단 정보를 저장한 뒤 다시 분석하면 받을 수 있는 지원금이 표시돼요.</Text>
            </View>
          ) : (
            <View style={s.subsidyListWrap}>
              {visibleSubsidies.map(item => {
                const isExpanded = expandedSubsidy === item.id;

                return (
                  <View key={item.id} style={s.subsidyCard}>
                    <TouchableOpacity
                      style={s.subsidyRow}
                      onPress={() => setExpandedSubsidy(isExpanded ? null : item.id)}
                      activeOpacity={0.76}
                    >
                      <View style={[s.subsidyIconBox, { backgroundColor: item.iconBg }]}>
                        <Ionicons name={item.icon} size={21} color="#4B5563" />
                      </View>

                      <View style={s.subsidyInfo}>
                        <Text style={s.subsidyTitle}>{item.title}</Text>
                        <Text style={s.subsidyAmount}>{item.amount}</Text>
                      </View>

                      <View style={s.subsidyRight}>
                        <View
                          style={[
                            s.subsidyTag,
                            item.status === 'CONDITION_CHECK' && s.subsidyTagBlue,
                          ]}
                        >
                          <Text
                            style={[
                              s.subsidyTagText,
                              item.status === 'CONDITION_CHECK' && s.subsidyTagBlueText,
                            ]}
                          >
                            {item.tag}
                          </Text>
                        </View>

                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={17}
                          color={PALETTE.muted}
                        />
                      </View>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={s.subsidyExpanded}>
                        <Text style={s.subsidyDesc}>{item.desc}</Text>

                        <View style={s.subsidyBtnRow}>
                          <TouchableOpacity
                            style={s.subsidyBtnOutline}
                            activeOpacity={0.74}
                            onPress={onSelectBenefit}
                          >
                            <Text style={s.subsidyBtnOutlineText}>지원금 화면에서 확인</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}

              {subsidies.length > 3 && (
                <TouchableOpacity
                  style={s.subsidyExpandBtn}
                  onPress={() => setShowAllSubsidies(prev => !prev)}
                  activeOpacity={0.76}
                >
                  <Text style={s.subsidyExpandBtnText}>
                    {showAllSubsidies
                      ? '접기'
                      : `전체 ${subsidies.length}건 펼쳐보기`}
                  </Text>
                  <Ionicons
                    name={showAllSubsidies ? 'chevron-up' : 'chevron-down'}
                    size={15}
                    color={PALETTE.muted}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              2. 무료 공공 프로그램{' '}
              <Text style={s.sectionCountBlue}>{freePrograms.length}건</Text>
            </Text>

            <TouchableOpacity
              style={s.moreBtn}
              activeOpacity={0.72}
              onPress={onSelectFreePrograms}
            >
              <Text style={s.moreBtnText}>전체보기</Text>
              <Ionicons name="chevron-forward" size={13} color={PALETTE.muted} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={s.loadingCard}>
              <ActivityIndicator />
              <Text style={s.loadingText}>무료 공공 프로그램을 찾는 중이에요.</Text>
            </View>
          ) : freePrograms.length === 0 ? (
            <View style={s.emptyCard}>
              <Ionicons name="gift-outline" size={22} color={PALETTE.muted} />
              <Text style={s.emptyTitle}>조건에 맞는 무료 프로그램이 아직 없어요.</Text>
              <Text style={s.emptyText}>지원금 진단 지역과 아이 관심분야를 기준으로 모집중 무료 프로그램만 보여줘요.</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.hScroll}
            >
              {freePrograms.map(program => (
                <TouchableOpacity
                  key={program.id}
                  style={s.freeProgramCard}
                  activeOpacity={0.8}
                >
                  {program.imageUrl ? (
                    <Image
                      source={{ uri: program.imageUrl }}
                      style={s.freeProgramImage}
                    />
                  ) : (
                    <Image
                      source={DEFAULT_PROGRAM_IMAGE}
                      style={s.freeProgramImage}
                    />
                  )}

                  <View style={s.freeProgramInfo}>
                    <Text style={s.freeProgramTitle} numberOfLines={1}>
                      {program.title}
                    </Text>
                    <Text style={s.freeProgramOrg} numberOfLines={1}>
                      {program.org}
                    </Text>

                    <View style={s.freeProgramBadge}>
                      <Text style={s.freeProgramBadgeText}>
                        무료 · {program.date}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              3. AI 추천 프로그램 <Text style={s.sectionCountPurple}>준비중</Text>
            </Text>
          </View>

          <View style={s.pendingCard}>
            <View style={s.pendingIconBox}>
              <Ionicons name="sparkles-outline" size={22} color={PALETTE.purpleDark} />
            </View>
            <View style={s.pendingTextWrap}>
              <Text style={s.pendingTitle}>맞춤 추천 로직 완성 후 연결할 예정이에요.</Text>
              <Text style={s.pendingText}>
                지금은 지원금 진단 정보와 무료 공공 프로그램만 실제 데이터로 분석해요.
              </Text>
            </View>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>4. 이번 달 지원 혜택 요약</Text>

          <View style={s.savingCard}>
            <View style={s.savingTop}>
              <View style={s.savingIconBox}>
                <Ionicons name="wallet-outline" size={24} color="#2563EB" />
              </View>

              <Text style={s.savingDesc}>
                현재 진단 정보 기준{'\n'}확정 예상 지원금은
              </Text>
            </View>

            <Text style={s.savingAmount}>{formatWon(confirmedSaving)}원</Text>
            <Text style={s.savingSubDesc}>조건 확인 대상은 별도 가능 금액으로만 표시해요.</Text>

            <View style={s.savingDivider} />

            {savingRows.map(row => (
              <View key={row.label} style={s.savingRow}>
                <View style={s.savingRowLeft}>
                  <Ionicons
                    name="checkmark-circle"
                    size={15}
                    color={PALETTE.greenDark}
                  />
                  <Text style={s.savingRowLabel}>{row.label}</Text>
                </View>

                <Text style={s.savingRowValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.bottomSpacer} />
      </ScrollView>

      <View style={s.bottomBar}>
        <TouchableOpacity
          style={s.selectBtn}
          onPress={onSelectProgram}
          activeOpacity={0.82}
        >
          <Text style={s.selectBtnText}>맞춤 추천 보러가기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3,
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.bg,
  },

  safeArea: {
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 52,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerSide: {
    width: 64,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: PALETTE.text,
    letterSpacing: -0.2,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },

  heroCard: {
    backgroundColor: PALETTE.card,
    borderRadius: 28,
    padding: 22,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: PALETTE.border,
    ...SHADOW,
  },

  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: PALETTE.text,
    lineHeight: 32,
    letterSpacing: -0.8,
    marginBottom: 18,
  },

  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFD',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },

  scoreCircleOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#FEEFC3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },

  scoreCircleInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scoreText: {
    fontSize: 22,
    fontWeight: '900',
    color: PALETTE.black,
  },

  scoreInfo: {
    flex: 1,
  },

  scoreTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: PALETTE.text,
    marginBottom: 6,
  },

  scoreDesc: {
    fontSize: 12.5,
    color: PALETTE.subText,
    lineHeight: 18,
    fontWeight: '600',
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 5,
  },

  chipText: {
    fontSize: 11.5,
    fontWeight: '800',
  },

  profileBasisCard: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: PALETTE.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  profileBasisText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.subText,
    lineHeight: 17,
  },

  errorCard: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 20,
    padding: 15,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  errorText: {
    flex: 1,
    fontSize: 12.5,
    color: '#92400E',
    fontWeight: '700',
    lineHeight: 18,
  },

  retryBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },

  retryBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },

  section: {
    marginBottom: 38,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.5,
  },

  sectionCountYellow: {
    color: PALETTE.yellowDark,
  },

  sectionCountBlue: {
    color: PALETTE.blueDark,
  },

  sectionCountPurple: {
    color: PALETTE.purpleDark,
  },

  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 5,
    paddingLeft: 8,
  },

  moreBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  loadingCard: {
    backgroundColor: PALETTE.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: PALETTE.border,
    alignItems: 'center',
    gap: 10,
    ...SHADOW,
  },

  loadingText: {
    fontSize: 12.5,
    color: PALETTE.subText,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: PALETTE.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: PALETTE.border,
    alignItems: 'center',
    ...SHADOW,
  },

  emptyTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '900',
    color: PALETTE.text,
  },

  emptyText: {
    marginTop: 6,
    fontSize: 12,
    color: PALETTE.subText,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },

  subsidyListWrap: {
    marginBottom: 6,
  },

  subsidyExpandBtn: {
    height: 42,
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: PALETTE.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  subsidyExpandBtnText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: PALETTE.subText,
  },

  subsidyCard: {
    backgroundColor: PALETTE.card,
    borderRadius: 22,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: PALETTE.border,
    overflow: 'hidden',
    ...SHADOW,
  },

  subsidyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },

  subsidyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  subsidyInfo: {
    flex: 1,
  },

  subsidyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: PALETTE.text,
    marginBottom: 5,
    letterSpacing: -0.2,
  },

  subsidyAmount: {
    fontSize: 12.5,
    fontWeight: '800',
    color: PALETTE.yellowDark,
  },

  subsidyRight: {
    alignItems: 'flex-end',
    gap: 8,
  },

  subsidyTag: {
    backgroundColor: PALETTE.yellow,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  subsidyTagBlue: {
    backgroundColor: PALETTE.blue,
  },

  subsidyTagText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: PALETTE.yellowDark,
  },

  subsidyTagBlueText: {
    color: PALETTE.blueDark,
  },

  subsidyExpanded: {
    borderTopWidth: 1,
    borderTopColor: PALETTE.border,
    padding: 14,
    backgroundColor: '#FCFCFD',
  },

  subsidyDesc: {
    fontSize: 12.5,
    color: PALETTE.subText,
    lineHeight: 19,
    fontWeight: '600',
  },

  subsidyBtnRow: {
    flexDirection: 'row',
    marginTop: 12,
  },

  subsidyBtnOutline: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.softBorder,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },

  subsidyBtnOutlineText: {
    fontSize: 12,
    fontWeight: '900',
    color: PALETTE.text,
  },

  hScroll: {
    paddingRight: 20,
  },

  freeProgramCard: {
    width: 166,
    backgroundColor: PALETTE.card,
    borderRadius: 20,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PALETTE.border,
    ...SHADOW,
  },

  freeProgramImage: {
    width: '100%',
    height: 104,
    backgroundColor: '#EEF0F3',
  },

  freeProgramInfo: {
    padding: 12,
  },

  freeProgramTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: PALETTE.text,
    lineHeight: 18,
  },

  freeProgramOrg: {
    marginTop: 5,
    fontSize: 11.5,
    color: PALETTE.subText,
    fontWeight: '700',
  },

  freeProgramBadge: {
    alignSelf: 'flex-start',
    marginTop: 9,
    backgroundColor: PALETTE.blue,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  freeProgramBadgeText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: PALETTE.blueDark,
  },

  pendingCard: {
    backgroundColor: PALETTE.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: PALETTE.border,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    ...SHADOW,
  },

  pendingIconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: PALETTE.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pendingTextWrap: {
    flex: 1,
  },

  pendingTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: PALETTE.text,
    marginBottom: 5,
  },

  pendingText: {
    fontSize: 12.5,
    color: PALETTE.subText,
    fontWeight: '600',
    lineHeight: 18,
  },

  savingCard: {
    backgroundColor: PALETTE.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginTop: 12,
    ...SHADOW,
  },

  savingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  savingIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  savingDesc: {
    flex: 1,
    fontSize: 13,
    color: PALETTE.subText,
    fontWeight: '700',
    lineHeight: 19,
  },

  savingAmount: {
    marginTop: 18,
    fontSize: 34,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -1,
  },

  savingSubDesc: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '800',
    color: PALETTE.subText,
  },

  savingDivider: {
    height: 1,
    backgroundColor: PALETTE.border,
    marginVertical: 16,
  },

  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    gap: 12,
  },

  savingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },

  savingRowLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.subText,
  },

  savingRowValue: {
    fontSize: 13,
    fontWeight: '900',
    color: PALETTE.text,
  },

  bottomSpacer: {
    height: 16,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: 'rgba(245,246,248,0.94)',
    borderTopWidth: 1,
    borderTopColor: PALETTE.border,
  },

  selectBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: PALETTE.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
