import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';
import type { ProgramDetail } from '../program/ProgramDetailScreen';

interface PaymentScreenProps {
  program: ProgramDetail;
  onBack: () => void;
  onComplete: () => void;
  onGoHome: () => void;
}

type PaymentMethod = 'kakao' | 'toss' | null;
type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

const SUBSIDY_AMOUNT = 30000;
const FIRST_MONTH_DISCOUNT = 5000;

function getSubsidyApplicable(program: ProgramDetail): boolean {
  return (program.type === 'government' || program.type === 'public') && program.priceValue > 0;
}

function calcFinalPrice(program: ProgramDetail) {
  const original = program.priceValue;
  const subsidyApplicable = getSubsidyApplicable(program);
  const subsidy = subsidyApplicable ? Math.min(SUBSIDY_AMOUNT, original) : 0;
  const afterSubsidy = original - subsidy;
  const firstDiscount = afterSubsidy > FIRST_MONTH_DISCOUNT ? FIRST_MONTH_DISCOUNT : 0;
  const final = Math.max(0, afterSubsidy - firstDiscount);
  return { original, subsidy, firstDiscount, final };
}

function formatPrice(value: number): string {
  if (value === 0) return '무료';
  return value.toLocaleString('ko-KR') + '원';
}

function getAIStartDate(childName: string): string {
  const today = new Date();
  const daysUntilThursday = (4 - today.getDay() + 7) % 7 || 7;
  const thursday = new Date(today);
  thursday.setDate(today.getDate() + daysUntilThursday);
  const month = thursday.getMonth() + 1;
  const date = thursday.getDate();
  const name = childName.trim() || '아이';
  return `✦ AI 분석: ${name}에게 최적의 시작일은 ${month}월 ${date}일(목)이에요`;
}

