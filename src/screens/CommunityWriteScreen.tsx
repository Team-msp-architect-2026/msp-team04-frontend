import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants';

export interface WritePostData {
  category: string;
  title: string;
  content: string;
  tags: string[];
  childAge: string;
}

interface CommunityWriteScreenProps {
  onBack: () => void;
  onSubmit?: (post: WritePostData) => void;
}

const CATEGORIES = ['후기', '질문', '정보', '교육', '돌봄'];
const CHILD_AGE_OPTIONS = ['1세', '2세', '3세', '4세', '5세', '6세', '7세', '8세', '9세', '10세 이상'];
const SUGGESTED_TAGS = ['미술', '코딩', '영어', '수학', '돌봄', '지원금', '분리불안', '소근육발달', '교육고민', '맞벌이', '후기'];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  후기: { bg: '#FFF3CD', text: '#d4a800', border: '#FFE082' },
  질문: { bg: '#EBF8FF', text: '#2B6CB0', border: '#BEE3F8' },
  정보: { bg: '#F0FFF4', text: '#276749', border: '#9AE6B4' },
  교육: { bg: '#FAF5FF', text: '#6B46C1', border: '#D6BCFA' },
  돌봄: { bg: '#FFF5F5', text: '#C53030', border: '#FEB2B2' },
};

