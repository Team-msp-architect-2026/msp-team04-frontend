import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants';
import type { ProgramDetail } from '../program/ProgramDetailScreen';
import {
  recommendationApi,
  type RecommendationItem,
  type Top3CompareItem,
} from '../../api/recommendation';

export interface ChildFormData {
  childName: string;
  age: number;
  concerns: string[];
  region?: string;
  budget?: string;
}

interface Program {
  id: number;
  title: string;
  organization: string;
  type: 'public' | 'private' | 'online' | 'government';
  category: string;
  location: string;
  distance: string;
  price: string;
  rating: number;
  reviewCount: number;
  ageRange: string;
  schedule: string;
  imageUrl: string;
  matchRate: number;
  isOpen: boolean;
  tags: string[];
  description: string;
  aiReason?: string;
  reviewChips?: string[];
  priceValue?: number;
  isTop3?: boolean;
}

const mockPrograms: Program[] = [
  {
    id: 1,
    title: '구립 어린이 창의교실',
    organization: '서울시 교육청',
    type: 'public',
    category: '창의력',
    location: '서울 강남구 역삼동',
    distance: '0.8km',
    price: '무료',
    rating: 4.8,
    reviewCount: 124,
    ageRange: '5-9세',
    schedule: '평일 14:00-18:00',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop',
    matchRate: 97,
    isOpen: true,
    tags: ['돌봄', '창의력'],
    description: '창의력과 문제해결 능력을 키워주는 어린이 창의교실입니다.',
    aiReason: '창의력·소근육 발달에 최적화된 프로그램이에요',
    reviewChips: ['선생님 친절', '소규모 수업', '만족도 높음'],
  },
  {
    id: 2,
    title: '키즈 영어 스피킹 클래스',
    organization: '스마트 에듀',
    type: 'private',
    category: '영어',
    location: '서울 강남구 삼성동',
    distance: '1.2km',
    price: '월 15만원',
    rating: 4.6,
    reviewCount: 89,
    ageRange: '6-10세',
    schedule: '화/목 16:00-17:30',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
    matchRate: 91,
    isOpen: true,
    tags: ['영어', '회화'],
    description: '원어민 선생님과 함께하는 실전 영어 회화 수업입니다.',
    aiReason: '비슷한 부모들이 가장 만족한 프로그램이에요',
    reviewChips: ['체계적 커리큘럼', '아이가 좋아함'],
  },
  {
    id: 3,
    title: '초등 코딩 부트캠프',
    organization: '코드키즈',
    type: 'online',
    category: '코딩',
    location: '온라인',
    distance: '-',
    price: '월 8만원',
    rating: 4.5,
    reviewCount: 256,
    ageRange: '7-12세',
    schedule: '자유 수강',
    imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=300&fit=crop',
    matchRate: 87,
    isOpen: true,
    tags: ['코딩', 'SW교육'],
    description: '스크래치, 파이썬 등 다양한 프로그래밍 언어를 배웁니다.',
    aiReason: '학습 준비에 특화된 검증된 프로그램이에요',
    reviewChips: ['재등록 의향', '소규모 수업'],
  },
  {
    id: 4,
    title: '아이돌봄 서비스',
    organization: '여성가족부',
    type: 'government',
    category: '돌봄',
    location: '가정 방문',
    distance: '-',
    price: '시간당 1,150원~',
    rating: 4.7,
    reviewCount: 1024,
    ageRange: '3-12세',
    schedule: '협의 가능',
    imageUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop',
    matchRate: 83,
    isOpen: true,
    tags: ['돌봄', '정부지원'],
    description: '정부 지원으로 저렴하게 이용 가능한 아이돌봄 서비스.',
    reviewChips: [],
  },
  {
    id: 5,
    title: '지역아동센터 방과후교실',
    organization: '강남구청',
    type: 'public',
    category: '돌봄',
    location: '서울 강남구 논현동',
    distance: '1.5km',
    price: '무료',
    rating: 4.4,
    reviewCount: 67,
    ageRange: '6-12세',
    schedule: '평일 13:00-19:00',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop',
    matchRate: 79,
    isOpen: false,
    tags: ['돌봄', '학습지원'],
    description: '방과후 돌봄이 필요한 초등학생 대상 종합 서비스.',
    reviewChips: [],
  },
];

