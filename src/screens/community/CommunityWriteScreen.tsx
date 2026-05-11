import React, { useMemo, useState } from 'react';
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
import { communityApi, PostCategory, PostDetail } from '../../api/community';

type CategoryKey = 'education' | 'care' | 'review' | 'info' | 'question';

interface CommunityWriteScreenProps {
  onBack: () => void;
  onSubmit: () => void;
  editPost?: PostDetail;
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

const CATEGORIES: { key: CategoryKey; label: string; description: string }[] = [
  { key: 'education', label: '교육', description: '수업, 학습, 프로그램 고민' },
  { key: 'care', label: '돌봄', description: '하원, 돌봄 공백, 맞벌이 고민' },
  { key: 'review', label: '후기', description: '직접 경험한 프로그램 후기' },
  { key: 'info', label: '정보공유', description: '지원금, 무료 프로그램, 지역 정보' },
  { key: 'question', label: '질문', description: '다른 부모님께 묻고 싶은 내용' },
];

const AGE_OPTIONS = ['공통', '만 3~4세', '만 5~6세', '초등 저학년', '초등 고학년'];

const CATEGORY_API_MAP: Record<CategoryKey, PostCategory> = {
  education: 'EDUCATION',
  care: 'CARE',
  review: 'REVIEW',
  info: 'INFO',
  question: 'QUESTION',
};

const API_CATEGORY_MAP: Record<PostCategory, CategoryKey> = {
  EDUCATION: 'education',
  CARE: 'care',
  REVIEW: 'review',
  INFO: 'info',
  QUESTION: 'question',
};

export default function CommunityWriteScreen({ onBack, onSubmit, editPost }: CommunityWriteScreenProps) {
  const isEditMode = !!editPost;

  const [category, setCategory] = useState<CategoryKey>(
    editPost ? API_CATEGORY_MAP[editPost.category] : 'question',
  );
  const [ageGroup, setAgeGroup] = useState(editPost?.childAge ?? '공통');
  const [title, setTitle] = useState(editPost?.title ?? '');
  const [content, setContent] = useState(editPost?.content ?? '');
  const [loading, setLoading] = useState(false);

  const canSubmit = title.trim().length >= 3 && content.trim().length >= 10 && !loading;

  const selectedCategory = useMemo(
    () => CATEGORIES.find(item => item.key === category),
    [category],
  );

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    try {
      if (isEditMode && editPost) {
        await communityApi.updatePost(editPost.postId, {
          category: CATEGORY_API_MAP[category],
          childAge: ageGroup === '공통' ? undefined : ageGroup,
          title: title.trim(),
          content: content.trim(),
        });
      } else {
        await communityApi.createPost({
          category: CATEGORY_API_MAP[category],
          childAge: ageGroup === '공통' ? undefined : ageGroup,
          title: title.trim(),
          content: content.trim(),
        });
      }
      onSubmit();
    } catch (e) {
      console.error(isEditMode ? '게시글 수정 실패' : '게시글 작성 실패', e);
      Alert.alert('오류', isEditMode ? '게시글 수정에 실패했습니다. 다시 시도해주세요.' : '게시글 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.headerTitle} pointerEvents="none">
            {isEditMode ? '글 수정' : '글쓰기'}
          </Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>카테고리</Text>
            <View style={styles.categoryChipRow}>
              {CATEGORIES.map(item => {
                const isActive = category === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                    onPress={() => setCategory(item.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.categoryDescription}>{selectedCategory?.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>아이 연령</Text>
            <View style={styles.ageChipRow}>
              {AGE_OPTIONS.map(option => {
                const isActive = ageGroup === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.ageChip, isActive && styles.ageChipActive]}
                    onPress={() => setAgeGroup(option)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.ageChipText, isActive && styles.ageChipTextActive]}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>제목</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="제목을 입력해주세요"
              placeholderTextColor="#A8B0BD"
              maxLength={60}
            />
            <View style={styles.helperRow}>
              <Text style={styles.helperText}>3자 이상 입력해주세요</Text>
              <Text style={styles.inputCount}>{title.length}/60</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>내용</Text>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder={`예: ${selectedCategory?.description ?? '궁금한 내용을'} 편하게 적어주세요.`}
              placeholderTextColor="#A8B0BD"
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
            <View style={styles.helperRow}>
              <Text style={styles.helperText}>10자 이상 입력하면 등록할 수 있어요</Text>
              <Text style={styles.inputCount}>{content.length}/1000</Text>
            </View>
          </View>

          <View style={styles.noticeCard}>
            <Ionicons name="information-circle-outline" size={17} color={PALETTE.primaryDark} />
            <Text style={styles.noticeText}>
              개인정보, 연락처, 기관 담당자 실명 등은 공개하지 않도록 주의해주세요.
            </Text>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.86}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[styles.submitButtonText, !canSubmit && styles.submitButtonTextDisabled]}>
                {isEditMode ? '수정하기' : '등록하기'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.bg },
  keyboardRoot: { flex: 1 },
  header: { height: 52, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: PALETTE.bg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 16, fontWeight: '800', color: PALETTE.text, letterSpacing: -0.3, zIndex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 118 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: PALETTE.text, letterSpacing: -0.2, marginBottom: 14 },
  categoryChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { height: 34, paddingHorizontal: 13, borderRadius: 17, borderWidth: 1, borderColor: PALETTE.border, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  categoryChipActive: { borderColor: PALETTE.primaryBorder, backgroundColor: PALETTE.primarySoft },
  categoryChipText: { fontSize: 12, fontWeight: '800', color: PALETTE.subText },
  categoryChipTextActive: { color: PALETTE.primaryDark },
  categoryDescription: { marginTop: 12, fontSize: 12, lineHeight: 18, fontWeight: '700', color: PALETTE.muted },
  ageChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ageChip: { height: 34, paddingHorizontal: 13, borderRadius: 17, borderWidth: 1, borderColor: PALETTE.border, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  ageChipActive: { borderColor: PALETTE.primaryBorder, backgroundColor: PALETTE.primarySoft },
  ageChipText: { fontSize: 12, fontWeight: '800', color: PALETTE.subText },
  ageChipTextActive: { color: PALETTE.primaryDark },
  titleInput: { height: 50, borderRadius: 16, borderWidth: 1, borderColor: PALETTE.border, backgroundColor: '#FFFFFF', paddingHorizontal: 14, fontSize: 14, fontWeight: '700', color: PALETTE.text },
  contentInput: { minHeight: 180, borderRadius: 18, borderWidth: 1, borderColor: PALETTE.border, backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 14, fontSize: 14, fontWeight: '600', color: PALETTE.text, lineHeight: 22 },
  helperRow: { marginTop: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  helperText: { flex: 1, fontSize: 11, fontWeight: '700', color: PALETTE.muted },
  inputCount: { fontSize: 11, fontWeight: '700', color: PALETTE.muted },
  noticeCard: { borderRadius: 17, borderWidth: 1, borderColor: PALETTE.primaryBorder, backgroundColor: PALETTE.primarySoft, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 19, fontWeight: '700', color: PALETTE.primaryDark },
  bottomSpace: { height: 10 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, borderTopColor: PALETTE.softBorder, backgroundColor: PALETTE.bg, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 },
  submitButton: { height: 48, borderRadius: 15, backgroundColor: PALETTE.black, alignItems: 'center', justifyContent: 'center' },
  submitButtonDisabled: { backgroundColor: '#E5E7EB' },
  submitButtonText: { fontSize: 15, fontWeight: '900', color: '#FFFFFF' },
  submitButtonTextDisabled: { color: '#9CA3AF' },
});
