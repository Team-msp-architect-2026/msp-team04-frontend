import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CommonHeader from '../../components/CommonHeader';
import BottomTabBar from '../../components/BottomTabBar';

type CategoryKey = 'all' | 'education' | 'care' | 'review' | 'info' | 'question';

export interface Post {
  id: number;
  category: CategoryKey;
  categoryLabel: string;
  childAge: string;
  title: string;
  content: string;
  author: string;
  authorName?: string;
  time: string;
  createdAt: string;
  commentCount: number;
  likeCount: number;
  liked?: boolean;
  tags: string[];
}

interface CommunityScreenProps {
  onTabChange: (tab: string) => void;
  onPostClick: (post: Post) => void;
  onWriteClick: () => void;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
}

const PALETTE = {
  text: '#111827',
  subText: '#64748B',
  muted: '#94A3B8',
  border: '#E8EDF3',
  softBorder: '#EEF2F6',
  bg: '#FFFFFF',
  softBg: '#F8FAFC',

  primary: '#F6DD8F',
  primaryDark: '#8A6400',
  primarySoft: '#FFF9E8',
  primaryBorder: '#F3E3A3',

  coral: '#E58B84',
  coralDark: '#B85A52',
  coralSoft: '#FFF7F5',
  coralBorder: '#F4DAD5',

  blue: '#78A9FF',
  blueDark: '#3E6DCC',
  blueSoft: '#F3F7FF',
  blueBorder: '#DCE7FF',

  green: '#35A66A',
  greenDark: '#228251',
  greenSoft: '#F2FBF6',
  greenBorder: '#D5F0DE',

  purple: '#8B7CF6',
  purpleDark: '#5F52C8',
  purpleSoft: '#F5F3FF',
  purpleBorder: '#E4DFFF',

  black: '#111827',
};

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'education', label: '교육' },
  { key: 'care', label: '돌봄' },
  { key: 'review', label: '후기' },
  { key: 'info', label: '정보공유' },
  { key: 'question', label: '질문' },
];

const CATEGORY_STYLES: Record<
  Exclude<CategoryKey, 'all'>,
  { bg: string; border: string; text: string }
> = {
  education: {
    bg: PALETTE.primarySoft,
    border: PALETTE.primaryBorder,
    text: PALETTE.primaryDark,
  },
  care: {
    bg: PALETTE.greenSoft,
    border: PALETTE.greenBorder,
    text: PALETTE.greenDark,
  },
  review: {
    bg: PALETTE.purpleSoft,
    border: PALETTE.purpleBorder,
    text: PALETTE.purpleDark,
  },
  info: {
    bg: PALETTE.blueSoft,
    border: PALETTE.blueBorder,
    text: PALETTE.blueDark,
  },
  question: {
    bg: PALETTE.coralSoft,
    border: PALETTE.coralBorder,
    text: PALETTE.coralDark,
  },
};