const FALLBACK_IMAGE_URL =
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop';

function formatRecommendationPrice(price: number, isFree: boolean) {
  if (isFree || price === 0) {
    return '무료';
  }

  return `${price.toLocaleString('ko-KR')}원`;
}

function toRecommendationProgram(item: RecommendationItem): Program {
  const totalScore = Number(item.scoreBreakdown?.totalScore ?? 0);
  const matchRate = Math.max(0, Math.min(100, Math.round(totalScore)));

  return {
    id: item.programId,
    title: item.title,
    organization: '운영 기관 확인 필요',
    type: item.isFree ? 'government' : 'private',
    category: item.category,
    location: item.region ?? '지역 정보 없음',
    distance: '-',
    price: formatRecommendationPrice(item.price, item.isFree),
    priceValue: item.price,
    rating: 0,
    reviewCount: 0,
    ageRange: '대상 연령 확인 필요',
    schedule: item.classType ?? '운영 방식 확인 필요',
    imageUrl: item.imageUrl ?? FALLBACK_IMAGE_URL,
    matchRate,
    isOpen: item.isRecruiting,
    tags: [item.category, item.isTop3 ? 'TOP3' : '맞춤추천'].filter(Boolean),
    description: item.recommendReason,
    aiReason: item.recommendReason,
    reviewChips: [],
    isTop3: item.isTop3,
  };
}

// Program → ProgramDetail 변환 함수
function toProgramDetail(p: Program): ProgramDetail {
  return {
    id: p.id,
    title: p.title,
    organization: p.organization,
    type: p.type,
    location: p.location,
    address: p.location,
    distance: p.distance,
    price: p.price,
    priceValue: p.priceValue ?? (p.price === '무료' ? 0 : 1),
    rating: p.rating,
    reviewCount: p.reviewCount,
    ageRange: p.ageRange,
    schedule: p.schedule,
    score: p.matchRate,
    isOpen: p.isOpen,
    tags: p.tags,
    description: p.description,
    curriculum: ['커리큘럼 정보 준비중'],
    contact: '문의처 정보 준비중',
    capacity: 20,
    enrolled: 15,
    startDate: '2025.03.01',
    endDate: '2025.12.31',
    isPartner: false,
    aiReason: p.aiReason,
    reviewChips: p.reviewChips,
    matchRate: p.matchRate,
  };
}

interface RecommendationScreenProps {
  childData: ChildFormData;
  preferenceId?: number | null;
  recommendations?: RecommendationItem[];
  loading?: boolean;
  errorMessage?: string;
  onBack: () => void;
  onGoHome: () => void;
  onProgramClick: (program: ProgramDetail) => void;
}

