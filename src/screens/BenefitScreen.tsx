import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Image, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchBenefitMatches, recalculateBenefits } from '../api/benefit';
import type { BenefitMatch } from '../api/benefit';
import { fetchChildren } from '../api/child';
 
// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────
type MatchStatus = 'APPLICABLE' | 'CONDITION_CHECK' | 'FREE' | 'NOT_ELIGIBLE';
type FilterTab = 'all' | 'applicable' | 'condition';
 
interface Condition {
  id: number;
  icon: string;
  iconBg: string;
  label: string;
  status: 'met' | 'required' | 'pending';
}
 
interface BenefitItem {
  id: number;
  icon: string;
  iconBg: string;
  title: string;
  type: string;
  monthlyAmount: number;
  status: MatchStatus;
  description?: string;
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
  onNotificationClick?: () => void;
  isLoading?: boolean;
  onGoRecommendation?: () => void;
  onGoNotificationSettings?: () => void;
  onGoMap?: () => void;
}
 
// ─────────────────────────────────────────────
// 매핑 유틸
// ─────────────────────────────────────────────
function getBenefitVisual(type: string): { icon: string; iconBg: string } {
  switch (type) {
    case '바우처':        return { icon: '🏠', iconBg: '#EAFBF3' };
    case '교육비':        return { icon: '📚', iconBg: '#EBF4FF' };
    case '무료 프로그램': return { icon: '🎨', iconBg: '#F0FFF4' };
    case '지원금':
    default:              return { icon: '👵🏻', iconBg: '#FFF1E8' };
  }
}
 
