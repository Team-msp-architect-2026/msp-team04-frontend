import React, { useState } from 'react';
import {
  ActivityIndicator,
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

export interface PaymentSummary {
  originalAmount: number;
  subsidyAmount: number;
  firstMonthDiscount: number;
  finalAmount: number;
  paymentMethod: 'toss' | 'free';
  approvedAt: string;
}

interface PaymentScreenProps {
  program: ProgramDetail;
  applicationInfo: ApplicationInfo;
  onBack: () => void;
  onComplete: (summary: PaymentSummary) => void;
  onGoHome: () => void;
}

type PaymentStatus = 'idle' | 'processing' | 'failed';

const SUBSIDY_AMOUNT = 30000;
const FIRST_MONTH_DISCOUNT = 5000;

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
  red: '#D85B52',
  redSoft: '#FFF3F1',
  redBorder: '#FAD9D4',
  toss: '#0064FF',
};

function getSubsidyApplicable(program: ProgramDetail): boolean {
  return (
    (program.type === 'government' || program.type === 'public') &&
    program.priceValue > 0
  );
}

function calcFinalPrice(program: ProgramDetail) {
  const originalAmount = program.priceValue;
  const subsidyApplicable = getSubsidyApplicable(program);
  const subsidyAmount = subsidyApplicable
    ? Math.min(SUBSIDY_AMOUNT, originalAmount)
    : 0;
  const afterSubsidy = originalAmount - subsidyAmount;
  const firstMonthDiscount =
    afterSubsidy > FIRST_MONTH_DISCOUNT ? FIRST_MONTH_DISCOUNT : 0;
  const finalAmount = Math.max(0, afterSubsidy - firstMonthDiscount);

  return {
    originalAmount,
    subsidyAmount,
    firstMonthDiscount,
    finalAmount,
  };
}

function formatPrice(value: number): string {
  if (value === 0) {
    return '무료';
  }

  return `${value.toLocaleString('ko-KR')}원`;
}

