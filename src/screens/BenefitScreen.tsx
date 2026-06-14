import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Image, ActivityIndicator,
  Linking, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchBenefitSummary, recalculateBenefits } from '../api/benefit';
import type { BenefitMatch, BenefitSummary } from '../api/benefit';
 
// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────
type MatchStatus = 'APPLICABLE' | 'CONDITION_CHECK' | 'FREE' | 'NOT_ELIGIBLE';
type FilterTab = 'all' | 'applicable' | 'condition';
 
interface Condition {
  id: number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconBg: string;
  label: string;
  status: 'met' | 'required' | 'pending';
}
 
interface BenefitItem {
  id: number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconBg: string;
  title: string;
  type: string;
  monthlyAmount: number;
  status: MatchStatus;
  description?: string;
  conditionDescription?: string;
  region?: string | null;
  applyLink?: string | null;
  deadline?: string;
  targets?: string[];
  documents?: string[];
  steps?: string[];
  conditions?: Condition[];
  conditionNote?: string;
  extraInputs?: { id: number; label: string; sub: string }[];
  yearlyMax?: number;
}
 
interface BenefitScreenProps {
  userName?: string;
  childName?: string;
  childAge?: number;
  childRegion?: string;
  childId?: number;
  hasChildInfo?: boolean;
  onBack?: () => void;
  onRegisterChild?: () => void;
  onBenefitProfileInput?: () => void;
  onNotificationClick?: () => void;
  isLoading?: boolean;
  onGoRecommendation?: () => void;
  onGoNotificationSettings?: () => void;
  onGoMap?: () => void;
}
 
// ─────────────────────────────────────────────
// 매핑 유틸
// ─────────────────────────────────────────────
function getBenefitVisual(
  type?: string | null,
): { icon: React.ComponentProps<typeof Ionicons>['name']; iconBg: string } {
  switch (type) {
    case 'VOUCHER':
    case '바우처':
      return { icon: 'card-outline', iconBg: '#F2F7FF' };
    case 'EDUCATION':
    case '교육비':
      return { icon: 'school-outline', iconBg: '#F4F7FB' };
    case 'FREE_PROGRAM':
    case '무료 프로그램':
      return { icon: 'sparkles-outline', iconBg: '#F4FBF7' };
    case 'ALLOWANCE':
    case '지원금':
    default:
      return { icon: 'wallet-outline', iconBg: '#FFF7E0' };
  }
}

function formatBenefitType(type?: string | null) {
  switch (type) {
    case 'ALLOWANCE':
    case '지원금':
      return '지원금';
    case 'VOUCHER':
    case '바우처':
      return '바우처';
    case 'EDUCATION':
    case '교육비':
      return '교육비';
    case 'FREE_PROGRAM':
    case '무료 프로그램':
      return '무료 프로그램';
    default:
      return '지원금';
  }
}
 
function toBenefitItem(match: BenefitMatch): BenefitItem {
  const displayType = formatBenefitType(match.benefitType);
  const { icon, iconBg } = getBenefitVisual(displayType);

  return {
    id: match.matchId,
    icon,
    iconBg,
    title: match.benefitName,
    type: displayType,
    monthlyAmount: match.expectedMonthlySaving ?? 0,
    status: match.matchStatus as MatchStatus,
    description: match.supportDescription ?? match.conditionDescription ?? '',
    conditionDescription: match.conditionDescription ?? undefined,
    region: match.region,
    applyLink: match.applyLink,
    deadline: '상시',
    targets: match.conditionDescription ? [match.conditionDescription] : [],
    documents: [],
    steps: match.applyLink
      ? ['공식 신청 페이지에서 자격 조건 확인', '필요 서류는 공식 사이트에서 확인', '공식 사이트에서 신청 진행']
      : ['공식 사이트에서 자격 조건과 필요 서류를 확인해주세요'],
    conditions:
      match.matchStatus === 'CONDITION_CHECK'
        ? [
            {
              id: 1,
              icon: 'clipboard-outline',
              iconBg: '#F4F7FB',
              label: '공식 자격 조건 확인 필요',
              status: 'pending',
            },
          ]
        : [],
    conditionNote: match.conditionDescription ?? undefined,
  };
}
 
// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
function formatAmount(n: number | null | undefined) {
  if (n == null) return '0';
  return n.toLocaleString('ko-KR');
}
 
function statusLabel(s: MatchStatus) {
  switch (s) {
    case 'APPLICABLE':      return '신청 가능';
    case 'CONDITION_CHECK': return '조건 확인';
    case 'FREE':            return '무료';
    case 'NOT_ELIGIBLE':    return '조건 미충족';
  }
}
 
function statusStyle(s: MatchStatus) {
  switch (s) {
    case 'APPLICABLE':      return { bg: '#FFF4BF', text: '#7A5A00' };
    case 'CONDITION_CHECK': return { bg: '#FFF0E1', text: '#B45309' };
    case 'FREE':            return { bg: '#EAF8EF', text: '#15803D' };
    case 'NOT_ELIGIBLE':    return { bg: '#F2F3F5', text: '#6B7280' };
  }
}
 