export default function PaymentScreen({
  program,
  onBack,
  onComplete,
  onGoHome,
}: PaymentScreenProps) {
  const [step, setStep] = useState<'info' | 'payment' | 'complete'>('info');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [applicantInfo, setApplicantInfo] = useState({
    childName: '',
    parentName: '',
    parentPhone: '',
    request: '',
  });
  const [agreedTerms, setAgreedTerms] = useState({
    all: false,
    service: false,
    privacy: false,
    refund: false,
  });
  const [payAgreed, setPayAgreed] = useState(false);

  const pricing = calcFinalPrice(program);
  const subsidyApplicable = getSubsidyApplicable(program);
  const isFree = program.priceValue === 0;

  const handleAgreeAll = () => {
    const newVal = !agreedTerms.all;
    setAgreedTerms({ all: newVal, service: newVal, privacy: newVal, refund: newVal });
  };

  const handleAgreeItem = (key: 'service' | 'privacy' | 'refund') => {
    const next = { ...agreedTerms, [key]: !agreedTerms[key] };
    next.all = next.service && next.privacy && next.refund;
    setAgreedTerms(next);
  };

  const canProceedInfo =
    applicantInfo.childName.trim() !== '' &&
    applicantInfo.parentName.trim() !== '' &&
    applicantInfo.parentPhone.trim() !== '' &&
    agreedTerms.service && agreedTerms.privacy && agreedTerms.refund;

  const canProceedPayment = paymentMethod !== null && payAgreed;

  const handlePayment = async () => {
    setPaymentStatus('processing');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    if (Math.random() > 0.1) {
      setPaymentStatus('success');
      setStep('complete');
    } else {
      setPaymentStatus('failed');
    }
  };

  // ── 완료 화면 ──
  if (step === 'complete') {
    const today = new Date();
    const daysUntilThursday = (4 - today.getDay() + 7) % 7 || 7;
    const thursday = new Date(today);
    thursday.setDate(today.getDate() + daysUntilThursday);
    const month = thursday.getMonth() + 1;
    const date = thursday.getDate();
    const startDateStr = `${today.getFullYear()}년 ${month}월 ${date}일 (목)`;
    const startDateShort = `${month}월 ${date}일(목)`;

    const SUMMARY_ROWS = [
      { label: '프로그램', value: program.title },
      { label: '시작일', value: startDateStr },
      { label: '수업 시간', value: program.schedule },
      { label: '결제 금액', value: isFree ? '무료' : formatPrice(pricing.final) },
      { label: '결제 수단', value: paymentMethod === 'kakao' ? '카카오페이' : '토스페이' },
    ];

    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={s.completeContent}>
          {/* 성공 아이콘 */}
          <View style={s.completeIcon}>
            <Text style={{ fontSize: 44 }}>🎉</Text>
          </View>

          <Text style={s.completeTitle}>신청이 완료됐어요!</Text>
          <Text style={s.completeSubtitle}>
            {program.title}{'\n'}{startDateShort}부터 시작됩니다 🎨
          </Text>

          {/* 요약 카드 */}
          <View style={s.summaryCard}>
            {SUMMARY_ROWS.map((item, idx) => (
              <View
                key={item.label}
                style={[s.summaryRow, idx !== SUMMARY_ROWS.length - 1 && s.summaryRowBorder]}
              >
                <Text style={s.summaryLabel}>{item.label}</Text>
                <Text style={s.summaryValue} numberOfLines={2}>{item.value}</Text>
              </View>
            ))}
          </View>

          {/* AI 다음 추천 */}
          <View style={s.aiNextCard}>
            <View style={s.aiNextHeader}>
              <Text style={s.aiNextIcon}>✦</Text>
              <Text style={s.aiNextTitle}>AI 다음 추천</Text>
            </View>
            <Text style={s.aiNextDesc}>
              미술 수업과 함께{' '}
              <Text style={{ fontWeight: '700' }}>오감 발달 음악 교실</Text>을 병행하면{' '}
              {applicantInfo.childName || '아이'}의 창의력 발달에 더욱 효과적이에요!
            </Text>
          </View>

          {/* 버튼 */}
          <TouchableOpacity style={s.completePrimaryBtn} onPress={onComplete}>
            <Text style={s.completePrimaryBtnText}>신청 내역 확인하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.completeSecondaryBtn} onPress={onGoHome}>
            <Text style={s.completeSecondaryBtnText}>홈으로 돌아가기</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.headerBtn}
          onPress={step === 'info' ? onBack : () => setStep('info')}
        >
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          {step === 'info' ? '신청 정보 입력' : '결제하기'}
        </Text>
        <View style={s.headerBtn} />
      </View>

      {/* 진행 바 */}
      <View style={s.progressBar}>
        <View style={s.progressFill} />
        <View style={[s.progressFill, step === 'payment' ? s.progressActive : s.progressInactive]} />
      </View>

      {/* 프로그램 요약 */}
      <View style={s.programSummary}>
        <View style={s.programSummaryInfo}>
          <Text style={s.programSummaryOrg}>{program.organization}</Text>
          <Text style={s.programSummaryTitle} numberOfLines={1}>{program.title}</Text>
          <Text style={s.programSummaryPrice}>{program.price}</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── 신청 정보 입력 ── */}
        {step === 'info' && (
          <>
            {/* 신청자 정보 */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>신청자 정보</Text>
              <View style={s.gap16}>
                <View>
                  <Text style={s.inputLabel}>아이 이름 <Text style={s.required}>*</Text></Text>
                  <TextInput
                    style={s.input}
                    value={applicantInfo.childName}
                    onChangeText={(v) => setApplicantInfo({ ...applicantInfo, childName: v })}
                    placeholder="홍민준 (실명으로 입력해주세요)"
                    placeholderTextColor="#aaa"
                  />
                </View>
                <View>
                  <Text style={s.inputLabel}>보호자 이름 <Text style={s.required}>*</Text></Text>
                  <TextInput
                    style={s.input}
                    value={applicantInfo.parentName}
                    onChangeText={(v) => setApplicantInfo({ ...applicantInfo, parentName: v })}
                    placeholder="홍길동"
                    placeholderTextColor="#aaa"
                  />
                </View>
                <View>
                  <Text style={s.inputLabel}>연락처 <Text style={s.required}>*</Text></Text>
                  <TextInput
                    style={s.input}
                    value={applicantInfo.parentPhone}
                    onChangeText={(v) => setApplicantInfo({ ...applicantInfo, parentPhone: v })}
                    placeholder="010-0000-0000"
                    placeholderTextColor="#aaa"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            {/* 요청 사항 */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>
                요청 사항{' '}
                <Text style={s.optional}>(선택)</Text>
              </Text>
              <TextInput
                style={s.textarea}
                value={applicantInfo.request}
                onChangeText={(v) => setApplicantInfo({ ...applicantInfo, request: v })}
                placeholder="알레르기, 특이사항 등을 입력해주세요"
                placeholderTextColor="#aaa"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* AI 시작일 배너 */}
            <View style={s.section}>
              <View style={s.aiDateBanner}>
                <Text style={s.aiDateText}>
                  {getAIStartDate(applicantInfo.childName)}
                </Text>
              </View>
            </View>

            {/* 약관 동의 */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>약관 동의</Text>
              <View style={s.termsBox}>
                {/* 전체 동의 */}
                <TouchableOpacity style={s.termsAllRow} onPress={handleAgreeAll}>
                  <View style={[s.checkbox, agreedTerms.all && s.checkboxActive]}>
                    {agreedTerms.all && <Ionicons name="checkmark" size={12} color="#7B5E00" />}
                  </View>
                  <Text style={s.termsAllText}>전체 동의</Text>
                </TouchableOpacity>

                {([
                  { key: 'service' as const, label: '서비스 이용약관 (필수)' },
                  { key: 'privacy' as const, label: '개인정보 수집 및 이용 동의 (필수)' },
                  { key: 'refund' as const, label: '환불 규정 동의 (필수)' },
                ]).map((item, idx) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[s.termsRow, idx !== 2 && s.termsRowBorder]}
                    onPress={() => handleAgreeItem(item.key)}
                  >
                    <View style={[s.checkbox, agreedTerms[item.key] && s.checkboxActive]}>
                      {agreedTerms[item.key] && <Ionicons name="checkmark" size={12} color="#7B5E00" />}
                    </View>
                    <Text style={s.termsText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* ── 결제하기 ── */}
        {step === 'payment' && (
          <>
            {/* 정부 지원금 배너 */}
            {subsidyApplicable && (
              <View style={s.section}>
                <View style={s.subsidyBanner}>
                  <Text style={{ fontSize: 18 }}>💰</Text>
                  <View>
                    <Text style={s.subsidyBannerTitle}>정부 지원금 자동 적용됨</Text>
                    <Text style={s.subsidyBannerDesc}>
                      아이행복카드 지원금 {formatPrice(SUBSIDY_AMOUNT)} 차감
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* 주문 내역 */}
            <View style={s.section}>
              <View style={s.orderCard}>
                <Text style={s.orderCardTitle}>주문 내역</Text>
                <View style={s.orderRow}>
                  <Text style={s.orderLabel}>{program.title}</Text>
                  <Text style={s.orderValue}>
                    {isFree ? '무료' : formatPrice(pricing.original)}
                  </Text>
                </View>
                {subsidyApplicable && pricing.subsidy > 0 && (
                  <View style={s.orderRow}>
                    <Text style={s.orderLabel}>정부 지원금 할인</Text>
                    <Text style={s.orderDiscountValue}>-{formatPrice(pricing.subsidy)}</Text>
                  </View>
                )}
                {pricing.firstDiscount > 0 && (
                  <View style={s.orderRow}>
                    <Text style={s.orderLabel}>첫 달 등록 할인</Text>
                    <Text style={s.orderDiscountValue}>-{formatPrice(pricing.firstDiscount)}</Text>
                  </View>
                )}
                <View style={[s.orderRow, s.orderTotalRow]}>
                  <Text style={s.orderTotalLabel}>최종 결제 금액</Text>
                  <Text style={s.orderTotalValue}>
                    {isFree ? '무료' : formatPrice(pricing.final)}
                  </Text>
                </View>
              </View>
            </View>

            {/* 결제 수단 */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>결제 수단</Text>
              <View style={s.payMethodRow}>
                <TouchableOpacity
                  style={[s.payMethodBtn, paymentMethod === 'kakao' && s.payMethodBtnKakao]}
                  onPress={() => setPaymentMethod('kakao')}
                >
                  <View style={s.kakaoIcon}>
                    <Text style={{ fontSize: 14 }}>K</Text>
                  </View>
                  <Text style={[s.payMethodText, paymentMethod === 'kakao' && s.payMethodTextKakao]}>
                    카카오페이
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.payMethodBtn, paymentMethod === 'toss' && s.payMethodBtnToss]}
                  onPress={() => setPaymentMethod('toss')}
                >
                  <View style={s.tossIcon}>
                    <Text style={s.tossIconText}>T</Text>
                  </View>
                  <Text style={[s.payMethodText, paymentMethod === 'toss' && s.payMethodTextToss]}>
                    토스페이
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 테스트 안내 */}
            <View style={s.section}>
              <View style={s.noticeBanner}>
                <Ionicons name="alert-circle-outline" size={14} color="#b8860b" />
                <Text style={s.noticeText}>
                  현재 테스트 모드로 운영 중입니다. 실제 결제가 이루어지지 않습니다.
                </Text>
              </View>
            </View>

            {/* 결제 실패 */}
            {paymentStatus === 'failed' && (
              <View style={s.section}>
                <View style={s.errorBanner}>
                  <Ionicons name="alert-circle-outline" size={14} color="#991B1B" />
                  <Text style={s.errorText}>결제에 실패했습니다. 다시 시도해 주세요.</Text>
                </View>
              </View>
            )}

            {/* 결제 약관 동의 */}
            <View style={[s.section, { marginBottom: 8 }]}>
              <TouchableOpacity style={s.payAgreeRow} onPress={() => setPayAgreed(!payAgreed)}>
                <View style={[s.checkbox, payAgreed && s.checkboxActive]}>
                  {payAgreed && <Ionicons name="checkmark" size={12} color="#7B5E00" />}
                </View>
                <Text style={s.payAgreeText}>
                  결제 진행 시{' '}
                  <Text style={s.payAgreeUnderline}>이용약관</Text>,{' '}
                  <Text style={s.payAgreeUnderline}>개인정보처리방침</Text>,{' '}
                  <Text style={s.payAgreeUnderline}>환불정책</Text>에 동의하게 됩니다.
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View style={s.bottomBar}>
        <TouchableOpacity style={s.homeBtn} onPress={onGoHome}>
          <Ionicons name="home-outline" size={22} color="#4A5568" />
        </TouchableOpacity>

        {step === 'info' ? (
          <TouchableOpacity
            style={[s.mainBtn, !canProceedInfo && s.mainBtnDisabled]}
            onPress={() => setStep('payment')}
            disabled={!canProceedInfo}
          >
            <Text style={s.mainBtnText}>다음</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[s.mainBtn, (!canProceedPayment || paymentStatus === 'processing') && s.mainBtnDisabled]}
            onPress={handlePayment}
            disabled={!canProceedPayment || paymentStatus === 'processing'}
          >
            {paymentStatus === 'processing' ? (
              <View style={s.processingRow}>
                <ActivityIndicator size="small" color="#7B5E00" />
                <Text style={s.mainBtnText}>결제 처리중...</Text>
              </View>
            ) : (
              <Text style={s.mainBtnText}>
                {isFree ? '무료 신청하기' : `${formatPrice(pricing.final)} 결제하기`}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },

  // 진행 바
  progressBar: { flexDirection: 'row', height: 4 },
  progressFill: { flex: 1, backgroundColor: '#FFD966' },
  progressActive: { backgroundColor: '#FFD966' },
  progressInactive: { backgroundColor: '#E5E7EB' },

  // 프로그램 요약
  programSummary: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  programSummaryInfo: { flex: 1 },
  programSummaryOrg: { fontSize: 11, color: '#888' },
  programSummaryTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginTop: 2 },
  programSummaryPrice: { fontSize: 14, fontWeight: '700', color: colors.primary.default, marginTop: 2 },

  // 스크롤
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // 섹션 공통
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A202C', marginBottom: 14 },
  gap16: { gap: 16 },

  // 입력 폼
  inputLabel: { fontSize: 13, fontWeight: '500', color: '#1A1A1A', marginBottom: 6 },
  required: { color: '#EF4444' },
  optional: { fontSize: 11, fontWeight: '400', color: '#aaa' },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#2D3748',
    backgroundColor: '#fff',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2D3748',
    backgroundColor: '#fff',
    height: 90,
    textAlignVertical: 'top',
  },

  // AI 시작일
  aiDateBanner: {
    backgroundColor: '#EBF8FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },
  aiDateText: { fontSize: 13, fontWeight: '600', color: '#1A365D' },

  // 약관
  termsBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  termsAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  termsAllText: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  termsRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  termsText: { fontSize: 13, color: '#1A1A1A' },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { borderColor: '#F9A825', backgroundColor: '#FFE082' },

  // 지원금 배너
  subsidyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EBF8FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },
  subsidyBannerTitle: { fontSize: 12, fontWeight: '700', color: '#1A365D' },
  subsidyBannerDesc: { fontSize: 11, color: '#4A90D9', marginTop: 2 },

  // 주문 내역
  orderCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  orderCardTitle: { fontSize: 13, fontWeight: '700', color: '#1A202C', marginBottom: 12 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderLabel: { fontSize: 13, color: '#718096' },
  orderValue: { fontSize: 13, fontWeight: '600', color: '#2D3748' },
  orderDiscountValue: { fontSize: 13, fontWeight: '600', color: '#3182CE' },
  orderTotalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginBottom: 0,
  },
  orderTotalLabel: { fontSize: 15, fontWeight: '800', color: '#1A202C' },
  orderTotalValue: { fontSize: 20, fontWeight: '800', color: '#1A202C' },

  // 결제 수단
  payMethodRow: { flexDirection: 'row', gap: 12 },
  payMethodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9F9F9',
  },
  payMethodBtnKakao: { backgroundColor: '#FFE082', borderColor: '#F9A825' },
  payMethodBtnToss: { backgroundColor: '#EBF1FF', borderColor: '#667EEA' },
  kakaoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEE500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tossIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0064FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tossIconText: { fontSize: 14, fontWeight: '900', color: '#fff' },
  payMethodText: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  payMethodTextKakao: { color: '#7B5E00' },
  payMethodTextToss: { color: '#3B4FCC' },

  // 안내 배너
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  noticeText: { fontSize: 12, color: '#92400E', flex: 1, lineHeight: 18 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { fontSize: 12, color: '#991B1B', flex: 1 },

  // 결제 약관
  payAgreeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  payAgreeText: { fontSize: 12, color: '#718096', flex: 1, lineHeight: 20 },
  payAgreeUnderline: { textDecorationLine: 'underline', color: '#1A1A1A' },

  // 하단 버튼
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  homeBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFD966',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtnDisabled: { backgroundColor: '#E5E7EB' },
  mainBtnText: { fontSize: 15, fontWeight: '700', color: '#7B5E00' },
  processingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  // 완료 화면
  completeContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  completeIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFE082',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  completeTitle: { fontSize: 24, fontWeight: '800', color: '#1A202C', marginBottom: 8 },
  completeSubtitle: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  summaryLabel: { fontSize: 13, color: '#A0AEC0' },
  summaryValue: { fontSize: 13, fontWeight: '600', color: '#2D3748', textAlign: 'right', flex: 1, marginLeft: 16 },
  aiNextCard: {
    width: '100%',
    backgroundColor: '#EBF8FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BEE3F8',
    marginBottom: 32,
  },
  aiNextHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  aiNextIcon: { fontSize: 13, color: '#3182CE' },
  aiNextTitle: { fontSize: 12, fontWeight: '700', color: '#1A365D' },
  aiNextDesc: { fontSize: 12, color: '#4A90D9', lineHeight: 20 },
  completePrimaryBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFD966',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  completePrimaryBtnText: { fontSize: 16, fontWeight: '700', color: '#7B5E00' },
  completeSecondaryBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeSecondaryBtnText: { fontSize: 15, fontWeight: '600', color: '#4A5568' },
});