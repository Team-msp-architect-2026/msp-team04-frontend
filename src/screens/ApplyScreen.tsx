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
import { colors } from '../constants';

interface Program {
  id: number;
  title: string;
  organization: string;
  location: string;
  deadline: string;
  urgency: 'urgent' | 'soon' | 'normal';
  price: string;
  spotsLeft: number;
}

interface ApplyScreenProps {
  onTabChange: (tab: string) => void;
}

const URGENCY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  urgent: { bg: '#FEE2E2', text: '#C53030', label: '마감임박' },
  soon:   { bg: '#FFF3CD', text: '#d4a800', label: '곧 마감' },
  normal: { bg: '#F3F4F6', text: '#718096', label: '신청중' },
};

const AVAILABLE_PROGRAMS: Program[] = [
  { id: 1, title: '2024 여름방학 영어캠프', organization: '서울시 교육청', location: '서울 강남구', deadline: 'D-2', urgency: 'urgent', price: '무료', spotsLeft: 3 },
  { id: 2, title: '초등 코딩 교실 (2기)', organization: '강남구청', location: '서울 강남구 삼성동', deadline: 'D-5', urgency: 'soon', price: '월 5만원', spotsLeft: 8 },
  { id: 3, title: '유아 발레 클래스', organization: '아트발레', location: '서울 서초구', deadline: 'D-7', urgency: 'normal', price: '월 12만원', spotsLeft: 15 },
  { id: 4, title: '방과후 돌봄 교실', organization: '송파구청', location: '서울 송파구', deadline: 'D-3', urgency: 'urgent', price: '무료', spotsLeft: 2 },
  { id: 5, title: '아이 미술 교실', organization: '아트키즈', location: '서울 마포구', deadline: 'D-10', urgency: 'normal', price: '월 8만원', spotsLeft: 20 },
  { id: 6, title: '수학 창의력 캠프', organization: '수학나라', location: '서울 강동구', deadline: 'D-4', urgency: 'soon', price: '10만원', spotsLeft: 5 },
];