export default function PaymentScreen({
  program,
  applicationInfo,
  onBack,
  onComplete,
  onGoHome,
}: PaymentScreenProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [payAgreed, setPayAgreed] = useState(false);

  const pricing = calcFinalPrice(program);
  const subsidyApplicable = getSubsidyApplicable(program);
  const isFree = program.priceValue === 0;
  const canProceedPayment = payAgreed;

  const handlePayment = async () => {
    if (!canProceedPayment) {
      return;
    }

    setPaymentStatus('processing');

    await new Promise(resolve => setTimeout(resolve, 1200));

    onComplete({
      ...pricing,
      paymentMethod: isFree ? 'free' : 'toss',
      approvedAt: new Date().toISOString(),
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
          결제하기
        </Text>

        <View style={styles.headerButton} />
      </View>

      <View style={styles.progressArea}>
        <View style={styles.progressTrack}>
          <View style={styles.progressActive} />
          <View style={styles.progressActive} />
        </View>

        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabelDone}>신청 정보</Text>
          <Text style={styles.progressLabelActive}>결제</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
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

        <View style={styles.applicantCard}>
          <Text style={styles.applicantTitle}>신청자 정보</Text>

          {[
            { label: '아이 이름', value: applicationInfo.childName },
            { label: '보호자', value: applicationInfo.parentName },
            { label: '연락처', value: applicationInfo.parentPhone },
          ].map((item, index, array) => (
            <View
              key={item.label}
              style={[
                styles.applicantRow,
                index !== array.length - 1 && styles.applicantRowBorder,
              ]}
            >
              <Text style={styles.applicantLabel}>{item.label}</Text>
              <Text style={styles.applicantValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {subsidyApplicable && (
          <View style={styles.subsidyBanner}>
            <View style={styles.subsidyIconCircle}>
              <Ionicons name="wallet-outline" size={18} color={PALETTE.primary} />
            </View>

            <View style={styles.subsidyTextBox}>
              <Text style={styles.subsidyTitle}>정부 지원금 자동 적용</Text>
              <Text style={styles.subsidyDesc}>
                아이행복카드 지원금 {formatPrice(SUBSIDY_AMOUNT)}이 결제
                금액에서 차감돼요.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 정보</Text>

          <View style={styles.orderCard}>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>{program.title}</Text>
              <Text style={styles.orderValue}>
                {isFree ? '무료' : formatPrice(pricing.originalAmount)}
              </Text>
            </View>

            {subsidyApplicable && pricing.subsidyAmount > 0 && (
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>정부 지원금 할인</Text>
                <Text style={styles.orderDiscountValue}>
                  -{formatPrice(pricing.subsidyAmount)}
                </Text>
              </View>
            )}

            {pricing.firstMonthDiscount > 0 && (
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>첫 달 등록 할인</Text>
                <Text style={styles.orderDiscountValue}>
                  -{formatPrice(pricing.firstMonthDiscount)}
                </Text>
              </View>
            )}

            <View style={[styles.orderRow, styles.orderTotalRow]}>
              <Text style={styles.orderTotalLabel}>최종 결제 금액</Text>
              <Text style={styles.orderTotalValue}>
                {isFree ? '무료' : formatPrice(pricing.finalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {!isFree && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>결제 수단</Text>

            <View style={styles.tossOnlyCard}>
              <View style={styles.tossIcon}>
                <Text style={styles.tossIconText}>T</Text>
              </View>

              <View style={styles.tossTextBox}>
                <Text style={styles.tossTitle}>토스페이먼츠</Text>
                <Text style={styles.tossDescription}>
                  테스트 결제로 진행됩니다
                </Text>
              </View>

              <Ionicons
                name="checkmark-circle"
                size={20}
                color={PALETTE.primary}
              />
            </View>
          </View>
        )}

        <View style={styles.noticeBanner}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={PALETTE.primary}
          />
          <Text style={styles.noticeText}>
            현재 테스트 모드로 운영 중입니다. 실제 결제가 이루어지지
            않습니다.
          </Text>
        </View>

        {paymentStatus === 'failed' && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={PALETTE.red} />
            <Text style={styles.errorText}>
              결제에 실패했습니다. 다시 시도해 주세요.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.payAgreeRow}
          onPress={() => setPayAgreed(!payAgreed)}
          activeOpacity={0.75}
        >
          {renderCheckbox(payAgreed)}
          <Text style={styles.payAgreeText}>
            결제 진행 시 <Text style={styles.payAgreeUnderline}>이용약관</Text>,{' '}
            <Text style={styles.payAgreeUnderline}>개인정보처리방침</Text>,{' '}
            <Text style={styles.payAgreeUnderline}>환불정책</Text>에 동의합니다.
          </Text>
        </TouchableOpacity>

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
            styles.paymentButton,
            (!canProceedPayment || paymentStatus === 'processing') &&
              styles.paymentButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={!canProceedPayment || paymentStatus === 'processing'}
          activeOpacity={0.85}
        >
          {paymentStatus === 'processing' ? (
            <View style={styles.processingRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.paymentButtonText}>처리중...</Text>
            </View>
          ) : (
            <Text
              style={[
                styles.paymentButtonText,
                !canProceedPayment && styles.paymentButtonTextDisabled,
              ]}
            >
              {isFree
                ? '무료 신청하기'
                : `${formatPrice(pricing.finalAmount)} 결제하기`}
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
  progressLabelRow: {
    height: 34,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabelDone: {
    fontSize: 11,
    fontWeight: '800',
    color: PALETTE.text,
  },
  progressLabelActive: {
    fontSize: 11,
    fontWeight: '800',
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
  applicantCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingTop: 15,
    marginBottom: 24,
  },
  applicantTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: PALETTE.text,
    marginBottom: 4,
  },
  applicantRow: {
    minHeight: 45,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  applicantRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.softBorder,
  },
  applicantLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.muted,
  },
  applicantValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  section: {
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  subsidyBanner: {
    minHeight: 66,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: PALETTE.primaryBorder,
    backgroundColor: PALETTE.primarySoft,
    padding: 14,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subsidyIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subsidyTextBox: {
    flex: 1,
  },
  subsidyTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: PALETTE.primaryDark,
    letterSpacing: -0.2,
  },
  subsidyDesc: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
    color: '#6574B6',
    lineHeight: 18,
  },
  orderCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    padding: 15,
  },
  orderRow: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  orderLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.subText,
  },
  orderValue: {
    fontSize: 13,
    fontWeight: '900',
    color: PALETTE.text,
  },
  orderDiscountValue: {
    fontSize: 13,
    fontWeight: '900',
    color: PALETTE.primary,
  },
  orderTotalRow: {
    marginTop: 10,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: PALETTE.softBorder,
  },
  orderTotalLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: PALETTE.text,
  },
  orderTotalValue: {
    fontSize: 21,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.6,
  },
  tossOnlyCard: {
    minHeight: 72,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: PALETTE.primaryBorder,
    backgroundColor: PALETTE.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tossIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: PALETTE.toss,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tossIconText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  tossTextBox: {
    flex: 1,
  },
  tossTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: PALETTE.primaryDark,
  },
  tossDescription: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.subText,
  },
  noticeBanner: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.primaryBorder,
    backgroundColor: PALETTE.primarySoft,
    padding: 13,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.primaryDark,
    lineHeight: 18,
  },
  errorBanner: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.redBorder,
    backgroundColor: PALETTE.redSoft,
    padding: 13,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.red,
    lineHeight: 18,
  },
  payAgreeRow: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  payAgreeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: PALETTE.subText,
    lineHeight: 20,
  },
  payAgreeUnderline: {
    textDecorationLine: 'underline',
    color: PALETTE.text,
    fontWeight: '800',
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
  paymentButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: PALETTE.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  paymentButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  paymentButtonTextDisabled: {
    color: '#9CA3AF',
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});