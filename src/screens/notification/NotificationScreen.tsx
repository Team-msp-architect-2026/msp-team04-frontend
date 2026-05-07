import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type NotificationType = 'ai' | 'deadline' | 'apply' | 'payment' | 'community';
type FilterKey = '전체' | '읽지 않음' | 'AI 추천' | '마감 임박' | '신청/결제' | '커뮤니티';

interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  referenceId?: number;
}

interface Props {
  onBack: () => void;
  onNotificationPress?: (notification: NotificationItem) => void;
}

const FILTERS: FilterKey[] = [
  '전체',
  '읽지 않음',
  'AI 추천',
  '마감 임박',
  '신청/결제',
  '커뮤니티',
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    type: 'ai',
    title: 'AI 새 추천 도착!',
    body: '유진이에게 딱 맞는 새 프로그램 3개가 추천됐어요. 지금 확인해보세요!',
    time: '방금 전',
    unread: true,
  },
  {
    id: 2,
    type: 'deadline',
    title: '마감 임박! 창의력 쑥쑥 미술 놀이',
    body: '잔여 3석 · 내일 마감 예정이에요. 빠른 신청을 권장해요.',
    time: '1시간 전',
    unread: true,
  },
  {
    id: 3,
    type: 'apply',
    title: '신청 완료',
    body: '창의력 쑥쑥 미술 놀이 신청이 완료됐어요. 5월 1일(목) 10:00 첫 수업이에요!',
    time: '2시간 전',
    unread: true,
  },
  {
    id: 4,
    type: 'payment',
    title: '결제 완료',
    body: '55,000원 결제가 완료됐어요. 카카오페이로 처리됐습니다.',
    time: '2시간 전',
    unread: false,
  },
  {
    id: 5,
    type: 'ai',
    title: 'AI 지원금 매칭 완료',
    body: '유진이에게 맞는 정부 지원금 3개를 찾았어요. 최대 45만원 혜택을 받을 수 있어요!',
    time: '어제',
    unread: false,
  },
  {
    id: 6,
    type: 'deadline',
    title: '마감 임박! 오감 발달 음악 교실',
    body: '잔여 5석 · 3일 후 마감 예정이에요.',
    time: '어제',
    unread: false,
  },
  {
    id: 7,
    type: 'community',
    title: '내 게시글에 댓글이 달렸어요',
    body: "박○○ 부모님이 '저도 같은 고민이에요! 저희 아이는...' 댓글을 남겼어요.",
    time: '2일 전',
    unread: true,
  },
];

const TYPE_STYLE: Record<
  NotificationType,
  {
    label: string;
    accent: string;
    unreadBg: string;
    unreadBorder: string;
    readBg: string;
    readBorder: string;
    readAccent: string;
    readText: string;
    pillBg: string;
    readPillBg: string;
  }
> = {
  ai: {
    label: 'AI',
    accent: '#1687C7',
    unreadBg: '#F8FCFF',
    unreadBorder: '#D7EEFF',
    readBg: '#F9FBFC',
    readBorder: '#E5F0F5',
    readAccent: '#9FCFE5',
    readText: '#739CAF',
    pillBg: '#EAF8FF',
    readPillBg: '#EEF6F9',
  },
  deadline: {
    label: '마감',
    accent: '#EF6B6B',
    unreadBg: '#FFFAFA',
    unreadBorder: '#FFDCDC',
    readBg: '#FCF9F9',
    readBorder: '#F2E6E6',
    readAccent: '#E7AAAA',
    readText: '#B88181',
    pillBg: '#FFF0F0',
    readPillBg: '#F7EEEE',
  },
  apply: {
    label: '신청',
    accent: '#2FB95D',
    unreadBg: '#F8FFF9',
    unreadBorder: '#D7F4DE',
    readBg: '#F8FBF8',
    readBorder: '#E4F0E7',
    readAccent: '#9ED8AF',
    readText: '#6EA77E',
    pillBg: '#ECFAF0',
    readPillBg: '#EEF6F0',
  },
  payment: {
    label: '결제',
    accent: '#94A3B8',
    unreadBg: '#FFFFFF',
    unreadBorder: '#E8EDF3',
    readBg: '#F8FAFC',
    readBorder: '#EEF2F6',
    readAccent: '#CBD5E1',
    readText: '#94A3B8',
    pillBg: '#F1F5F9',
    readPillBg: '#F1F5F9',
  },
  community: {
    label: '커뮤니티',
    accent: '#8B5CF6',
    unreadBg: '#FCFAFF',
    unreadBorder: '#E7E0FB',
    readBg: '#FAF9FC',
    readBorder: '#EDE8F7',
    readAccent: '#C6B5F3',
    readText: '#9786C9',
    pillBg: '#F2EDFF',
    readPillBg: '#F3F0FA',
  },
};

function matchesFilter(notification: NotificationItem, filter: FilterKey) {
  if (filter === '전체') {
    return true;
  }

  if (filter === '읽지 않음') {
    return notification.unread;
  }

  if (filter === 'AI 추천') {
    return notification.type === 'ai';
  }

  if (filter === '마감 임박') {
    return notification.type === 'deadline';
  }

  if (filter === '신청/결제') {
    return notification.type === 'apply' || notification.type === 'payment';
  }

  if (filter === '커뮤니티') {
    return notification.type === 'community';
  }

  return true;
}

