import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ProgramDetail } from '../program/ProgramDetailScreen';

export interface ApplicationInfo {
  childName: string;
  parentName: string;
  parentPhone: string;
  request: string;
  aiStartMessage: string;
  agreedTerms: boolean;
  agreedPrivacy: boolean;
  agreedRefund: boolean;
}

interface ApplicationFormScreenProps {
  program: ProgramDetail;
  initialChildName?: string;
  initialParentName?: string;
  onBack: () => void;
  onNext: (info: ApplicationInfo) => void;
  onGoHome: () => void;
}

const PALETTE = {
  text: '#111827',
  subText: '#64748B',
  muted: '#94A3B8',
  border: '#E8EDF3',
  softBorder: '#EEF2F6',
  bg: '#FFFFFF',
  softBg: '#F8FAFC',
  primary: '#6377F2',
  primaryDark: '#4D5FD2',
  primarySoft: '#F3F5FF',
  primaryBorder: '#DCE2FF',
  blue: '#4A90E2',
  blueDark: '#2563A8',
  blueSoft: '#F2F8FF',
  blueBorder: '#D7EAFE',
  red: '#D85B52',
};

function getAIStartMessage(childName: string) {
  const today = new Date();
  const daysUntilThursday = (4 - today.getDay() + 7) % 7 || 7;
  const thursday = new Date(today);

  thursday.setDate(today.getDate() + daysUntilThursday);

  const month = thursday.getMonth() + 1;
  const date = thursday.getDate();
  const name = childName.trim() || '아이';

  return `${name}에게 최적의 시작일은 ${month}월 ${date}일(목)이에요`;
}