function conditionIcon(s: Condition['status']) {
  switch (s) {
    case 'met':      return { name: 'checkmark-circle' as const, color: '#22C55E', label: '충족', bg: '#DCFCE7' };
    case 'required': return { name: 'alert-circle' as const,     color: '#F59E0B', label: '필요', bg: '#FEF3C7' };
    case 'pending':  return { name: 'time' as const,             color: '#3B82F6', label: '확인 필요', bg: '#DBEAFE' };
  }
}
 
// ─────────────────────────────────────────────
// 서브뷰 — 혜택 신청 상세
// ─────────────────────────────────────────────
function BenefitDetailView({
  benefit,
  onBack,
  onNotificationClick,
}: {
  benefit: BenefitItem;
  onBack: () => void;
  onNotificationClick?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0, 1, 2]));
 
  function toggleSection(idx: number) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }
 
  const sectionsBase: Array<{
    label: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    iconBg: string;
    items: string[];
    steps?: string[];
    hideWhenEmpty?: boolean;
  }> = [
    {
      label: '지원 대상',
      icon: 'people-outline',
      iconBg: '#F4FBF7',
      items: benefit.targets ?? [],
    },
    {
      label: '준비 서류',
      icon: 'document-text-outline',
      iconBg: '#F4F7FB',
      items: benefit.documents ?? [],
      hideWhenEmpty: true,
    },
    {
      label: '신청 방법',
      icon: 'pencil-outline',
      iconBg: '#F7F3FF',
      items: [],
      steps: benefit.steps ?? [],
    },
  ];

  const sections = sectionsBase.filter((sec) => {
    if (!sec.hideWhenEmpty) return true;
    return sec.items.length > 0 || (sec.steps?.length ?? 0) > 0;
  });
 
  const { bg, text } = statusStyle(benefit.status);

  async function openOfficialSite() {
    if (!benefit.applyLink) {
      Alert.alert('공식 사이트 정보가 없어요', '이 혜택은 현재 연결 가능한 공식 신청 페이지 정보가 없어요.');
      return;
    }

    const canOpen = await Linking.canOpenURL(benefit.applyLink);
    if (!canOpen) {
      Alert.alert('링크를 열 수 없어요', '공식 사이트 주소를 확인할 수 없어요.');
      return;
    }

    await Linking.openURL(benefit.applyLink);
  }
 
  return (
    <View style={[dStyles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={dStyles.header}>
        <TouchableOpacity onPress={onBack} style={dStyles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={dStyles.headerTitle}>혜택 안내</Text>
        <TouchableOpacity style={dStyles.bellBtn} onPress={onNotificationClick}>
          <Ionicons name="notifications" size={22} color="#555" />
          <View style={dStyles.notiBadge} />
        </TouchableOpacity>
      </View>
 
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={dStyles.scroll}>
        <View style={dStyles.summaryCard}>
          <View style={dStyles.summaryTop}>
            <View style={[dStyles.summaryIconBox, { backgroundColor: benefit.iconBg }]}>
              <Ionicons name={benefit.icon} size={26} color="#4B5563" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={dStyles.summaryTitle}>{benefit.title}</Text>
              <View style={[dStyles.statusBadge, { backgroundColor: bg }]}>
                <Text style={[dStyles.statusBadgeText, { color: text }]}>{statusLabel(benefit.status)}</Text>
              </View>
            </View>
          </View>
          <View style={dStyles.divider} />
          <View style={dStyles.summaryRow}>
            <Ionicons name="cash-outline" size={16} color="#FFB020" />
            <Text style={dStyles.summaryLabel}>예상 월 지원금</Text>
            <Text style={dStyles.summaryValue}>{formatAmount(benefit.monthlyAmount)}원</Text>
          </View>
          <View style={dStyles.summaryRow}>
            <Ionicons name="pricetag-outline" size={16} color="#888" />
            <Text style={dStyles.summaryLabel}>지원 유형</Text>
            <Text style={dStyles.summaryValueDark}>{benefit.type}</Text>
          </View>
          <View style={dStyles.summaryRow}>
            <Ionicons name="calendar-outline" size={16} color="#888" />
            <Text style={dStyles.summaryLabel}>신청 마감</Text>
            <Text style={dStyles.summaryValueDark}>{benefit.deadline ?? '상시'}</Text>
          </View>
          {benefit.region && (
            <View style={dStyles.summaryRow}>
              <Ionicons name="location-outline" size={16} color="#888" />
              <Text style={dStyles.summaryLabel}>제공 기관/지역</Text>
              <Text style={dStyles.summaryValueDark}>{benefit.region}</Text>
            </View>
          )}
        </View>
 
        {sections.map((sec, idx) => (
          <View key={idx} style={dStyles.accordionCard}>
            <TouchableOpacity
              style={dStyles.accordionHeader}
              onPress={() => toggleSection(idx)}
              activeOpacity={0.75}
            >
              <View style={[dStyles.accordionIconBox, { backgroundColor: sec.iconBg }]}>
                <Ionicons name={sec.icon} size={21} color="#4B5563" />
              </View>
              <Text style={dStyles.accordionTitle}>{`${idx + 1}. ${sec.label}`}</Text>
              <Ionicons
                name={openSections.has(idx) ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#B8C0C8"
              />
            </TouchableOpacity>
            {openSections.has(idx) && (
              <View style={dStyles.accordionBody}>
                {sec.steps && sec.steps.length > 0 ? (
                  <View style={dStyles.stepsRow}>
                    {sec.steps.map((step, si) => (
                      <React.Fragment key={si}>
                        <View style={dStyles.stepItem}>
                          <View style={dStyles.stepCircle}>
                            <Text style={dStyles.stepNum}>{si + 1}</Text>
                          </View>
                          <Text style={dStyles.stepLabel}>{step}</Text>
                        </View>
                        {si < sec.steps!.length - 1 && (
                          <Ionicons name="chevron-forward" size={14} color="#ccc" style={{ marginTop: 8 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </View>
                ) : (
                  sec.items.map((item, ii) => (
                    <View key={ii} style={dStyles.bulletRow}>
                      <View style={dStyles.bullet} />
                      <Text style={dStyles.bulletText}>{item}</Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        ))}
 
        <View style={dStyles.infoBanner}>
          <View style={dStyles.infoIconBox}>
            <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={dStyles.infoBannerTitle}>MoMent는 신청 전 안내만 제공해요</Text>
            <Text style={dStyles.infoBannerSub}>최종 신청 가능 여부와 정확한 금액은 공식 사이트에서 확인해주세요.</Text>
          </View>
        </View>
 
        <TouchableOpacity
          style={[dStyles.ctaBtn, !benefit.applyLink && dStyles.ctaBtnDisabled]}
          activeOpacity={0.85}
          onPress={openOfficialSite}
        >
          <Text style={dStyles.ctaBtnText}>
            {benefit.applyLink ? '공식 사이트에서 확인하기' : '공식 사이트 정보 없음'}
          </Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
 
// ─────────────────────────────────────────────
// 서브뷰 — 조건 확인
// ─────────────────────────────────────────────
function BenefitConditionView({
  benefit,
  onBack,
}: {
  benefit: BenefitItem;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const metCount = (benefit.conditions ?? []).filter((c) => c.status === 'met').length;
  const totalCount = (benefit.conditions ?? []).length;
  const remainCount = totalCount - metCount;
 
  return (
    <View style={[cStyles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={cStyles.header}>
        <TouchableOpacity onPress={onBack} style={cStyles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={cStyles.headerTitle}>조건 확인</Text>
        <View style={{ width: 40 }} />
      </View>
 
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={cStyles.scroll}>
        <View style={cStyles.summaryCard}>
          <View style={cStyles.summaryTop}>
            <View style={[cStyles.summaryIconBox, { backgroundColor: benefit.iconBg }]}>
              <Ionicons name={benefit.icon} size={24} color="#4B5563" />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={cStyles.summaryTitle}>{benefit.title}</Text>
              <View style={cStyles.statusBadge}>
                <Text style={cStyles.statusBadgeText}>조건 확인</Text>
              </View>
            </View>
          </View>
          <View style={cStyles.divider} />
          <View style={cStyles.summaryInfoRow}>
            <Ionicons name="cash-outline" size={16} color="#3B82F6" />
            <Text style={cStyles.summaryInfoLabel}>예상 월 지원금</Text>
            <Text style={cStyles.summaryInfoValue}>{formatAmount(benefit.monthlyAmount)}원</Text>
          </View>
          <View style={cStyles.summaryInfoRow}>
            <Ionicons name="pricetag-outline" size={16} color="#8E8E93" />
            <Text style={cStyles.summaryInfoLabel}>지원 유형</Text>
            <Text style={cStyles.summaryInfoValueDark}>{benefit.type}</Text>
          </View>
          {benefit.region && (
            <View style={cStyles.summaryInfoRow}>
              <Ionicons name="location-outline" size={16} color="#8E8E93" />
              <Text style={cStyles.summaryInfoLabel}>제공 기관/지역</Text>
              <Text style={cStyles.summaryInfoValueDark}>{benefit.region}</Text>
            </View>
          )}
        </View>
 
        <Text style={cStyles.sectionTitle}>신청 자격 조건 확인</Text>
        <View style={cStyles.conditionCard}>
          {(benefit.conditions ?? []).map((cond, idx) => {
            const ci = conditionIcon(cond.status);
            return (
              <TouchableOpacity
                key={cond.id}
                style={[
                  cStyles.conditionRow,
                  idx !== (benefit.conditions!.length - 1) && cStyles.conditionBorder,
                ]}
                activeOpacity={0.75}
              >
                <View style={[cStyles.conditionIconBox, { backgroundColor: cond.iconBg }]}>
                  <Ionicons name={cond.icon} size={20} color="#4B5563" />
                </View>
                <Text style={cStyles.conditionLabel}>{cond.label}</Text>
                <View style={[cStyles.conditionBadge, { backgroundColor: ci.bg }]}>
                  <Ionicons name={ci.name} size={12} color={ci.color} />
                  <Text style={[cStyles.conditionBadgeText, { color: ci.color }]}>{ci.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#B8C0C8" />
              </TouchableOpacity>
            );
          })}
        </View>
 
        {benefit.conditionNote && (
          <View style={cStyles.conditionNoteCard}>
            <Text style={cStyles.conditionNoteTitle}>공식 조건 안내</Text>
            <Text style={cStyles.conditionNoteText}>{benefit.conditionNote}</Text>
          </View>
        )}

        {remainCount > 0 && (
          <View style={cStyles.noteBanner}>
            <Image
              source={require('../../assets/character2.png')}
              style={cStyles.noteCharacter}
              resizeMode="contain"
            />
            <Text style={cStyles.noteText}>
              <Text style={cStyles.noteHighlight}>{remainCount}개 조건</Text>만 더 확인하면{'\n'}신청할 수 있어요.
            </Text>
          </View>
        )}
 
        {(benefit.extraInputs ?? []).length > 0 && (
          <>
            <Text style={[cStyles.sectionTitle, { marginTop: 24 }]}>추가로 입력하면 좋은 정보</Text>
            <View style={cStyles.conditionCard}>
              {(benefit.extraInputs ?? []).map((ei, idx) => (
                <View
                  key={ei.id}
                  style={[
                    cStyles.extraRow,
                    idx !== (benefit.extraInputs!.length - 1) && cStyles.conditionBorder,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={cStyles.extraLabel}>{ei.label}</Text>
                    <Text style={cStyles.extraSub}>{ei.sub}</Text>
                  </View>
                  <TouchableOpacity style={cStyles.inputBtn}>
                    <Text style={cStyles.inputBtnText}>입력하기</Text>
                  </TouchableOpacity>
                  <Ionicons name="chevron-forward" size={18} color="#B8C0C8" />
                </View>
              ))}
            </View>
          </>
        )}
 
        <TouchableOpacity style={cStyles.ctaBtn} activeOpacity={0.85}>
          <Text style={cStyles.ctaBtnText}>조건 입력하기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={cStyles.secondaryBtn} activeOpacity={0.85}>
          <Text style={cStyles.secondaryBtnText}>관련 제도 보기</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
 
// ─────────────────────────────────────────────
// 메인 컴포넌트 — BenefitScreen
// ─────────────────────────────────────────────
export default function BenefitScreen({
  userName = '부모님',
  childName = '서준',
  childAge = 5,
  childRegion = '서울 강동구',
  childId,
  hasChildInfo = true,
  onBack,
  onRegisterChild,
  onBenefitProfileInput,
  onNotificationClick,
}: BenefitScreenProps) {
  const insets = useSafeAreaInsets();
 
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [detailBenefit, setDetailBenefit] = useState<BenefitItem | null>(null);
  const [conditionBenefit, setConditionBenefit] = useState<BenefitItem | null>(null);
  const [benefits, setBenefits] = useState<BenefitItem[]>([]);
  const [summary, setSummary] = useState<BenefitSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  const loadBenefits = useCallback(async () => {
    if (!childId) {
      setSummary(null);
      setBenefits([]);
      setError('자녀 정보를 찾을 수 없어요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await recalculateBenefits(childId);
      const nextSummary = await fetchBenefitSummary(childId);

      setSummary(nextSummary);
      setBenefits((nextSummary.benefits ?? []).map(toBenefitItem));
    } catch (e) {
      console.error('혜택 로딩 실패', e);
      setSummary(null);
      setBenefits([]);
      setError('혜택 정보를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, [childId]);
 
  useEffect(() => {
    if (!hasChildInfo) return;
    loadBenefits();
  }, [hasChildInfo, loadBenefits]);
 
  async function handleRecalculate() {
    if (!childId) {
      setError('자녀 정보를 찾을 수 없어요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await recalculateBenefits(childId);
      const nextSummary = await fetchBenefitSummary(childId);

      setSummary(nextSummary);
      setBenefits((nextSummary.benefits ?? []).map(toBenefitItem));
    } catch (e) {
      console.error('재계산 실패', e);
      setError('혜택을 다시 계산하지 못했어요.');
    } finally {
      setLoading(false);
    }
  }
 
  if (detailBenefit) {
    return (
      <BenefitDetailView
        benefit={detailBenefit}
        onBack={() => setDetailBenefit(null)}
        onNotificationClick={onNotificationClick}
      />
    );
  }
  if (conditionBenefit) {
    return (
      <BenefitConditionView
        benefit={conditionBenefit}
        onBack={() => setConditionBenefit(null)}
      />
    );
  }
 
  function handleBenefitPress(b: BenefitItem) {
    setConditionBenefit(null);
    setDetailBenefit(b);
  }
 
  const filteredBenefits = benefits.filter((b) => {
    if (activeTab === 'applicable') return b.status === 'APPLICABLE' || b.status === 'FREE';
    if (activeTab === 'condition') return b.status === 'CONDITION_CHECK';
    return true;
  });
 
  const confirmedMonthly = benefits
    .filter((b) => b.status === 'APPLICABLE')
    .reduce((sum, b) => sum + (b.monthlyAmount ?? 0), 0);

  const potentialMonthly = benefits
    .filter((b) => b.status === 'CONDITION_CHECK')
    .reduce((sum, b) => sum + (b.monthlyAmount ?? 0), 0);

  const applicableCount = summary?.applicableCount ?? 0;
  const conditionCheckCount = summary?.conditionCheckCount ?? 0;
 
  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'applicable', label: '신청 가능' },
    { key: 'condition', label: '조건 확인' },
  ];
 
  return (
    <View style={[bStyles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
 
      <View style={bStyles.header}>
        <TouchableOpacity onPress={onBack} style={bStyles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#222" />
        </TouchableOpacity>
        <View style={bStyles.headerCenter}>
          <Text style={bStyles.headerTitle}>지원금 확인</Text>
          <Text style={bStyles.headerSub}>우리 아이 조건에 맞는 혜택을 확인해보세요</Text>
        </View>
        <TouchableOpacity style={bStyles.bellBtn} onPress={onNotificationClick}>
          <Ionicons name="notifications" size={22} color="#555" />
          <View style={bStyles.notiBadge} />
        </TouchableOpacity>
      </View>
 
      {loading ? (
        <View style={bStyles.loadingBox}>
          <ActivityIndicator size="large" color="#FFD93D" />
          <Text style={bStyles.loadingText}>혜택을 불러오는 중...</Text>
        </View>
      ) : !hasChildInfo ? (
        <View style={bStyles.emptyBox}>
          <Text style={{ fontSize: 48 }}>🤖</Text>
          <Text style={bStyles.emptyTitle}>아이 정보를 먼저 등록해주세요</Text>
          <Text style={bStyles.emptySub}>아이 정보 등록 후 맞춤 지원 혜택을 확인할 수 있어요</Text>
          <TouchableOpacity style={bStyles.emptyBtn} onPress={onBenefitProfileInput}>
            <Text style={bStyles.emptyBtnText}>아이 정보 등록하기</Text>
          </TouchableOpacity>
        </View>
      ) : error ? (
        <View style={bStyles.emptyBox}>
          <View style={bStyles.emptyIconBox}>
            <Ionicons name="alert-circle-outline" size={30} color="#6B7280" />
          </View>
          <Text style={bStyles.emptyTitle}>{error}</Text>
          <TouchableOpacity style={bStyles.emptyBtn} onPress={loadBenefits}>
            <Text style={bStyles.emptyBtnText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : summary && !summary.profileCompleted ? (
        <View style={bStyles.emptyBox}>
          <Ionicons name="document-text-outline" size={52} color="#D97706" />
          <Text style={bStyles.emptyTitle}>지원금 진단 정보가 필요해요</Text>
          <Text style={bStyles.emptySub}>
            거주 지역, 가구 조건, 소득 구간을 입력하면 맞춤 지원 혜택을 확인할 수 있어요.
          </Text>
          {summary.summaryMessage && (
            <Text style={[bStyles.emptySub, { marginTop: 10 }]}>
              {summary.summaryMessage}
            </Text>
          )}
          <TouchableOpacity style={bStyles.emptyBtn} onPress={onBenefitProfileInput}>
            <Text style={bStyles.emptyBtnText}>지원금 진단 입력하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={bStyles.scroll}>
 
          <View style={bStyles.summaryCard}>
            <View style={bStyles.summaryHeaderRow}>
              <View style={bStyles.summaryIconBox}>
                <Ionicons name="wallet-outline" size={22} color="#111827" />
              </View>
              <View style={bStyles.summaryTextArea}>
                <Text style={bStyles.summaryAmountLabel}>확정 예상 지원금</Text>
                <Text style={bStyles.summaryAmount}>
                  월 <Text style={bStyles.summaryAmountHighlight}>{formatAmount(confirmedMonthly)}</Text>원
                </Text>
              </View>
            </View>

            <View style={bStyles.summaryStatsRow}>
              <View style={bStyles.summaryStatItem}>
                <Text style={bStyles.summaryStatValue}>{applicableCount}</Text>
                <Text style={bStyles.summaryStatLabel}>신청 가능</Text>
              </View>
              <View style={bStyles.summaryStatDivider} />
              <View style={bStyles.summaryStatItem}>
                <Text style={bStyles.summaryStatValue}>{conditionCheckCount}</Text>
                <Text style={bStyles.summaryStatLabel}>조건 확인</Text>
              </View>
            </View>

            {potentialMonthly > 0 && (
              <View style={bStyles.summaryPotentialBox}>
                <Ionicons name="information-circle-outline" size={14} color="#8E8E93" />
                <Text style={bStyles.summaryPotentialText}>
                  조건 확인 시 월 {formatAmount(potentialMonthly)}원까지 추가 가능해요.
                </Text>
              </View>
            )}
          </View>
          <View style={bStyles.summaryMeta}>
            <Ionicons name="person-outline" size={13} color="#aaa" />
            <Text style={bStyles.summaryMetaText}>
              {summary?.childName ?? childName ?? '아이'} · {childAge ?? '-'}세 · {childRegion} 기준
            </Text>
          </View>

          {(summary?.summaryMessage || summary?.officialCheckMessage) && (
            <View style={bStyles.combinedNoticeCard}>
              {summary?.summaryMessage && (
                <View style={bStyles.combinedNoticeSection}>
                  <View style={bStyles.combinedNoticeIconBox}>
                    <Ionicons name="sparkles-outline" size={15} color="#8A5A00" />
                  </View>
                  <Text style={bStyles.combinedNoticeTitle}>
                    {summary.summaryMessage}
                  </Text>
                </View>
              )}

              {summary?.summaryMessage && summary?.officialCheckMessage && (
                <View style={bStyles.combinedNoticeDivider} />
              )}

              {summary?.officialCheckMessage && (
                <View style={bStyles.combinedNoticeSection}>
                  <View style={bStyles.combinedNoticeIconBox}>
                    <Ionicons name="information-circle-outline" size={15} color="#8A5A00" />
                  </View>
                  <Text style={bStyles.combinedNoticeBody}>
                    {summary.officialCheckMessage}
                  </Text>
                </View>
              )}
            </View>
          )}
 
          <View style={bStyles.tabRow}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[bStyles.tabBtn, activeTab === tab.key && bStyles.tabBtnActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.75}
              >
                <Text style={[bStyles.tabBtnText, activeTab === tab.key && bStyles.tabBtnTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
 
          <Text style={bStyles.sectionTitle}>맞춤 지원 혜택</Text>
          <View style={bStyles.benefitListCard}>
            {filteredBenefits.map((b, idx) => {
              const { bg, text } = statusStyle(b.status);
              return (
                <TouchableOpacity
                  key={b.id}
                  style={[
                    bStyles.benefitRow,
                    idx !== filteredBenefits.length - 1 && bStyles.benefitBorder,
                  ]}
                  onPress={() => handleBenefitPress(b)}
                  activeOpacity={0.75}
                >
                  <View style={[bStyles.benefitIconBox, { backgroundColor: b.iconBg }]}>
                    <Ionicons name={b.icon} size={21} color="#4B5563" />
                  </View>
                  <View style={bStyles.benefitTextWrap}>
                    <Text style={bStyles.benefitTitle}>{b.title}</Text>
                    <View style={bStyles.benefitMetaRow}>
                      <View style={bStyles.typeTag}>
                        <Text style={bStyles.typeTagText}>{b.type}</Text>
                      </View>
                      <Text style={bStyles.benefitAmount}>
                        월 {formatAmount(b.monthlyAmount)}원
                      </Text>
                    </View>
                  </View>
                  <View style={[bStyles.statusBadge, { backgroundColor: bg }]}>
                    <Text style={[bStyles.statusBadgeText, { color: text }]}>
                      {statusLabel(b.status)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#B8C0C8" />
                </TouchableOpacity>
              );
            })}
            {filteredBenefits.length === 0 && (
              <View style={bStyles.emptyFilter}>
                <Text style={bStyles.emptyFilterText}>해당 조건의 혜택이 없어요</Text>
              </View>
            )}
          </View>
 
          <View style={bStyles.recalcCard}>
            <View style={bStyles.recalcIconBox}>
              <Ionicons name="options-outline" size={20} color="#4B5563" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={bStyles.recalcTitle}>진단 정보가 바뀌었나요?</Text>
              <Text style={bStyles.recalcSub}>거주 지역, 소득 구간, 가구 조건을 수정하면 혜택을 다시 확인할 수 있어요.</Text>
            </View>
            <TouchableOpacity style={bStyles.recalcBtn} onPress={onBenefitProfileInput}>
              <Text style={bStyles.recalcBtnText}>수정</Text>
            </TouchableOpacity>
          </View>
 
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}
 
// ─────────────────────────────────────────────
// 공통 그림자
// ─────────────────────────────────────────────
const SHADOW = {
  shadowColor: '#000' as const,
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
};
 
// ─────────────────────────────────────────────
// BenefitScreen 스타일
// ─────────────────────────────────────────────
const bStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 34 },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F3F5',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#111827', letterSpacing: -0.35 },
  headerSub: { fontSize: 12, color: '#8E8E93', marginTop: 2, fontWeight: '600' },
  bellBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notiBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#f87171',
    borderWidth: 2,
    borderColor: '#fff',
  },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 13, color: '#8E8E93', fontWeight: '600' },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 32 },
  emptyIconBox: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#F5F6F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#111827', textAlign: 'center' },
  emptySub: { fontSize: 12.5, color: '#8E8E93', textAlign: 'center', lineHeight: 20, fontWeight: '600' },
  emptyBtn: {
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },

  summaryCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E8EAEE',
    padding: 18,
    backgroundColor: '#fff',
    ...SHADOW,
  },
  summaryHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF6D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextArea: { flex: 1 },
  summaryAmountLabel: { fontSize: 12, color: '#8E8E93', fontWeight: '700' },
  summaryAmount: { fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 3 },
  summaryAmountHighlight: { fontSize: 26, fontWeight: '900', color: '#111827' },
  summaryStatsRow: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryStatItem: { flex: 1, alignItems: 'center' },
  summaryStatValue: { fontSize: 20, fontWeight: '900', color: '#111827' },
  summaryStatLabel: { marginTop: 3, fontSize: 12, fontWeight: '700', color: '#8E8E93' },
  summaryStatDivider: { width: 1, height: 34, backgroundColor: '#EEF0F3' },
  summaryPotentialBox: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#EEF0F3',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryPotentialText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    lineHeight: 18,
  },
  summaryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    marginBottom: 16,
    paddingLeft: 2,
  },
  summaryMetaText: { fontSize: 12, color: '#8E8E93', fontWeight: '600' },

  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF9E8',
    borderRadius: 18,
    padding: 14,
    marginTop: 2,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F7E7B5',
  },
  noticeText: { flex: 1, fontSize: 12, color: '#8A5A00', lineHeight: 18, fontWeight: '700' },
  officialCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#F4E7BA',
  },
  officialText: { flex: 1, fontSize: 11.5, color: '#7C5A10', lineHeight: 18, fontWeight: '600' },

  combinedNoticeCard: {
    backgroundColor: '#FFFBEF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 2,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#F2E6B8',
  },
  combinedNoticeSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  combinedNoticeIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF4CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  combinedNoticeTitle: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 19,
    color: '#7A4E00',
    fontWeight: '800',
  },
  combinedNoticeBody: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 18,
    color: '#7C5A10',
    fontWeight: '600',
  },
  combinedNoticeDivider: {
    height: 1,
    backgroundColor: '#EAD9A8',
    marginVertical: 13,
    marginLeft: 31,
  },
  tabRow: { flexDirection: 'row', gap: 10, marginTop: 2, marginBottom: 24 },
  tabBtn: { borderRadius: 18, paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#F4F5F7' },
  tabBtnActive: { backgroundColor: '#111827' },
  tabBtnText: { fontSize: 13, fontWeight: '700', color: '#8E8E93' },
  tabBtnTextActive: { color: '#FFFFFF' },

  sectionTitle: { fontSize: 17, fontWeight: '900', color: '#111827', marginBottom: 14 },
  benefitListCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF0F3',
    marginBottom: 6,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 17,
    paddingHorizontal: 15,
    gap: 12,
  },
  benefitBorder: { borderBottomWidth: 1, borderBottomColor: '#F2F3F5' },
  benefitIconBox: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  benefitTextWrap: { flex: 1 },
  benefitTitle: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 5, letterSpacing: -0.2 },
  benefitMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeTag: { backgroundColor: '#F4F5F7', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  typeTagText: { fontSize: 10.5, color: '#8E8E93', fontWeight: '700' },
  benefitAmount: { fontSize: 11.5, color: '#B0B4BB', fontWeight: '600' },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statusBadgeText: { fontSize: 11, fontWeight: '900' },
  emptyFilter: { padding: 20, alignItems: 'center' },
  emptyFilterText: { fontSize: 13, color: '#8E8E93', fontWeight: '700' },

  recalcCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFBEF',
    borderRadius: 22,
    padding: 16,
    marginTop: 28,
    borderWidth: 1,
    borderColor: '#F2E6B8',
  },
  recalcIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF7D6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F2D67A',
  },
  recalcTitle: { fontSize: 14, fontWeight: '900', color: '#111827', lineHeight: 19 },
  recalcSub: { fontSize: 11.5, color: '#8A8A8E', marginTop: 6, lineHeight: 17, fontWeight: '600' },
  recalcBtn: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#111827',
    alignSelf: 'center',
  },
  recalcBtnText: { fontSize: 11.5, fontWeight: '900', color: '#FFFFFF' },
});
 
// ─────────────────────────────────────────────
// BenefitDetailView 스타일
// ─────────────────────────────────────────────
const dStyles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#fff' },
  scroll:          { paddingHorizontal: 16, paddingTop: 8 },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  backBtn:         { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle:     { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  bellBtn:         { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notiBadge:       { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: '#f87171', borderWidth: 2, borderColor: '#fff' },
  summaryCard:     { borderRadius: 24, borderWidth: 1, borderColor: '#E8EAEE', padding: 18, marginBottom: 16, backgroundColor: '#fff', ...SHADOW },
  summaryTop:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  summaryIconBox:  { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  summaryIcon:     { fontSize: 30 },
  summaryTitle:    { fontSize: 17, fontWeight: '900', color: '#111827', marginBottom: 7, letterSpacing: -0.2 },
  statusBadge:     { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  statusBadgeText: { fontSize: 11.5, fontWeight: '800' },
  divider:         { height: 1, backgroundColor: '#F0F1F3', marginBottom: 14 },
  summaryRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  summaryLabel:    { flex: 1, fontSize: 13, color: '#8E8E93', fontWeight: '600' },
  summaryValue:    { fontSize: 16, fontWeight: '900', color: '#111827' },
  summaryValueDark: { fontSize: 13.5, fontWeight: '800', color: '#111827', flexShrink: 1, textAlign: 'right' },
  accordionCard:   { backgroundColor: '#fff', borderRadius: 22, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#EEF0F3' },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 15, paddingVertical: 16 },
  accordionIconBox: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  accordionIcon:   { fontSize: 22 },
  accordionTitle:  { flex: 1, fontSize: 14.5, fontWeight: '900', color: '#111827' },
  accordionBody:   { paddingHorizontal: 16, paddingBottom: 16 },
  bulletRow:       { flexDirection: 'row', gap: 8, marginBottom: 6, alignItems: 'flex-start' },
  bullet:          { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD93D', marginTop: 6 },
  bulletText:      { flex: 1, fontSize: 13, color: '#5F6672', lineHeight: 21, fontWeight: '500' },
  stepsRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: 4, justifyContent: 'center' },
  stepItem:        { alignItems: 'center', gap: 6, flex: 1 },
  stepCircle:      { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3EEFF', alignItems: 'center', justifyContent: 'center' },
  stepNum:         { fontSize: 14, fontWeight: '700', color: '#8B5CF6' },
  stepLabel:       { fontSize: 11, color: '#555', textAlign: 'center' },
  infoBanner:      { flexDirection: 'row', alignItems: 'flex-start', gap: 11, backgroundColor: '#F8F9FB', borderRadius: 20, padding: 15, marginTop: 8, marginBottom: 14, borderWidth: 1, borderColor: '#EEF0F3' },
  infoIconBox:     { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#EEF0F3' },
  infoBannerTitle: { fontSize: 14, fontWeight: '900', color: '#111827' },
  infoBannerSub:   { fontSize: 12, color: '#6B7280', marginTop: 5, lineHeight: 18, fontWeight: '600' },
  ctaBtn:          { backgroundColor: '#111827', borderRadius: 18, padding: 16, alignItems: 'center', marginBottom: 10 },
  ctaBtnText:      { fontSize: 15, fontWeight: '900', color: '#fff' },
  ctaBtnDisabled:  { backgroundColor: '#C7CBD1' },
  secondaryBtn:    { borderRadius: 16, borderWidth: 1.5, borderColor: '#FFA500', padding: 15, alignItems: 'center' },
  secondaryBtnText: { fontSize: 15, fontWeight: '700', color: '#FFA500' },
});
 
// ─────────────────────────────────────────────
// BenefitConditionView 스타일
// ─────────────────────────────────────────────
const cStyles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#fff' },
  scroll:          { paddingHorizontal: 16, paddingTop: 8 },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  backBtn:         { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle:     { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  summaryCard:     { borderRadius: 18, borderWidth: 1.5, borderColor: '#93C5FD', padding: 16, marginBottom: 24, backgroundColor: '#fff', ...SHADOW },
  summaryTop:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  summaryIconBox:  { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  summaryIcon:     { fontSize: 28 },
  summaryTitle:    { fontSize: 16, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  summaryDesc:     { fontSize: 11.5, color: '#999', lineHeight: 17, marginTop: 4 },
  statusBadge:     { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#DBEAFE' },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: '#3B82F6' },
  divider:         { height: 1, backgroundColor: '#F0F1F3', marginBottom: 14 },
  summaryInfoRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 9 },
  summaryInfoLabel: { flex: 1, fontSize: 13, color: '#8E8E93', fontWeight: '600' },
  summaryInfoValue: { fontSize: 15, fontWeight: '900', color: '#3B82F6' },
  summaryInfoValueDark: { fontSize: 13.5, fontWeight: '800', color: '#111827', flexShrink: 1, textAlign: 'right' },
  amountRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amountLabel:     { fontSize: 11.5, color: '#888', marginBottom: 2 },
  amountValue:     { fontSize: 22, fontWeight: '900', color: '#3B82F6' },
  yearlyBox:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  yearlyIconWrap:  { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  yearlyLabel:     { fontSize: 11, color: '#888' },
  yearlyValue:     { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  sectionTitle:    { fontSize: 16, fontWeight: '800', color: '#1a1a1a', marginBottom: 12 },
  conditionCard:   { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', marginBottom: 4, ...SHADOW },
  conditionRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, gap: 10 },
  conditionBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F1F3' },
  conditionIconBox: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  conditionIcon:   { fontSize: 22 },
  conditionLabel:  { flex: 1, fontSize: 13.5, fontWeight: '600', color: '#1a1a1a' },
  conditionBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 },
  conditionBadgeText: { fontSize: 11, fontWeight: '700' },
  conditionNoteCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  conditionNoteTitle: { fontSize: 13.5, fontWeight: '800', color: '#1a1a1a', marginBottom: 6 },
  conditionNoteText: { fontSize: 12, color: '#555', lineHeight: 19 },
  noteBanner:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#EFF6FF', borderRadius: 16, padding: 14, marginTop: 14 },
  noteCharacter:   { width: 44, height: 44 },
  noteText:        { fontSize: 14, color: '#1a1a1a', lineHeight: 21 },
  noteHighlight:   { color: '#3B82F6', fontWeight: '800' },
  extraRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, gap: 10 },
  extraLabel:      { fontSize: 13.5, fontWeight: '700', color: '#1a1a1a' },
  extraSub:        { fontSize: 11.5, color: '#aaa', marginTop: 2 },
  inputBtn:        { borderRadius: 20, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 12, paddingVertical: 6 },
  inputBtnText:    { fontSize: 12, fontWeight: '600', color: '#555' },
  ctaBtn:          { backgroundColor: '#3B82F6', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 20, marginBottom: 10 },
  ctaBtnText:      { fontSize: 15, fontWeight: '800', color: '#fff' },
  secondaryBtn:    { borderRadius: 16, borderWidth: 1.5, borderColor: '#ddd', padding: 15, alignItems: 'center' },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: '#555' },
});