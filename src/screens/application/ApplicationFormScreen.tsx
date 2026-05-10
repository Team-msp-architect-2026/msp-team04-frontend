import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import client from '../../api/client';

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

export interface CreatedApplication {
  applicationId: number;
  programId: number;
  programTitle: string;
  reserveNo: number;
  applicationStatus: string;
  seatLockedUntil: string;
  remainCapacity: number;
}

interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

interface ApplicationFormScreenProps {
  program: ProgramDetail;
  childId?: number;
  initialChildName?: string;
  initialParentName?: string;
  onBack: () => void;
  onNext: (
    info: ApplicationInfo,
    createdApplication: CreatedApplication,
  ) => void;
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
  redSoft: '#FFF3F1',
  redBorder: '#FAD9D4',
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
  childId,
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

  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'submitting' | 'failed'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const aiStartMessage = getAIStartMessage(form.childName);

  const canProceed =
    form.childName.trim() !== '' &&
    form.parentName.trim() !== '' &&
    form.parentPhone.trim() !== '' &&
    agreements.service &&
    agreements.privacy &&
    agreements.refund;

  const isSubmitting = submitStatus === 'submitting';

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

  const handleNext = async () => {
    if (!canProceed || isSubmitting) {
      return;
    }

    if (!childId) {
      setSubmitStatus('failed');
      setErrorMessage('등록된 자녀 ID가 없어 신청을 진행할 수 없습니다.');
      return;
    }

    setSubmitStatus('submitting');
    setErrorMessage('');

    const applicationInfo: ApplicationInfo = {
      childName: form.childName.trim(),
      parentName: form.parentName.trim(),
      parentPhone: form.parentPhone.trim(),
      request: form.request.trim(),
      aiStartMessage,
      agreedTerms: agreements.service,
      agreedPrivacy: agreements.privacy,
      agreedRefund: agreements.refund,
    };

    try {
      console.log('[신청 요청]', {
        programId: program.id,
        programTitle: program.title,
        childId,
      });

      const response = await client.post<ApiResponse<CreatedApplication>>(
        '/api/applications',
        {
          programId: program.id,
          childId,
          applicantName: applicationInfo.childName,
          parentName: applicationInfo.parentName,
          phone: applicationInfo.parentPhone,
          requestNote: applicationInfo.request,
          aiStartMessage: applicationInfo.aiStartMessage,
          agreeTerms: applicationInfo.agreedTerms,
          agreePrivacy: applicationInfo.agreedPrivacy,
        },
      );

      console.log('[신청 생성 성공]', response.data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || '신청 생성에 실패했습니다.');
      }

      onNext(applicationInfo, response.data.data);
    } catch (error: any) {
      console.log(
        '[신청 생성 실패]',
        error?.response?.status,
        error?.response?.data ?? error?.message ?? error,
      );

      setSubmitStatus('failed');

      if (error?.response?.status === 401) {
        setErrorMessage('로그인 토큰이 만료되었거나 저장되지 않았습니다.');
        return;
      }

      if (error?.response?.status === 404) {
        setErrorMessage(
          error?.response?.data?.message ??
            '프로그램 정보를 찾을 수 없습니다. 프로그램 ID를 확인해 주세요.',
        );
        return;
      }

      if (error?.response?.status === 409) {
        setErrorMessage(
          error?.response?.data?.message ??
            '이미 신청한 프로그램이거나 현재 신청할 수 없습니다.',
        );
        return;
      }

      if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
        return;
      }

      setErrorMessage('신청 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  const renderCheckbox = (checked: boolean) => (
    <View style={[styles.checkbox, checked && styles.checkboxActive]}>
      {checked && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
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

        {submitStatus === 'failed' && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={PALETTE.red} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

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
          style={[
            styles.nextButton,
            (!canProceed || isSubmitting) && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canProceed || isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <View style={styles.processingRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.nextButtonText}>신청 생성중...</Text>
            </View>
          ) : (
            <Text
              style={[
                styles.nextButtonText,
                !canProceed && styles.nextButtonTextDisabled,
              ]}
            >
              다음
            </Text>
          )}
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
    marginBottom: 18,
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
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.25,
    marginBottom: 11,
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
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.subText,
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
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.softBorder,
    backgroundColor: PALETTE.softBg,
    paddingHorizontal: 13,
    fontSize: 14,
    fontWeight: '700',
    color: PALETTE.text,
  },
  textarea: {
    minHeight: 110,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.softBorder,
    backgroundColor: PALETTE.softBg,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '700',
    color: PALETTE.text,
    lineHeight: 21,
  },
  aiDateBanner: {
    borderRadius: 17,
    borderWidth: 1,
    borderColor: PALETTE.primaryBorder,
    backgroundColor: PALETTE.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  aiIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiDateText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: PALETTE.primaryDark,
    lineHeight: 19,
  },
  termsBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  termsAllRow: {
    minHeight: 52,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.softBorder,
  },
  termsAllText: {
    fontSize: 14,
    fontWeight: '900',
    color: PALETTE.text,
  },
  termsRow: {
    minHeight: 48,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  termsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.softBorder,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.subText,
  },
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    borderColor: PALETTE.primary,
    backgroundColor: PALETTE.primary,
  },
  errorBanner: {
    marginTop: 4,
    marginBottom: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.redBorder,
    backgroundColor: PALETTE.redSoft,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    color: PALETTE.red,
  },
  bottomSpace: {
    height: 104,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: PALETTE.softBorder,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    flexDirection: 'row',
    gap: 10,
  },
  homeButton: {
    width: 52,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: PALETTE.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  nextButtonTextDisabled: {
    color: '#94A3B8',
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});