import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';
import type { Post } from './CommunityScreen';

interface MyCommunityScreenProps {
  onBack: () => void;
  onActivityPress?: (activity: CommunityActivity) => void;
}

export interface CommunityActivity {
  id: number;
  type: 'post' | 'comment' | 'like';
  title: string;
  preview: string;
  date: string;
  likes?: number;
  comments?: number;
  post: Post;
}

type ActivityType = CommunityActivity['type'];
type IconName = React.ComponentProps<typeof Ionicons>['name'];

const MOCK_ACTIVITIES: CommunityActivity[] = [
  {
    id: 1,
    type: 'post',
    title: '7세 영어 학원 vs 온라인 영어 어떤게 좋을까요?',
    preview: '곧 초등학교 입학하는 아이인데 영어를 시작하려고 해요...',
    date: '3시간 전',
    likes: 45,
    comments: 32,
    post: {
      id: 101,
      category: 'education',
      categoryLabel: '교육',
      childAge: '만 7세',
      title: '7세 영어 학원 vs 온라인 영어 어떤게 좋을까요?',
      content:
        '곧 초등학교 입학하는 아이인데 영어를 시작하려고 해요. 오프라인 학원은 꾸준히 다니기 좋을 것 같고, 온라인 영어는 집에서 편하게 할 수 있어서 고민입니다. 아이가 낯을 조금 가리는 편이라 어떤 방식이 더 맞을지 의견 듣고 싶어요.',
      author: '정아름',
      authorName: '정아름',
      time: '3시간 전',
      createdAt: '3시간 전',
      commentCount: 32,
      likeCount: 45,
      liked: false,
      tags: ['영어', '초등준비', '온라인수업'],
    },
  },
  {
    id: 2,
    type: 'comment',
    title: '아이돌봄 서비스 신청 꿀팁 공유합니다',
    preview: '저도 같은 경험이 있어요. 신청할 때...',
    date: '어제',
    likes: 28,
    comments: 14,
    post: {
      id: 102,
      category: 'info',
      categoryLabel: '정보공유',
      childAge: '공통',
      title: '아이돌봄 서비스 신청 꿀팁 공유합니다',
      content:
        '아이돌봄 서비스 신청할 때 필요한 서류랑 확인해야 할 항목을 정리해봤어요. 처음 신청하면 어디서부터 봐야 할지 헷갈릴 수 있는데, 정부지원 유형과 이용 가능 시간을 먼저 확인하면 훨씬 편합니다. 댓글로 추가 팁도 같이 남겨주세요.',
      author: '정보요정',
      authorName: '정보요정',
      time: '어제',
      createdAt: '어제',
      commentCount: 14,
      likeCount: 28,
      liked: false,
      tags: ['아이돌봄', '정부지원', '신청팁'],
    },
  },
  {
    id: 3,
    type: 'like',
    title: '방학 때 돌봄 공백 어떻게 해결하세요?',
    preview: '맞벌이라 방학 때 아이 돌봄이 항상 고민이에요...',
    date: '2일 전',
    likes: 67,
    comments: 31,
    post: {
      id: 103,
      category: 'care',
      categoryLabel: '돌봄',
      childAge: '만 6세',
      title: '방학 때 돌봄 공백 어떻게 해결하세요?',
      content:
        '맞벌이라 방학 때 아이 돌봄이 항상 고민이에요. 학원만으로 시간을 채우기에는 아이가 힘들어할 것 같고, 공공 돌봄이나 무료 프로그램도 같이 알아보고 있습니다. 실제로 활용해보신 방법 있으면 공유 부탁드려요.',
      author: '서아맘',
      authorName: '서아맘',
      time: '2일 전',
      createdAt: '2일 전',
      commentCount: 31,
      likeCount: 67,
      liked: true,
      tags: ['방학', '맞벌이', '돌봄공백'],
    },
  },
];

const TAB_ITEMS: Array<{
  id: ActivityType;
  label: string;
}> = [
  {
    id: 'post',
    label: '작성글',
  },
  {
    id: 'comment',
    label: '댓글',
  },
  {
    id: 'like',
    label: '좋아요한 글',
  },
];

const TYPE_LABELS: Record<ActivityType, string> = {
  post: '작성한 글',
  comment: '작성한 댓글',
  like: '좋아요한 글',
};

const TYPE_ICONS: Record<ActivityType, IconName> = {
  post: 'create-outline',
  comment: 'chatbubble-ellipses-outline',
  like: 'heart-outline',
};

const TYPE_STYLES: Record<
  ActivityType,
  { bg: string; color: string; label: string }
