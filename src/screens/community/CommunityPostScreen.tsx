import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import type { Post } from './CommunityScreen';
import { communityApi, CommentItem, PostDetail } from '../../api/community';

interface CommunityPostScreenProps {
  post: Post;
  onBack: () => void;
  onEdit: (postDetail: PostDetail) => void;
}

type CategoryKey = Post['category'];

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
  red: '#D85B52',
  redSoft: '#FFF3F1',
  redBorder: '#FAD9D4',
};

const CATEGORY_STYLES: Record<Exclude<CategoryKey, 'all'>, { bg: string; border: string; text: string }> = {
  education: { bg: PALETTE.primarySoft, border: PALETTE.primaryBorder, text: PALETTE.primaryDark },
  care: { bg: PALETTE.greenSoft, border: PALETTE.greenBorder, text: PALETTE.greenDark },
  review: { bg: PALETTE.purpleSoft, border: PALETTE.purpleBorder, text: PALETTE.purpleDark },
  info: { bg: PALETTE.blueSoft, border: PALETTE.blueBorder, text: PALETTE.blueDark },
  question: { bg: PALETTE.coralSoft, border: PALETTE.coralBorder, text: PALETTE.coralDark },
};

function getCategoryStyle(category: CategoryKey) {
  if (category === 'all') return CATEGORY_STYLES.info;
  return CATEGORY_STYLES[category];
}

