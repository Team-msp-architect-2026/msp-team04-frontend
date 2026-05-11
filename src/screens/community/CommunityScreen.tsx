import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CommonHeader from '../../components/CommonHeader';
import BottomTabBar from '../../components/BottomTabBar';
import { communityApi, PostCategory, PostListItem } from '../../api/community';

type CategoryKey = 'all' | 'education' | 'care' | 'review' | 'info' | 'question';
type ViewMode = 'home' | 'allPosts';

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

const CATEGORY_STYLES: Record<Exclude<CategoryKey, 'all'>, { bg: string; border: string; text: string }> = {
  education: { bg: PALETTE.primarySoft, border: PALETTE.primaryBorder, text: PALETTE.primaryDark },
  care: { bg: PALETTE.greenSoft, border: PALETTE.greenBorder, text: PALETTE.greenDark },
  review: { bg: PALETTE.purpleSoft, border: PALETTE.purpleBorder, text: PALETTE.purpleDark },
  info: { bg: PALETTE.blueSoft, border: PALETTE.blueBorder, text: PALETTE.blueDark },
  question: { bg: PALETTE.coralSoft, border: PALETTE.coralBorder, text: PALETTE.coralDark },
};

const CATEGORY_LABEL_MAP: Record<PostCategory, string> = {
  REVIEW: '후기',
  QUESTION: '질문',
  INFO: '정보공유',
  EDUCATION: '교육',
  CARE: '돌봄',
};

const CATEGORY_KEY_MAP: Record<PostCategory, CategoryKey> = {
  REVIEW: 'review',
  QUESTION: 'question',
  INFO: 'info',
  EDUCATION: 'education',
  CARE: 'care',
};

const POPULAR_TOPICS = ['무료 공공 프로그램', '소규모 미술 수업', '맞벌이 돌봄', '초등 코딩'];

function getCategoryStyle(category: CategoryKey) {
  if (category === 'all') return CATEGORY_STYLES.info;
  return CATEGORY_STYLES[category];
}

function convertToPost(item: PostListItem): Post {
  const categoryKey = CATEGORY_KEY_MAP[item.category] ?? 'info';
  const categoryLabel = CATEGORY_LABEL_MAP[item.category] ?? item.category;

  return {
    id: item.postId,
    category: categoryKey,
    categoryLabel,
    childAge: item.childAge ?? '',
    title: item.title,
    content: item.contentPreview,
    author: `사용자${item.userId}`,
    time: new Date(item.createdAt).toLocaleDateString('ko-KR'),
    createdAt: item.createdAt,
    commentCount: item.commentCount,
    likeCount: item.likeCount,
    liked: false,
    tags: [],
  };
}

const FILTER_CATEGORY_MAP: Record<CategoryKey, PostCategory | undefined> = {
  all: undefined,
  education: 'EDUCATION',
  care: 'CARE',
  review: 'REVIEW',
  info: 'INFO',
  question: 'QUESTION',
};

