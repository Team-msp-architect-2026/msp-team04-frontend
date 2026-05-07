import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';
import type { Post } from './CommunityScreen';

interface Comment {
  id: number;
  author: string;
  authorAvatar: string;
  content: string;
  timeAgo: string;
  likes: number;
  isLiked: boolean;
}

interface CommunityPostScreenProps {
  post: Post;
  onBack: () => void;
}

const MOCK_COMMENTS: Comment[] = [
  { id: 1, author: '서○○ 부모님', authorAvatar: '서', content: '저희 아이도 처음에 많이 울었는데 2주 지나니까 적응하더라고요! 조금만 기다려보세요 😊', timeAgo: '1시간 전', likes: 8, isLiked: false },
  { id: 2, author: '강○○ 부모님', authorAvatar: '강', content: '어느 센터인지 여쭤봐도 될까요? 저도 비슷한 나이라 관심이 생겨서요!', timeAgo: '1시간 전', likes: 3, isLiked: true },
  { id: 3, author: '조○○ 부모님', authorAvatar: '조', content: '선생님이 친절하다니 다행이에요. 저희 동네에는 이런 프로그램이 없어서 부럽네요 ㅠㅠ', timeAgo: '30분 전', likes: 5, isLiked: false },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  후기: { bg: '#FFF3CD', text: '#d4a800' },
  질문: { bg: '#EBF8FF', text: '#2B6CB0' },
  정보: { bg: '#F0FFF4', text: '#276749' },
  교육: { bg: '#FAF5FF', text: '#6B46C1' },
  돌봄: { bg: '#FFF5F5', text: '#C53030' },
};

