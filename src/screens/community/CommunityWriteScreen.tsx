import React, { useMemo, useState } from 'react';
import {
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

type CategoryKey = 'education' | 'care' | 'review' | 'info' | 'question';

interface CommunityWriteScreenProps {
  onBack: () => void;
  onSubmit: () => void;
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

const CATEGORIES: {
  key: CategoryKey;
  label: string;
  description: string;
}[] = [
  {
    key: 'education',
    label: '교육',
    description: '수업, 학습, 프로그램 고민',
  },
  {
    key: 'care',
    label: '돌봄',
    description: '하원, 돌봄 공백, 맞벌이 고민',
  },
  {
    key: 'review',
    label: '후기',
    description: '직접 경험한 프로그램 후기',
  },
  {
    key: 'info',
    label: '정보공유',
    description: '지원금, 무료 프로그램, 지역 정보',
  },
  {
    key: 'question',
    label: '질문',
    description: '다른 부모님께 묻고 싶은 내용',
  },
];

const AGE_OPTIONS = ['공통', '만 3~4세', '만 5~6세', '초등 저학년', '초등 고학년'];

const TAG_SUGGESTIONS = [
  '무료',
  '공공',
  '소규모',
  '맞벌이',
  '돌봄',
  '미술',
  '코딩',
  '영어',
];

export default function CommunityWriteScreen({
  onBack,
  onSubmit,
}: CommunityWriteScreenProps) {
  const [category, setCategory] = useState<CategoryKey>('question');
  const [ageGroup, setAgeGroup] = useState('공통');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const canSubmit = title.trim().length >= 3 && content.trim().length >= 10;

  const selectedCategory = useMemo(
    () => CATEGORIES.find(item => item.key === category),
    [category],
  );

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(item => item !== tag)
        : prev.length >= 5
          ? prev
          : [...prev, tag],
    );
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit();
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
            글쓰기
          </Text>

          <TouchableOpacity
            style={styles.headerSubmitButton}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.headerSubmitText,
                !canSubmit && styles.headerSubmitTextDisabled,
              ]}
            >
              등록
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>카테고리</Text>

            <View style={styles.categoryList}>
              {CATEGORIES.map(item => {
                const isActive = category === item.key;

                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.categoryCard,
                      isActive && styles.categoryCardActive,
                    ]}
                    onPress={() => setCategory(item.key)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.categoryTextBox}>
                      <Text
                        style={[
                          styles.categoryLabel,
                          isActive && styles.categoryLabelActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text style={styles.categoryDescription}>
                        {item.description}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.radioCircle,
                        isActive && styles.radioCircleActive,
                      ]}
                    >
                      {isActive && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
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
                    <Text
                      style={[
                        styles.ageChipText,
                        isActive && styles.ageChipTextActive,
                      ]}
                    >
                      {option}
                    </Text>
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

            <Text style={styles.inputCount}>{title.length}/60</Text>
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

            <Text style={styles.inputCount}>{content.length}/1000</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitleNoMargin}>태그</Text>
              <Text style={styles.sectionHint}>최대 5개</Text>
            </View>

            <View style={styles.tagChipRow}>
              {TAG_SUGGESTIONS.map(tag => {
                const isActive = selectedTags.includes(tag);

                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagChip, isActive && styles.tagChipActive]}
                    onPress={() => toggleTag(tag)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.tagChipText,
                        isActive && styles.tagChipTextActive,
                      ]}
                    >
                      #{tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.noticeCard}>
            <Ionicons
              name="information-circle-outline"
              size={17}
              color={PALETTE.primaryDark}
            />
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
            <Text
              style={[
                styles.submitButtonText,
                !canSubmit && styles.submitButtonTextDisabled,
              ]}
            >
              등록하기
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PALETTE.bg,
  },

  keyboardRoot: {
    flex: 1,
  },

  header: {
    height: 52,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: PALETTE.bg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: PALETTE.text,
    letterSpacing: -0.3,
    zIndex: 1,
  },

  headerSubmitButton: {
    minWidth: 44,
    height: 34,
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 2,
  },

  headerSubmitText: {
    fontSize: 14,
    fontWeight: '900',
    color: PALETTE.black,
  },

  headerSubmitTextDisabled: {
    color: '#CBD5E1',
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 118,
  },

  section: {
    marginBottom: 30,
  },

  sectionTitleRow: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.2,
    marginBottom: 14,
  },

  sectionTitleNoMargin: {
    fontSize: 15,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.2,
  },

  sectionHint: {
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  categoryList: {
    gap: 10,
  },

  categoryCard: {
    minHeight: 66,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  categoryCardActive: {
    borderColor: PALETTE.primaryBorder,
    backgroundColor: PALETTE.primarySoft,
  },

  categoryTextBox: {
    flex: 1,
  },

  categoryLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: PALETTE.text,
  },

  categoryLabelActive: {
    color: PALETTE.primaryDark,
  },

  categoryDescription: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: PALETTE.muted,
    lineHeight: 18,
  },

  radioCircle: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.6,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  radioCircleActive: {
    borderColor: PALETTE.black,
  },

  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: PALETTE.black,
  },

  ageChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  ageChip: {
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  ageChipActive: {
    borderColor: PALETTE.primaryBorder,
    backgroundColor: PALETTE.primarySoft,
  },

  ageChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.subText,
  },

  ageChipTextActive: {
    color: PALETTE.primaryDark,
  },

  titleInput: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '700',
    color: PALETTE.text,
  },

  contentInput: {
    minHeight: 180,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 14,
    fontWeight: '600',
    color: PALETTE.text,
    lineHeight: 22,
  },

  inputCount: {
    marginTop: 7,
    alignSelf: 'flex-end',
    fontSize: 11,
    fontWeight: '700',
    color: PALETTE.muted,
  },

  tagChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  tagChip: {
    height: 32,
    paddingHorizontal: 11,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tagChipActive: {
    borderColor: PALETTE.primaryBorder,
    backgroundColor: PALETTE.primarySoft,
  },

  tagChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.subText,
  },

  tagChipTextActive: {
    color: PALETTE.primaryDark,
  },

  noticeCard: {
    borderRadius: 17,
    borderWidth: 1,
    borderColor: PALETTE.primaryBorder,
    backgroundColor: PALETTE.primarySoft,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: '700',
    color: PALETTE.primaryDark,
  },

  bottomSpace: {
    height: 10,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: PALETTE.softBorder,
    backgroundColor: PALETTE.bg,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },

  submitButton: {
    height: 48,
    borderRadius: 15,
    backgroundColor: PALETTE.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },

  submitButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  submitButtonTextDisabled: {
    color: '#9CA3AF',
  },
});