export default function CommunityScreen({
  onTabChange,
  onPostClick,
  onWriteClick,
  onSearchClick,
  onNotificationClick,
}: CommunityScreenProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [likedPostIds, setLikedPostIds] = useState<number[]>([]);

  const fetchPosts = useCallback(async (category: CategoryKey) => {
    setLoading(true);
    try {
      const apiCategory = FILTER_CATEGORY_MAP[category];
      const res = await communityApi.getPostList(apiCategory, 0, 20);
      setPosts(res.content.map(convertToPost));
    } catch (e) {
      console.error('커뮤니티 목록 조회 실패', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(activeCategory);
  }, [activeCategory, fetchPosts]);

  const filteredPosts = posts;

  const popularPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => b.likeCount + b.commentCount - (a.likeCount + a.commentCount))
      .slice(0, 3);
  }, [posts]);

  const previewPosts = useMemo(() => posts.slice(0, 3), [posts]);

  const toggleLike = (postId: number) => {
    setLikedPostIds(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId],
    );
  };

  const getLikeCount = (post: Post) => {
    const originallyLiked = !!post.liked;
    const currentlyLiked = likedPostIds.includes(post.id);
    if (originallyLiked === currentlyLiked) return post.likeCount;
    return currentlyLiked ? post.likeCount + 1 : Math.max(post.likeCount - 1, 0);
  };

  const getPostWithCurrentLike = (post: Post): Post => {
    return { ...post, liked: likedPostIds.includes(post.id), likeCount: getLikeCount(post) };
  };

  const renderPostCard = (post: Post) => {
    const categoryStyle = getCategoryStyle(post.category);
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
            <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.bg, borderColor: categoryStyle.border }]}>
              <Text style={[styles.categoryBadgeText, { color: categoryStyle.text }]}>{post.categoryLabel}</Text>
            </View>
            {post.childAge ? (
              <View style={styles.ageBadge}>
                <Text style={styles.ageBadgeText}>{post.childAge}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.postTime}>{post.time}</Text>
        </View>

        <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
        <Text style={styles.postContent} numberOfLines={3}>{post.content}</Text>

        {post.tags.length > 0 && (
          <View style={styles.tagRow}>
            {post.tags.map(tag => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.postFooter}>
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{post.author.slice(0, 1)}</Text>
            </View>
            <Text style={styles.authorName}>{post.author}</Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionItem} onPress={() => toggleLike(post.id)} activeOpacity={0.75}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={16} color={liked ? PALETTE.coralDark : PALETTE.muted} />
              <Text style={[styles.actionText, liked && styles.actionTextLiked]}>{getLikeCount(post)}</Text>
            </TouchableOpacity>
            <View style={styles.actionItem}>
              <Ionicons name="chatbubble-outline" size={15} color={PALETTE.muted} />
              <Text style={styles.actionText}>{post.commentCount}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
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
        {viewMode === 'home' ? (
          <>
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
                {loading ? (
                  <ActivityIndicator color={PALETTE.primaryDark} />
                ) : (
                  popularPosts.map((post, index) => {
                    const categoryStyle = getCategoryStyle(post.category);
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
                              <View style={[styles.topBadge, index === 0 && styles.topBadgeFirst]}>
                                <Text style={[styles.topBadgeText, index === 0 && styles.topBadgeTextFirst]}>TOP {index + 1}</Text>
                              </View>
                              <View style={[styles.smallCategoryBadge, { backgroundColor: categoryStyle.bg, borderColor: categoryStyle.border }]}>
                                <Text style={[styles.smallCategoryText, { color: categoryStyle.text }]}>{post.categoryLabel}</Text>
                              </View>
                            </View>
                            <Text style={styles.popularTime}>{post.time}</Text>
                          </View>
                          <Text style={styles.popularTitle} numberOfLines={1}>{post.title}</Text>
                          <View style={styles.popularStatRow}>
                            <View style={styles.popularStatItem}>
                              <Ionicons name="heart-outline" size={13} color={PALETTE.muted} />
                              <Text style={styles.popularStatText}>{getLikeCount(post)}</Text>
                            </View>
                            <View style={styles.popularStatItem}>
                              <Ionicons name="chatbubble-outline" size={12} color={PALETTE.muted} />
                              <Text style={styles.popularStatText}>{post.commentCount}</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </View>

            <View style={styles.allPostSection}>
              <View style={styles.listHeader}>
                <View>
                  <Text style={styles.listTitle}>커뮤니티 전체글</Text>
                  <Text style={styles.listSubtitle}>최신 글 3개만 먼저 보여드려요</Text>
                </View>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => setViewMode('allPosts')} activeOpacity={0.78}>
                  <Text style={styles.viewAllText}>전체보기</Text>
                  <Ionicons name="chevron-forward" size={14} color={PALETTE.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.postList}>
                {loading ? (
                  <ActivityIndicator color={PALETTE.primaryDark} />
                ) : (
                  previewPosts.map(post => renderPostCard(post))
                )}
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.allModeHeader}>
              <TouchableOpacity
                style={styles.inlineBackButton}
                onPress={() => { setViewMode('home'); setActiveCategory('all'); }}
                activeOpacity={0.78}
              >
                <Ionicons name="chevron-back" size={18} color={PALETTE.text} />
                <Text style={styles.inlineBackText}>메인으로</Text>
              </TouchableOpacity>
              <Text style={styles.allModeTitle}>커뮤니티 전체글</Text>
              <Text style={styles.allModeDesc}>카테고리별로 부모님들의 이야기를 확인해보세요.</Text>
            </View>

            <View style={styles.categorySection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContent}>
                {CATEGORIES.map(category => {
                  const isActive = activeCategory === category.key;
                  return (
                    <TouchableOpacity
                      key={category.key}
                      style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                      onPress={() => setActiveCategory(category.key)}
                      activeOpacity={0.78}
                    >
                      <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{category.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>
                {activeCategory === 'all' ? '전체 게시글' : `${CATEGORIES.find(item => item.key === activeCategory)?.label} 게시글`}
              </Text>
              <Text style={styles.listCount}>{filteredPosts.length}개</Text>
            </View>

            <View style={styles.postList}>
              {loading ? (
                <ActivityIndicator color={PALETTE.primaryDark} />
              ) : (
                filteredPosts.map(post => renderPostCard(post))
              )}
            </View>
          </>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <TouchableOpacity style={styles.writeButton} onPress={onWriteClick} activeOpacity={0.86}>
        <Ionicons name="create-outline" size={22} color="#FFFFFF" style={styles.writeIcon} />
      </TouchableOpacity>

      <BottomTabBar activeTab="community" onTabChange={onTabChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 116 },
  topicSection: { marginBottom: 38 },
  sectionHeader: { marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: PALETTE.text, letterSpacing: -0.2 },
  sectionHintBadge: { height: 22, paddingHorizontal: 8, borderRadius: 11, borderWidth: 1, borderColor: PALETTE.softBorder, backgroundColor: PALETTE.softBg, alignItems: 'center', justifyContent: 'center' },
  sectionHint: { fontSize: 10, fontWeight: '800', color: PALETTE.muted },
  sectionSubHint: { fontSize: 11, fontWeight: '800', color: PALETTE.muted },
  topicCard: { borderRadius: 20, borderWidth: 1, borderColor: PALETTE.primaryBorder, backgroundColor: PALETTE.primarySoft, paddingVertical: 17, paddingHorizontal: 16 },
  topicChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topicChip: { minHeight: 28, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(138,100,0,0.16)', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  topicChipText: { fontSize: 11, fontWeight: '800', color: PALETTE.primaryDark },
  popularSection: { marginBottom: 40 },
  popularList: { gap: 12 },
  popularCard: { minHeight: 82, borderRadius: 18, borderWidth: 1, borderColor: PALETTE.border, backgroundColor: '#FFFFFF', paddingVertical: 14, paddingHorizontal: 14 },
  popularContent: { flex: 1 },
  popularMetaRow: { marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  popularMetaLeft: { flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 1 },
  topBadge: { height: 22, paddingHorizontal: 9, borderRadius: 11, borderWidth: 1, borderColor: PALETTE.softBorder, backgroundColor: PALETTE.softBg, alignItems: 'center', justifyContent: 'center' },
  topBadgeFirst: { borderColor: PALETTE.primaryBorder, backgroundColor: PALETTE.primarySoft },
  topBadgeText: { fontSize: 10, fontWeight: '900', color: PALETTE.subText, letterSpacing: -0.1 },
  topBadgeTextFirst: { color: PALETTE.primaryDark },
  smallCategoryBadge: { height: 22, paddingHorizontal: 8, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  smallCategoryText: { fontSize: 10, fontWeight: '900' },
  popularTime: { fontSize: 10, fontWeight: '700', color: PALETTE.muted },
  popularTitle: { fontSize: 14, lineHeight: 19, fontWeight: '900', color: PALETTE.text, letterSpacing: -0.25 },
  popularStatRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  popularStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  popularStatText: { fontSize: 11, fontWeight: '800', color: PALETTE.muted },
  allPostSection: { marginBottom: 0 },
  listHeader: { marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  listTitle: { fontSize: 15, fontWeight: '900', color: PALETTE.text },
  listSubtitle: { marginTop: 4, fontSize: 11, fontWeight: '700', color: PALETTE.muted },
  listCount: { fontSize: 12, fontWeight: '800', color: PALETTE.muted },
  viewAllButton: { height: 32, paddingHorizontal: 11, borderRadius: 16, borderWidth: 1, borderColor: PALETTE.border, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewAllText: { fontSize: 12, fontWeight: '900', color: PALETTE.text },
  allModeHeader: { marginBottom: 24 },
  inlineBackButton: { alignSelf: 'flex-start', height: 32, paddingRight: 10, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  inlineBackText: { fontSize: 13, fontWeight: '900', color: PALETTE.text },
  allModeTitle: { fontSize: 21, lineHeight: 28, fontWeight: '900', color: PALETTE.text, letterSpacing: -0.6 },
  allModeDesc: { marginTop: 7, fontSize: 13, lineHeight: 20, fontWeight: '600', color: PALETTE.subText },
  categorySection: { marginBottom: 20 },
  categoryContent: { gap: 8, paddingRight: 2 },
  categoryChip: { height: 35, paddingHorizontal: 15, borderRadius: 18, borderWidth: 1, borderColor: PALETTE.border, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  categoryChipActive: { borderColor: PALETTE.primaryBorder, backgroundColor: PALETTE.primarySoft },
  categoryText: { fontSize: 12, fontWeight: '800', color: PALETTE.subText },
  categoryTextActive: { color: PALETTE.primaryDark },
  postList: { gap: 18 },
  postCard: { borderRadius: 22, borderWidth: 1, borderColor: PALETTE.border, backgroundColor: '#FFFFFF', padding: 16 },
  postTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13, gap: 10 },
  postBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  categoryBadge: { height: 24, paddingHorizontal: 9, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  categoryBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: -0.1 },
  ageBadge: { height: 24, paddingHorizontal: 9, borderRadius: 12, borderWidth: 1, borderColor: PALETTE.softBorder, backgroundColor: PALETTE.softBg, alignItems: 'center', justifyContent: 'center' },
  ageBadgeText: { fontSize: 10, fontWeight: '900', color: PALETTE.muted },
  postTime: { fontSize: 11, fontWeight: '700', color: PALETTE.muted },
  postTitle: { fontSize: 16, lineHeight: 22, fontWeight: '900', color: PALETTE.text, letterSpacing: -0.35, marginBottom: 9 },
  postContent: { fontSize: 13, lineHeight: 22, fontWeight: '600', color: PALETTE.subText, letterSpacing: -0.2 },
  tagRow: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  tagChip: { height: 25, paddingHorizontal: 9, borderRadius: 13, borderWidth: 1, borderColor: PALETTE.border, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  tagText: { fontSize: 10, fontWeight: '800', color: PALETTE.muted },
  postFooter: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: PALETTE.softBorder, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: PALETTE.primarySoft, borderWidth: 1, borderColor: PALETTE.primaryBorder, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 11, fontWeight: '900', color: PALETTE.primaryDark },
  authorName: { fontSize: 12, fontWeight: '800', color: PALETTE.subText },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  actionItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12, fontWeight: '800', color: PALETTE.muted },
  actionTextLiked: { color: PALETTE.coralDark },
  writeButton: { position: 'absolute', right: 22, bottom: 112, width: 56, height: 56, borderRadius: 28, backgroundColor: PALETTE.black, alignItems: 'center', justifyContent: 'center', shadowColor: '#111827', shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 8, zIndex: 20 },
  writeIcon: { transform: [{ translateX: 1 }, { translateY: -1 }] },
  bottomSpace: { height: 8 },
});
