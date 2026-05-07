import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomTabBar from '../../components/BottomTabBar';
import CommonHeader from '../../components/CommonHeader';
import { colors } from '../../constants';

export interface Post {
  id: number;
  author: string;
  authorAvatar: string;
  category: string;
  title: string;
  preview: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked: boolean;
  childAge: string;
  tags: string[];
}

interface CommunityScreenProps {
  onTabChange: (tab: string) => void;
  onPostClick: (post: Post) => void;
  onWriteClick: () => void;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
}

const CATEGORIES = ['전체', '후기', '질문', '정보', '교육', '돌봄'];

const AI_TOPICS = [
  '소근육 발달',
  '언어 자극',
  '미술 놀이',
  '분리불안',
  '편식 해결',
  '수면 교육',
  '코딩 교육',
  '영어 시작',
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  후기: { bg: '#FFF3CD', text: '#d4a800' },
  질문: { bg: '#EBF8FF', text: '#2B6CB0' },
  정보: { bg: '#F0FFF4', text: '#276749' },
  교육: { bg: '#FAF5FF', text: '#6B46C1' },
  돌봄: { bg: '#FFF5F5', text: '#C53030' },
};

export const mockPosts: Post[] = [
  {
    id: 1,
    author: '김○○ 부모님',
    authorAvatar: '김',
    category: '후기',
    title: '창의력 미술 수업 3개월 후기예요 🎨',
    preview: '처음엔 낯가림이 심했던 우리 아이가 이제는 수업 가는 날을 손꼽아 기다려요.',
    likes: 47,
    comments: 12,
    timeAgo: '2시간 전',
    isLiked: false,
    childAge: '만 3세',
    tags: ['미술', '소근육발달'],
  },
  {
    id: 2,
    author: '이○○ 부모님',
    authorAvatar: '이',
    category: '질문',
    title: '만 4세 아이 영어 수업 시작 시기 어떻게 생각하세요?',
    preview: '주변에서 너무 이르다는 말도 있고, 빨리 시작하는 게 좋다는 말도 있어서 고민이에요.',
    likes: 23,
    comments: 31,
    timeAgo: '5시간 전',
    isLiked: true,
    childAge: '만 4세',
    tags: ['영어', '교육고민'],
  },
  {
    id: 3,
    author: '박○○ 부모님',
    authorAvatar: '박',
    category: '정보',
    title: '2025년 아이행복카드 지원금 총정리 💰',
    preview: '많은 분들이 지원금 신청 방법을 물어보셔서 정리해봤어요.',
    likes: 89,
    comments: 24,
    timeAgo: '1일 전',
    isLiked: false,
    childAge: '만 2세',
    tags: ['지원금', '정보공유'],
  },
  {
    id: 4,
    author: '최○○ 부모님',
    authorAvatar: '최',
    category: '돌봄',
    title: '방학 돌봄 공백 어떻게 해결하세요? 맞벌이 부모 고민',
    preview: '여름방학이 다가오는데 아이 돌봄이 너무 걱정돼요.',
    likes: 56,
    comments: 41,
    timeAgo: '1일 전',
    isLiked: true,
    childAge: '만 7세',
    tags: ['돌봄', '맞벌이'],
  },
  {
    id: 5,
    author: '정○○ 부모님',
    authorAvatar: '정',
    category: '후기',
    title: '강남구 구립 창의교실 등록했어요! 솔직 후기 🏫',
    preview: 'MoMent 추천으로 등록하게 됐는데 정말 만족스럽네요.',
    likes: 103,
    comments: 18,
    timeAgo: '2일 전',
    isLiked: false,
    childAge: '만 6세',
    tags: ['창의력', '공공프로그램'],
  },
  {
    id: 6,
    author: '한○○ 부모님',
    authorAvatar: '한',
    category: '교육',
    title: '코딩 교육, 초등 1학년도 괜찮을까요?',
    preview: '요즘 코딩 교육이 필수라는 말이 많은데 너무 이른 건 아닌지 걱정돼요.',
    likes: 31,
    comments: 22,
    timeAgo: '2일 전',
    isLiked: false,
    childAge: '만 7세',
    tags: ['코딩', '교육'],
  },
  {
    id: 7,
    author: '오○○ 부모님',
    authorAvatar: '오',
    category: '정보',
    title: '아이돌봄 서비스 신청 꿀팁 총정리 📝',
    preview: '1년째 이용 중인데 처음에 몰라서 고생했던 것들 공유할게요.',
    likes: 134,
    comments: 47,
    timeAgo: '3일 전',
    isLiked: false,
    childAge: '만 5세',
    tags: ['아이돌봄', '꿀팁'],
  },
  {
    id: 8,
    author: '윤○○ 부모님',
    authorAvatar: '윤',
    category: '후기',
    title: '온라인 코딩 수업 vs 오프라인 학원 비교 후기',
    preview: '두 곳 다 3개월씩 다녀본 솔직 비교예요.',
    likes: 78,
    comments: 35,
    timeAgo: '4일 전',
    isLiked: true,
    childAge: '만 9세',
    tags: ['코딩', '비교후기'],
  },
];

