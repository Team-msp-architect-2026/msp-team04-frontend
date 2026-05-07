import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';

interface SavedProgram {
  id: number;
  title: string;
  organization: string;
  location: string;
  price: string;
  rating: number;
  isOpen: boolean;
  emoji: string;
}

interface SavedListScreenProps {
  onBack: () => void;
}

const MOCK_SAVED_PROGRAMS: SavedProgram[] = [
  { id: 1, title: '구립 어린이 창의교실', organization: '서울시 교육청', location: '서울 강남구 역삼동', price: '무료', rating: 4.8, isOpen: true, emoji: '🎨' },
  { id: 2, title: '키즈 영어 스피킹 클래스', organization: '스마트 에듀', location: '서울 강남구 삼성동', price: '월 15만원', rating: 4.6, isOpen: true, emoji: '🗣️' },
  { id: 3, title: '초등 코딩 부트캠프', organization: '코드키즈', location: '온라인', price: '월 8만원', rating: 4.5, isOpen: false, emoji: '💻' },
  { id: 4, title: '아이돌봄 서비스', organization: '여성가족부', location: '가정 방문', price: '시간당 1,150원~', rating: 4.7, isOpen: true, emoji: '🏠' },
  { id: 5, title: '유아 발레 클래스', organization: '아트발레', location: '서울 서초구', price: '월 12만원', rating: 4.4, isOpen: true, emoji: '🩰' },
];

export default function SavedListScreen({ onBack }: SavedListScreenProps) {
  const [savedPrograms, setSavedPrograms] = useState(MOCK_SAVED_PROGRAMS);

  const handleRemove = (id: number) => {
    setSavedPrograms(prev => prev.filter(p => p.id !== id));
  };

  return (
    <SafeAreaView style={s.root}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>저장 목록</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {savedPrograms.length > 0 ? (
          <View style={s.list}>
            {savedPrograms.map(program => (
              <View key={program.id} style={s.card}>
                <View style={s.cardRow}>
                  {/* 이미지 영역 */}
                  <View style={s.cardImageWrap}>
                    <View style={[s.cardImage, { backgroundColor: program.isOpen ? '#FFF9E6' : '#F3F4F6' }]}>
                      <Text style={{ fontSize: 36 }}>{program.emoji}</Text>
                    </View>
                    {!program.isOpen && (
                      <View style={s.closedOverlay}>
                        <Text style={s.closedText}>마감</Text>
                      </View>
                    )}
                  </View>

                  {/* 내용 */}
                  <View style={s.cardContent}>
                    <Text style={s.cardTitle} numberOfLines={1}>{program.title}</Text>
                    <Text style={s.cardOrg}>{program.organization}</Text>
                    <View style={s.cardMeta}>
                      <View style={s.metaItem}>
                        <Ionicons name="location" size={11} color="#888" />
                        <Text style={s.metaText}>{program.location.split(' ').slice(-1)}</Text>
                      </View>
                      <View style={s.metaItem}>
                        <Ionicons name="wallet" size={11} color="#888" />
                        <Text style={s.metaText}>{program.price}</Text>
                      </View>
                    </View>
                    <View style={s.ratingRow}>
                      <Text style={{ fontSize: 11 }}>⭐</Text>
                      <Text style={s.ratingText}>{program.rating}</Text>
                    </View>
                  </View>

                  {/* 좋아요 버튼 */}
                  <TouchableOpacity style={s.likeBtn} onPress={() => handleRemove(program.id)}>
                    <Text style={{ fontSize: 20 }}>❤️</Text>
                  </TouchableOpacity>
                </View>

                {/* 신청 버튼 */}
                <View style={s.cardFooter}>
                  <TouchableOpacity
                    style={[s.applyBtn, !program.isOpen && s.applyBtnDisabled]}
                    disabled={!program.isOpen}
                  >
                    <Text style={[s.applyBtnText, !program.isOpen && s.applyBtnTextDisabled]}>
                      {program.isOpen ? '신청하기' : '모집 마감'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🤍</Text>
            <Text style={s.emptyText}>저장한 프로그램이 없습니다</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },

  scroll: { padding: 16, paddingBottom: 40 },
  list: { gap: 12 },

  card: { borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },

  cardImageWrap: { width: 112, height: 112, position: 'relative' },
  cardImage: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  closedOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  closedText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  cardContent: { flex: 1, padding: 12, gap: 4 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  cardOrg: { fontSize: 12, color: '#888' },
  cardMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, color: '#888' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#1A1A1A' },

  likeBtn: { width: 44, alignItems: 'center', justifyContent: 'center' },

  cardFooter: { borderTopWidth: 1, borderTopColor: '#F0F0F0', padding: 10 },
  applyBtn: { height: 38, borderRadius: 10, backgroundColor: colors.primary.default, alignItems: 'center', justifyContent: 'center' },
  applyBtnDisabled: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  applyBtnText: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  applyBtnTextDisabled: { color: '#aaa' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 120 },
  emptyText: { fontSize: 14, color: '#888' },
});