const POSTS: Post[] = [
  {
    id: 1,
    category: 'review',
    categoryLabel: '후기',
    childAge: '만 5세',
    title: '창의력 미술 수업 다녀온 후기 공유해요',
    content:
      '소규모라 아이가 덜 긴장했고, 선생님이 끝나고 짧게 피드백을 주셔서 좋았어요. 처음 미술 수업 찾는 분들께 추천해요.',
    author: '민준맘',
    authorName: '민준맘',
    time: '방금 전',
    createdAt: '방금 전',
    commentCount: 12,
    likeCount: 34,
    liked: false,
    tags: ['미술', '소규모', '강남'],
  },
  {
    id: 2,
    category: 'question',
    categoryLabel: '질문',
    childAge: '만 7세',
    title: '초등 저학년 코딩 수업 시작해도 괜찮을까요?',
    content:
      '아이가 게임 만들기에 관심이 많아졌는데 아직 어려워하지 않을까 걱정돼요. 스크래치부터 시작하는 수업이면 괜찮을까요?',
    author: '하준아빠',
    authorName: '하준아빠',
    time: '12분 전',
    createdAt: '12분 전',
    commentCount: 8,
    likeCount: 19,
    liked: true,
    tags: ['코딩', '초등', '질문'],
  },
  {
    id: 3,
    category: 'care',
    categoryLabel: '돌봄',
    childAge: '만 4세',
    title: '맞벌이 가정 돌봄 공백 줄이는 방법 있을까요',
    content:
      '퇴근 시간이 일정하지 않아서 하원 후 돌봄이 항상 고민이에요. 정부지원이나 지역 프로그램 같이 활용하신 분 계신가요?',
    author: '서아맘',
    authorName: '서아맘',
    time: '35분 전',
    createdAt: '35분 전',
    commentCount: 15,
    likeCount: 41,
    liked: false,
    tags: ['돌봄', '맞벌이', '지원'],
  },
  {
    id: 4,
    category: 'education',
    categoryLabel: '교육',
    childAge: '만 6세',
    title: '영어 말하기 수업 고를 때 뭘 봐야 할까요?',
    content:
      '파닉스는 조금 하는데 말하기는 아직 자신감이 없어요. 원어민 수업보다 아이 성향에 맞는 소그룹이 나을지 고민입니다.',
    author: '유진맘',
    authorName: '유진맘',
    time: '1시간 전',
    createdAt: '1시간 전',
    commentCount: 6,
    likeCount: 23,
    liked: false,
    tags: ['영어', '소그룹', '말하기'],
  },
  {
    id: 5,
    category: 'info',
    categoryLabel: '정보공유',
    childAge: '공통',
    title: '강남구 무료 공공 프로그램 모집 열렸어요',
    content:
      '이번 주부터 구립 창의교실 접수 시작했더라고요. 무료라 경쟁이 있을 것 같아서 필요한 분들은 빨리 확인해보세요.',
    author: '정보요정',
    authorName: '정보요정',
    time: '2시간 전',
    createdAt: '2시간 전',
    commentCount: 21,
    likeCount: 68,
    liked: true,
    tags: ['무료', '공공', '강남구'],
  },
];

const POPULAR_TOPICS = [
  '무료 공공 프로그램',
  '소규모 미술 수업',
  '맞벌이 돌봄',
  '초등 코딩',
];

