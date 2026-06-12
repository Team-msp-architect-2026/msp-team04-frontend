import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
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
import { getPrograms, type ProgramListItem } from '../../api/programApi';
import { mypageApi } from '../../api/mypage';

type ProgramType = 'public' | 'private' | 'online' | 'government';
type FilterKey = 'all' | 'urgent' | 'free' | 'online';

interface RecruitingProgram {
  id: number;
  title: string;
  organization: string;
  type: ProgramType;
  category: string;
  imageUrl: string | null;
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
  startDate: string;
  endDate: string;
}

interface RecruitingScreenProps {
  onTabChange: (tab: string) => void;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  onProgramClick?: (program: ProgramDetail) => void;
  initialFilter?: string;
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

const PAGE_SIZE = 5;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'urgent', label: '마감임박' },
  { key: 'free', label: '무료' },
  { key: 'online', label: '온라인' },
];

const FILTER_TO_SERVER_FILTER: Record<
  FilterKey,
  'ALL' | 'URGENT' | 'FREE' | 'ONLINE'
> = {
  all: 'ALL',
  urgent: 'URGENT',
  free: 'FREE',
  online: 'ONLINE',
};

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

function getCategoryLabel(category: string | null): string {
  const categoryMap: Record<string, string> = {
    EDUCATION: '교육',
    CARE: '돌봄',
    ART: '미술',
    SPORTS: '체육',
    MUSIC: '음악',
    LANGUAGE: '언어',
    CODING: '코딩',
    BENEFIT: '지원',
  };

  if (!category) {
    return '기타';
  }

  return categoryMap[category] ?? category;
}

function normalizeCode(value: string | null | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function containsOnlineText(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }

  const lowerValue = value.toLowerCase();

  return (
    value.includes('온라인') ||
    value.includes('비대면') ||
    lowerValue.includes('online')
  );
}

function getProgramType(program: ProgramListItem): ProgramType {
  if (normalizeCode(program.classType) === 'ONLINE' || containsOnlineText(program.classType)) {
    return 'online';
  }

  const programType = normalizeCode(program.programType);

  if (programType === 'GOVERNMENT') {
    return 'government';
  }

  if (programType === 'PUBLIC') {
    return 'public';
  }

  if (programType === 'PRIVATE') {
    return 'private';
  }

  if (program.category === 'BENEFIT') {
    return 'government';
  }

  if (program.isPublic) {
    return 'public';
  }

  return 'private';
}

function formatPrice(program: ProgramListItem): string {
  if (program.isFree) {
    return '무료';
  }

  if (program.price != null && program.price > 0) {
    return `${program.price.toLocaleString()}원`;
  }

  return '가격 확인 필요';
}

function formatAgeRange(minAge: number | null, maxAge: number | null): string {
  if (minAge != null && maxAge != null) {
    return `${minAge}~${maxAge}세`;
  }

  if (minAge != null) {
    return `${minAge}세 이상`;
  }

  if (maxAge != null) {
    return `${maxAge}세 이하`;
  }

  return '대상 연령 확인 필요';
}

function formatSchedule(program: ProgramListItem): string {
  const classType = program.classType ?? '운영 방식 확인 필요';

  if (program.classTime) {
    return `${classType} · ${program.classTime}`;
  }

  return classType;
}

function formatDate(value: string | null | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  return value;
}

function splitCurriculum(curriculum: string | null): string[] {
  if (!curriculum || !curriculum.trim()) {
    return ['상세 커리큘럼은 프로그램 상세 정보를 확인해 주세요.'];
  }

  return curriculum
    .split(/\r?\n|\|/)
    .map(item => item.trim())
    .filter(Boolean);
}

function getDeadlineLabel(deadlineDate: string | null): string {
  if (!deadlineDate) {
    return '상시';
  }

  const today = new Date();
  const deadline = new Date(`${deadlineDate}T00:00:00`);
  const diffDays = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (Number.isNaN(diffDays)) {
    return '마감일 확인';
  }

  if (diffDays < 0) {
    return '마감일 확인';
  }

  if (diffDays === 0) {
    return '오늘 마감';
  }

  return `D-${diffDays}`;
}

