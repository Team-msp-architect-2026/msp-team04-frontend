import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ProgramDetail } from '../program/ProgramDetailScreen';
import { searchApi, type SearchProgramItem } from '../../api/search';

interface SearchScreenState {
  query: string;
  searched: boolean;
}

interface SearchScreenProps {
  onBack: () => void;
  onSelectProgram?: (program: ProgramDetail) => void;
  initialQuery?: string;
  initialSearched?: boolean;
  onSearchStateChange?: (state: SearchScreenState) => void;
}

interface SearchResult extends ProgramDetail {
  category: string;
  match: number;
  imageUrl?: string | null;
}

const FALLBACK_AI_SUGGESTIONS = [
  '선생님 피드백 좋은 소규모 미술 수업',
  '집 근처 무료 공공 프로그램',
  '주말에 가능한 창의력 수업',
  '언어 자극에 도움되는 독서 프로그램',
];

const QUICK_CONDITIONS = [
  '무료 프로그램',
  '소규모',
  '공공기관',
  '주말 프로그램',
  '놀이',
];

const CATEGORY_LABELS: Record<string, string> = {
  EDUCATION: '교육',
  CARE: '돌봄',
  EXPERIENCE: '체험',
  SPORTS: '체육',
  ART: '미술',
  LANGUAGE: '언어',
  ETC: '기타',
};

const CLASS_TYPE_LABELS: Record<string, string> = {
  SMALL: '소규모',
  ONE_ON_ONE: '1:1',
  GROUP: '그룹',
  ONLINE: '온라인',
};

const formatPrice = (price: number, isFree: boolean) => {
  if (isFree || price === 0) {
    return '무료';
  }

  return `월 ${price.toLocaleString()}원`;
};

const formatAgeRange = (minAge: number | null, maxAge: number | null) => {
  if (minAge !== null && maxAge !== null) {
    return `만 ${minAge}~${maxAge}세`;
  }

  if (minAge !== null) {
    return `만 ${minAge}세 이상`;
  }

  if (maxAge !== null) {
    return `만 ${maxAge}세 이하`;
  }

  return '대상 연령 확인 필요';
};

const formatSchedule = (classType: string | null, deadlineDate: string | null) => {
  const classTypeLabel = classType
    ? CLASS_TYPE_LABELS[classType] ?? classType
    : '운영 방식 확인 필요';

  if (!deadlineDate) {
    return classTypeLabel;
  }

  return `${classTypeLabel} · ${deadlineDate.replace(/-/g, '.')} 마감`;
};

const calculateMatch = (item: SearchProgramItem, keyword: string) => {
  const lowerKeyword = keyword.trim().toLowerCase();

  const contains = (value?: string | null) =>
    !!value && value.toLowerCase().includes(lowerKeyword);

  if (contains(item.name)) {
    return 97;
  }

  if (item.tags.some(tag => contains(tag))) {
    return 94;
  }

  if (contains(item.institutionName)) {
    return 91;
  }

  if (contains(item.description)) {
    return 88;
  }

  if (contains(item.region) || contains(item.detailAddress)) {
    return 86;
  }

  return item.isRecruiting ? 84 : 76;
};

const mapSearchItemToProgramDetail = (
  item: SearchProgramItem,
  keyword: string,
): SearchResult => {
  const match = calculateMatch(item, keyword);
  const capacity = item.maxCapacity ?? 0;
  const remainCapacity = item.remainCapacity ?? 0;
  const enrolled =
    capacity > 0 && remainCapacity >= 0
      ? Math.max(capacity - remainCapacity, 0)
      : 0;

  const categoryLabel = CATEGORY_LABELS[item.category] ?? item.category;
  const tags = item.tags.length > 0 ? item.tags : [categoryLabel];

  return {
    id: item.id,
    title: item.name,
    category: categoryLabel,
    type: (item.isFree ? 'government' : 'private') as ProgramDetail['type'],
    organization: item.institutionName ?? '기관 정보 없음',
    location: item.region ?? '지역 정보 없음',
    address: item.detailAddress ?? item.region ?? '주소 정보 없음',
    distance: '-',
    price: formatPrice(item.price, item.isFree),
    priceValue: item.price,
    rating: item.ratingAvg ?? 0,
    reviewCount: item.reviewCount ?? 0,
    ageRange: formatAgeRange(item.targetAgeMin, item.targetAgeMax),
    schedule: formatSchedule(item.classType, item.deadlineDate),
    score: match,
    match,
    matchRate: match,
    isOpen: item.isRecruiting && remainCapacity > 0,
    tags,
    description:
      item.description ??
      `${item.institutionName ?? '운영 기관'}에서 운영하는 ${item.name} 프로그램입니다.`,
    curriculum: [
      '프로그램 소개 및 오리엔테이션',
      '아이 수준에 맞춘 참여형 활동',
      '주제별 실습 및 활동 진행',
      '마무리 활동 및 보호자 피드백',
    ],
    contact: '문의처 확인 필요',
    website: undefined,
    capacity,
    enrolled,
    startDate: '운영 시작일 확인 필요',
    endDate: item.deadlineDate
      ? item.deadlineDate.replace(/-/g, '.')
      : '운영 종료일 확인 필요',
    isPartner: true,
    aiReason: `"${keyword}" 검색 조건과 프로그램 정보가 잘 맞는 추천 프로그램입니다.`,
    reviewChips: tags.slice(0, 3),
    imageUrl: item.imageUrl,
  };
};