export default function RecommendationScreen({
  childData,
  preferenceId,
  recommendations = [],
  loading = false,
  errorMessage = '',
  onBack,
  onGoHome,
  onProgramClick,
}: RecommendationScreenProps) {
  const [activeTab, setActiveTab] = useState<'top3' | 'all'>('top3');
  const [likedPrograms, setLikedPrograms] = useState<number[]>([]);
  const [top3CompareSummary, setTop3CompareSummary] = useState('');
  const [top3CompareItems, setTop3CompareItems] = useState<
    Top3CompareItem[]
  >([]);

  const programs =
    recommendations.length > 0
      ? recommendations.map(toRecommendationProgram)
      : mockPrograms;
  const top3 = programs.filter(program => program.isTop3).slice(0, 3);
  const displayTop3 = top3.length > 0 ? top3 : programs.slice(0, 3);

  useEffect(() => {
    if (!preferenceId || top3.length < 3) {
      setTop3CompareSummary('');
      setTop3CompareItems([]);
      return;
    }

    let cancelled = false;

    const fetchTop3Compare = async () => {
      try {
        const data = await recommendationApi.compareTop3(preferenceId);

        if (cancelled) {
          return;
        }

        setTop3CompareSummary(data.commonSummary ?? '');
        setTop3CompareItems(data.items ?? []);
      } catch (error) {
        console.error('AI TOP3 비교 설명 조회 실패', error);

        if (!cancelled) {
          setTop3CompareSummary('');
          setTop3CompareItems([]);
        }
      }
    };

    fetchTop3Compare();

    return () => {
      cancelled = true;
    };
  }, [preferenceId, top3.length]);

  const getCompareItem = (programId: number) =>
    top3CompareItems.find(item => item.programId === programId);

  const toggleLike = (id: number) => {
    setLikedPrograms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const rankEmoji = (idx: number) => idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
  const rankBg = (idx: number) => idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32';

  return (
    <SafeAreaView style={s.root}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>맞춤 추천 결과</Text>
        <TouchableOpacity style={s.homeBtn} onPress={onGoHome}>
          <Text style={s.homeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* AI 배너 */}
      <View style={s.aiBanner}>
        <View style={s.aiBannerLeft}>
          <Text style={s.aiStar}>✦</Text>
          <Text style={s.aiText}>{childData.childName}에게 딱 맞는 프로그램 {programs.length}개를 찾았어요!</Text>
        </View>
        <View style={s.aiBadge}>
          <Text style={s.aiBadgeText}>✦ 95%</Text>
        </View>
      </View>

      {/* 아이 정보 칩 */}
      <View style={s.filterRow}>
        <View style={s.chips}>
          <View style={s.chip}><Text style={s.chipText}>{childData.childName} ({childData.age}세)</Text></View>
          {childData.region && <View style={s.chipGray}><Text style={s.chipGrayText}>{childData.region}</Text></View>}
          {childData.budget && <View style={s.chipGray}><Text style={s.chipGrayText}>{childData.budget}</Text></View>}
        </View>
      </View>

      {/* 탭 */}
      <View style={s.tabRow}>
        <TouchableOpacity
          style={[s.tabBtn, activeTab === 'top3' && s.tabBtnActive]}
          onPress={() => setActiveTab('top3')}
        >
          <Text style={[s.tabBtnText, activeTab === 'top3' && s.tabBtnTextActive]}>✦ AI TOP 3</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tabBtn, activeTab === 'all' && s.tabBtnActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[s.tabBtnText, activeTab === 'all' && s.tabBtnTextActive]}>전체 결과</Text>
        </TouchableOpacity>
        <Text style={s.totalCount}>총 {programs.length}개</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {loading && (
          <View style={s.compareBox}>
            <Text style={s.compareTitle}>추천 결과를 불러오는 중이에요.</Text>
          </View>
        )}

        {!!errorMessage && (
          <View style={s.compareBox}>
            <Text style={s.compareTitle}>{errorMessage}</Text>
          </View>
        )}

        {/* TOP3 탭 */}
        {activeTab === 'top3' && (
          <View style={{ gap: 16 }}>
            {/* AI 비교 배너 */}
            <View style={s.compareBox}>
              <View style={s.compareHeader}>
                <Text style={s.aiStar}>✦</Text>
                <Text style={s.compareTitle}>AI 비교 추천 TOP 3</Text>
              </View>

              {top3.length < 3 ? (
                <Text style={s.compareSummary}>
                  추천 결과가 3개 이상일 때 AI TOP3 비교 설명을 제공해요.
                </Text>
              ) : top3CompareSummary ? (
                <Text style={s.compareSummary}>{top3CompareSummary}</Text>
              ) : null}

              <View style={s.compareGrid}>
                {displayTop3.map((p, idx) => {
                  const compareItem = getCompareItem(p.id);

                  return (
                    <View key={p.id} style={s.compareItem}>
                      <Text style={s.compareRank}>#{idx + 1}</Text>
                      <Text style={s.compareTitle2}>{p.title.slice(0, 6)}...</Text>
                      <Text style={s.compareRate}>{p.matchRate}%</Text>
                      {compareItem?.highlightTag ? (
                        <Text style={s.compareTag}>{compareItem.highlightTag}</Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>

              {top3CompareItems.length > 0 && (
                <View style={s.compareReasonList}>
                  {displayTop3.map(program => {
                    const compareItem = getCompareItem(program.id);

                    if (!compareItem?.reason) {
                      return null;
                    }

                    return (
                      <View key={`reason-${program.id}`} style={s.compareReasonItem}>
                        <Text style={s.compareReasonTitle}>{program.title}</Text>
                        <Text style={s.compareReasonText}>{compareItem.reason}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* TOP3 카드 */}
            {displayTop3.map((program, idx) => (
              <View key={program.id} style={s.card}>
                <View style={s.cardImageWrap}>
                  <Image
                    source={{ uri: program.imageUrl }}
                    style={s.cardImage}
                    resizeMode="cover"
                  />
                  <View style={s.cardBadgeRow}>
                    <View style={[s.rankBadge, { backgroundColor: rankBg(idx) }]}>
                      <Text style={s.rankBadgeText}>{rankEmoji(idx)} {idx + 1}위</Text>
                    </View>
                    <View style={s.aiBadgeSmall}>
                      <Text style={s.aiBadgeSmallText}>✦ {program.matchRate}%</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={s.likeBtn} onPress={() => toggleLike(program.id)}>
                    <Text>{likedPrograms.includes(program.id) ? '❤️' : '🤍'}</Text>
                  </TouchableOpacity>
                </View>

                <View style={s.cardBody}>
                  <View style={s.cardTopRow}>
                    <View>
                      <View style={s.categoryBadge}>
                        <Text style={s.categoryBadgeText}>{program.category}</Text>
                      </View>
                      <Text style={s.cardTitle}>{program.title}</Text>
                      <Text style={s.cardLocation}>📍 {program.location}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={s.cardPrice}>{program.price}</Text>
                      <View style={s.ratingRow}>
                        <Text style={{ fontSize: 11 }}>⭐</Text>
                        <Text style={s.ratingText}>{program.rating}</Text>
                        <Text style={s.reviewCount}>({program.reviewCount})</Text>
                      </View>
                    </View>
                  </View>

                  {program.aiReason && (
                    <View style={s.aiReasonBox}>
                      <Text style={s.aiReasonText}>✦ {program.aiReason}</Text>
                    </View>
                  )}

                  {program.reviewChips && program.reviewChips.length > 0 && (
                    <View style={s.reviewChipRow}>
                      {program.reviewChips.map(chip => (
                        <View key={chip} style={s.reviewChip}>
                          <Text style={s.reviewChipText}>{chip}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* ← 상세보기 버튼에 onProgramClick 연결 */}
                <View style={s.cardFooter}>
                  <TouchableOpacity
                    style={[s.detailBtn, !program.isOpen && s.detailBtnDisabled]}
                    disabled={!program.isOpen}
                    onPress={() => program.isOpen && onProgramClick(toProgramDetail(program))}
                  >
                    <Text style={s.detailBtnText}>{program.isOpen ? '상세보기 →' : '모집 마감'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 전체 탭 - ← TouchableOpacity에 onProgramClick 연결 */}
        {activeTab === 'all' && (
          <View style={{ gap: 12 }}>
            {programs.map(program => (
              <TouchableOpacity
                key={program.id}
                style={s.listCard}
                onPress={() => onProgramClick(toProgramDetail(program))}
              >
                <Image
                  source={{ uri: program.imageUrl }}
                  style={s.listCardImage}
                  resizeMode="cover"
                />
                <View style={s.listCardBody}>
                  <View style={s.listCardTop}>
                    <View style={s.categoryBadge}>
                      <Text style={s.categoryBadgeText}>{program.category}</Text>
                    </View>
                    <View style={s.aiBadgeSmall}>
                      <Text style={s.aiBadgeSmallText}>✦ {program.matchRate}%</Text>
                    </View>
                  </View>
                  <Text style={s.listCardTitle}>{program.title}</Text>
                  <Text style={s.listCardLocation}>📍 {program.location}</Text>
                  <View style={s.listCardBottom}>
                    <Text style={s.cardPrice}>{program.price}</Text>
                    <View style={s.ratingRow}>
                      <Text style={{ fontSize: 11 }}>⭐</Text>
                      <Text style={s.ratingText}>{program.rating}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backBtnText: { fontSize: 20, color: '#1A1A1A' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  homeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  homeBtnText: { fontSize: 18, color: '#888' },

  aiBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#EBF8FF', borderRadius: 16, margin: 16, padding: 12, borderWidth: 1, borderColor: '#BEE3F8' },
  aiBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  aiStar: { fontSize: 14, color: '#3182CE' },
  aiText: { fontSize: 12, fontWeight: '600', color: '#1A365D', flex: 1 },
  aiBadge: { backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 20 },
  aiBadgeText: { fontSize: 13, fontWeight: '700', color: '#3182CE' },

  filterRow: { paddingHorizontal: 16, paddingBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#FFF3CD', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.primary.default },
  chipGray: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  chipGrayText: { fontSize: 13, color: '#888' },

  tabRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  tabBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 2, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  tabBtnActive: { borderColor: '#F9A825', backgroundColor: '#FFE082' },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: '#718096' },
  tabBtnTextActive: { color: '#7B5E00' },
  totalCount: { marginLeft: 'auto', fontSize: 12, color: '#888' },

  scroll: { padding: 16, paddingBottom: 40 },

  compareBox: { backgroundColor: '#EBF8FF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#BEE3F8' },
  compareHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  compareTitle: { fontSize: 13, fontWeight: '700', color: '#1A365D' },
  compareGrid: { flexDirection: 'row', gap: 8 },
  compareItem: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 10, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  compareRank: { fontSize: 11, fontWeight: '700', color: '#F9A825', marginBottom: 4 },
  compareTitle2: { fontSize: 11, fontWeight: '600', color: '#2D3748', textAlign: 'center' },
  compareRate: { fontSize: 14, fontWeight: '800', color: '#3182CE', marginTop: 6 },

  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardImageWrap: { position: 'relative' },
  cardImage: { width: '100%', height: 140 },
  cardBadgeRow: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', gap: 6 },
  rankBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  rankBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  aiBadgeSmall: { backgroundColor: '#3182CE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  aiBadgeSmallText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  likeBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 20, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  cardBody: { padding: 14, gap: 10 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  categoryBadge: { backgroundColor: '#FFF3CD', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 4 },
  categoryBadgeText: { fontSize: 10, fontWeight: '700', color: '#F9A825' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#1A202C', marginTop: 4 },
  cardLocation: { fontSize: 12, color: '#718096', marginTop: 2 },
  cardPrice: { fontSize: 15, fontWeight: '800', color: '#1A202C' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#1A1A1A' },
  reviewCount: { fontSize: 11, color: '#A0AEC0' },

  aiReasonBox: { backgroundColor: '#EBF8FF', borderRadius: 10, padding: 10 },
  aiReasonText: { fontSize: 11, fontWeight: '600', color: '#2B6CB0' },
  reviewChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  reviewChip: { backgroundColor: '#EBF8FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#BEE3F8' },
  reviewChipText: { fontSize: 11, fontWeight: '600', color: '#2B6CB0' },

  cardFooter: { borderTopWidth: 1, borderTopColor: '#F0F0F0', padding: 12 },
  detailBtn: { height: 40, borderRadius: 10, backgroundColor: colors.primary.default, alignItems: 'center', justifyContent: 'center' },
  detailBtnDisabled: { backgroundColor: '#E5E7EB' },
  detailBtnText: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },

  listCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  listCardImage: { width: 64, height: 64, borderRadius: 12 },
  listCardBody: { flex: 1, gap: 4 },
  listCardTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  listCardTitle: { fontSize: 13, fontWeight: '700', color: '#1A202C' },
  listCardLocation: { fontSize: 11, color: '#718096' },
  listCardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  compareSummary: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  compareTag: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary.default,
  },
  compareReasonList: {
    marginTop: 14,
    gap: 10,
  },
  compareReasonItem: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  compareReasonTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 5,
  },
  compareReasonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    lineHeight: 18,
  },

});