function getUrgency(program: ProgramListItem): RecruitingProgram['urgency'] {
  if (!program.deadlineDate) {
    return 'normal';
  }

  const today = new Date();
  const deadline = new Date(`${program.deadlineDate}T00:00:00`);
  const diffDays = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (Number.isNaN(diffDays) || diffDays < 0) {
    return 'normal';
  }

  if (diffDays <= 3) {
    return 'urgent';
  }

  if (diffDays <= 7) {
    return 'soon';
  }

  return 'normal';
}

function decodeHtml(str: string): string {
  return str
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function toRecruitingProgram(program: ProgramListItem): RecruitingProgram {
  const categoryLabel = getCategoryLabel(program.category);
  const capacity = program.maxCapacity ?? 0;
  const spotsLeft = Math.max(program.remainCapacity ?? 0, 0);
  const enrolled = capacity > 0 ? Math.max(capacity - spotsLeft, 0) : 0;
  const rating = program.ratingAvg ?? 0;
  const type = getProgramType(program);
  const isFree = Boolean(program.isFree) || program.price === 0;
  const typeLabel = TYPE_LABELS[type];

  return {
    id: program.id,
    title: decodeHtml(program.name),
    organization: program.institutionName ?? '운영기관 확인 필요',
    type,
    category: categoryLabel,
    imageUrl: program.imageUrl ?? null,
    location: program.region ?? '지역 확인 필요',
    address: program.detailAddress ?? program.region ?? '주소 확인 필요',
    distance: '-',
    deadline: getDeadlineLabel(program.deadlineDate),
    urgency: getUrgency(program),
    price: formatPrice(program),
    priceValue: program.price ?? 0,
    rating,
    reviewCount: program.reviewCount ?? 0,
    ageRange: formatAgeRange(program.targetAgeMin, program.targetAgeMax),
    schedule: formatSchedule(program),
    spotsLeft,
    capacity,
    enrolled,
    isOpen: program.isRecruiting,
    tags: [
      categoryLabel,
      typeLabel,
      isFree ? '무료' : '유료',
      program.region ?? null,
    ].filter(Boolean) as string[],
    description:
      program.description?.trim() ||
      '프로그램 설명 정보가 아직 제공되지 않았습니다.',
    curriculum: splitCurriculum(program.curriculum),
    contact: program.contactPhone ?? '문의처 확인 필요',
    website: program.contactUrl ?? undefined,
    isPartner: type === 'private',
    aiReason: undefined,
    reviewChips: undefined,
    startDate: formatDate(program.operationStart, '운영 시작일 확인 필요'),
    endDate: formatDate(
      program.operationEnd ?? program.deadlineDate,
      '운영 종료일 확인 필요',
    ),
  };
}

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
  };
}

function getVisiblePageNumbers(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) {
    return [];
  }

  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  if (currentPage <= 1) {
    return [0, 1, 2];
  }

  if (currentPage >= totalPages - 2) {
    return [totalPages - 3, totalPages - 2, totalPages - 1];
  }

  return [currentPage - 1, currentPage, currentPage + 1];
}