> = {
  post: {
    bg: '#FFF8D8',
    color: colors.primary.default,
    label: '#8A6A00',
  },
  comment: {
    bg: '#EEF3FF',
    color: '#6377F2',
    label: '#4D5FD2',
  },
  like: {
    bg: '#FFF1F2',
    color: '#EF6F73',
    label: '#D94B58',
  },
};

export default function MyCommunityScreen({
  onBack,
  onActivityPress,
}: MyCommunityScreenProps) {
  const [activeTab, setActiveTab] = useState<ActivityType>('post');

  const filteredActivities = useMemo(
    () => MOCK_ACTIVITIES.filter((activity) => activity.type === activeTab),
    [activeTab],
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SafeAreaView edges={['top']} style={s.safeArea}>
        <View style={s.header}>
          <TouchableOpacity
            style={s.headerSide}
            onPress={onBack}
            activeOpacity={0.72}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={25} color="#191919" />
          </TouchableOpacity>

          <Text style={s.headerTitle}>커뮤니티 활동</Text>

          <View style={s.headerSide} />
        </View>
      </SafeAreaView>

      <View style={s.tabBar}>
        {TAB_ITEMS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              style={s.tabButton}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.76}
            >
              <Text style={[s.tabText, isActive && s.tabTextActive]}>
                {tab.label}
              </Text>

              <View style={[s.tabIndicator, isActive && s.tabIndicatorActive]} />
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {filteredActivities.length > 0 ? (
          <View style={s.activityList}>
            {filteredActivities.map((activity) => {
              const typeStyle = TYPE_STYLES[activity.type];

              return (
                <TouchableOpacity
                  key={activity.id}
                  style={s.activityCard}
                  onPress={() => onActivityPress?.(activity)}
                  activeOpacity={0.74}
                >
                  <View style={s.activityRow}>
                    <View
                      style={[
                        s.activityIcon,
                        { backgroundColor: typeStyle.bg },
                      ]}
                    >
                      <Ionicons
                        name={TYPE_ICONS[activity.type]}
                        size={16}
                        color={typeStyle.color}
                      />
                    </View>

                    <View style={s.activityContent}>
                      <View style={s.activityMeta}>
                        <Text
                          style={[
                            s.activityType,
                            { color: typeStyle.label },
                          ]}
                        >
                          {TYPE_LABELS[activity.type]}
                        </Text>
                        <Text style={s.activityDot}>·</Text>
                        <Text style={s.activityDate}>{activity.date}</Text>
                      </View>

                      <Text style={s.activityTitle} numberOfLines={1}>
                        {activity.title}
                      </Text>

                      <Text style={s.activityPreview} numberOfLines={1}>
                        {activity.preview}
                      </Text>

                      <View style={s.activityStats}>
                        <View style={s.activityStat}>
                          <Ionicons
                            name="heart-outline"
                            size={11}
                            color="#A8AFBA"
                          />
                          <Text style={s.activityStatText}>
                            {activity.likes ?? 0}
                          </Text>
                        </View>

                        <View style={s.activityStat}>
                          <Ionicons
                            name="chatbubble-outline"
                            size={11}
                            color="#A8AFBA"
                          />
                          <Text style={s.activityStatText}>
                            {activity.comments ?? 0}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#C7CDD6"
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={s.empty}>
            <View style={s.emptyIconBox}>
              <Ionicons name="chatbubbles-outline" size={30} color="#AEB4BE" />
            </View>
            <Text style={s.emptyTitle}>아직 활동이 없습니다</Text>
            <Text style={s.emptySub}>
              커뮤니티에서 글을 쓰거나 댓글을 남기면 여기에서 확인할 수 있어요.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  safeArea: {
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 52,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerSide: {
    width: 64,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: '#17191D',
    letterSpacing: -0.35,
  },

  tabBar: {
    height: 58,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F3',
    flexDirection: 'row',
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  tabText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#A0A7B2',
    letterSpacing: -0.25,
  },

  tabTextActive: {
    color: '#17191D',
  },

  tabIndicator: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },

  tabIndicatorActive: {
    backgroundColor: '#17191D',
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },

  activityList: {
    gap: 10,
  },

  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  activityContent: {
    flex: 1,
    gap: 4,
  },

  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  activityType: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: -0.1,
  },

  activityDot: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    color: '#D1D5DB',
  },

  activityDate: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    color: '#8B929E',
  },

  activityTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.15,
  },

  activityPreview: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    color: '#8B929E',
  },

  activityStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },

  activityStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  activityStatText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#A8AFBA',
  },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 110,
    paddingHorizontal: 28,
  },

  emptyIconBox: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: '#EEF0F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: -0.15,
  },

  emptySub: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: '#9AA1AC',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});