import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants';

interface MyApplicationsScreenProps {
  onBack: () => void;
}

interface Application {
  id: number;
  title: string;
  organization: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: string;
  location: string;
  price: string;
  imageUrl: string;
}

const STATUS_LABELS = {
  pending: '승인대기',
  confirmed: '신청완료',
  completed: '수강완료',
  cancelled: '취소됨',
};

const STATUS_COLORS = {
  pending: { bg: '#FEF9C3', text: '#854D0E' },
  confirmed: { bg: '#DCFCE7', text: '#166534' },
  completed: { bg: '#F3F4F6', text: '#6B7280' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

const MOCK_APPLICATIONS: Application[] = [
  {
    id: 1,
    title: '구립 어린이 창의교실',
    organization: '서울시 교육청',
    status: 'confirmed',
    date: '2024.03.15',
    location: '서울 강남구 역삼동',
    price: '무료',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    title: '초등 코딩 교실 (2기)',
    organization: '강남구청',
    status: 'pending',
    date: '2024.03.20',
    location: '서울 강남구 삼성동',
    price: '월 5만원',
    imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=300&fit=crop',
  },
];

export default function MyApplicationsScreen({ onBack }: MyApplicationsScreenProps) {
  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>신청 내역</Text>
        <View style={s.headerBtn} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {MOCK_APPLICATIONS.length > 0 ? (
          MOCK_APPLICATIONS.map((app) => (
            <TouchableOpacity key={app.id} style={s.card} activeOpacity={0.7}>
              {/* 썸네일 */}
              <Image source={{ uri: app.imageUrl }} style={s.thumbnail} />

              {/* 내용 */}
              <View style={s.cardContent}>
                {/* 상태 배지 */}
                <View
                  style={[
                    s.statusBadge,
                    { backgroundColor: STATUS_COLORS[app.status].bg },
                  ]}
                >
                  <Text
                    style={[
                      s.statusText,
                      { color: STATUS_COLORS[app.status].text },
                    ]}
                  >
                    {STATUS_LABELS[app.status]}
                  </Text>
                </View>

                {/* 제목 */}
                <Text style={s.cardTitle} numberOfLines={1}>
                  {app.title}
                </Text>

                {/* 기관 */}
                <Text style={s.cardOrg}>{app.organization}</Text>

                {/* 날짜 / 위치 */}
                <View style={s.cardMeta}>
                  <View style={s.metaItem}>
                    <Ionicons name="calendar-outline" size={12} color="#888" />
                    <Text style={s.metaText}>{app.date}</Text>
                  </View>
                  <View style={s.metaItem}>
                    <Ionicons name="location-outline" size={12} color="#888" />
                    <Text style={s.metaText}>
                      {app.location.split(' ').slice(-1)[0]}
                    </Text>
                  </View>
                </View>
              </View>

              {/* 화살표 */}
              <View style={s.chevron}>
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          /* 빈 상태 */
          <View style={s.empty}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={s.emptyText}>신청 내역이 없습니다</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

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
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  // 스크롤
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },

  // 카드
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
  },
  thumbnail: {
    width: 96,
    height: 96,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    gap: 3,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  cardOrg: {
    fontSize: 12,
    color: '#888',
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: '#888',
  },

  // 화살표
  chevron: {
    paddingRight: 12,
  },

  // 빈 상태
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#aaa',
  },
});