export default function RecruitingScreen({
  onTabChange,
  onSearchClick,
  onNotificationClick,
  onProgramClick,
  initialFilter,
}: RecruitingScreenProps) {
  const [likedPrograms, setLikedPrograms] = useState<number[]>([]);
  const [bookmarkLoadingIds, setBookmarkLoadingIds] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (initialFilter) {
      setActiveFilter((initialFilter as FilterKey) ?? 'all');
      setCurrentPage(0);
    }
  }, [initialFilter]);

  const [programs, setPrograms] = useState<RecruitingProgram[]>([]);
  const [programLoading, setProgramLoading] = useState(false);
  const [programErrorMessage, setProgramErrorMessage] = useState('');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterCounts, setFilterCounts] = useState<Record<FilterKey, number>>({
    all: 0,
    urgent: 0,
    free: 0,
    online: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchBookmarks = async () => {
      try {
        const bookmarks = await mypageApi.getBookmarkList();

        if (!cancelled) {
          setLikedPrograms(bookmarks.map(item => item.programId));
        }
      } catch (error) {
        console.error('북마크 목록 조회 실패', error);
      }
    };

    fetchBookmarks();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchPrograms = async () => {
      setProgramLoading(true);
      setProgramErrorMessage('');

      try {
        const response = await getPrograms({
          status: 'RECRUITING',
          filter: FILTER_TO_SERVER_FILTER[activeFilter],
          page: currentPage,
          size: PAGE_SIZE,
        });

        if (!cancelled) {
          setPrograms(response.data.content.map(toRecruitingProgram));
          setTotalElements(response.data.totalElements);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error('모집중 프로그램 조회 실패', error);

        if (!cancelled) {
          setPrograms([]);
          setTotalElements(0);
          setTotalPages(0);
          setProgramErrorMessage(
            '모집중 프로그램을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
          );
        }
      } finally {
        if (!cancelled) {
          setProgramLoading(false);
        }
      }
    };

    fetchPrograms();

    return () => {
      cancelled = true;
    };
  }, [activeFilter, currentPage]);

  useEffect(() => {
    let cancelled = false;

    const fetchFilterCounts = async () => {
      try {
        const entries = await Promise.all(
          FILTERS.map(async ({ key }) => {
            const response = await getPrograms({
              status: 'RECRUITING',
              filter: FILTER_TO_SERVER_FILTER[key],
              page: 0,
              size: 1,
            });

            return [key, response.data.totalElements] as const;
          }),
        );

        if (!cancelled) {
          const nextCounts: Record<FilterKey, number> = {
            all: 0,
            urgent: 0,
            free: 0,
            online: 0,
                  };

          entries.forEach(([key, value]) => {
            nextCounts[key] = value;
          });

          setFilterCounts(nextCounts);
        }
      } catch (error) {
        console.error('모집중 필터 카운트 조회 실패', error);
      }
    };

    fetchFilterCounts();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPrograms = programs;

  const heroStats = [
    {
      key: 'all',
      value: filterCounts.all,
      label: '전체',
      color: PALETTE.text,
    },
    {
      key: 'urgent',
      value: filterCounts.urgent,
      label: '마감임박',
      color: PALETTE.coralDark,
    },
    {
      key: 'free',
      value: filterCounts.free,
      label: '무료',
      color: PALETTE.greenDark,
    },
    {
      key: 'online',
      value: filterCounts.online,
      label: '온라인',
      color: PALETTE.blueDark,
    },
  ];

  const toggleLike = async (id: number) => {
    if (bookmarkLoadingIds.includes(id)) {
      return;
    }

    setBookmarkLoadingIds(prev => [...prev, id]);

    try {
      const result = await mypageApi.toggleBookmark(id);

      setLikedPrograms(prev => {
        const withoutCurrent = prev.filter(programId => programId !== id);

        return result.bookmarked ? [...withoutCurrent, id] : withoutCurrent;
      });
    } catch (error) {
      console.error('북마크 토글 실패', error);
    } finally {
      setBookmarkLoadingIds(prev => prev.filter(programId => programId !== id));
    }
  };

  const visiblePageNumbers = getVisiblePageNumbers(currentPage, totalPages);
  const hasPreviousPage = currentPage > 0;
  const hasNextPage = currentPage < totalPages - 1;
  const shouldShowPagination =
    !programLoading && !programErrorMessage && totalPages > 1;

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
                  onPress={() => {
                    setActiveFilter(filter.key);
                    setCurrentPage(0);
                  }}
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
          <Text style={styles.listCount}>총 {totalElements}개</Text>
        </View>

        <View style={styles.programList}>
          {programLoading && (
            <Text style={{ paddingVertical: 20, textAlign: 'center', color: PALETTE.subText, fontWeight: '700' }}>
              모집중 프로그램을 불러오는 중입니다.
            </Text>
          )}

          {!programLoading && programErrorMessage ? (
            <Text style={{ paddingVertical: 20, textAlign: 'center', color: PALETTE.coralDark, fontWeight: '700' }}>
              {programErrorMessage}
            </Text>
          ) : null}

          {!programLoading && !programErrorMessage && filteredPrograms.length === 0 ? (
            <Text style={{ paddingVertical: 20, textAlign: 'center', color: PALETTE.subText, fontWeight: '700' }}>
              조건에 맞는 모집중 프로그램이 없습니다.
            </Text>
          ) : null}

          {!programLoading && filteredPrograms.map(program => {
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
                    {program.imageUrl ? (
                      <Image
                        source={{ uri: program.imageUrl }}
                        style={{ width: '100%', height: '100%', borderRadius: 14 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image
                        source={require('../../../assets/default-program.png')}
                        style={{ width: '100%', height: '100%', borderRadius: 14 }}
                        resizeMode="cover"
                      />
                    )}
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
                    disabled={bookmarkLoadingIds.includes(program.id)}
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
                    <Text style={styles.statusLabel}>모집 상태</Text>
                    <Text style={styles.statusValue}>
                      {program.isOpen ? '신청 가능' : '마감'}
                    </Text>
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

          {shouldShowPagination && (
            <View style={styles.paginationSection}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  !hasPreviousPage && styles.paginationButtonDisabled,
                ]}
                activeOpacity={0.78}
                disabled={!hasPreviousPage}
                onPress={() => setCurrentPage(page => Math.max(page - 1, 0))}
              >
                <Text
                  style={[
                    styles.paginationButtonText,
                    !hasPreviousPage && styles.paginationButtonTextDisabled,
                  ]}
                >
                  이전
                </Text>
              </TouchableOpacity>

              <View style={styles.pageNumberRow}>
                {visiblePageNumbers.map(pageNumber => {
                  const isCurrentPage = pageNumber === currentPage;

                  return (
                    <TouchableOpacity
                      key={pageNumber}
                      style={[
                        styles.pageNumberButton,
                        isCurrentPage && styles.pageNumberButtonActive,
                      ]}
                      activeOpacity={0.78}
                      disabled={isCurrentPage}
                      onPress={() => setCurrentPage(pageNumber)}
                    >
                      <Text
                        style={[
                          styles.pageNumberText,
                          isCurrentPage && styles.pageNumberTextActive,
                        ]}
                      >
                        {pageNumber + 1}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  !hasNextPage && styles.paginationButtonDisabled,
                ]}
                activeOpacity={0.78}
                disabled={!hasNextPage}
                onPress={() =>
                  setCurrentPage(page => Math.min(page + 1, totalPages - 1))
                }
              >
                <Text
                  style={[
                    styles.paginationButtonText,
                    !hasNextPage && styles.paginationButtonTextDisabled,
                  ]}
                >
                  다음
                </Text>
              </TouchableOpacity>
            </View>
          )}

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
    paddingBottom: 52,
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

  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  statusValue: {
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
  paginationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingTop: 0,
    paddingBottom: 10,
  },
  paginationButton: {
    minWidth: 54,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
  },
  paginationButtonDisabled: {
    opacity: 0.4,
  },
  paginationButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: PALETTE.text,
  },
  paginationButtonTextDisabled: {
    color: PALETTE.muted,
  },
  pageNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageNumberButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
  },
  pageNumberButtonActive: {
    borderColor: PALETTE.yellow,
    backgroundColor: '#FFF8E1',
  },
  pageNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: PALETTE.subText,
  },
  pageNumberTextActive: {
    color: PALETTE.text,
  },

});