import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ProgramDetail } from '../program/ProgramDetailScreen';
import type { ApplicationInfo } from './ApplicationFormScreen';
import type { PaymentSummary } from './PaymentScreen';

interface ApplicationCompleteScreenProps {
  program: ProgramDetail;
  applicationInfo: ApplicationInfo;
  paymentSummary: PaymentSummary;
  onGoApplications: () => void;
  onGoHome: () => void;
}

const PALETTE = {
  text: '#111827',
  subText: '#64748B',
  muted: '#94A3B8',
  border: '#E8EDF3',
  softBorder: '#EEF2F6',
  bg: '#FFFFFF',
  primary: '#6377F2',
  primaryDark: '#4D5FD2',
  primarySoft: '#F3F5FF',
  primaryBorder: '#DCE2FF',
  blue: '#4A90E2',
  blueDark: '#2563A8',
  blueSoft: '#F2F8FF',
  blueBorder: '#D7EAFE',
};

function formatPrice(value: number): string {
  if (value === 0) {
    return '무료';
  }

  return `${value.toLocaleString('ko-KR')}원`;
}

function getStartDate() {
  const today = new Date();
  const daysUntilThursday = (4 - today.getDay() + 7) % 7 || 7;
  const thursday = new Date(today);

  thursday.setDate(today.getDate() + daysUntilThursday);

  const year = today.getFullYear();
  const month = thursday.getMonth() + 1;
  const date = thursday.getDate();

  return {
    full: `${year}년 ${month}월 ${date}일 (목)`,
    short: `${month}월 ${date}일(목)`,
  };
}

function getPaymentMethodLabel(method: PaymentSummary['paymentMethod']) {
  if (method === 'toss') {
    return '토스페이먼츠';
  }

  return '무료 신청';
}

export default function ApplicationCompleteScreen({
  program,
  applicationInfo,
  paymentSummary,
  onGoApplications,
  onGoHome,
}: ApplicationCompleteScreenProps) {
  const startDate = getStartDate();

  const summaryRows = [
    { label: '프로그램', value: program.title },
    { label: '아이 이름', value: applicationInfo.childName },
    { label: '보호자', value: applicationInfo.parentName },
    { label: '연락처', value: applicationInfo.parentPhone },
    { label: '시작일', value: startDate.full },
    { label: '수업 시간', value: program.schedule },
    { label: '결제 금액', value: formatPrice(paymentSummary.finalAmount) },
    {
      label: '결제 수단',
      value: getPaymentMethodLabel(paymentSummary.paymentMethod),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.completeIcon}>
          <Ionicons name="checkmark" size={42} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>신청이 완료됐어요!</Text>

        <Text style={styles.subtitle}>
          {program.title}
          {'\n'}
          {startDate.short}부터 시작됩니다.
        </Text>

        <View style={styles.summaryCard}>
          {summaryRows.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.summaryRow,
                index !== summaryRows.length - 1 && styles.summaryRowBorder,
              ]}
            >
              <Text style={styles.summaryLabel}>{item.label}</Text>

              <Text style={styles.summaryValue} numberOfLines={2}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.aiNextCard}>
          <View style={styles.aiNextHeader}>
            <Ionicons name="sparkles" size={15} color={PALETTE.primary} />
            <Text style={styles.aiNextTitle}>AI 다음 추천</Text>
          </View>

          <Text style={styles.aiNextDesc}>
            미술 수업과 함께{' '}
            <Text style={styles.boldText}>오감 발달 음악 교실</Text>을
            병행하면 {applicationInfo.childName || '아이'}의 창의력 발달에 더
            도움이 될 수 있어요.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onGoApplications}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>신청 내역 확인하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onGoHome}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>홈으로 돌아가기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.bg,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 58,
    paddingBottom: 40,
  },
  completeIcon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: PALETTE.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PALETTE.subText,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 30,
  },
  summaryCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    marginBottom: 16,
  },
  summaryRow: {
    minHeight: 48,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.softBorder,
  },
  summaryLabel: {
    width: 72,
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.muted,
  },
  summaryValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    lineHeight: 19,
  },
  aiNextCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.primaryBorder,
    backgroundColor: PALETTE.primarySoft,
    padding: 16,
    marginBottom: 30,
  },
  aiNextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 9,
  },
  aiNextTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: PALETTE.primaryDark,
  },
  aiNextDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6574B6',
    lineHeight: 21,
  },
  boldText: {
    fontWeight: '900',
    color: PALETTE.primaryDark,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    backgroundColor: PALETTE.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  secondaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#475569',
  },
});