export default function CommunityPostScreen({ post, onBack, onEdit }: CommunityPostScreenProps) {
  const [postDetail, setPostDetail] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentText, setCommentText] = useState('');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const categoryStyle = useMemo(() => getCategoryStyle(post.category), [post.category]);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const [detail, commentList] = await Promise.all([
        communityApi.getPostDetail(post.id),
        communityApi.getCommentList(post.id),
      ]);
      setPostDetail(detail);
      setLiked(detail.likedByMe);
      setLikeCount(detail.likeCount);
      setComments(commentList);
    } catch (e) {
      console.error('게시글 상세 조회 실패', e);
    } finally {
      setLoading(false);
    }
  }, [post.id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleToggleLike = async () => {
    try {
      const res = await communityApi.toggleLike(post.id);
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch (e) {
      console.error('좋아요 실패', e);
    }
  };

  const handleToggleCommentLike = async (commentId: number) => {
    try {
      const res = await communityApi.toggleCommentLike(post.id, commentId);
      setComments(prev =>
        prev.map(c =>
          c.commentId === commentId
            ? { ...c, likedByMe: res.likedByMe, likeCount: res.likeCount }
            : c,
        ),
      );
    } catch (e) {
      console.error('댓글 좋아요 실패', e);
    }
  };

  const handleSendComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const newComment = await communityApi.createComment(post.id, trimmed);
      setComments(prev => [...prev, newComment]);
      setCommentText('');
    } catch (e) {
      console.error('댓글 작성 실패', e);
      Alert.alert('오류', '댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    Alert.alert('댓글 삭제', '이 댓글을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await communityApi.deleteComment(post.id, commentId);
            setComments(prev => prev.filter(c => c.commentId !== commentId));
          } catch (e) {
            console.error('댓글 삭제 실패', e);
            Alert.alert('오류', '댓글 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleEditPost = () => {
    setShowActionMenu(false);
    if (postDetail) {
      onEdit(postDetail);
    }
  };

  const handleDeletePost = () => {
    setShowActionMenu(false);
    Alert.alert('게시글 삭제', '이 게시글을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await communityApi.deletePost(post.id);
            onBack();
          } catch (e) {
            console.error('게시글 삭제 실패', e);
            Alert.alert('오류', '게시글 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const displayContent = postDetail?.content ?? post.content;
  const displayTitle = postDetail?.title ?? post.title;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onBack}
            activeOpacity={0.75}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          >
            <Ionicons name="arrow-back" size={22} color={PALETTE.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} pointerEvents="none">커뮤니티</Text>

          <View style={styles.moreWrap}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowActionMenu(prev => !prev)}
              activeOpacity={0.75}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color={PALETTE.text} />
            </TouchableOpacity>

            {showActionMenu && (
              <View style={styles.actionMenu}>
                <TouchableOpacity
                  style={styles.actionMenuItem}
                  onPress={handleEditPost}
                  activeOpacity={0.75}
                >
                  <Ionicons name="pencil-outline" size={16} color={PALETTE.subText} />
                  <Text style={styles.actionMenuText}>수정하기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionMenuItem, styles.actionMenuItemDanger]}
                  onPress={handleDeletePost}
                  activeOpacity={0.75}
                >
                  <Ionicons name="trash-outline" size={16} color={PALETTE.red} />
                  <Text style={styles.actionMenuTextDanger}>삭제하기</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {showActionMenu && (
          <TouchableOpacity
            style={styles.menuDim}
            activeOpacity={1}
            onPress={() => setShowActionMenu(false)}
          />
        )}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={PALETTE.primaryDark} />
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.postHeader}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorAvatarText}>{post.author.slice(0, 1)}</Text>
              </View>
              <View style={styles.postHeaderInfo}>
                <View style={styles.badgeRow}>
                  <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.bg, borderColor: categoryStyle.border }]}>
                    <Text style={[styles.categoryBadgeText, { color: categoryStyle.text }]}>{post.categoryLabel}</Text>
                  </View>
                  {post.childAge ? (
                    <View style={styles.ageBadge}>
                      <Text style={styles.ageBadgeText}>{post.childAge}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.authorRow}>
                  <Text style={styles.authorName}>{post.author}</Text>
                  <Text style={styles.timeText}>{post.time}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.title}>{displayTitle}</Text>
            <Text style={styles.content}>{displayContent}</Text>

            {post.tags.length > 0 && (
              <View style={styles.tagRow}>
                {post.tags.map(tag => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.actionBar}>
              <TouchableOpacity style={styles.actionButton} onPress={handleToggleLike} activeOpacity={0.75}>
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={19} color={liked ? PALETTE.coralDark : PALETTE.muted} />
                <Text style={[styles.actionText, liked && styles.actionTextLiked]}>{likeCount}</Text>
              </TouchableOpacity>
              <View style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={18} color={PALETTE.muted} />
                <Text style={styles.actionText}>{comments.length}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.commentHeader}>
              <Text style={styles.commentTitle}>댓글 {comments.length}개</Text>
              <Text style={styles.commentHint}>서로 예의를 지켜주세요</Text>
            </View>

            <View style={styles.commentList}>
              {comments.map(comment => (
                <View key={comment.commentId} style={styles.commentItem}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>U</Text>
                  </View>
                  <View style={styles.commentBody}>
                    <View style={styles.commentMetaRow}>
                      <Text style={styles.commentAuthor}>사용자{comment.userId}</Text>
                      <Text style={styles.commentTime}>
                        {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                      </Text>
                      {comment.mine && (
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(comment.commentId)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="trash-outline" size={13} color={PALETTE.muted} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.commentContent}>{comment.content}</Text>
                    <TouchableOpacity
                      style={styles.commentLikeRow}
                      onPress={() => handleToggleCommentLike(comment.commentId)}
                      activeOpacity={0.75}
                    >
                      <Ionicons
                        name={comment.likedByMe ? 'heart' : 'heart-outline'}
                        size={14}
                        color={comment.likedByMe ? PALETTE.coralDark : '#CBD5E1'}
                      />
                      <Text style={[styles.commentLikeText, comment.likedByMe && styles.commentLikeTextActive]}>
                        {comment.likeCount}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.bottomSpace} />
          </ScrollView>
        )}

        <View style={styles.inputBar}>
          <View style={styles.myAvatar}>
            <Text style={styles.myAvatarText}>나</Text>
          </View>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.commentInput}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="댓글을 입력하세요"
              placeholderTextColor="#A8B0BD"
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, commentText.trim() && styles.sendButtonActive]}
              onPress={handleSendComment}
              disabled={!commentText.trim() || submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={17} color={commentText.trim() ? '#FFFFFF' : '#CBD5E1'} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.bg },
  keyboardRoot: { flex: 1 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { height: 52, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: PALETTE.bg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 30 },
  headerButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 16, fontWeight: '800', color: PALETTE.text, letterSpacing: -0.3, zIndex: 1 },
  moreWrap: { position: 'relative', zIndex: 40 },
  menuDim: { position: 'absolute', top: 52, left: 0, right: 0, bottom: 0, zIndex: 20, backgroundColor: 'transparent' },
  actionMenu: { position: 'absolute', top: 42, right: 0, width: 148, borderRadius: 16, borderWidth: 1, borderColor: PALETTE.border, backgroundColor: '#FFFFFF', paddingVertical: 6, shadowColor: '#111827', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8, zIndex: 50 },
  actionMenuItem: { minHeight: 42, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9 },
  actionMenuText: { fontSize: 13, fontWeight: '800', color: PALETTE.subText },
  actionMenuItemDanger: { borderTopWidth: 1, borderTopColor: PALETTE.softBorder },
  actionMenuTextDanger: { fontSize: 13, fontWeight: '800', color: PALETTE.red },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 120 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  authorAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: PALETTE.primary, alignItems: 'center', justifyContent: 'center' },
  authorAvatarText: { fontSize: 15, fontWeight: '900', color: PALETTE.primaryDark },
  postHeaderInfo: { flex: 1, gap: 7 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  categoryBadge: { height: 24, paddingHorizontal: 9, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  categoryBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: -0.1 },
  ageBadge: { height: 24, paddingHorizontal: 9, borderRadius: 12, borderWidth: 1, borderColor: PALETTE.softBorder, backgroundColor: PALETTE.softBg, alignItems: 'center', justifyContent: 'center' },
  ageBadgeText: { fontSize: 10, fontWeight: '900', color: PALETTE.muted },
  authorRow: { marginLeft: 3, flexDirection: 'row', alignItems: 'center', gap: 7 },
  authorName: { fontSize: 13, fontWeight: '900', color: PALETTE.text },
  timeText: { fontSize: 12, fontWeight: '700', color: PALETTE.muted },
  title: { fontSize: 21, lineHeight: 30, fontWeight: '900', color: PALETTE.text, letterSpacing: -0.6, marginBottom: 14 },
  content: { fontSize: 15, lineHeight: 26, fontWeight: '600', color: PALETTE.subText, letterSpacing: -0.25 },
  tagRow: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { height: 27, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: PALETTE.border, backgroundColor: PALETTE.softBg, alignItems: 'center', justifyContent: 'center' },
  tagText: { fontSize: 11, fontWeight: '800', color: PALETTE.muted },
  actionBar: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 18 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13, fontWeight: '800', color: PALETTE.muted },
  actionTextLiked: { color: PALETTE.coralDark },
  divider: { height: 1, backgroundColor: PALETTE.softBorder, marginTop: 24, marginBottom: 22 },
  commentHeader: { marginBottom: 18 },
  commentTitle: { fontSize: 15, fontWeight: '900', color: PALETTE.text },
  commentHint: { marginTop: 5, fontSize: 12, fontWeight: '700', color: PALETTE.muted },
  commentList: { gap: 22 },
  commentItem: { flexDirection: 'row', gap: 12 },
  commentAvatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: PALETTE.softBorder, backgroundColor: PALETTE.softBg, alignItems: 'center', justifyContent: 'center' },
  commentAvatarText: { fontSize: 12, fontWeight: '900', color: PALETTE.subText },
  commentBody: { flex: 1 },
  commentMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  commentAuthor: { fontSize: 13, fontWeight: '900', color: PALETTE.text },
  commentTime: { fontSize: 11, fontWeight: '700', color: PALETTE.muted, flex: 1 },
  commentContent: { fontSize: 13, lineHeight: 21, fontWeight: '600', color: PALETTE.subText, letterSpacing: -0.2 },
  commentLikeRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' },
  commentLikeText: { fontSize: 11, fontWeight: '800', color: '#CBD5E1' },
  commentLikeTextActive: { color: PALETTE.coralDark },
  bottomSpace: { height: 24 },
  inputBar: { borderTopWidth: 1, borderTopColor: PALETTE.softBorder, backgroundColor: PALETTE.bg, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 24, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  myAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: PALETTE.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  myAvatarText: { fontSize: 12, fontWeight: '900', color: PALETTE.primaryDark },
  inputWrap: { flex: 1, minHeight: 42, borderRadius: 21, backgroundColor: PALETTE.softBg, borderWidth: 1, borderColor: PALETTE.softBorder, paddingLeft: 14, paddingRight: 5, flexDirection: 'row', alignItems: 'center' },
  commentInput: { flex: 1, maxHeight: 86, paddingVertical: 10, fontSize: 13, fontWeight: '600', color: PALETTE.text },
  sendButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  sendButtonActive: { backgroundColor: PALETTE.black },
});
