import React from 'react';
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

interface MyCommunityScreenProps {
  onBack: () => void;
}

interface Activity {
  id: number;
  type: 'post' | 'comment' | 'like';
  title: string;
  preview: string;
  date: string;
  likes?: number;
  comments?: number;
}

const MOCK_ACTIVITIES: Activity[] = [
  { id: 1, type: 'post', title: '7세 영어 학원 vs 온라인 영어 어떤게 좋을까요?', preview: '곧 초등학교 입학하는 아이인데 영어를 시작하려고 해요...', date: '3시간 전', likes: 45, comments: 32 },
  { id: 2, type: 'comment', title: '아이돌봄 서비스 신청 꿀팁 공유합니다', preview: '저도 같은 경험이 있어요. 신청할 때...', date: '어제' },
  { id: 3, type: 'like', title: '방학 때 돌봄 공백 어떻게 해결하세요?', preview: '맞벌이라 방학 때 아이 돌봄이 항상 고민이에요...', date: '2일 전' },
];

const TYPE_LABELS = {
  post: '작성한 글',
  comment: '작성한 댓글',
  like: '좋아요한 글',
};

const TYPE_ICONS = {
  post: 'create',
  comment: 'chatbubble',
  like: 'heart',
};

export default function MyCommunityScreen({ onBack }: MyCommunityScreenProps) {
  return (
    <SafeAreaView style={s.root}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>커뮤니티 활동</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* 통계 */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Ionicons name="create" size={20} color={colors.primary.default} />
            <Text style={s.statNum}>1</Text>
            <Text style={s.statLabel}>작성글</Text>
          </View>
          <View style={s.statCard}>
            <Ionicons name="chatbubble" size={20} color={colors.primary.default} />
            <Text style={s.statNum}>1</Text>
            <Text style={s.statLabel}>댓글</Text>
          </View>
          <View style={s.statCard}>
            <Ionicons name="heart" size={20} color="#f87171" />
            <Text style={s.statNum}>1</Text>
            <Text style={s.statLabel}>좋아요</Text>
          </View>
        </View>

        {/* 최근 활동 */}
        <Text style={s.sectionTitle}>최근 활동</Text>
        <View style={s.activityList}>
          {MOCK_ACTIVITIES.map(activity => (
            <View key={activity.id} style={s.activityCard}>
              <View style={s.activityRow}>
                <View style={[
                  s.activityIcon,
                  { backgroundColor: activity.type === 'like' ? '#FEE2E2' : '#FFF9E6' }
                ]}>
                  <Ionicons
                    name={TYPE_ICONS[activity.type] as any}
                    size={16}
                    color={activity.type === 'like' ? '#f87171' : colors.primary.default}
                  />
                </View>
                <View style={s.activityContent}>
                  <View style={s.activityMeta}>
                    <Text style={s.activityType}>{TYPE_LABELS[activity.type]}</Text>
                    <Text style={s.activityDot}>·</Text>
                    <Text style={s.activityDate}>{activity.date}</Text>
                  </View>
                  <Text style={s.activityTitle} numberOfLines={1}>{activity.title}</Text>
                  <Text style={s.activityPreview} numberOfLines={1}>{activity.preview}</Text>
                  {activity.type === 'post' && (
                    <View style={s.activityStats}>
                      <View style={s.activityStat}>
                        <Ionicons name="heart" size={11} color="#aaa" />
                        <Text style={s.activityStatText}>{activity.likes}</Text>
                      </View>
                      <View style={s.activityStat}>
                        <Ionicons name="chatbubble" size={11} color="#aaa" />
                        <Text style={s.activityStatText}>{activity.comments}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
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

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#F0F0F0' },
  statNum: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  statLabel: { fontSize: 11, color: '#888' },

  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 12 },

  activityList: { gap: 10 },
  activityCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#F0F0F0' },
  activityRow: { flexDirection: 'row', gap: 12 },
  activityIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  activityContent: { flex: 1, gap: 4 },
  activityMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  activityType: { fontSize: 11, color: '#888' },
  activityDot: { fontSize: 11, color: '#ccc' },
  activityDate: { fontSize: 11, color: '#888' },
  activityTitle: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  activityPreview: { fontSize: 12, color: '#888' },
  activityStats: { flexDirection: 'row', gap: 12, marginTop: 4 },
  activityStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  activityStatText: { fontSize: 11, color: '#aaa' },
});