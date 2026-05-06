import React, { useState } from 'react';
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
import { colors } from '../constants';

interface SearchScreenProps {
  onBack: () => void;
  onSelectProgram?: () => void;
}

const RECENT_SEARCHES = ['강남 미술 수업', '소규모 음악 교실', '만 3세 영어', '아이돌봄 서비스'];

const AI_SUGGESTIONS = [
  '강남 근처 선생님 피드백 좋은 소규모 미술 수업',
  '만 3세 언어발달에 도움되는 독서 프로그램',
  '주말에 할 수 있는 체육 수업',
  '집에서 가까운 영어 유치원',
];

const SEARCH_RESULTS = [
  { id: 1, title: '창의력 쑥쑥 미술 놀이',   category: '미술', location: '강남구 역삼동', price: '월 9만원',  rating: 4.9, match: 97, imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop' },
  { id: 2, title: '소근육 발달 클레이 아트', category: '미술', location: '강남구 청담동', price: '월 8만원',  rating: 4.7, match: 89, imageUrl: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=400&h=300&fit=crop' },
  { id: 3, title: '수채화 기초 클래스',       category: '미술', location: '강남구 논현동', price: '월 10만원', rating: 4.6, match: 84, imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop' },
];

export default function SearchScreen({ onBack, onSelectProgram }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [isAI, setIsAI] = useState(false);
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);

  const handleSearch = (q?: string) => {
    const searchQuery = q ?? query;
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setIsAI(searchQuery.length > 10);
    setSearched(true);
    setRecentSearches((prev) =>
      [searchQuery, ...prev.filter((s) => s !== searchQuery)].slice(0, 6)
    );
  };

  const handleClear = () => {
    setQuery('');
    setSearched(false);
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>검색</Text>
        <View style={s.headerBtn} />
      </View>

      {/* 검색창 영역 */}
      <View style={s.searchBox}>
        <View style={s.inputWrapper}>
          <Ionicons name="search" size={16} color="#aaa" style={s.searchIcon} />
          <TextInput
            style={s.input}
            placeholder="AI 자연어 검색: '강남 소규모 미술 수업'"
            placeholderTextColor="#aaa"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={s.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        {/* AI 뱃지 */}
        <View style={s.aiBadgeRow}>
          <View style={s.aiBadge}>
            <Text style={s.aiBadgeIcon}>✦</Text>
            <Text style={s.aiBadgeText}>AI 의미 검색 활성화</Text>
          </View>
          <Text style={s.aiHint}>자연어로 검색해보세요</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!searched ? (
          /* ── 검색 전 ── */
          <View style={s.gap24}>

            {/* 최근 검색어 */}
            <View>
              <View style={s.rowBetween}>
                <Text style={s.sectionTitle}>최근 검색어</Text>
                <TouchableOpacity onPress={() => setRecentSearches([])}>
                  <Text style={s.clearAllText}>전체 삭제</Text>
                </TouchableOpacity>
              </View>
              <View style={s.chipWrap}>
                {recentSearches.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={s.recentChip}
                    onPress={() => handleSearch(item)}
                  >
                    <Ionicons name="time-outline" size={13} color="#aaa" />
                    <Text style={s.recentChipText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* AI 추천 검색어 */}
            <View>
              <View style={s.aiSuggestHeader}>
                <View style={s.aiSuggestBadge}>
                  <Text style={s.aiSuggestBadgeText}>✦ AI 추천 검색어</Text>
                </View>
              </View>
              <View style={s.gap8}>
                {AI_SUGGESTIONS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={s.aiSuggestItem}
                    onPress={() => handleSearch(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={s.aiSuggestIcon}>✦</Text>
                    <Text style={s.aiSuggestText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : (
          /* ── 검색 후 ── */
          <View style={s.gap12}>

            {/* AI 분석 배너 */}
            {isAI && (
              <View style={s.aiAnalyzeBanner}>
                <Text style={s.aiAnalyzeIcon}>✦</Text>
                <Text style={s.aiAnalyzeText}>
                  AI가 "{query}"를 분석해서 관련 프로그램을 찾았어요
                </Text>
              </View>
            )}

            {/* 결과 수 */}
            <Text style={s.resultCount}>
              "<Text style={s.resultQuery}>{query}</Text>" 검색 결과 {SEARCH_RESULTS.length}개
            </Text>

            {/* 결과 목록 */}
            {SEARCH_RESULTS.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={s.resultCard}
                onPress={onSelectProgram}
                activeOpacity={0.7}
              >
                <Image source={{ uri: p.imageUrl }} style={s.resultImage} />
                <View style={s.resultInfo}>
                  {/* 배지 행 */}
                  <View style={s.resultBadgeRow}>
                    <View style={s.categoryBadge}>
                      <Text style={s.categoryBadgeText}>{p.category}</Text>
                    </View>
                    <View style={s.matchBadge}>
                      <Text style={s.matchBadgeText}>✦ {p.match}%</Text>
                    </View>
                  </View>
                  {/* 제목 */}
                  <Text style={s.resultTitle} numberOfLines={1}>{p.title}</Text>
                  {/* 위치 */}
                  <Text style={s.resultLocation}>📍 {p.location}</Text>
                  {/* 가격 + 별점 */}
                  <View style={s.resultBottom}>
                    <Text style={s.resultPrice}>{p.price}</Text>
                    <View style={s.ratingRow}>
                      <Text style={s.ratingStar}>★</Text>
                      <Text style={s.ratingText}>{p.rating}</Text>
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
  container: { flex: 1, backgroundColor: '#fff' },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },

  // 검색창
  searchBox: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 50,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: '#2D3748' },
  clearBtn: { padding: 4 },

  // AI 뱃지
  aiBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },
  aiBadgeIcon: { fontSize: 11, color: '#3182CE' },
  aiBadgeText: { fontSize: 11, fontWeight: '700', color: '#1A365D' },
  aiHint: { fontSize: 11, color: '#A0AEC0' },

  // 스크롤
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  // 공통 레이아웃
  gap24: { gap: 24 },
  gap12: { gap: 12 },
  gap8: { gap: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1A202C' },
  clearAllText: { fontSize: 12, color: '#A0AEC0' },

  // 최근 검색어 칩
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F9F9F9',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  recentChipText: { fontSize: 13, fontWeight: '500', color: '#4A5568' },

  // AI 추천 검색어
  aiSuggestHeader: { marginBottom: 12 },
  aiSuggestBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fde584',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#eecb64',
  },
  aiSuggestBadgeText: { fontSize: 11, fontWeight: '700', color: '#795b0e' },
  aiSuggestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  aiSuggestIcon: { fontSize: 14, color: '#d4a800' },
  aiSuggestText: { fontSize: 13, fontWeight: '500', color: '#413108', flex: 1 },

  // AI 분석 배너
  aiAnalyzeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EBF8FF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },
  aiAnalyzeIcon: { fontSize: 13, color: '#3182CE' },
  aiAnalyzeText: { fontSize: 12, fontWeight: '700', color: '#1A365D', flex: 1 },

  // 결과 수
  resultCount: { fontSize: 13, color: '#A0AEC0' },
  resultQuery: { fontWeight: '600', color: '#2D3748' },

  // 결과 카드
  resultCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    padding: 14,
  },
  resultImage: { width: 64, height: 64, borderRadius: 12 },
  resultInfo: { flex: 1 },
  resultBadgeRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  categoryBadge: {
    backgroundColor: '#FFF3CD',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryBadgeText: { fontSize: 10, fontWeight: '700', color: '#F9A825' },
  matchBadge: {
    backgroundColor: '#EBF8FF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },
  matchBadgeText: { fontSize: 10, fontWeight: '700', color: '#3182CE' },
  resultTitle: { fontSize: 14, fontWeight: '700', color: '#1A202C' },
  resultLocation: { fontSize: 11, color: '#718096', marginTop: 2 },
  resultBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  resultPrice: { fontSize: 13, fontWeight: '700', color: '#1A202C' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingStar: { fontSize: 11, color: '#F9A825' },
  ratingText: { fontSize: 11, fontWeight: '600', color: '#2D3748' },
});