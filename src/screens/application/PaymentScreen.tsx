import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import type { ProgramDetail } from '../program/ProgramDetailScreen';
import type {
  ApplicationInfo,
  CreatedApplication,
} from './ApplicationFormScreen';
import client from '../../api/client';

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
  createdApplication: CreatedApplication;
  onBack: () => void;
  onComplete: (summary: PaymentSummary) => void;
  onGoHome: () => void;
}

type PaymentStatus = 'idle' | 'preparing' | 'webview' | 'confirming' | 'failed';

interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

interface PaymentPrepareResponse {
  paymentId: number;
  applicationId: number;
  orderId: string;
  orderName: string;
  amount: number;
  clientKey: string;
  successUrl: string;
  failUrl: string;
  paymentMethod: 'TOSS_PAYMENTS' | 'FREE';
  paymentStatus: 'READY' | 'APPROVED' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  applicationStatus:
    | 'PENDING'
    | 'PAYMENT_READY'
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'FAILED';
}

interface PaymentConfirmResponse {
  paymentId: number;
  applicationId: number;
  orderId: string;
  amount: number;
  paymentMethod: 'TOSS_PAYMENTS' | 'FREE';
  paymentStatus: 'READY' | 'APPROVED' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  applicationStatus:
    | 'PENDING'
    | 'PAYMENT_READY'
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'FAILED';
  approvedAt?: string;
  cancelledAt?: string;
}

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

function getQueryParam(url: string, key: string) {
  const queryString = url.split('?')[1] ?? '';
  const params = new URLSearchParams(queryString);

  return params.get(key);
}

function isExternalAppUrl(url: string) {
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('about:blank') ||
    url.startsWith('data:')
  ) {
    return false;
  }

  return true;
}

function createTossPaymentHtml(prepare: PaymentPrepareResponse) {
  const safeClientKey = JSON.stringify(prepare.clientKey);
  const safeAmount = JSON.stringify(prepare.amount);
  const safeOrderId = JSON.stringify(prepare.orderId);
  const safeOrderName = JSON.stringify(prepare.orderName);
  const safeSuccessUrl = JSON.stringify(prepare.successUrl);
  const safeFailUrl = JSON.stringify(prepare.failUrl);

  return `
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1"
    />
    <script src="https://js.tosspayments.com/v1/payment"></script>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        min-height: 100%;
        background: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
      }
      .wrap {
        min-height: 100vh;
        padding: 28px 20px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .card {
        background: #ffffff;
        border: 1px solid #e8edf3;
        border-radius: 24px;
        padding: 24px 20px;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
      }
      .badge {
        display: inline-flex;
        align-items: center;
        height: 28px;
        padding: 0 10px;
        border-radius: 14px;
        background: #eef3ff;
        color: #4d5fd2;
        font-size: 12px;
        font-weight: 800;
        margin-bottom: 16px;
      }
      h1 {
        margin: 0;
        color: #111827;
        font-size: 22px;
        line-height: 30px;
        letter-spacing: -0.6px;
      }
      p {
        margin: 10px 0 0;
        color: #64748b;
        font-size: 14px;
        line-height: 22px;
      }
      .amount {
        margin-top: 22px;
        padding: 16px;
        border-radius: 18px;
        background: #f8fafc;
        border: 1px solid #eef2f6;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .amount span {
        color: #64748b;
        font-size: 13px;
        font-weight: 700;
      }
      .amount strong {
        color: #111827;
        font-size: 18px;
        font-weight: 900;
      }
      .loading {
        margin-top: 18px;
        color: #94a3b8;
        font-size: 12px;
        line-height: 18px;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <div class="badge">토스페이먼츠 테스트 결제</div>
        <h1>결제창을 준비하고 있어요</h1>
        <p>잠시 후 토스페이먼츠 테스트 결제창으로 이동합니다.</p>
        <div class="amount">
          <span>결제 금액</span>
          <strong>${Number(prepare.amount).toLocaleString('ko-KR')}원</strong>
        </div>
        <div class="loading">화면이 이동하지 않으면 뒤로가기 후 다시 시도해 주세요.</div>
      </div>
    </div>

    <script>
      window.onload = function () {
        try {
          var tossPayments = TossPayments(${safeClientKey});

          tossPayments.requestPayment('카드', {
            amount: ${safeAmount},
            orderId: ${safeOrderId},
            orderName: ${safeOrderName},
            successUrl: ${safeSuccessUrl},
            failUrl: ${safeFailUrl}
          });
        } catch (error) {
          window.location.href =
            ${safeFailUrl} +
            '?code=CLIENT_PAYMENT_ERROR&message=' +
            encodeURIComponent(error && error.message ? error.message : '결제창을 열 수 없습니다.') +
            '&orderId=' +
            encodeURIComponent(${safeOrderId});
        }
      };
    </script>
  </body>
</html>
`;
}

