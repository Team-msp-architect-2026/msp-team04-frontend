import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomTabBar from '../../components/BottomTabBar';
import CommonHeader from '../../components/CommonHeader';
import type { ProgramDetail } from '../program/ProgramDetailScreen';

type ProgramType = 'public' | 'private' | 'online' | 'government';
type FilterKey = 'all' | 'urgent' | 'free' | 'online' | 'public';

interface RecruitingProgram {
  id: number;
  title: string;
  organization: string;
  type: ProgramType;
  category: string;
  location: string;
  address: string;
  distance: string;
  deadline: string;
  urgency: 'urgent' | 'soon' | 'normal';
  price: string;
  priceValue: number;
  rating: number;
  reviewCount: number;
  ageRange: string;
  schedule: string;
  spotsLeft: number;
  capacity: number;
  enrolled: number;
  isOpen: boolean;
  tags: string[];
  description: string;
  curriculum: string[];
  contact: string;
  website?: string;
  isPartner: boolean;
  aiReason?: string;
  reviewChips?: string[];
  matchRate: number;
  startDate: string;
  endDate: string;
}

interface RecruitingScreenProps {
  onTabChange: (tab: string) => void;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  onProgramClick?: (program: ProgramDetail) => void;
}

const PALETTE = {
  text: '#111827',
  subText: '#64748B',
  muted: '#94A3B8',
  border: '#E8EDF3',
  softBorder: '#EEF2F6',
  bg: '#FFFFFF',
  softBg: '#F8FAFC',

  primary: '#F6DD8F',
  primaryDark: '#8A6400',
  primarySoft: '#FFF9E8',
  primaryBorder: '#F3E3A3',

  yellow: '#F2CF52',
  yellowDark: '#8A6400',
  yellowSoft: '#FFF9E5',
  yellowBorder: '#F7E5A1',

  coral: '#E58B84',
  coralDark: '#B85A52',
  coralSoft: '#FFF7F5',
  coralBorder: '#F4DAD5',

  green: '#35A66A',
  greenDark: '#228251',
  greenSoft: '#F2FBF6',
  greenBorder: '#D5F0DE',

  blue: '#78A9FF',
  blueDark: '#3E6DCC',
  blueSoft: '#F3F7FF',
  blueBorder: '#DCE7FF',
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'urgent', label: '마감임박' },
  { key: 'free', label: '무료' },
  { key: 'online', label: '온라인' },
  { key: 'public', label: '공공/지원' },
];

const TYPE_LABELS: Record<ProgramType, string> = {
  public: '공공',
  private: '민간',
  online: '온라인',
  government: '정부지원',
};

const URGENCY_LABELS: Record<
  RecruitingProgram['urgency'],
  { label: string; bg: string; border: string; text: string }
> = {
  urgent: {
    label: '마감임박',
    bg: PALETTE.coralSoft,
    border: PALETTE.coralBorder,
    text: PALETTE.coralDark,
  },
  soon: {
    label: '곧 마감',
    bg: PALETTE.yellowSoft,
    border: PALETTE.yellowBorder,
    text: PALETTE.yellowDark,
  },
  normal: {
    label: '신청중',
    bg: PALETTE.primarySoft,
    border: PALETTE.primaryBorder,
    text: PALETTE.primaryDark,
  },
};