function toBenefitItem(match: BenefitMatch): BenefitItem {
  const { icon, iconBg } = getBenefitVisual(match.benefitType);
  return {
    id: match.matchId,
    icon,
    iconBg,
    title: match.benefitName,
    type: match.benefitType,
    monthlyAmount: match.expectedMonthlySaving,
    status: match.matchStatus as MatchStatus,
    description: match.supportDescription,
    deadline: '상시',
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
    case 'APPLICABLE':      return { bg: '#FFD93D', text: '#191919' };
    case 'CONDITION_CHECK': return { bg: '#FF8C00', text: '#fff' };
    case 'FREE':            return { bg: '#22C55E', text: '#fff' };
    case 'NOT_ELIGIBLE':    return { bg: '#E5E7EB', text: '#6B7280' };
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
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0, 2]));
 
  function toggleSection(idx: number) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }
 
  const sections = [
    {
      label: '지원 대상',
      icon: '👥',
      iconBg: '#EAFBF3',
      items: benefit.targets ?? [],
    },
    {
      label: '준비 서류',
      icon: '📄',
      iconBg: '#EBF4FF',
      items: benefit.documents ?? [],
    },
    {
      label: '신청 방법',
      icon: '✏️',
      iconBg: '#F3EEFF',
      items: [],
      steps: benefit.steps ?? [],
    },
  ];
 
  const { bg, text } = statusStyle(benefit.status);
 
  return (
    <View style={[dStyles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={dStyles.header}>
        <TouchableOpacity onPress={onBack} style={dStyles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={dStyles.headerTitle}>혜택 신청</Text>
        <TouchableOpacity style={dStyles.bellBtn} onPress={onNotificationClick}>
          <Ionicons name="notifications" size={22} color="#555" />
          <View style={dStyles.notiBadge} />
        </TouchableOpacity>
      </View>
 
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={dStyles.scroll}>
        <View style={dStyles.summaryCard}>
          <View style={dStyles.summaryTop}>
            <View style={[dStyles.summaryIconBox, { backgroundColor: benefit.iconBg }]}>
              <Text style={dStyles.summaryIcon}>{benefit.icon}</Text>
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
            <Text style={dStyles.summaryLabel}>예상 월 절감액</Text>
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
        </View>
 
        {sections.map((sec, idx) => (
          <View key={idx} style={dStyles.accordionCard}>
            <TouchableOpacity
              style={dStyles.accordionHeader}
              onPress={() => toggleSection(idx)}
              activeOpacity={0.75}
            >
              <View style={[dStyles.accordionIconBox, { backgroundColor: sec.iconBg }]}>
                <Text style={dStyles.accordionIcon}>{sec.icon}</Text>
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
          <Text style={dStyles.infoBannerEmoji}>💡</Text>
          <View>
            <Text style={dStyles.infoBannerTitle}>조건이 맞으면 온라인 신청이 가능해요</Text>
            <Text style={dStyles.infoBannerSub}>제출 서류는 스캔 또는 사진으로 업로드하면 돼요.</Text>
          </View>
        </View>
 
        <TouchableOpacity style={dStyles.ctaBtn} activeOpacity={0.85}>
          <Text style={dStyles.ctaBtnText}>신청하러 가기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={dStyles.secondaryBtn} activeOpacity={0.85}>
          <Text style={dStyles.secondaryBtnText}>나중에 보기</Text>
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
              <Text style={cStyles.summaryIcon}>{benefit.icon}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={cStyles.summaryTitle}>{benefit.title}</Text>
              <View style={cStyles.statusBadge}>
                <Text style={cStyles.statusBadgeText}>조건 확인</Text>
              </View>
              {benefit.description && (
                <Text style={cStyles.summaryDesc}>{benefit.description}</Text>
              )}
            </View>
          </View>
          <View style={cStyles.divider} />
          <View style={cStyles.amountRow}>
            <View>
              <Text style={cStyles.amountLabel}>예상 월 절감액</Text>
              <Text style={cStyles.amountValue}>{formatAmount(benefit.monthlyAmount)}원</Text>
            </View>
            {benefit.yearlyMax && (
              <View style={cStyles.yearlyBox}>
                <View style={cStyles.yearlyIconWrap}>
                  <Ionicons name="wallet" size={18} color="#3B82F6" />
                </View>
                <View>
                  <Text style={cStyles.yearlyLabel}>연 최대</Text>
                  <Text style={cStyles.yearlyValue}>{formatAmount(benefit.yearlyMax)}원</Text>
                </View>
              </View>
            )}
          </View>
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
                  <Text style={cStyles.conditionIcon}>{cond.icon}</Text>
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
  onNotificationClick,
  onGoNotificationSettings,
  onGoMap,
}: BenefitScreenProps) {
  const insets = useSafeAreaInsets();
 
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [detailBenefit, setDetailBenefit] = useState<BenefitItem | null>(null);
  const [conditionBenefit, setConditionBenefit] = useState<BenefitItem | null>(null);
  const [benefits, setBenefits] = useState<BenefitItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  const loadBenefits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
 
      const children = await fetchChildren();
      console.log('BenefitScreen fetchChildren:', JSON.stringify(children));
      if (children.length === 0) {
        setError('자녀 정보를 찾을 수 없어요.');
        return;
      }
 
      const realChildId = children[0].childId;
      const matches = await fetchBenefitMatches(realChildId);
      if (matches.length === 0) {
        await recalculateBenefits(realChildId);
        const retried = await fetchBenefitMatches(realChildId);
        setBenefits(retried.map(toBenefitItem));
      } else {
        setBenefits(matches.map(toBenefitItem));
      }
    } catch (e) {
      console.error('혜택 로딩 실패', e);
      setError('혜택 정보를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    if (!hasChildInfo) return;
    loadBenefits();
  }, [hasChildInfo]);
 
  async function handleRecalculate() {
    try {
      setLoading(true);
      const children = await fetchChildren();
      if (children.length === 0) return;
      const realChildId = children[0].childId;
      await recalculateBenefits(realChildId);
      const matches = await fetchBenefitMatches(realChildId);
      setBenefits(matches.map(toBenefitItem));
    } catch (e) {
      console.error('재계산 실패', e);
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
    if (b.status === 'CONDITION_CHECK') {
      setConditionBenefit(b);
    } else {
      setDetailBenefit(b);
    }
  }
 
  const filteredBenefits = benefits.filter((b) => {
    if (activeTab === 'applicable') return b.status === 'APPLICABLE' || b.status === 'FREE';
    if (activeTab === 'condition') return b.status === 'CONDITION_CHECK';
    return true;
  });
 
  const totalMonthly = benefits.reduce((acc, b) => acc + b.monthlyAmount, 0);
  const applicableCount = benefits.filter(
    (b) => b.status === 'APPLICABLE' || b.status === 'FREE',
  ).length;
 
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
          <TouchableOpacity style={bStyles.emptyBtn} onPress={onRegisterChild}>
            <Text style={bStyles.emptyBtnText}>아이 정보 등록하기</Text>
          </TouchableOpacity>
        </View>
      ) : error ? (
        <View style={bStyles.emptyBox}>
          <Text style={{ fontSize: 48 }}>😢</Text>
          <Text style={bStyles.emptyTitle}>{error}</Text>
          <TouchableOpacity style={bStyles.emptyBtn} onPress={loadBenefits}>
            <Text style={bStyles.emptyBtnText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={bStyles.scroll}>
 
          <View style={bStyles.summaryCard}>
            <View style={bStyles.summaryLeft}>
              <Image
                source={require('../../assets/moment-splash.png')}
                style={bStyles.childAvatar}
                resizeMode="cover"
              />
              <View>
                <Text style={bStyles.summaryAmountLabel}>예상 월 절감액</Text>
                <Text style={bStyles.summaryAmount}>
                  월{' '}
                  <Text style={bStyles.summaryAmountHighlight}>
                    {formatAmount(totalMonthly)}
                  </Text>
                  원
                </Text>
                <Text style={bStyles.summaryApplicable}>
                  신청 가능한 혜택{' '}
                  <Text style={bStyles.summaryApplicableHighlight}>{applicableCount}개</Text>
                </Text>
              </View>
            </View>
            <View style={bStyles.summaryDivider} />
            <View style={bStyles.summaryRight}>
              <Text style={bStyles.summaryPiggy}>🐷</Text>
            </View>
          </View>
          <View style={bStyles.summaryMeta}>
            <Ionicons name="person-outline" size={13} color="#aaa" />
            <Text style={bStyles.summaryMetaText}>
              {childName} · {childAge}세 · {childRegion} 기준
            </Text>
          </View>
 
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
 
          <Text style={bStyles.sectionTitle}>받을 수 있는 지원 혜택</Text>
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
                    <Text style={bStyles.benefitIcon}>{b.icon}</Text>
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
 
          <Text style={[bStyles.sectionTitle, { marginTop: 28 }]}>혜택 활용 팁</Text>
          <TouchableOpacity style={bStyles.tipCard} onPress={onGoMap} activeOpacity={0.85}>
            <Text style={bStyles.tipEmoji}>🎁</Text>
            <View style={{ flex: 1 }}>
              <Text style={bStyles.tipTitle}>내 주변 무료 프로그램을{'\n'}찾아보세요</Text>
              <Text style={bStyles.tipSub}>가까운 곳에 무료로 이용할 수 있는{'\n'}프로그램이 있을 수 있어요.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#B8C0C8" />
          </TouchableOpacity>
          <TouchableOpacity style={[bStyles.tipCard, bStyles.tipCardBlue]} onPress={onGoNotificationSettings} activeOpacity={0.85}>
            <Text style={bStyles.tipEmoji}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={bStyles.tipTitle}>신청 마감 전 알림을 켜두면{'\n'}놓치지 않아요</Text>
              <Text style={bStyles.tipSub}>관심 혜택을 등록하고 알림을 받아보세요.{'\n'}마감 임박 혜택을 알려드려요.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#B8C0C8" />
          </TouchableOpacity>
 
          <View style={bStyles.recalcCard}>
            <Image
              source={require('../../assets/moment-splash.png')}
              style={bStyles.recalcAvatar}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={bStyles.recalcTitle}>아이 정보가 바뀌면{'\n'}혜택도 다시 계산돼요</Text>
              <Text style={bStyles.recalcSub}>생년월일, 거주지, 가구구성 등이 바뀌면{'\n'}받을 수 있는 혜택이 달라질 수 있어요</Text>
            </View>
            <TouchableOpacity style={bStyles.recalcBtn} onPress={onRegisterChild}>
              <Text style={bStyles.recalcBtnText}>다시 계산하기</Text>
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
  container:    { flex: 1, backgroundColor: '#fff' },
  scroll:       { paddingHorizontal: 16, paddingTop: 8 },
  header:       { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 4 },
  backBtn:      { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  headerSub:    { fontSize: 12, color: '#999', marginTop: 2 },
  bellBtn:      { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notiBadge:    { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: '#f87171', borderWidth: 2, borderColor: '#fff' },
  loadingBox:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText:  { fontSize: 13, color: '#bbb' },
  emptyBox:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 32 },
  emptyTitle:   { fontSize: 16, fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
  emptySub:     { fontSize: 12.5, color: '#aaa', textAlign: 'center', lineHeight: 20 },
  emptyBtn:     { backgroundColor: '#FFD93D', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  summaryCard:        { borderRadius: 18, borderWidth: 1.5, borderColor: '#FFD93D', padding: 18, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', ...SHADOW },
  summaryLeft:        { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  childAvatar:        { width: 52, height: 52, borderRadius: 26 },
  summaryAmountLabel: { fontSize: 11.5, color: '#999' },
  summaryAmount:      { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginTop: 2 },
  summaryAmountHighlight: { fontSize: 22, fontWeight: '900', color: '#FFB020' },
  summaryApplicable:  { fontSize: 12, color: '#666', marginTop: 4 },
  summaryApplicableHighlight: { color: '#3B82F6', fontWeight: '700' },
  summaryDivider:     { width: 1, height: 50, backgroundColor: '#F0F0F0', marginHorizontal: 14 },
  summaryRight:       { alignItems: 'center', justifyContent: 'center' },
  summaryPiggy:       { fontSize: 42 },
  summaryMeta:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, marginBottom: 16, paddingLeft: 2 },
  summaryMetaText: { fontSize: 12, color: '#aaa' },
  tabRow:          { flexDirection: 'row', gap: 8, marginBottom: 18 },
  tabBtn:          { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F4F4F4' },
  tabBtnActive:    { backgroundColor: '#FFD93D' },
  tabBtnText:      { fontSize: 13, fontWeight: '600', color: '#999' },
  tabBtnTextActive: { color: '#191919' },
  sectionTitle:  { fontSize: 16, fontWeight: '800', color: '#1a1a1a', marginBottom: 12 },
  moreText:      { fontSize: 12, color: '#bbb' },
  benefitListCard: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', ...SHADOW },
  benefitRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, gap: 10 },
  benefitBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F1F3' },
  benefitIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  benefitIcon:   { fontSize: 24 },
  benefitTextWrap: { flex: 1 },
  benefitTitle:  { fontSize: 13.5, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  benefitMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeTag:       { backgroundColor: '#F4F4F4', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  typeTagText:   { fontSize: 10.5, color: '#888', fontWeight: '600' },
  benefitAmount: { fontSize: 11.5, color: '#BBB' },
  statusBadge:   { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  statusBadgeText: { fontSize: 11, fontWeight: '800' },
  missedSub:     { fontSize: 11.5, color: '#aaa', marginTop: 2 },
  emptyFilter:   { padding: 20, alignItems: 'center' },
  emptyFilterText: { fontSize: 13, color: '#bbb' },
  tipCard:       { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 16, borderWidth: 1.5, borderColor: '#FFD93D', padding: 14, marginBottom: 10 },
  tipCardBlue:   { borderColor: '#93C5FD' },
  tipEmoji:      { fontSize: 32 },
  tipTitle:      { fontSize: 14, fontWeight: '700', color: '#1a1a1a', lineHeight: 21 },
  tipSub:        { fontSize: 11.5, color: '#999', marginTop: 4, lineHeight: 17 },
  recalcCard:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFBEB', borderRadius: 18, padding: 14, marginTop: 24 },
  recalcAvatar:  { width: 48, height: 48, borderRadius: 24 },
  recalcTitle:   { fontSize: 13.5, fontWeight: '700', color: '#1a1a1a', lineHeight: 20 },
  recalcSub:     { fontSize: 11, color: '#aaa', marginTop: 4, lineHeight: 16 },
  recalcBtn:     { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#FFD93D', alignSelf: 'flex-start' },
  recalcBtnText: { fontSize: 11.5, fontWeight: '700', color: '#191919' },
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
  summaryCard:     { borderRadius: 18, borderWidth: 1.5, borderColor: '#FFD93D', padding: 16, marginBottom: 14, backgroundColor: '#fff', ...SHADOW },
  summaryTop:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  summaryIconBox:  { width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  summaryIcon:     { fontSize: 30 },
  summaryTitle:    { fontSize: 16, fontWeight: '800', color: '#1a1a1a', marginBottom: 6 },
  statusBadge:     { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  statusBadgeText: { fontSize: 11.5, fontWeight: '800' },
  divider:         { height: 1, backgroundColor: '#F0F1F3', marginBottom: 12 },
  summaryRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  summaryLabel:    { flex: 1, fontSize: 13, color: '#888' },
  summaryValue:    { fontSize: 16, fontWeight: '800', color: '#FFB020' },
  summaryValueDark: { fontSize: 13.5, fontWeight: '700', color: '#1a1a1a' },
  accordionCard:   { backgroundColor: '#fff', borderRadius: 18, marginBottom: 10, overflow: 'hidden', ...SHADOW },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  accordionIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  accordionIcon:   { fontSize: 22 },
  accordionTitle:  { flex: 1, fontSize: 14.5, fontWeight: '700', color: '#1a1a1a' },
  accordionBody:   { paddingHorizontal: 14, paddingBottom: 14 },
  bulletRow:       { flexDirection: 'row', gap: 8, marginBottom: 6, alignItems: 'flex-start' },
  bullet:          { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD93D', marginTop: 6 },
  bulletText:      { flex: 1, fontSize: 13, color: '#555', lineHeight: 20 },
  stepsRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: 4, justifyContent: 'center' },
  stepItem:        { alignItems: 'center', gap: 6, flex: 1 },
  stepCircle:      { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3EEFF', alignItems: 'center', justifyContent: 'center' },
  stepNum:         { fontSize: 14, fontWeight: '700', color: '#8B5CF6' },
  stepLabel:       { fontSize: 11, color: '#555', textAlign: 'center' },
  infoBanner:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#FFFBEB', borderRadius: 16, padding: 14, marginBottom: 14 },
  infoBannerEmoji: { fontSize: 28 },
  infoBannerTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  infoBannerSub:   { fontSize: 12, color: '#999', marginTop: 4 },
  ctaBtn:          { backgroundColor: '#FFA500', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 10 },
  ctaBtnText:      { fontSize: 15, fontWeight: '800', color: '#fff' },
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