export default function PaymentScreen({
  program,
  applicationInfo,
  createdApplication,
  onBack,
  onComplete,
  onGoHome,
}: PaymentScreenProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [payAgreed, setPayAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentPrepare, setPaymentPrepare] =
    useState<PaymentPrepareResponse | null>(null);
  const [webViewKey, setWebViewKey] = useState(0);

  const pricing = calcFinalPrice(program);
  const subsidyApplicable = getSubsidyApplicable(program);
  const isFree = program.priceValue === 0;
  const canProceedPayment = payAgreed;
  const isProcessing =
    paymentStatus === 'preparing' || paymentStatus === 'confirming';

  const paymentHtml = useMemo(() => {
    if (!paymentPrepare) {
      return '';
    }

    return createTossPaymentHtml(paymentPrepare);
  }, [paymentPrepare]);

  const completePayment = (
    method: PaymentSummary['paymentMethod'],
    approvedAt?: string,
  ) => {
    onComplete({
      ...pricing,
      paymentMethod: method,
      approvedAt: approvedAt ?? new Date().toISOString(),
    });
  };

  const handlePayment = async () => {
    if (!canProceedPayment || isProcessing) {
      return;
    }

    setPaymentStatus('preparing');
    setErrorMessage('');

    try {
      const response = await client.post<ApiResponse<PaymentPrepareResponse>>(
        '/api/payments/toss/prepare',
        {
          applicationId: createdApplication.applicationId,
        },
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || '결제 준비에 실패했습니다.');
      }

      const prepare = response.data.data;

      if (prepare.paymentMethod === 'FREE') {
        completePayment('free');
        return;
      }

      if (
        !prepare.clientKey ||
        !prepare.orderId ||
        !prepare.amount ||
        !prepare.successUrl ||
        !prepare.failUrl
      ) {
        throw new Error('결제창 실행에 필요한 정보가 부족합니다.');
      }

      setPaymentPrepare(prepare);
      setWebViewKey(prev => prev + 1);
      setPaymentStatus('webview');
    } catch (error) {
      setPaymentStatus('failed');
      setErrorMessage('결제 준비에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  const handleConfirmPayment = async (
    paymentKey: string,
    orderId: string,
    amount: number,
  ) => {
    setPaymentStatus('confirming');
    setErrorMessage('');

    try {
      const response = await client.post<ApiResponse<PaymentConfirmResponse>>(
        '/api/payments/toss/confirm',
        {
          paymentKey,
          orderId,
          amount,
        },
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || '결제 승인에 실패했습니다.');
      }

      const result = response.data.data;

      setPaymentPrepare(null);
      completePayment('toss', result.approvedAt);
    } catch (error) {
      setPaymentPrepare(null);
      setPaymentStatus('failed');
      setErrorMessage('결제 승인에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleFailPayment = async (
    orderId: string | null,
    failureCode: string | null,
    failureMessage: string | null,
  ) => {
    setPaymentPrepare(null);
    setPaymentStatus('failed');
    setErrorMessage(
      failureMessage || '결제가 취소되었거나 실패했습니다. 다시 시도해 주세요.',
    );

    if (!orderId) {
      return;
    }

    try {
      await client.post('/api/payments/toss/fail', {
        orderId,
        failureCode: failureCode ?? 'PAYMENT_FAILED',
        failureMessage:
          failureMessage ?? '결제가 취소되었거나 실패했습니다.',
      });
    } catch (error) {
      console.log('결제 실패 콜백 저장 실패:', error);
    }
  };

  const handleWebViewNavigation = (navState: { url: string }) => {
    const { url } = navState;

    if (isExternalAppUrl(url)) {
      Linking.openURL(url).catch(() => {
        setPaymentPrepare(null);
        setPaymentStatus('failed');
        setErrorMessage(
          '선택한 결제수단 앱을 열 수 없습니다. 카드 결제 또는 다른 결제수단으로 다시 시도해 주세요.',
        );
      });

      return false;
    }

    if (!paymentPrepare) {
      return true;
    }

    if (url.startsWith(paymentPrepare.successUrl)) {
      const paymentKey = getQueryParam(url, 'paymentKey');
      const orderId = getQueryParam(url, 'orderId');
      const amountParam = getQueryParam(url, 'amount');
      const amount = Number(amountParam);

      if (paymentKey && orderId && Number.isFinite(amount)) {
        handleConfirmPayment(paymentKey, orderId, amount);
      } else {
        setPaymentPrepare(null);
        setPaymentStatus('failed');
        setErrorMessage('결제 승인 정보가 올바르지 않습니다.');
      }

      return false;
    }

    if (url.startsWith(paymentPrepare.failUrl)) {
      const orderId = getQueryParam(url, 'orderId');
      const code = getQueryParam(url, 'code');
      const message = getQueryParam(url, 'message');

      handleFailPayment(orderId, code, message);
      return false;
    }

    return true;
  };

  const handleCloseWebView = () => {
    setPaymentPrepare(null);
    setPaymentStatus('idle');
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
            <Text style={styles.errorText}>{errorMessage}</Text>
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
            (!canProceedPayment || isProcessing) && styles.paymentButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={!canProceedPayment || isProcessing}
          activeOpacity={0.85}
        >
          {isProcessing ? (
            <View style={styles.processingRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.paymentButtonText}>
                {paymentStatus === 'confirming' ? '승인중...' : '처리중...'}
              </Text>
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

      <Modal
        visible={paymentStatus === 'webview' && !!paymentPrepare}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseWebView}
      >
        <SafeAreaView style={styles.webViewContainer} edges={['top']}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity
              style={styles.webViewCloseButton}
              onPress={handleCloseWebView}
              activeOpacity={0.75}
            >
              <Ionicons name="close" size={23} color={PALETTE.text} />
            </TouchableOpacity>

            <Text style={styles.webViewTitle}>토스페이먼츠 결제</Text>

            <View style={styles.webViewCloseButton} />
          </View>

          {paymentHtml !== '' && (
            <WebView
              key={webViewKey}
              originWhitelist={['*']}
              source={{ html: paymentHtml }}
              javaScriptEnabled
              domStorageEnabled
              setSupportMultipleWindows={false}
              onShouldStartLoadWithRequest={handleWebViewNavigation}
              onNavigationStateChange={handleWebViewNavigation}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator size="small" color={PALETTE.primary} />
                  <Text style={styles.webViewLoadingText}>
                    결제창을 불러오는 중입니다
                  </Text>
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
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
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  subsidyBanner: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.primaryBorder,
    backgroundColor: PALETTE.primarySoft,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 24,
  },
  subsidyIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 15,
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
  },
  subsidyDesc: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#6574B6',
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.25,
    marginBottom: 11,
  },
  orderCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingTop: 14,
  },
  orderRow: {
    minHeight: 40,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderLabel: {
    flex: 1,
    paddingRight: 14,
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
    color: PALETTE.primaryDark,
  },
  orderTotalRow: {
    marginTop: 5,
    minHeight: 54,
    borderTopWidth: 1,
    borderTopColor: PALETTE.softBorder,
  },
  orderTotalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: PALETTE.text,
  },
  orderTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: PALETTE.primaryDark,
    letterSpacing: -0.35,
  },
  tossOnlyCard: {
    minHeight: 74,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.blueBorder,
    backgroundColor: PALETTE.blueSoft,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tossIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: PALETTE.toss,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tossIconText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  tossTextBox: {
    flex: 1,
  },
  tossTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: PALETTE.blueDark,
  },
  tossDescription: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#5C8BC8',
  },
  noticeBanner: {
    borderRadius: 15,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: PALETTE.softBorder,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 14,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: PALETTE.subText,
    lineHeight: 18,
  },
  errorBanner: {
    borderRadius: 15,
    backgroundColor: PALETTE.redSoft,
    borderWidth: 1,
    borderColor: PALETTE.redBorder,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.red,
    lineHeight: 18,
  },
  payAgreeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginBottom: 18,
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
    marginTop: 1,
  },
  checkboxActive: {
    borderColor: PALETTE.primary,
    backgroundColor: PALETTE.primary,
  },
  payAgreeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: PALETTE.subText,
    lineHeight: 18,
  },
  payAgreeUnderline: {
    fontWeight: '900',
    color: PALETTE.text,
    textDecorationLine: 'underline',
  },
  bottomSpace: {
    height: 106,
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
  paymentButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: PALETTE.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  paymentButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  paymentButtonTextDisabled: {
    color: '#94A3B8',
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webViewHeader: {
    height: 52,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.softBorder,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  webViewCloseButton: {
    width: 54,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webViewTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.25,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  webViewLoadingText: {
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.subText,
  },
});