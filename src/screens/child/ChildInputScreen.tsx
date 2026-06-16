import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../constants';
import StepIndicator from '../../components/StepIndicator';

export interface ChildFormData {
  childName: string;
  age: number;
  concerns: string[];
}

interface ChildInputScreenProps {
  onBack: () => void;
  onComplete: (data: ChildFormData) => void;
}

const CONCERN_OPTIONS = [
  { id: 'study', label: '학습', emoji: '📚' },
  { id: 'friends', label: '친구 관계', emoji: '👫' },
  { id: 'personality', label: '성격', emoji: '💝' },
  { id: 'career', label: '진로', emoji: '🎯' },
  { id: 'other', label: '기타', emoji: '✨' },
];

const AGE_OPTIONS = Array.from({ length: 11 }, (_, i) => i + 3); // 3세 ~ 13세

export default function ChildInputScreen({ onBack, onComplete }: ChildInputScreenProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ChildFormData>({
    childName: '',
    age: 7,
    concerns: [],
  });

  const TOTAL_STEPS = 4;

  const canProceed = () => {
    switch (step) {
      case 1: return formData.childName.trim() !== '';
      case 2: return formData.age > 0;
      case 3: return formData.concerns.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onBack();
  };

  const toggleConcern = (label: string) => {
    setFormData(prev => ({
      ...prev,
      concerns: prev.concerns.includes(label)
        ? prev.concerns.filter(c => c !== label)
        : [...prev.concerns, label],
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>👋</Text>
              </View>
              <Text style={styles.stepTitle}>아이 이름을 알려주세요</Text>
              <Text style={styles.stepDesc}>별명이나 애칭도 괜찮아요</Text>
            </View>
            <TextInput
              style={styles.nameInput}
              value={formData.childName}
              onChangeText={text => setFormData({ ...formData, childName: text })}
              placeholder="예: 하은이"
              placeholderTextColor={colors.text.secondary}
              autoFocus
              textAlign="center"
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>🎂</Text>
              </View>
              <Text style={styles.stepTitle}>{formData.childName}이(가) 몇 살인가요?</Text>
              <Text style={styles.stepDesc}>만 나이로 선택해 주세요</Text>
            </View>
            <View style={styles.ageGrid}>
              {AGE_OPTIONS.map(age => (
                <TouchableOpacity
                  key={age}
                  style={[
                    styles.ageBtn,
                    formData.age === age && styles.ageBtnSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, age })}
                >
                  <Text
                    style={[
                      styles.ageBtnText,
                      formData.age === age && styles.ageBtnTextSelected,
                    ]}
                  >
                    {age}세
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {formData.age > 0 && (
              <Text style={styles.birthYearText}>
                {new Date().getFullYear() - formData.age}년생 ({formData.age}세)
              </Text>
            )}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>💭</Text>
              </View>
              <Text style={styles.stepTitle}>어떤 고민이 있으세요?</Text>
              <Text style={styles.stepDesc}>여러 개 선택할 수 있어요</Text>
            </View>
            <View style={styles.concernList}>
              {CONCERN_OPTIONS.map(concern => {
                const selected = formData.concerns.includes(concern.label);
                return (
                  <TouchableOpacity
                    key={concern.id}
                    style={[styles.concernBtn, selected && styles.concernBtnSelected]}
                    onPress={() => toggleConcern(concern.label)}
                  >
                    <Text style={styles.concernEmoji}>{concern.emoji}</Text>
                    <Text style={[styles.concernLabel, selected && styles.concernLabelSelected]}>
                      {concern.label}
                    </Text>
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                      {selected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>✨</Text>
              </View>
              <Text style={styles.stepTitle}>입력 완료!</Text>
              <Text style={styles.stepDesc}>아이 정보를 확인해 주세요</Text>
            </View>

            {/* 요약 카드 */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryAvatar}>
  <Image
    source={require('../../../assets/moment-splash.png')}
    style={{ width: 56, height: 56, borderRadius: 28 }}
    resizeMode="cover"
  />
</View>
                <View>
                  <Text style={styles.summaryName}>{formData.childName}</Text>
                  <Text style={styles.summaryAge}>만 {formData.age}세</Text>
                </View>
              </View>

              <Text style={styles.summaryLabel}>관심 분야</Text>
              <View style={styles.tagRow}>
                {formData.concerns.map(concern => {
                  const found = CONCERN_OPTIONS.find(c => c.label === concern);
                  return (
                    <View key={concern} style={styles.tag}>
                      <Text style={styles.tagText}>{found?.emoji} {concern}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        );
    }
  };

  return (
  <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
    {/* 헤더 */}
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
        <Text style={styles.backBtnText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>아이 정보 입력</Text>
      <View style={{ width: 40 }} />
    </View>

    {/* 프로그레스 바 */}
    <View style={styles.stepIndicatorWrap}>
      <StepIndicator total={TOTAL_STEPS} current={step - 1} />
    </View>

    {/* 본문 */}
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      {renderStep()}
    </ScrollView>

    {/* 하단 버튼 */}
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
        onPress={handleNext}
        disabled={!canProceed()}
      >
        <Text style={styles.nextBtnText}>
          {step === TOTAL_STEPS ? '✨ 등록하기' : '다음 →'}
        </Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },

  stepIndicatorWrap: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backBtnText: { fontSize: 20, color: '#1A1A1A' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },

  // 프로그레스
  progressBg: { height: 4, backgroundColor: '#F0F0F0' },
  progressFill: { height: 4, backgroundColor: colors.primary.default },

  // 스크롤
  scrollContent: { padding: 24, paddingBottom: 40 },

  // 스텝 공통
  stepContainer: { gap: 32 },
  stepHeader: { alignItems: 'center', gap: 8 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF9E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconEmoji: { fontSize: 32 },
  stepTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  stepDesc: { fontSize: 14, color: '#888', textAlign: 'center' },

  // 이름 입력
  nameInput: {
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    fontSize: 18,
    paddingHorizontal: 16,
    color: '#1A1A1A',
  },

  // 나이 선택
  ageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  ageBtn: {
    width: '22%',
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  ageBtnSelected: {
    borderColor: colors.primary.default,
    backgroundColor: '#FFF9E6',
  },
  ageBtnText: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  ageBtnTextSelected: { color: colors.primary.default },

  // 고민 선택
  concernList: { gap: 12 },
  concernBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  concernBtnSelected: {
    borderColor: colors.primary.default,
    backgroundColor: '#FFF9E6',
  },
  concernEmoji: { fontSize: 24 },
  concernLabel: { flex: 1, fontSize: 16, fontWeight: '500', color: '#1A1A1A' },
  concernLabelSelected: { color: colors.primary.default },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary.default,
    borderColor: colors.primary.default,
  },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // 요약 카드
  summaryCard: {
    borderRadius: 24,
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FFE08A',
    padding: 20,
    gap: 16,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  summaryAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryAvatarText: { fontSize: 24, fontWeight: '700', color: '#fff' },
  summaryName: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  summaryAge: { fontSize: 14, color: '#888', marginTop: 2 },
  summaryLabel: { fontSize: 12, color: '#888' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#FFE08A',
  },
  tagText: { fontSize: 13, fontWeight: '500', color: colors.primary.default },

  // 하단 버튼
  footer: {
  padding: 16,
  backgroundColor: '#fff',
  borderTopWidth: 1,
  borderTopColor: '#F0F0F0',
},
  nextBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#E5E7EB' },
  nextBtnText: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  birthYearText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.default,
    marginTop: 8,
  },
});