export default function CommunityPostScreen({ post, onBack }: CommunityPostScreenProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [commentInput, setCommentInput] = useState('');

  const catColor = CATEGORY_COLORS[post.category] ?? { bg: '#F7F8FA', text: '#718096' };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const toggleCommentLike = (id: number) => {
    setComments(prev => prev.map(c =>
      c.id === id
        ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
        : c
    ));
  };

  const handleSubmitComment = () => {
    if (!commentInput.trim()) return;
    const newComment: Comment = {
      id: comments.length + 1,
      author: '나',
      authorAvatar: '나',
      content: commentInput,
      timeAgo: '방금 전',
      likes: 0,
      isLiked: false,
    };
    setComments(prev => [...prev, newComment]);
    setCommentInput('');
  };

  return (
    <SafeAreaView style={s.root}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>커뮤니티</Text>
        <TouchableOpacity style={s.moreBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#666" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView contentContainerStyle={s.scroll}>
          {/* 게시글 */}
          <View style={s.article}>
            {/* 작성자 */}
            <View style={s.authorRow}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{post.authorAvatar}</Text>
              </View>
              <View style={s.authorInfo}>
                <View style={s.authorTopRow}>
                  <Text style={s.authorName}>{post.author}</Text>
                  <View style={[s.catBadge, { backgroundColor: catColor.bg }]}>
                    <Text style={[s.catBadgeText, { color: catColor.text }]}>{post.category}</Text>
                  </View>
                </View>
                <View style={s.authorMeta}>
                  <Text style={s.metaText}>{post.childAge}</Text>
                  <Text style={s.metaDot}>·</Text>
                  <Text style={s.metaText}>{post.timeAgo}</Text>
                </View>
              </View>
            </View>

            {/* 제목 */}
            <Text style={s.postTitle}>{post.title}</Text>

            {/* 내용 */}
            <Text style={s.postBody}>
              {post.preview}{'\n\n'}
              아이가 정말 많이 성장한 것 같아서 뿌듯해요. 처음에는 분리불안도 있었는데, 선생님께서 아이 페이스에 맞게 기다려주시고 격려해주셔서 지금은 씩씩하게 들어가요. 관심 있으신 분들은 구립센터 홈페이지에서 확인해보세요! 무료라서 부담도 없고 좋아요 😊
            </Text>

            {/* 태그 */}
            <View style={s.tagRow}>
              {post.tags.map(tag => (
                <View key={tag} style={s.tag}>
                  <Text style={s.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>

            {/* 액션 */}
            <View style={s.actions}>
              <TouchableOpacity style={s.actionBtn} onPress={toggleLike}>
                <Text style={[s.actionIcon, isLiked && s.actionIconLiked]}>
                  {isLiked ? '❤️' : '🤍'}
                </Text>
                <Text style={[s.actionText, isLiked && s.actionTextLiked]}>{likes}</Text>
              </TouchableOpacity>
              <View style={s.actionBtn}>
                <Text style={s.actionIcon}>💬</Text>
                <Text style={s.actionText}>{comments.length}</Text>
              </View>
              <TouchableOpacity style={[s.actionBtn, { marginLeft: 'auto' }]}>
                <Ionicons name="share-outline" size={18} color="#888" />
                <Text style={s.actionText}>공유</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 댓글 */}
          <View style={s.commentsSection}>
            <Text style={s.commentsTitle}>댓글 {comments.length}개</Text>
            {comments.map(comment => (
              <View key={comment.id} style={s.commentRow}>
                <View style={s.commentAvatar}>
                  <Text style={s.commentAvatarText}>{comment.authorAvatar}</Text>
                </View>
                <View style={s.commentContent}>
                  <View style={s.commentMeta}>
                    <Text style={s.commentAuthor}>{comment.author}</Text>
                    <Text style={s.commentTime}>{comment.timeAgo}</Text>
                  </View>
                  <Text style={s.commentText}>{comment.content}</Text>
                  <TouchableOpacity
                    style={s.commentLikeBtn}
                    onPress={() => toggleCommentLike(comment.id)}
                  >
                    <Text style={[s.commentLikeIcon, comment.isLiked && s.commentLikeIconActive]}>
                      {comment.isLiked ? '❤️' : '🤍'}
                    </Text>
                    <Text style={[s.commentLikeText, comment.isLiked && s.commentLikeTextActive]}>
                      {comment.likes}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 댓글 입력 */}
        <View style={s.commentInputWrap}>
          <View style={s.commentInputAvatar}>
            <Text style={s.commentInputAvatarText}>나</Text>
          </View>
          <View style={s.commentInputBox}>
            <TextInput
              style={s.commentInput}
              placeholder="댓글을 입력하세요..."
              placeholderTextColor="#aaa"
              value={commentInput}
              onChangeText={setCommentInput}
              onSubmitEditing={handleSubmitComment}
            />
            <TouchableOpacity
              onPress={handleSubmitComment}
              disabled={!commentInput.trim()}
            >
              <Ionicons
                name="send"
                size={18}
                color={commentInput.trim() ? colors.primary.default : '#ccc'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  moreBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },

  scroll: { paddingBottom: 20 },

  article: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary.default, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#191919' },
  authorInfo: { flex: 1 },
  authorTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  authorName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  catBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 },
  catBadgeText: { fontSize: 10, fontWeight: '600' },
  authorMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontSize: 11, color: '#888' },
  metaDot: { fontSize: 11, color: '#ccc' },

  postTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 12, lineHeight: 26 },
  postBody: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 16 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  tag: { backgroundColor: '#F7F8FA', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  tagText: { fontSize: 11, color: '#718096' },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionIcon: { fontSize: 16 },
  actionIconLiked: { color: '#f87171' },
  actionText: { fontSize: 13, color: '#888' },
  actionTextLiked: { color: '#f87171' },

  commentsSection: { padding: 16 },
  commentsTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 },
  commentRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F7F8FA', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB', flexShrink: 0 },
  commentAvatarText: { fontSize: 12, fontWeight: '700', color: '#718096' },
  commentContent: { flex: 1 },
  commentMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  commentAuthor: { fontSize: 12, fontWeight: '600', color: '#1A1A1A' },
  commentTime: { fontSize: 11, color: '#aaa' },
  commentText: { fontSize: 13, color: '#555', lineHeight: 20 },
  commentLikeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  commentLikeIcon: { fontSize: 12 },
  commentLikeIconActive: { color: '#f87171' },
  commentLikeText: { fontSize: 11, color: '#aaa' },
  commentLikeTextActive: { color: '#f87171' },

  commentInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#fff' },
  commentInputAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary.default, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  commentInputAvatarText: { fontSize: 12, fontWeight: '700', color: '#191919' },
  commentInputBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  commentInput: { flex: 1, fontSize: 14, color: '#1A1A1A' },
});