export default function SearchScreen({
  onBack,
  onSelectProgram,
  initialQuery = '',
  initialSearched = false,
  onSearchStateChange,
}: SearchScreenProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searched, setSearched] = useState(initialSearched);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [resultTotal, setResultTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recentLoading, setRecentLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const loadingMoreRef = useRef(false);

  const trimmedQuery = query.trim();
  const aiSuggestionKeywords =
    aiSuggestions.length > 0 ? aiSuggestions : FALLBACK_AI_SUGGESTIONS;

  const resultCountLabel = useMemo(() => {
    if (!trimmedQuery) {
      return '';
    }

    return `"${trimmedQuery}" 검색 결과 ${resultTotal}개`;
  }, [resultTotal, trimmedQuery]);

  const loadRecentSearches = async () => {
    try {
      setRecentLoading(true);
      const recentItems = await searchApi.getRecentSearches();
      setRecentSearches(recentItems.map(item => item.keyword));
    } catch (error) {
      console.warn('최근 검색어 조회 실패:', error);
    } finally {
      setRecentLoading(false);
    }
  };

  const loadSearchSuggestions = async () => {
    try {
      const suggestionItems = await searchApi.getSearchSuggestions();
      const keywords = suggestionItems
        .map(item => item.keyword.trim())
        .filter((keyword, index, array) => {
          return keyword.length > 0 && array.indexOf(keyword) === index;
        });

      setAiSuggestions(keywords);
    } catch (error) {
      console.warn('AI 추천 검색어 조회 실패:', error);
      setAiSuggestions([]);
    }
  };

  const runSearch = async (nextQuery: string) => {
    const normalizedQuery = nextQuery.trim();

    if (!normalizedQuery) {
      return;
    }

    try {
      loadingMoreRef.current = false;
      setLoading(true);
      setLoadingMore(false);
      setErrorMessage('');
      setQuery(normalizedQuery);
      setSearched(true);
      onSearchStateChange?.({ query: normalizedQuery, searched: true });

      const page = await searchApi.searchPrograms(normalizedQuery, 0, 10);
      const mappedResults = page.content.map(item =>
        mapSearchItemToProgramDetail(item, normalizedQuery),
      );

      setResults(mappedResults);
      setResultTotal(page.totalElements);
      setCurrentPage(page.number);
      setTotalPages(page.totalPages);
      await loadRecentSearches();
    } catch (error) {
      console.warn('검색 실패:', error);
      setResults([]);
      setResultTotal(0);
      setCurrentPage(0);
      setTotalPages(0);
      setErrorMessage('검색 결과를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreResults = async () => {
    const normalizedQuery = query.trim();
    const nextPage = currentPage + 1;

    if (
      !searched ||
      loading ||
      loadingMoreRef.current ||
      !normalizedQuery ||
      totalPages === 0 ||
      nextPage >= totalPages
    ) {
      return;
    }

    try {
      loadingMoreRef.current = true;
      setLoadingMore(true);
      setErrorMessage('');

      const page = await searchApi.searchPrograms(normalizedQuery, nextPage, 10);
      const mappedResults = page.content.map(item =>
        mapSearchItemToProgramDetail(item, normalizedQuery),
      );

      setResults(prevResults => {
        const existingIds = new Set(prevResults.map(item => item.id));
        const nextResults = mappedResults.filter(item => !existingIds.has(item.id));

        return [...prevResults, ...nextResults];
      });
      setResultTotal(page.totalElements);
      setCurrentPage(page.number);
      setTotalPages(page.totalPages);
    } catch (error) {
      console.warn('추가 검색 결과 조회 실패:', error);
      setErrorMessage('추가 검색 결과를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadRecentSearches();
    loadSearchSuggestions();

    if (initialSearched && initialQuery.trim()) {
      runSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (value?: string) => {
    runSearch(value ?? query);
  };

  const handleClear = () => {
    setQuery('');
    setSearched(false);
    setResults([]);
    setResultTotal(0);
    setErrorMessage('');
    onSearchStateChange?.({ query: '', searched: false });
  };

  const handleClearRecent = async () => {
    try {
      await searchApi.deleteRecentSearches();
      setRecentSearches([]);
    } catch (error) {
      console.warn('최근 검색어 삭제 실패:', error);
      setErrorMessage('최근 검색어를 삭제하지 못했어요.');
    }
  };

  const handleHeaderBack = () => {
    if (searched) {
      handleClear();
      return;
    }

    onBack();
  };

  const handleSelectProgram = (program: SearchResult) => {
    onSelectProgram?.(program);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleHeaderBack}
          activeOpacity={0.75}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} pointerEvents="none">
          검색
        </Text>

        <View style={styles.headerButton} />
      </View>

      <View style={[styles.searchArea, searched && styles.searchAreaSearched]}>
        <View style={styles.inputBox}>
          <Ionicons
            name="search-outline"
            size={17}
            color="#9AA4B2"
            style={styles.inputIcon}
          />

          <TextInput
            style={styles.input}
            placeholder="선생님 피드백 좋은 소규모 미술 수업"
            placeholderTextColor="#A8B0BD"
            value={query}
            onChangeText={value => {
              setQuery(value);

              if (!value.trim()) {
                setSearched(false);
                setResults([]);
                setResultTotal(0);
                setErrorMessage('');
                onSearchStateChange?.({ query: '', searched: false });
                return;
              }

              onSearchStateChange?.({ query: value, searched });
            }}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
            autoCorrect={false}
            clearButtonMode="never"
          />

          {query.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color="#C5CCD6" />
            </TouchableOpacity>
          )}
        </View>

        {!searched && (
          <View style={styles.aiGuideRow}>
            <View style={styles.aiGuideBadge}>
              <Text style={styles.aiGuideBadgeText}>AI 의미 검색</Text>
            </View>
            <Text style={styles.aiGuideText}>
              문장으로 입력해도 조건을 이해해서 찾아줘요
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          searched && styles.resultScrollContent,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={400}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isNearBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 120;

          if (isNearBottom) {
            loadMoreResults();
          }
        }}
      >
        {!searched ? (
          <View style={styles.readyContent}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>최근 검색어</Text>

                {recentSearches.length > 0 && (
                  <TouchableOpacity
                    onPress={handleClearRecent}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.clearAllText}>전체 삭제</Text>
                  </TouchableOpacity>
                )}
              </View>

              {recentLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#94A3B8" />
                  <Text style={styles.loadingText}>최근 검색어 불러오는 중</Text>
                </View>
              ) : recentSearches.length > 0 ? (
                <View style={styles.chipWrap}>
                  {recentSearches.map(item => (
                    <TouchableOpacity
                      key={item}
                      style={styles.recentChip}
                      onPress={() => handleSearch(item)}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="time-outline" size={13} color="#A8B0BD" />
                      <Text style={styles.recentChipText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptySmallText}>최근 검색어가 없어요</Text>
              )}
            </View>

            {errorMessage.length > 0 && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            <View style={styles.section}>
              <View style={styles.aiHeader}>
                <View>
                  <Text style={styles.sectionTitle}>AI 추천 검색어</Text>
                  <Text style={styles.sectionDesc}>
                    아이 조건과 검색 흐름에 맞춰 제안해요
                  </Text>
                </View>

                <View style={styles.aiMiniBadge}>
                  <Text style={styles.aiMiniBadgeText}>AI</Text>
                </View>
              </View>

              <View style={styles.suggestionList}>
                {aiSuggestionKeywords.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={styles.suggestionItem}
                    onPress={() => handleSearch(item)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.suggestionDot} />

                    <Text style={styles.suggestionText} numberOfLines={1}>
                      {item}
                    </Text>

                    <Ionicons name="chevron-forward" size={15} color="#C5CCD6" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>자주 찾는 조건</Text>

              <View style={styles.conditionGrid}>
                {QUICK_CONDITIONS.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={styles.conditionChip}
                    onPress={() => handleSearch(item)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.conditionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.resultContent}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultCount}>{resultCountLabel}</Text>
              <Text style={styles.resultGuide}>
                검색 조건과 관련도가 높은 순으로 보여드려요
              </Text>
            </View>

            {errorMessage.length > 0 && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            {loading ? (
              <View style={styles.loadingResult}>
                <ActivityIndicator size="small" color="#1479B8" />
                <Text style={styles.loadingText}>검색 결과 불러오는 중</Text>
              </View>
            ) : results.length > 0 ? (
              <>
                <View style={styles.resultList}>
                  {results.map(program => (
                  <TouchableOpacity
                    key={program.id}
                    style={styles.resultCard}
                    onPress={() => handleSelectProgram(program)}
                    activeOpacity={0.84}
                  >
                    {program.imageUrl ? (
                      <Image
                        source={{ uri: program.imageUrl }}
                        style={styles.resultImage}
                      />
                    ) : (
                      <View style={styles.resultImagePlaceholder}>
                        <Ionicons name="image-outline" size={24} color="#CBD5E1" />
                      </View>
                    )}

                    <View style={styles.resultInfo}>
                      <View style={styles.resultTitleRow}>
                        <Text style={styles.resultTitle} numberOfLines={1}>
                          {program.title}
                        </Text>

                        <View style={styles.matchBadge}>
                          <Text style={styles.matchBadgeText}>{program.match}%</Text>
                        </View>
                      </View>

                      <View style={styles.resultMetaRow}>
                        <Text style={styles.categoryText}>{program.category}</Text>
                        <Text style={styles.dotDivider}>·</Text>
                        <Text style={styles.resultSub} numberOfLines={1}>
                          {program.organization} · {program.location}
                        </Text>
                      </View>

                      <View style={styles.resultBottom}>
                        <Text style={styles.resultPrice}>{program.price}</Text>

                        <View style={styles.ratingRow}>
                          <Text style={styles.ratingStar}>★</Text>
                          <Text style={styles.ratingText}>
                            {program.rating.toFixed(1)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                  ))}
                </View>

                {loadingMore && (
                  <View style={styles.loadingMoreRow}>
                    <ActivityIndicator size="small" color="#1479B8" />
                    <Text style={styles.loadingText}>검색 결과 더 불러오는 중</Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyResult}>
                <Ionicons name="search-outline" size={32} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>검색 결과가 없어요</Text>
                <Text style={styles.emptyDesc}>
                  다른 지역이나 조건으로 다시 검색해보세요.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 52,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
    zIndex: 1,
  },

  searchArea: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },

  searchAreaSearched: {
    paddingBottom: 8,
  },

  inputBox: {
    height: 46,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#DDE5EE',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  inputIcon: {
    marginRight: 8,
  },

  input: {
    flex: 1,
    height: 46,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: -0.2,
  },

  clearButton: {
    paddingLeft: 8,
    paddingVertical: 6,
  },

  aiGuideRow: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  aiGuideBadge: {
    height: 25,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: '#EAF8FF',
    justifyContent: 'center',
  },

  aiGuideBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1479B8',
  },

  aiGuideText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#A0AEC0',
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 42,
  },

  resultScrollContent: {
    paddingTop: 12,
  },

  readyContent: {
    gap: 34,
  },

  resultContent: {
    gap: 10,
  },

  section: {
    gap: 13,
  },

  sectionHeader: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.2,
  },

  sectionDesc: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#A0AEC0',
  },

  clearAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A0AEC0',
  },

  emptySmallText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A0AEC0',
  },

  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  recentChip: {
    minHeight: 34,
    paddingHorizontal: 13,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  recentChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },

  aiHeader: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },

  aiMiniBadge: {
    height: 24,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5EAF0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiMiniBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
  },

  suggestionList: {
    gap: 9,
  },

  suggestionItem: {
    minHeight: 43,
    paddingHorizontal: 13,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E9EEF5',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  suggestionDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D9B84F',
  },

  suggestionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#3D4451',
    letterSpacing: -0.15,
  },

  conditionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  conditionChip: {
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    justifyContent: 'center',
  },

  conditionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },

  resultHeader: {
    minHeight: 35,
    justifyContent: 'center',
  },

  resultCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },

  resultGuide: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '600',
    color: '#A0AEC0',
  },

  resultList: {
    gap: 11,
  },

  resultCard: {
    minHeight: 96,
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    gap: 11,
    shadowColor: '#111827',
    shadowOpacity: 0.035,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  resultImage: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },

  resultImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultInfo: {
    flex: 1,
    minHeight: 72,
    justifyContent: 'space-between',
  },

  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  resultTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
    color: '#1F2937',
    letterSpacing: -0.25,
  },

  matchBadge: {
    height: 23,
    minWidth: 43,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#EAF8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  matchBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1479B8',
  },

  resultMetaRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C57A00',
  },

  dotDivider: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
  },

  resultSub: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },

  resultBottom: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  resultPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  ratingStar: {
    fontSize: 11,
    color: '#F9A825',
  },

  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
  },

  loadingMoreRow: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  emptyResult: {
    marginTop: 58,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '900',
    color: '#334155',
  },

  emptyDesc: {
    marginTop: 6,
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },

  loadingRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  loadingResult: {
    marginTop: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },

  errorText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    color: '#EF4444',
  },
});