export default function CommunityWriteScreen({ onBack, onSubmit }: CommunityWriteScreenProps) {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [childAge, setChildAge] = useState('');
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);

  const canSubmit = category && title.trim() && content.trim();

  const toggleTag = (tag: string) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 5 ? [...prev, tag] : prev
    );
  };

  const addCustomTag = () => {
    const t = customTag.trim().replace(/^#/, '');
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags(prev => [...prev, t]);
      setCustomTag('');
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit?.({ category, title, content, tags, childAge });
    onBack();
  };

  return (
    <SafeAreaView style={s.root}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>글쓰기</Text>
        <TouchableOpacity
          style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <Text style={[s.submitBtnText, !canSubmit && s.submitBtnTextDisabled]}>등록</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* 카테고리 */}
        <View style={s.section}>
          <Text style={s.label}>카테고리 *</Text>
          <View style={s.categoryRow}>
            {CATEGORIES.map(cat => {
              const color = CATEGORY_COLORS[cat];
              const selected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    s.categoryBtn,
                    selected && { backgroundColor: color.bg, borderColor: color.border },
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[s.categoryBtnText, selected && { color: color.text }]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 아이 나이 */}
        <View style={s.section}>
          <Text style={s.label}>아이 나이 (선택)</Text>
          <TouchableOpacity
            style={s.dropdown}
            onPress={() => setShowAgeDropdown(!showAgeDropdown)}
          >
            <Text style={[s.dropdownText, !childAge && s.dropdownPlaceholder]}>
              {childAge || '아이 나이를 선택하세요'}
            </Text>
            <Ionicons name={showAgeDropdown ? 'chevron-up' : 'chevron-down'} size={16} color="#888" />
          </TouchableOpacity>
          {showAgeDropdown && (
            <View style={s.dropdownList}>
              {CHILD_AGE_OPTIONS.map(age => (
                <TouchableOpacity
                  key={age}
                  style={s.dropdownItem}
                  onPress={() => { setChildAge(age); setShowAgeDropdown(false); }}
                >
                  <Text style={[s.dropdownItemText, childAge === age && s.dropdownItemTextSelected]}>
                    {age}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 제목 */}
        <View style={s.section}>
          <Text style={s.label}>제목 *</Text>
          <TextInput
            style={s.input}
            placeholder="제목을 입력하세요"
            placeholderTextColor="#aaa"
            value={title}
            onChangeText={setTitle}
            maxLength={50}
          />
          <Text style={s.charCount}>{title.length}/50</Text>
        </View>

        {/* 내용 */}
        <View style={s.section}>
          <Text style={s.label}>내용 *</Text>
          <TextInput
            style={s.textarea}
            placeholder="다른 부모님들과 나누고 싶은 이야기를 적어주세요. 경험, 후기, 질문 모두 환영해요 😊"
            placeholderTextColor="#aaa"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
          <Text style={s.charCount}>{content.length}자</Text>
        </View>

        {/* 태그 */}
        <View style={s.section}>
          <Text style={s.label}>태그 (최대 5개)</Text>

          {/* 선택된 태그 */}
          {tags.length > 0 && (
            <View style={s.tagRow}>
              {tags.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={s.tagSelected}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={s.tagSelectedText}>#{tag}</Text>
                  <Ionicons name="close" size={12} color="#d4a800" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 추천 태그 */}
          <View style={s.tagRow}>
            {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(tag => (
              <TouchableOpacity
                key={tag}
                style={[s.tagBtn, tags.length >= 5 && s.tagBtnDisabled]}
                onPress={() => toggleTag(tag)}
                disabled={tags.length >= 5}
              >
                <Text style={s.tagBtnText}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 직접 입력 */}
          <View style={s.customTagRow}>
            <TextInput
              style={s.customTagInput}
              placeholder="직접 입력..."
              placeholderTextColor="#aaa"
              value={customTag}
              onChangeText={setCustomTag}
              onSubmitEditing={addCustomTag}
            />
            <TouchableOpacity
              style={[s.customTagBtn, (!customTag.trim() || tags.length >= 5) && s.customTagBtnDisabled]}
              onPress={addCustomTag}
              disabled={!customTag.trim() || tags.length >= 5}
            >
              <Text style={s.customTagBtnText}>추가</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 안내 문구 */}
        <View style={s.notice}>
          <Text style={s.noticeText}>
            📌 개인정보(이름, 연락처, 기관명 등)는 익명으로 표기해주세요.{'\n'}
            커뮤니티 가이드라인을 위반하는 게시물은 삭제될 수 있습니다.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  submitBtn: { backgroundColor: colors.primary.default, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  submitBtnDisabled: { backgroundColor: '#E5E7EB' },
  submitBtnText: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  submitBtnTextDisabled: { color: '#aaa' },

  scroll: { padding: 16, paddingBottom: 40 },

  section: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 8 },

  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F7F8FA', borderWidth: 2, borderColor: 'transparent' },
  categoryBtnText: { fontSize: 13, fontWeight: '600', color: '#A0AEC0' },

  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9F9F9', paddingHorizontal: 14 },
  dropdownText: { fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
  dropdownPlaceholder: { color: '#aaa' },
  dropdownList: { marginTop: 4, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff', overflow: 'hidden' },
  dropdownItem: { height: 44, paddingHorizontal: 14, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  dropdownItemText: { fontSize: 14, color: '#374151' },
  dropdownItemTextSelected: { color: '#d4a800', fontWeight: '600' },

  input: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9F9F9', paddingHorizontal: 14, fontSize: 14, color: '#1A1A1A' },
  textarea: { borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9F9F9', paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1A1A1A', minHeight: 160, lineHeight: 22 },
  charCount: { fontSize: 11, color: '#aaa', textAlign: 'right', marginTop: 4 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tagSelected: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF3CD', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#FFE082' },
  tagSelectedText: { fontSize: 12, fontWeight: '600', color: '#d4a800' },
  tagBtn: { backgroundColor: '#F7F8FA', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  tagBtnDisabled: { opacity: 0.4 },
  tagBtnText: { fontSize: 12, color: '#718096' },

  customTagRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  customTagInput: { flex: 1, height: 40, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9F9F9', paddingHorizontal: 14, fontSize: 14, color: '#1A1A1A' },
  customTagBtn: { backgroundColor: colors.primary.default, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  customTagBtnDisabled: { backgroundColor: '#E5E7EB' },
  customTagBtnText: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },

  notice: { backgroundColor: '#F9F9F9', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  noticeText: { fontSize: 12, color: '#888', lineHeight: 20 },
});