export default function CommunityScreen({
  onTabChange,
  onPostClick,
  onWriteClick,
  onSearchClick,
  onNotificationClick,
}: CommunityScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [posts, setPosts] = useState(mockPosts);

  const toggleLike = (postId: number) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
  };

  const filteredPosts =
    selectedCategory === '전체'
      ? posts
      : posts.filter(post => post.category === selectedCategory);

  return (
    <View style={s.root}>
      <CommonHeader
        variant="community"
        unreadCount={3}
        onSearchPress={onSearchClick}
        onNotificationPress={onNotificationClick}
      />

      <FlatList
        data={filteredPosts}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={() => (
          <View>

            <View style={s.aiTopicBox}>
              <View style={s.aiTopicHeader}>
                <Ionicons name="trending-up" size={14} color="#3182CE" />
                <Text style={s.aiTopicTitle}>AI 이번 주 인기 토픽</Text>
              </View>

              <View style={s.aiTopicRow}>
                {AI_TOPICS.map(topic => (
                  <View key={topic} style={s.aiTopicChip}>
                    <Text style={s.aiTopicChipText}># {topic}</Text>
                  </View>
                ))}
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.categoryScroll}
              contentContainerStyle={s.categoryContent}
            >
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    s.categoryBtn,
                    selectedCategory === cat && s.categoryBtnActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      s.categoryBtnText,
                      selectedCategory === cat && s.categoryBtnTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        renderItem={({ item: post }) => {
          const catColor =
            CATEGORY_COLORS[post.category] ?? {
              bg: '#F7F8FA',
              text: '#718096',
            };

          return (
            <TouchableOpacity
              style={s.postCard}
              onPress={() => onPostClick(post)}
              activeOpacity={0.86}
            >
              <View style={s.postRow}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{post.authorAvatar}</Text>
                </View>

                <View style={s.postContent}>
                  <View style={s.postMeta}>
                    <Text style={s.postAuthor}>{post.author}</Text>

                    <View style={[s.catBadge, { backgroundColor: catColor.bg }]}>
                      <Text style={[s.catBadgeText, { color: catColor.text }]}>
                        {post.category}
                      </Text>
                    </View>

                    <Text style={s.postAge}>{post.childAge}</Text>
                    <Text style={s.postTime}>{post.timeAgo}</Text>
                  </View>

                  <Text style={s.postTitle} numberOfLines={1}>
                    {post.title}
                  </Text>

                  <Text style={s.postPreview} numberOfLines={2}>
                    {post.preview}
                  </Text>

                  <View style={s.tagRow}>
                    {post.tags.map(tag => (
                      <View key={tag} style={s.tag}>
                        <Text style={s.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={s.postActions}>
                    <TouchableOpacity
                      style={s.actionBtn}
                      onPress={() => toggleLike(post.id)}
                    >
                      <Text style={[s.actionIcon, post.isLiked && s.actionIconLiked]}>
                        {post.isLiked ? '❤️' : '🤍'}
                      </Text>
                      <Text style={[s.actionText, post.isLiked && s.actionTextLiked]}>
                        {post.likes}
                      </Text>
                    </TouchableOpacity>

                    <View style={s.actionBtn}>
                      <Text style={s.actionIcon}>💬</Text>
                      <Text style={s.actionText}>{post.comments}</Text>
                    </View>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={16} color="#ccc" />
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={s.separator} />}
      />

      <TouchableOpacity style={s.fab} onPress={onWriteClick}>
        <Ionicons name="create" size={22} color="#191919" />
      </TouchableOpacity>

      <BottomTabBar activeTab="community" onTabChange={onTabChange} />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },

  listContent: {
    paddingBottom: 24,
  },

  titleSection: {
    padding: 16,
    paddingBottom: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  subtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },

  aiTopicBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#EBF8FF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },

  aiTopicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },

  aiTopicTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A365D',
  },

  aiTopicRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  aiTopicChip: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },

  aiTopicChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2B6CB0',
  },

  categoryScroll: {
    marginBottom: 4,
  },

  categoryContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 8,
  },

  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F7F8FA',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  categoryBtnActive: {
    backgroundColor: colors.primary.default,
    borderColor: colors.primary.default,
  },

  categoryBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#718096',
  },

  categoryBtnTextActive: {
    color: '#191919',
    fontWeight: '700',
  },

  postCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },

  postRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#191919',
  },

  postContent: {
    flex: 1,
  },

  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },

  postAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
  },

  catBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },

  postAge: {
    fontSize: 11,
    color: '#888',
  },

  postTime: {
    fontSize: 11,
    color: '#aaa',
  },

  postTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },

  postPreview: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 18,
  },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },

  tag: {
    backgroundColor: '#F7F8FA',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  tagText: {
    fontSize: 10,
    color: '#A0AEC0',
  },

  postActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  actionIcon: {
    fontSize: 13,
  },

  actionIconLiked: {
    color: '#f87171',
  },

  actionText: {
    fontSize: 12,
    color: '#888',
  },

  actionTextLiked: {
    color: '#f87171',
  },

  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },

  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});