export default function NotificationScreen({
  onBack,
  onNotificationPress,
}: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('전체');
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification =>
      matchesFilter(notification, activeFilter),
    );
  }, [activeFilter, notifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter(notification => notification.unread).length;
  }, [notifications]);

  const handlePressNotification = (notification: NotificationItem) => {
    const nextNotification = {
      ...notification,
      unread: false,
    };

    setNotifications(prev =>
      prev.map(item =>
        item.id === notification.id ? nextNotification : item,
      ),
    );

    onNotificationPress?.(nextNotification);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={onBack}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>

        <Text style={styles.headerTitle}>알림 센터</Text>

        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
        </View>
      </View>

      <View style={styles.filterArea}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map(filter => {
            const isActive = activeFilter === filter;

            return (
              <Pressable
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={({ pressed }) => [
                  styles.filterChip,
                  isActive ? styles.filterChipActive : styles.filterChipInactive,
                  pressed && styles.filterChipPressed,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive ? styles.filterTextActive : styles.filterTextInactive,
                  ]}
                  numberOfLines={1}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-outline" size={34} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>표시할 알림이 없어요</Text>
            <Text style={styles.emptyDescription}>
              새 알림이 도착하면 여기에서 확인할 수 있어요.
            </Text>
          </View>
        ) : (
          filteredNotifications.map(notification => {
            const typeStyle = TYPE_STYLE[notification.type];
            const isUnread = notification.unread;

            return (
              <Pressable
                key={notification.id}
                onPress={() => handlePressNotification(notification)}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: isUnread ? typeStyle.unreadBg : typeStyle.readBg,
                    borderColor: isUnread
                      ? typeStyle.unreadBorder
                      : typeStyle.readBorder,
                  },
                  pressed && styles.cardPressed,
                ]}
              >
                <View
                  style={[
                    styles.accentBar,
                    {
                      backgroundColor: isUnread
                        ? typeStyle.accent
                        : typeStyle.readAccent,
                    },
                  ]}
                />

                <View style={styles.cardHeader}>
                  <View style={styles.titleWrap}>
                    <Text
                      style={[
                        styles.cardTitle,
                        !isUnread && styles.cardTitleRead,
                      ]}
                      numberOfLines={1}
                    >
                      {notification.title}
                    </Text>

                    <View
                      style={[
                        styles.typeBadge,
                        {
                          backgroundColor: isUnread
                            ? typeStyle.pillBg
                            : typeStyle.readPillBg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeBadgeText,
                          {
                            color: isUnread ? typeStyle.accent : typeStyle.readText,
                          },
                        ]}
                      >
                        {typeStyle.label}
                      </Text>
                    </View>
                  </View>

                  {isUnread && (
                    <View
                      style={[
                        styles.unreadDot,
                        { backgroundColor: typeStyle.accent },
                      ]}
                    />
                  )}
                </View>

                <Text
                  style={[
                    styles.cardBody,
                    !isUnread && styles.cardBodyRead,
                  ]}
                  numberOfLines={2}
                >
                  {notification.body}
                </Text>

                <Text
                  style={[
                    styles.timeText,
                    !isUnread && styles.timeTextRead,
                  ]}
                >
                  {notification.time}
                </Text>
              </Pressable>
            );
          })
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 58,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 2,
  },

  pressed: {
    opacity: 0.72,
  },

  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },

  unreadBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 17,
    backgroundColor: '#FFE48A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  unreadBadgeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#7A5A00',
  },

  filterArea: {
    height: 62,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },

  filterContent: {
    paddingHorizontal: 18,
    gap: 8,
    alignItems: 'center',
  },

  filterChip: {
    height: 38,
    paddingHorizontal: 17,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterChipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },

  filterChipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },

  filterChipPressed: {
    transform: [{ scale: 0.98 }],
  },

  filterText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  filterTextInactive: {
    color: '#64748B',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 26,
    paddingTop: 16,
  },

  card: {
    position: 'relative',
    minHeight: 110,
    borderWidth: 1,
    borderRadius: 18,
    paddingTop: 15,
    paddingRight: 18,
    paddingBottom: 14,
    paddingLeft: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },

  cardPressed: {
    transform: [{ scale: 0.992 }],
  },

  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },

  cardHeader: {
    minHeight: 24,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  cardTitle: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.25,
  },

  cardTitleRead: {
    color: '#64748B',
  },

  typeBadge: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  typeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: -0.1,
  },

  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },

  cardBody: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    color: '#64748B',
    letterSpacing: -0.2,
  },

  cardBodyRead: {
    color: '#8FA0B3',
  },

  timeText: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '700',
    color: '#A8B4C3',
  },

  timeTextRead: {
    color: '#B7C2D0',
  },

  emptyBox: {
    marginTop: 84,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
  },

  emptyDescription: {
    marginTop: 6,
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },

  bottomSpace: {
    height: 22,
  },
});