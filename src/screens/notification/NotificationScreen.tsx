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

interface NotificationItem {
  id: number;
  type: 'ai' | 'deadline' | 'apply' | 'payment' | 'community';
  icon: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  bg: string;
  border: string;
  iconBg: string;
}

interface Props {
  onBack: () => void;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1, type: 'ai', icon: '✦', title: 'AI 새 추천 도착!',
    body: '유진이에게 딱 맞는 새 프로그램 3개가 추천됐어요. 지금 확인해보세요!',
    time: '방금 전', unread: true,
    bg: '#EBF8FF', border: '#BEE3F8', iconBg: '#BEE3F8',
  },
  {
    id: 2, type: 'deadline', icon: '⏰', title: '마감 임박! 창의력 쑥쑥 미술 놀이',
    body: '잔여 3석 · 내일 마감 예정이에요. 빠른 신청을 권장해요.',
    time: '1시간 전', unread: true,
    bg: '#FFF5F5', border: '#FED7D7', iconBg: '#FED7D7',
  },
  {
    id: 3, type: 'apply', icon: '✅', title: '신청 완료',
    body: '창의력 쑥쑥 미술 놀이 신청이 완료됐어요. 5월 1일(목) 10:00 첫 수업이에요!',
    time: '2시간 전', unread: true,
    bg: '#F0FFF4', border: '#C6F6D5', iconBg: '#C6F6D5',
  },
  {
    id: 4, type: 'payment', icon: '💳', title: '결제 완료',
    body: '55,000원 결제가 완료됐어요. 카카오페이로 처리됐습니다.',
    time: '2시간 전', unread: false,
    bg: '#F9F9F9', border: '#F0F0F0', iconBg: '#E2E8F0',
  },
  {
    id: 5, type: 'ai', icon: '✦', title: 'AI 지원금 매칭 완료',
    body: '유진이에게 맞는 정부 지원금 3개를 찾았어요. 최대 45만원 혜택을 받을 수 있어요!',
    time: '어제', unread: false,
    bg: '#EBF8FF', border: '#BEE3F8', iconBg: '#BEE3F8',
  },
  {
    id: 6, type: 'deadline', icon: '⏰', title: '마감 임박! 오감 발달 음악 교실',
    body: '잔여 5석 · 3일 후 마감 예정이에요.',
    time: '어제', unread: false,
    bg: '#FFF5F5', border: '#FED7D7', iconBg: '#FED7D7',
  },
  {
    id: 7, type: 'community', icon: '💬', title: '내 게시글에 댓글이 달렸어요',
    body: "박○○ 부모님이 '저도 같은 고민이에요! 저희 아이는...' 댓글을 남겼어요.",
    time: '2일 전', unread: false,
    bg: '#F9F9F9', border: '#F0F0F0', iconBg: '#E2E8F0',
  },
];

const FILTERS = ['전체', 'AI 추천', '마감 임박', '신청/결제'];
const FILTER_MAP: Record<string, string[]> = {
  '전체': ['ai', 'deadline', 'apply', 'payment', 'community'],
  'AI 추천': ['ai'],
  '마감 임박': ['deadline'],
  '신청/결제': ['apply', 'payment'],
};

export default function NotificationScreen({ onBack }: Props) {
  const [activeFilter, setActiveFilter] = useState('전체');

  const filtered = NOTIFICATIONS.filter(n => FILTER_MAP[activeFilter].includes(n.type));
  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <SafeAreaView style={s.root}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>알림 센터</Text>
        <View style={s.unreadBadge}>
          <Text style={s.unreadBadgeText}>{unreadCount}</Text>
        </View>
      </View>

      {/* 필터 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.filterChip, activeFilter === f && s.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[s.filterChipText, activeFilter === f && s.filterChipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 알림 목록 */}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {filtered.map(notif => (
          <View
            key={notif.id}
            style={[
              s.notifCard,
              { backgroundColor: notif.bg, borderColor: notif.border },
              !notif.unread && { opacity: 0.75 },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              {/* 아이콘 */}
              <View style={[s.iconWrap, { backgroundColor: notif.iconBg }]}>
                <Text style={s.iconText}>{notif.icon}</Text>
              </View>

              {/* 내용 */}
              <View style={{ flex: 1 }}>
                <View style={s.notifTitleRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                    <Text style={s.notifTitle} numberOfLines={1}>{notif.title}</Text>
                    {notif.type === 'ai' && (
                      <View style={s.aiBadge}>
                        <Text style={s.aiBadgeText}>+ AI</Text>
                      </View>
                    )}
                  </View>
                  {notif.unread && <View style={s.unreadDot} />}
                </View>
                <Text style={s.notifBody}>{notif.body}</Text>
                <Text style={s.notifTime}>{notif.time}</Text>
              </View>
            </View>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  unreadBadge: { backgroundColor: '#FFE082', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  unreadBadgeText: { fontSize: 12, fontWeight: '700', color: '#7B5E00' },

  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  filterChipActive: { backgroundColor: '#1A202C', borderColor: '#1A202C' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#718096' },
  filterChipTextActive: { color: '#fff' },

  scroll: { paddingHorizontal: 16, paddingTop: 4 },

  notifCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 10 },
  iconWrap: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconText: { fontSize: 16 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  notifTitle: { fontSize: 13, fontWeight: '700', color: '#1A202C', flex: 1 },
  aiBadge: { backgroundColor: '#EBF8FF', borderWidth: 1, borderColor: '#BEE3F8', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  aiBadgeText: { fontSize: 10, fontWeight: '700', color: '#2B6CB0' },
  unreadDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: '#FC8181', flexShrink: 0 },
  notifBody: { fontSize: 12, color: '#718096', lineHeight: 20 },
  notifTime: { fontSize: 11, color: '#CBD5E0', marginTop: 6 },
});