const AVAILABLE_PROGRAMS: RecruitingProgram[] = [
  {
    id: 101,
    title: '창의력 쑥쑥 미술 놀이',
    organization: '아트키즈 스튜디오',
    type: 'private',
    category: '미술',
    location: '강남구 역삼동',
    address: '서울 강남구 역삼동 123-4',
    distance: '1.2km',
    deadline: 'D-2',
    urgency: 'urgent',
    price: '월 9만원',
    priceValue: 90000,
    rating: 4.9,
    reviewCount: 128,
    ageRange: '만 3~6세',
    schedule: '토요일 10:00',
    spotsLeft: 3,
    capacity: 8,
    enrolled: 5,
    isOpen: true,
    tags: ['미술', '소규모', '창의력'],
    description:
      '아이의 창의력과 소근육 발달을 함께 키울 수 있는 소규모 미술 프로그램입니다.',
    curriculum: ['색채 감각 놀이', '클레이 만들기', '수채화 기초', '작품 발표'],
    contact: '02-1234-5678',
    website: 'https://example.com/artkids',
    isPartner: true,
    aiReason: '소규모 수업과 선생님 피드백 조건에 잘 맞는 프로그램입니다.',
    reviewChips: ['선생님 친절', '소규모 수업', '피드백 좋음'],
    matchRate: 97,
    startDate: '2026.05.01',
    endDate: '2026.06.30',
  },
  {
    id: 102,
    title: '구립 어린이 창의교실',
    organization: '강남구청',
    type: 'public',
    category: '창의력',
    location: '강남구 대치동',
    address: '서울 강남구 대치동 88-2',
    distance: '0.8km',
    deadline: 'D-3',
    urgency: 'urgent',
    price: '무료',
    priceValue: 0,
    rating: 4.8,
    reviewCount: 124,
    ageRange: '만 5~9세',
    schedule: '평일 14:00',
    spotsLeft: 4,
    capacity: 20,
    enrolled: 16,
    isOpen: true,
    tags: ['공공', '창의력', '무료'],
    description:
      '공공기관에서 운영하는 어린이 창의 프로그램으로 비용 부담 없이 참여할 수 있습니다.',
    curriculum: ['문제 해결 놀이', '창의 보드게임', '협동 활동', '발표 활동'],
    contact: '02-2345-6789',
    isPartner: false,
    aiReason: '무료 공공 프로그램을 찾는 조건에 잘 맞는 추천입니다.',
    reviewChips: ['무료', '공공기관', '접근성 좋음'],
    matchRate: 94,
    startDate: '2026.05.05',
    endDate: '2026.07.05',
  },
  {
    id: 103,
    title: '키즈 영어 스피킹 클래스',
    organization: '스마트 에듀',
    type: 'private',
    category: '영어',
    location: '강남구 삼성동',
    address: '서울 강남구 삼성동 44-1',
    distance: '1.6km',
    deadline: 'D-5',
    urgency: 'soon',
    price: '월 15만원',
    priceValue: 150000,
    rating: 4.6,
    reviewCount: 89,
    ageRange: '만 6~10세',
    schedule: '화/목 16:00',
    spotsLeft: 8,
    capacity: 16,
    enrolled: 8,
    isOpen: true,
    tags: ['영어', '회화', '소그룹'],
    description: '원어민 선생님과 함께하는 실전 영어 회화 수업입니다.',
    curriculum: ['파닉스 복습', '상황별 표현', '스피킹 게임', '미니 발표'],
    contact: '02-3456-7890',
    website: 'https://example.com/smartedu',
    isPartner: true,
    aiReason: '영어 말하기와 소그룹 수업을 원하는 조건에 적합합니다.',
    reviewChips: ['회화 중심', '아이가 좋아함', '소그룹'],
    matchRate: 91,
    startDate: '2026.05.10',
    endDate: '2026.07.30',
  },
  {
    id: 104,
    title: '초등 코딩 부트캠프',
    organization: '코드키즈',
    type: 'online',
    category: '코딩',
    location: '온라인',
    address: '온라인 수업',
    distance: '-',
    deadline: 'D-7',
    urgency: 'normal',
    price: '월 8만원',
    priceValue: 80000,
    rating: 4.5,
    reviewCount: 256,
    ageRange: '만 7~12세',
    schedule: '자유 수강',
    spotsLeft: 20,
    capacity: 40,
    enrolled: 20,
    isOpen: true,
    tags: ['코딩', '온라인', 'SW교육'],
    description: '스크래치와 파이썬 기초를 배우는 온라인 코딩 프로그램입니다.',
    curriculum: ['스크래치 기초', '알고리즘 놀이', '미니 게임 제작', '프로젝트 발표'],
    contact: '02-4567-8901',
    website: 'https://example.com/codekids',
    isPartner: false,
    aiReason: '온라인 수업과 코딩 관심사 조건에 맞는 프로그램입니다.',
    reviewChips: ['자유 수강', '코딩 입문', '재등록 의향'],
    matchRate: 87,
    startDate: '2026.05.15',
    endDate: '2026.08.15',
  },
  {
    id: 105,
    title: '아이돌봄 서비스',
    organization: '여성가족부',
    type: 'government',
    category: '돌봄',
    location: '가정 방문',
    address: '가정 방문 서비스',
    distance: '-',
    deadline: '상시',
    urgency: 'normal',
    price: '시간당 1,150원~',
    priceValue: 1150,
    rating: 4.7,
    reviewCount: 1024,
    ageRange: '만 3~12세',
    schedule: '협의 가능',
    spotsLeft: 30,
    capacity: 50,
    enrolled: 20,
    isOpen: true,
    tags: ['돌봄', '정부지원', '방문'],
    description: '정부 지원으로 저렴하게 이용 가능한 아이돌봄 서비스입니다.',
    curriculum: ['등하원 보조', '놀이 돌봄', '식사 챙김', '안전 관리'],
    contact: '1577-2514',
    website: 'https://example.com/care',
    isPartner: false,
    aiReason: '돌봄 공백을 줄이고 비용 부담을 낮추는 데 적합합니다.',
    reviewChips: ['정부지원', '돌봄 공백 완화', '비용 부담 낮음'],
    matchRate: 83,
    startDate: '2026.05.01',
    endDate: '2026.12.31',
  },
];