export default function CommunityScreen({
  onTabChange,
  onPostClick,
  onWriteClick,
  onSearchClick,
  onNotificationClick,
}: CommunityScreenProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [likedPostIds, setLikedPostIds] = useState<number[]>(
    POSTS.filter(post => post.liked).map(post => post.id),
  );

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'all') {
      return POSTS;
    }

    return POSTS.filter(post => post.category === activeCategory);
  }, [activeCategory]);

  const popularPosts = useMemo(() => {
    return [...POSTS]
      .sort(
        (a, b) =>
          b.likeCount + b.commentCount - (a.likeCount + a.commentCount),
      )
      .slice(0, 3);
  }, []);

  const toggleLike = (postId: number) => {
    setLikedPostIds(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId],
    );
  };

  const getLikeCount = (post: Post) => {
    const originallyLiked = !!post.liked;
    const currentlyLiked = likedPostIds.includes(post.id);

    if (originallyLiked === currentlyLiked) {
      return post.likeCount;
    }

    return currentlyLiked ? post.likeCount + 1 : Math.max(post.likeCount - 1, 0);
  };

  const getPostWithCurrentLike = (post: Post): Post => {
    const liked = likedPostIds.includes(post.id);

    return {
      ...post,
      liked,
      likeCount: getLikeCount(post),
    };
  };

  return (
    <View style={styles.root}>
      <CommonHeader
        variant="community"
        unreadCount={3}
        onSearchPress={onSearchClick}
        onNotificationPress={onNotificationClick}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topicSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>요즘 많이 보는 주제</Text>
            <View style={styles.sectionHintBadge}>
              <Text style={styles.sectionHint}>AI 추천</Text>
            </View>
          </View>

          <View style={styles.topicCard}>
            <View style={styles.topicChipRow}>
              {POPULAR_TOPICS.map(topic => (
                <View key={topic} style={styles.topicChip}>
                  <Text style={styles.topicChipText}>{topic}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>커뮤니티 인기글 TOP 3</Text>
            <Text style={styles.sectionSubHint}>공감·댓글 기준</Text>
          </View>

          <View style={styles.popularList}>
            {popularPosts.map((post, index) => {
              const categoryStyle =
                CATEGORY_STYLES[post.category as Exclude<CategoryKey, 'all'>];

              return (
                <TouchableOpacity
                  key={post.id}
                  style={styles.popularCard}
                  onPress={() => onPostClick(getPostWithCurrentLike(post))}
                  activeOpacity={0.84}
                >
                  <View style={styles.popularContent}>
                    <View style={styles.popularMetaRow}>
                      <View style={styles.popularMetaLeft}>
                        <View
                          style={[
                            styles.topBadge,
                            index === 0 && styles.topBadgeFirst,
                          ]}
                        >
                          <Text
                            style={[
                              styles.topBadgeText,
                              index === 0 && styles.topBadgeTextFirst,
                            ]}
                          >
                            TOP {index + 1}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.smallCategoryBadge,
                            {
                              backgroundColor: categoryStyle.bg,
                              borderColor: categoryStyle.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.smallCategoryText,
                              { color: categoryStyle.text },
                            ]}
                          >
                            {post.categoryLabel}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.popularTime}>{post.time}</Text>
                    </View>

                    <Text style={styles.popularTitle} numberOfLines={1}>
                      {post.title}
                    </Text>

                    <View style={styles.popularStatRow}>
                      <View style={styles.popularStatItem}>
                        <Ionicons
                          name="heart-outline"
                          size={13}
                          color={PALETTE.muted}
                        />
                        <Text style={styles.popularStatText}>
                          {getLikeCount(post)}
                        </Text>
                      </View>

                      <View style={styles.popularStatItem}>
                        <Ionicons
                          name="chatbubble-outline"
                          size={12}
                          color={PALETTE.muted}
                        />
                        <Text style={styles.popularStatText}>
                          {post.commentCount}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.allPostSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>커뮤니티 전체글</Text>
            <Text style={styles.listCount}>{filteredPosts.length}개</Text>
          </View>

          <View style={styles.categorySection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContent}
            >
              {CATEGORIES.map(category => {
                const isActive = activeCategory === category.key;

                return (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      styles.categoryChip,
                      isActive && styles.categoryChipActive,
                    ]}
                    onPress={() => setActiveCategory(category.key)}
                    activeOpacity={0.78}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        isActive && styles.categoryTextActive,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.postList}>
            {filteredPosts.map(post => {
              const categoryStyle =
                post.category === 'all'
                  ? CATEGORY_STYLES.info
                  : CATEGORY_STYLES[post.category as Exclude<CategoryKey, 'all'>];

              const liked = likedPostIds.includes(post.id);

              return (
                <TouchableOpacity
                  key={post.id}
                  style={styles.postCard}
                  onPress={() => onPostClick(getPostWithCurrentLike(post))}
                  activeOpacity={0.84}
                >
                  <View style={styles.postTopRow}>
                    <View style={styles.postBadgeRow}>
                      <View
                        style={[
                          styles.categoryBadge,
                          {
                            backgroundColor: categoryStyle.bg,
                            borderColor: categoryStyle.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryBadgeText,
                            { color: categoryStyle.text },
                          ]}
                        >
                          {post.categoryLabel}
                        </Text>
                      </View>

                      <View style={styles.ageBadge}>
                        <Text style={styles.ageBadgeText}>{post.childAge}</Text>
                      </View>
                    </View>

                    <Text style={styles.postTime}>{post.time}</Text>
                  </View>

                  <Text style={styles.postTitle} numberOfLines={2}>
                    {post.title}
                  </Text>

                  <Text style={styles.postContent} numberOfLines={3}>
                    {post.content}
                  </Text>

                  <View style={styles.tagRow}>
                    {post.tags.map(tag => (
                      <View key={tag} style={styles.tagChip}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.postFooter}>
                    <View style={styles.authorRow}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {post.author.slice(0, 1)}
                        </Text>
                      </View>

                      <Text style={styles.authorName}>{post.author}</Text>
                    </View>

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => toggleLike(post.id)}
                        activeOpacity={0.75}
                      >
                        <Ionicons
                          name={liked ? 'heart' : 'heart-outline'}
                          size={16}
                          color={liked ? PALETTE.coralDark : PALETTE.muted}
                        />
                        <Text
                          style={[
                            styles.actionText,
                            liked && styles.actionTextLiked,
                          ]}
                        >
                          {getLikeCount(post)}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.actionItem}>
                        <Ionicons
                          name="chatbubble-outline"
                          size={15}
                          color={PALETTE.muted}
                        />
                        <Text style={styles.actionText}>{post.commentCount}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <TouchableOpacity
        style={styles.writeButton}
        onPress={onWriteClick}
        activeOpacity={0.86}
      >
        <Ionicons
          name="create-outline"
          size={22}
          color="#FFFFFF"
          style={styles.writeIcon}
        />
      </TouchableOpacity>

      <BottomTabBar activeTab="community" onTabChange={onTabChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PALETTE.bg,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 116,
  },

  topicSection: {
    marginBottom: 38,
  },

  sectionHeader: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.2,
  },

  sectionHintBadge: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: PALETTE.softBorder,
    backgroundColor: PALETTE.softBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHint: {
    fontSize: 10,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  sectionSubHint: {
    fontSize: 11,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  topicCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PALETTE.primaryBorder,
    backgroundColor: PALETTE.primarySoft,
    paddingVertical: 17,
    paddingHorizontal: 16,
  },

  topicChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  topicChip: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(138,100,0,0.16)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  topicChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: PALETTE.primaryDark,
  },

  popularSection: {
    marginBottom: 40,
  },

  popularList: {
    gap: 12,
  },

  popularCard: {
    minHeight: 82,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  popularContent: {
    flex: 1,
  },

  popularMetaRow: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  popularMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexShrink: 1,
  },

  topBadge: {
    height: 22,
    paddingHorizontal: 9,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: PALETTE.softBorder,
    backgroundColor: PALETTE.softBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  topBadgeFirst: {
    borderColor: PALETTE.primaryBorder,
    backgroundColor: PALETTE.primarySoft,
  },

  topBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: PALETTE.subText,
    letterSpacing: -0.1,
  },

  topBadgeTextFirst: {
    color: PALETTE.primaryDark,
  },

  smallCategoryBadge: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  smallCategoryText: {
    fontSize: 10,
    fontWeight: '900',
  },

  popularTime: {
    fontSize: 10,
    fontWeight: '700',
    color: PALETTE.muted,
  },

  popularTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.25,
  },

  popularStatRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  popularStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  popularStatText: {
    fontSize: 11,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  allPostSection: {
    marginBottom: 0,
  },

  listHeader: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  listTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: PALETTE.text,
  },

  listCount: {
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  categorySection: {
    marginBottom: 20,
  },

  categoryContent: {
    gap: 8,
    paddingRight: 2,
  },

  categoryChip: {
    height: 35,
    paddingHorizontal: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryChipActive: {
    borderColor: PALETTE.primaryBorder,
    backgroundColor: PALETTE.primarySoft,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.subText,
  },

  categoryTextActive: {
    color: PALETTE.primaryDark,
  },

  postList: {
    gap: 18,
  },

  postCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },

  postTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
    gap: 10,
  },

  postBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },

  categoryBadge: {
    height: 24,
    paddingHorizontal: 9,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: -0.1,
  },

  ageBadge: {
    height: 24,
    paddingHorizontal: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PALETTE.softBorder,
    backgroundColor: PALETTE.softBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ageBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: PALETTE.muted,
  },

  postTime: {
    fontSize: 11,
    fontWeight: '700',
    color: PALETTE.muted,
  },

  postTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.35,
    marginBottom: 9,
  },

  postContent: {
    fontSize: 13,
    lineHeight: 22,
    fontWeight: '600',
    color: PALETTE.subText,
    letterSpacing: -0.2,
  },

  tagRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  tagChip: {
    height: 25,
    paddingHorizontal: 9,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  postFooter: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: PALETTE.softBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PALETTE.primarySoft,
    borderWidth: 1,
    borderColor: PALETTE.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 11,
    fontWeight: '900',
    color: PALETTE.primaryDark,
  },

  authorName: {
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.subText,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  actionText: {
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  actionTextLiked: {
    color: PALETTE.coralDark,
  },

  writeButton: {
    position: 'absolute',
    right: 22,
    bottom: 112,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PALETTE.black,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111827',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 8,
    zIndex: 20,
  },

  writeIcon: {
    transform: [{ translateX: 1 }, { translateY: -1 }],
  },

  bottomSpace: {
    height: 8,
  },
});