export default function ApplicationFormScreen({
  program,
  initialChildName = '',
  initialParentName = '',
  onBack,
  onNext,
  onGoHome,
}: ApplicationFormScreenProps) {
  const [form, setForm] = useState({
    childName: initialChildName,
    parentName: initialParentName,
    parentPhone: '',
    request: '',
  });

  const [agreements, setAgreements] = useState({
    all: false,
    service: false,
    privacy: false,
    refund: false,
  });

  const aiStartMessage = getAIStartMessage(form.childName);

  const canProceed =
    form.childName.trim() !== '' &&
    form.parentName.trim() !== '' &&
    form.parentPhone.trim() !== '' &&
    agreements.service &&
    agreements.privacy &&
    agreements.refund;

  const handleAgreeAll = () => {
    const nextValue = !agreements.all;

    setAgreements({
      all: nextValue,
      service: nextValue,
      privacy: nextValue,
      refund: nextValue,
    });
  };

  const handleAgreeItem = (key: 'service' | 'privacy' | 'refund') => {
    const next = {
      ...agreements,
      [key]: !agreements[key],
    };

    next.all = next.service && next.privacy && next.refund;

    setAgreements(next);
  };

  const handleNext = () => {
    if (!canProceed) {
      return;
    }

    onNext({
      childName: form.childName.trim(),
      parentName: form.parentName.trim(),
      parentPhone: form.parentPhone.trim(),
      request: form.request.trim(),
      aiStartMessage,
      agreedTerms: agreements.service,
      agreedPrivacy: agreements.privacy,
      agreedRefund: agreements.refund,
    });
  };

  const renderCheckbox = (checked: boolean) => (
    <View style={[styles.checkbox, checked && styles.checkboxActive]}>
      {checked && (
        <Ionicons name="checkmark" size={13} color="#FFFFFF" />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          신청 정보 입력
        </Text>

        <View style={styles.headerButton} />
      </View>

      <View style={styles.progressArea}>
        <View style={styles.progressTrack}>
          <View style={styles.progressActive} />
          <View style={styles.progressInactive} />
        </View>

        <View style={styles.progressLabelRow}>
          <Text style={[styles.progressLabel, styles.progressLabelActive]}>
            신청 정보
          </Text>
          <Text style={styles.progressLabel}>결제</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.programCard}>
          <View style={styles.programIconBox}>
            <Ionicons name="school-outline" size={22} color={PALETTE.primary} />
          </View>

          <View style={styles.programInfo}>
            <Text style={styles.programOrg}>{program.organization}</Text>
            <Text style={styles.programTitle} numberOfLines={1}>
              {program.title}
            </Text>

            <View style={styles.programMetaRow}>
              <Text style={styles.programPrice}>{program.price}</Text>
              <Text style={styles.programDot}>·</Text>
              <Text style={styles.programSchedule} numberOfLines={1}>
                {program.schedule}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>신청자 정보</Text>

          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>
                아이 이름 <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={form.childName}
                onChangeText={value => setForm({ ...form, childName: value })}
                placeholder="실명으로 입력해주세요"
                placeholderTextColor="#A8B0BD"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>
                보호자 이름 <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={form.parentName}
                onChangeText={value => setForm({ ...form, parentName: value })}
                placeholder="보호자 이름을 입력해주세요"
                placeholderTextColor="#A8B0BD"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>
                연락처 <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={form.parentPhone}
                onChangeText={value =>
                  setForm({ ...form, parentPhone: value })
                }
                placeholder="010-0000-0000"
                placeholderTextColor="#A8B0BD"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            요청 사항 <Text style={styles.optional}>(선택)</Text>
          </Text>

          <TextInput
            style={styles.textarea}
            value={form.request}
            onChangeText={value => setForm({ ...form, request: value })}
            placeholder="알레르기, 특이사항 등을 입력해주세요"
            placeholderTextColor="#A8B0BD"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.aiDateBanner}>
          <View style={styles.aiIconCircle}>
            <Ionicons name="sparkles" size={14} color={PALETTE.primary} />
          </View>
          <Text style={styles.aiDateText}>{aiStartMessage}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>약관 동의</Text>

          <View style={styles.termsBox}>
            <TouchableOpacity
              style={styles.termsAllRow}
              onPress={handleAgreeAll}
              activeOpacity={0.75}
            >
              {renderCheckbox(agreements.all)}
              <Text style={styles.termsAllText}>전체 동의</Text>
            </TouchableOpacity>

            {[
              { key: 'service' as const, label: '서비스 이용약관 (필수)' },
              {
                key: 'privacy' as const,
                label: '개인정보 수집 및 이용 동의 (필수)',
              },
              { key: 'refund' as const, label: '환불 규정 동의 (필수)' },
            ].map((item, index, array) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.termsRow,
                  index !== array.length - 1 && styles.termsRowBorder,
                ]}
                onPress={() => handleAgreeItem(item.key)}
                activeOpacity={0.75}
              >
                {renderCheckbox(agreements[item.key])}
                <Text style={styles.termsText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={15} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={onGoHome}
          activeOpacity={0.78}
        >
          <Ionicons name="home-outline" size={21} color="#475569" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canProceed}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.nextButtonText,
              !canProceed && styles.nextButtonTextDisabled,
            ]}
          >
            다음
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.bg,
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
  progressArea: {
    borderBottomWidth: 1,
    borderBottomColor: '#F7F8FA',
    backgroundColor: PALETTE.bg,
  },
  progressTrack: {
    height: 4,
    flexDirection: 'row',
  },
  progressActive: {
    flex: 1,
    backgroundColor: PALETTE.primary,
  },
  progressInactive: {
    flex: 1,
    backgroundColor: '#E9EEF5',
  },
  progressLabelRow: {
    height: 34,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: PALETTE.muted,
  },
  progressLabelActive: {
    color: PALETTE.primaryDark,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  programCard: {
    minHeight: 82,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  programIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: PALETTE.primarySoft,
    borderWidth: 1,
    borderColor: PALETTE.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  programInfo: {
    flex: 1,
  },
  programOrg: {
    fontSize: 11,
    fontWeight: '700',
    color: PALETTE.muted,
  },
  programTitle: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.3,
  },
  programMetaRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  programPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: PALETTE.primaryDark,
  },
  programDot: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  programSchedule: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.subText,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  formCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    padding: 15,
    gap: 16,
  },
  fieldGroup: {
    gap: 7,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: PALETTE.text,
  },
  required: {
    color: PALETTE.red,
  },
  optional: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.muted,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: 15,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    backgroundColor: '#FFFFFF',
  },
  textarea: {
    minHeight: 104,
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 13,
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    backgroundColor: '#FFFFFF',
    lineHeight: 20,
  },
  aiDateBanner: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.primaryBorder,
    backgroundColor: PALETTE.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiDateText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '800',
    color: PALETTE.primaryDark,
    letterSpacing: -0.2,
  },
  termsBox: {
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  termsAllRow: {
    minHeight: 52,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.softBorder,
    backgroundColor: PALETTE.primarySoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  termsAllText: {
    fontSize: 14,
    fontWeight: '900',
    color: PALETTE.text,
  },
  termsRow: {
    minHeight: 50,
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  termsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.softBorder,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: -0.2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.8,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    borderColor: PALETTE.primary,
    backgroundColor: PALETTE.primary,
  },
  bottomSpace: {
    height: 104,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  homeButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: PALETTE.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  nextButtonTextDisabled: {
    color: '#9CA3AF',
  },
});