function toProgramDetail(program: RecruitingProgram): ProgramDetail {
  return {
    id: program.id,
    title: program.title,
    organization: program.organization,
    type: program.type,
    location: program.location,
    address: program.address,
    distance: program.distance,
    price: program.price,
    priceValue: program.priceValue,
    rating: program.rating,
    reviewCount: program.reviewCount,
    ageRange: program.ageRange,
    schedule: program.schedule,
    score: program.matchRate,
    isOpen: program.isOpen,
    tags: program.tags,
    description: program.description,
    curriculum: program.curriculum,
    contact: program.contact,
    website: program.website,
    capacity: program.capacity,
    enrolled: program.enrolled,
    startDate: program.startDate,
    endDate: program.endDate,
    isPartner: program.isPartner,
    aiReason: program.aiReason,
    reviewChips: program.reviewChips,
    matchRate: program.matchRate,
  };
}

export default function RecruitingScreen({
  onTabChange,
  onSearchClick,
  onNotificationClick,
  onProgramClick,
}: RecruitingScreenProps) {
  const [likedPrograms, setLikedPrograms] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filteredPrograms = useMemo(() => {
    if (activeFilter === 'urgent') {
      return AVAILABLE_PROGRAMS.filter(
        program => program.urgency === 'urgent' || program.urgency === 'soon',
      );
    }

    if (activeFilter === 'free') {
      return AVAILABLE_PROGRAMS.filter(program => program.priceValue === 0);
    }

    if (activeFilter === 'online') {
      return AVAILABLE_PROGRAMS.filter(program => program.type === 'online');
    }

    if (activeFilter === 'public') {
      return AVAILABLE_PROGRAMS.filter(
        program => program.type === 'public' || program.type === 'government',
      );
    }

    return AVAILABLE_PROGRAMS;
  }, [activeFilter]);

  const urgentCount = AVAILABLE_PROGRAMS.filter(
    program => program.urgency === 'urgent' || program.urgency === 'soon',
  ).length;

  const freeCount = AVAILABLE_PROGRAMS.filter(
    program => program.priceValue === 0,
  ).length;

  const onlineCount = AVAILABLE_PROGRAMS.filter(
    program => program.type === 'online',
  ).length;

  const heroStats = [
    {
      key: 'all',
      value: AVAILABLE_PROGRAMS.length,
      label: '전체',
      color: PALETTE.text,
    },
    {
      key: 'urgent',
      value: urgentCount,
      label: '마감임박',
      color: PALETTE.coralDark,
    },
    {
      key: 'free',
      value: freeCount,
      label: '무료',
      color: PALETTE.greenDark,
    },
    {
      key: 'online',
      value: onlineCount,
      label: '온라인',
      color: PALETTE.blueDark,
    },
  ];

  const toggleLike = (id: number) => {
    setLikedPrograms(prev =>
      prev.includes(id)
        ? prev.filter(programId => programId !== id)
        : [...prev, id],
    );
  };

  const handleOpenProgram = (program: RecruitingProgram) => {
    onProgramClick?.(toProgramDetail(program));
  };

  return (
    <View style={styles.root}>
      <CommonHeader
        variant="apply"
        unreadCount={3}
        onSearchPress={onSearchClick}
        onNotificationPress={onNotificationClick}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View>
            <Text style={styles.heroTitle}>지금 모집중인 프로그램</Text>
            <Text style={styles.heroSubtitle}>
              마감 전에 신청 가능한 교육·돌봄 프로그램을 확인해보세요.
            </Text>
          </View>

          <View style={styles.heroStatsRow}>
            {heroStats.map(stat => (
              <View key={stat.key} style={styles.heroStatCard}>
                <Text style={[styles.heroStatValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.heroStatLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <View style={styles.filterRow}>
            {FILTERS.map(filter => {
              const isActive = activeFilter === filter.key;

              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setActiveFilter(filter.key)}
                  activeOpacity={0.78}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>신청 가능한 프로그램</Text>
          <Text style={styles.listCount}>{filteredPrograms.length}개</Text>
        </View>

        <View style={styles.programList}>
          {filteredPrograms.map(program => {
            const urgency = URGENCY_LABELS[program.urgency];
            const liked = likedPrograms.includes(program.id);

            return (
              <TouchableOpacity
                key={program.id}
                style={styles.programCard}
                activeOpacity={0.84}
                onPress={() => handleOpenProgram(program)}
              >
                <View style={styles.cardTop}>
                  <View style={styles.thumbBox}>
                    <Text style={styles.thumbEmoji}>
                      {program.category === '미술'
                        ? '🎨'
                        : program.category === '영어'
                          ? '🔤'
                          : program.category === '코딩'
                            ? '💻'
                            : program.category === '돌봄'
                              ? '🧸'
                              : '📚'}
                    </Text>
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.urgencyBadge,
                          {
                            backgroundColor: urgency.bg,
                            borderColor: urgency.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.urgencyBadgeText,
                            { color: urgency.text },
                          ]}
                        >
                          {urgency.label}
                        </Text>
                      </View>

                      <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>
                          {TYPE_LABELS[program.type]}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {program.title}
                    </Text>

                    <Text style={styles.cardOrg} numberOfLines={1}>
                      {program.organization}
                    </Text>

                    <View style={styles.metaRow}>
                      <Ionicons
                        name="location-outline"
                        size={12}
                        color={PALETTE.muted}
                      />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {program.location}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.likeButton}
                    onPress={() => toggleLike(program.id)}
                    activeOpacity={0.75}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={liked ? 'heart' : 'heart-outline'}
                      size={21}
                      color={liked ? PALETTE.coralDark : PALETTE.muted}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardInfoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>마감</Text>
                    <Text style={styles.infoValue}>{program.deadline}</Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>가격</Text>
                    <Text style={styles.infoValue}>{program.price}</Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>잔여</Text>
                    <Text style={styles.infoValue}>{program.spotsLeft}석</Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>평점</Text>
                    <Text style={styles.infoValue}>★ {program.rating}</Text>
                  </View>
                </View>

                <View style={styles.tagRow}>
                  {program.tags.slice(0, 3).map(tag => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.matchLabel}>AI 매칭률</Text>
                    <Text style={styles.matchValue}>{program.matchRate}%</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => handleOpenProgram(program)}
                    activeOpacity={0.84}
                  >
                    <Text style={styles.detailButtonText}>상세보기</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={15}
                      color={PALETTE.text}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <BottomTabBar activeTab="apply" onTabChange={onTabChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PALETTE.bg,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 92,
  },

  heroSection: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    padding: 18,
    marginBottom: 24,
  },

  heroTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.6,
  },

  heroSubtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '600',
    color: PALETTE.subText,
    letterSpacing: -0.2,
  },

  heroStatsRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 8,
  },

  heroStatCard: {
    flex: 1,
    minHeight: 66,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: PALETTE.softBorder,
    backgroundColor: PALETTE.softBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroStatValue: {
    fontSize: 19,
    fontWeight: '900',
  },

  heroStatLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '800',
    color: '#7B8794',
  },

  filterSection: {
    marginBottom: 24,
  },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  filterChip: {
    flex: 1,
    height: 36,
    paddingHorizontal: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterChipActive: {
    borderColor: PALETTE.primaryBorder,
    backgroundColor: PALETTE.primarySoft,
  },

  filterChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: PALETTE.subText,
    textAlign: 'center',
  },

  filterChipTextActive: {
    color: PALETTE.primaryDark,
  },

  listHeader: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  listTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: PALETTE.text,
  },

  listCount: {
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  programList: {
    gap: 18,
  },

  programCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    padding: 15,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
  },

  thumbBox: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: PALETTE.primarySoft,
    borderWidth: 1,
    borderColor: PALETTE.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  thumbEmoji: {
    fontSize: 30,
  },

  cardBody: {
    flex: 1,
    minHeight: 70,
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },

  urgencyBadge: {
    height: 23,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  urgencyBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: -0.1,
  },

  typeBadge: {
    height: 23,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PALETTE.softBorder,
    backgroundColor: PALETTE.softBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  typeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: PALETTE.muted,
  },

  cardTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.35,
  },

  cardOrg: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.muted,
  },

  metaRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  metaText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: PALETTE.subText,
  },

  likeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardInfoGrid: {
    marginTop: 17,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: PALETTE.softBorder,
    flexDirection: 'row',
    gap: 8,
  },

  infoItem: {
    flex: 1,
    minHeight: 54,
    borderRadius: 15,
    backgroundColor: PALETTE.softBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  infoValue: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '900',
    color: PALETTE.text,
  },

  tagRow: {
    marginTop: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  tagChip: {
    height: 25,
    paddingHorizontal: 9,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  cardFooter: {
    marginTop: 17,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: PALETTE.softBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  matchLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  matchValue: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: '900',
    color: PALETTE.primaryDark,
  },

  detailButton: {
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  detailButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: PALETTE.text,
  },

  bottomSpace: {
    height: 8,
  },
});