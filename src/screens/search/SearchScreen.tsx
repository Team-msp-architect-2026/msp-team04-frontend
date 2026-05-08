import React, { useMemo, useState } from 'react';
import {
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
  imageUrl: string;
}

const INITIAL_RECENT_SEARCHES = [
  '강남 미술 수업',
  '소규모 음악 교실',
  '만 3세 영어',
  '아이돌봄 서비스',
];

const AI_SUGGESTIONS = [
  '선생님 피드백 좋은 소규모 미술 수업',
  '집 근처 무료 공공 프로그램',
  '주말에 가능한 창의력 수업',
  '언어 자극에 도움되는 독서 프로그램',
];

const QUICK_CONDITIONS = [
  '무료 프로그램',
  '주말 수업',
  '집 근처',
  '소규모 수업',
  '3~5세',
  '공공기관',
];

const SEARCH_RESULTS: SearchResult[] = [
  {
    id: 1,
    title: '창의력 쑥쑥 미술 놀이',
    category: '미술',
    type: 'private',
    organization: '아트키즈 스튜디오',
    location: '강남구 역삼동',
    address: '서울 강남구 역삼동 123-4',
    distance: '1.2km',
    price: '월 9만원',
    priceValue: 90000,
    rating: 4.9,
    reviewCount: 128,
    ageRange: '만 3~6세',
    schedule: '토요일 10:00',
    score: 97,
    match: 97,
    matchRate: 97,
    isOpen: true,
    tags: ['미술', '소규모', '창의력', '선생님 피드백'],
    description:
      '아이의 창의력과 소근육 발달을 함께 키울 수 있는 소규모 미술 프로그램입니다. 선생님이 아이별 성향을 관찰하며 피드백을 제공합니다.',
    curriculum: [
      '색채 감각 놀이',
      '클레이 만들기',
      '수채화 기초',
      '작품 발표와 피드백',
    ],
    contact: '02-1234-5678',
    website: 'https://example.com/artkids',
    capacity: 8,
    enrolled: 5,
    startDate: '2026.05.01',
    endDate: '2026.06.30',
    isPartner: true,
    aiReason:
      '소규모 수업과 선생님 피드백을 원하는 조건에 잘 맞는 미술 프로그램입니다.',
    reviewChips: ['선생님 친절', '소규모 수업', '피드백 좋음'],
    imageUrl:
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    title: '소근육 발달 클레이 아트',
    category: '미술',
    type: 'private',
    organization: '키즈아트랩',
    location: '강남구 청담동',
    address: '서울 강남구 청담동 55-1',
    distance: '2.1km',
    price: '월 8만원',
    priceValue: 80000,
    rating: 4.7,
    reviewCount: 96,
    ageRange: '만 3~5세',
    schedule: '일요일 11:00',
    score: 89,
    match: 89,
    matchRate: 89,
    isOpen: true,
    tags: ['미술', '클레이', '소근육', '오감발달'],
    description:
      '클레이와 다양한 재료를 활용해 아이의 소근육과 표현력을 키우는 미술 활동 프로그램입니다.',
    curriculum: [
      '클레이 촉감 놀이',
      '동물 만들기',
      '색 조합 활동',
      '작품 정리와 발표',
    ],
    contact: '02-2345-6789',
    website: 'https://example.com/kidsartlab',
    capacity: 10,
    enrolled: 6,
    startDate: '2026.05.03',
    endDate: '2026.07.05',
    isPartner: false,
    aiReason:
      '만 3세 아이의 소근육 발달과 미술 흥미 형성에 적합한 프로그램입니다.',
    reviewChips: ['오감발달', '재료 다양', '아이가 좋아함'],
    imageUrl:
      'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=400&h=300&fit=crop',
  },
  {
    id: 3,
    title: '수채화 기초 클래스',
    category: '미술',
    type: 'private',
    organization: '작은화실',
    location: '강남구 논현동',
    address: '서울 강남구 논현동 88-7',
    distance: '2.8km',
    price: '월 10만원',
    priceValue: 100000,
    rating: 4.6,
    reviewCount: 74,
    ageRange: '만 5~8세',
    schedule: '수요일 16:00',
    score: 84,
    match: 84,
    matchRate: 84,
    isOpen: true,
    tags: ['미술', '수채화', '기초', '창의력'],
    description:
      '수채화의 기본 표현법을 배우며 아이가 자유롭게 색과 형태를 탐색할 수 있는 기초 클래스입니다.',
    curriculum: [
      '물감 사용법',
      '색 번짐 표현',
      '사물 그리기',
      '나만의 작품 완성',
    ],
    contact: '02-3456-7890',
    website: 'https://example.com/smallatelier',
    capacity: 8,
    enrolled: 4,
    startDate: '2026.05.08',
    endDate: '2026.07.10',
    isPartner: false,
    aiReason:
      '창의력 표현과 미술 기초를 함께 경험할 수 있어 미술 관심이 있는 아이에게 적합합니다.',
    reviewChips: ['차분한 분위기', '기초 탄탄', '소수정예'],
    imageUrl:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
  },
];

export default function SearchScreen({
  onBack,
  onSelectProgram,
  initialQuery = '',
  initialSearched = false,
  onSearchStateChange,
}: SearchScreenProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searched, setSearched] = useState(initialSearched);
  const [recentSearches, setRecentSearches] = useState(INITIAL_RECENT_SEARCHES);

  const trimmedQuery = query.trim();

  const resultCountLabel = useMemo(() => {
    if (!trimmedQuery) {
      return '';
    }

    return `"${trimmedQuery}" 검색 결과 ${SEARCH_RESULTS.length}개`;
  }, [trimmedQuery]);

  const handleSearch = (value?: string) => {
    const nextQuery = (value ?? query).trim();

    if (!nextQuery) {
      return;
    }

    setQuery(nextQuery);
    setSearched(true);
    onSearchStateChange?.({ query: nextQuery, searched: true });
    setRecentSearches(prev =>
      [nextQuery, ...prev.filter(item => item !== nextQuery)].slice(0, 6),
    );
  };

  const handleClear = () => {
    setQuery('');
    setSearched(false);
    onSearchStateChange?.({ query: '', searched: false });
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
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

              {recentSearches.length > 0 ? (
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
                {AI_SUGGESTIONS.map(item => (
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
                AI 매칭률 높은 순으로 보여드려요
              </Text>
            </View>

            {SEARCH_RESULTS.length > 0 ? (
              <View style={styles.resultList}>
                {SEARCH_RESULTS.map(program => (
                  <TouchableOpacity
                    key={program.id}
                    style={styles.resultCard}
                    onPress={() => handleSelectProgram(program)}
                    activeOpacity={0.84}
                  >
                    <Image
                      source={{ uri: program.imageUrl }}
                      style={styles.resultImage}
                    />

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
                          <Text style={styles.ratingText}>{program.rating}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
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
});