export default function ApplyScreen({ onTabChange }: ApplyScreenProps) {
  const [likedPrograms, setLikedPrograms] = useState<number[]>([]);
  const [filter, setFilter] = useState<'all' | 'urgent'>('all');

  const toggleLike = (id: number) => {
    setLikedPrograms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const filteredPrograms = filter === 'urgent'
    ? AVAILABLE_PROGRAMS.filter(p => p.urgency === 'urgent' || p.urgency === 'soon')
    : AVAILABLE_PROGRAMS;

  return (
    <SafeAreaView style={s.root}>
      {/* 헤더 */}
      <View style={s.header}>
        <Text style={s.logo}>MoMent</Text>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.iconBtn}>
            <Ionicons name="search" size={22} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn}>
            <Ionicons name="notifications" size={22} color="#666" />
            <View style={s.badge} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* 타이틀 */}
        <View style={s.titleSection}>
          <Text style={s.title}>지금 신청 가능한 프로그램</Text>
          <Text style={s.subtitle}>마감 전에 서둘러 신청하세요</Text>
        </View>

        {/* 필터 */}
        <View style={s.filterRow}>
          <TouchableOpacity
            style={[s.filterBtn, filter === 'all' && s.filterBtnActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[s.filterBtnText, filter === 'all' && s.filterBtnTextActive]}>전체</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.filterBtn, filter === 'urgent' && s.filterBtnUrgent]}
            onPress={() => setFilter('urgent')}
          >
            <Text style={[s.filterBtnText, filter === 'urgent' && s.filterBtnUrgentText]}>마감임박</Text>
          </TouchableOpacity>
        </View>

        {/* 프로그램 목록 */}
        <View style={s.list}>
          {filteredPrograms.map(program => {
            const urgency = URGENCY_STYLES[program.urgency];
            const liked = likedPrograms.includes(program.id);
            return (
              <View key={program.id} style={s.card}>
                <View style={s.cardRow}>
                  {/* 이미지 영역 */}
                  <View style={s.cardImageWrap}>
                    <View style={[s.cardImage, { backgroundColor: program.urgency === 'urgent' ? '#FFE9E9' : program.urgency === 'soon' ? '#FFF9E6' : '#EBF8FF' }]}>
                      <Text style={{ fontSize: 32 }}>
                        {program.urgency === 'urgent' ? '🔥' : program.urgency === 'soon' ? '⏰' : '📚'}
                      </Text>
                    </View>
                    <TouchableOpacity style={s.likeBtn} onPress={() => toggleLike(program.id)}>
                      <Text>{liked ? '❤️' : '🤍'}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* 내용 */}
                  <View style={s.cardContent}>
                    <View style={s.cardTopRow}>
                      <View style={[s.urgencyBadge, { backgroundColor: urgency.bg }]}>
                        <Text style={[s.urgencyBadgeText, { color: urgency.text }]}>{urgency.label}</Text>
                      </View>
                      <Text style={s.deadline}>{program.deadline}</Text>
                    </View>
                    <Text style={s.cardTitle} numberOfLines={1}>{program.title}</Text>
                    <Text style={s.cardOrg}>{program.organization}</Text>
                    <View style={s.cardBottom}>
                      <View style={s.cardBottomLeft}>
                        <Ionicons name="location" size={11} color="#888" />
                        <Text style={s.cardLocation}>{program.location.split(' ').slice(-1)}</Text>
                        <Text style={s.cardPrice}>{program.price}</Text>
                      </View>
                      <Text style={s.spotsLeft}>{program.spotsLeft}자리 남음</Text>
                    </View>
                  </View>
                </View>

                {/* 신청 버튼 */}
                <View style={s.cardFooter}>
                  <TouchableOpacity style={s.applyBtn}>
                    <Text style={s.applyBtnText}>신청하기</Text>
                    <Ionicons name="open-outline" size={14} color="#1A1A1A" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* 하단 탭 */}
      <View style={s.bottomTab}>
        {[
          { key: 'home', icon: 'home', label: '홈' },
          { key: 'recommend', icon: 'sparkles', label: '추천' },
          { key: 'apply', icon: 'document-text', label: '신청' },
          { key: 'community', icon: 'chatbubbles', label: '커뮤니티' },
          { key: 'my', icon: 'person', label: '마이' },
        ].map(tab => (
          <TouchableOpacity key={tab.key} style={s.tabItem} onPress={() => onTabChange(tab.key)}>
            <Ionicons
              name={tab.icon as any}
              size={22}
              color={tab.key === 'apply' ? colors.primary.default : '#aaa'}
            />
            <Text style={[s.tabLabel, tab.key === 'apply' && s.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  logo: { fontSize: 20, fontWeight: '700', color: colors.primary.default },
  headerRight: { flexDirection: 'row' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#f87171', borderWidth: 2, borderColor: '#fff' },

  scroll: { padding: 16, paddingBottom: 40 },

  titleSection: { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 4 },

  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6' },
  filterBtnActive: { backgroundColor: colors.primary.default },
  filterBtnUrgent: { backgroundColor: '#FEE2E2' },
  filterBtnText: { fontSize: 13, fontWeight: '500', color: '#718096' },
  filterBtnTextActive: { color: '#191919', fontWeight: '700' },
  filterBtnUrgentText: { color: '#C53030', fontWeight: '700' },

  list: { gap: 12 },

  card: { borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  cardRow: { flexDirection: 'row' },
  cardImageWrap: { width: 112, height: 112, position: 'relative' },
  cardImage: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  likeBtn: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 14, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },

  cardContent: { flex: 1, padding: 10, justifyContent: 'space-between' },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  urgencyBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  urgencyBadgeText: { fontSize: 10, fontWeight: '700' },
  deadline: { fontSize: 10, fontWeight: '500', color: '#888' },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', marginTop: 4 },
  cardOrg: { fontSize: 11, color: '#888' },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  cardBottomLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardLocation: { fontSize: 11, color: '#888' },
  cardPrice: { fontSize: 12, fontWeight: '600', color: '#1A1A1A', marginLeft: 4 },
  spotsLeft: { fontSize: 10, fontWeight: '600', color: '#C53030' },

  cardFooter: { borderTopWidth: 1, borderTopColor: '#F0F0F0', padding: 10 },
  applyBtn: { height: 38, borderRadius: 10, backgroundColor: colors.primary.default, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  applyBtnText: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },

  bottomTab: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 6, gap: 2 },
  tabLabel: { fontSize: 10, color: '#aaa' },
  tabLabelActive: { color: colors.primary.default, fontWeight: '600' },
});