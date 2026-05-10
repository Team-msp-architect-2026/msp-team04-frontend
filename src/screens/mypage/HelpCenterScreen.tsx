import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface HelpCenterScreenProps {
  onBack: () => void;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface ContactOption {
  id: string;
  label: string;
  icon: IconName;
  iconBg: string;
  iconColor: string;
}

const FAQS: FAQ[] = [
  {
    id: 1,
    question: '프로그램 신청은 어떻게 하나요?',
    answer:
      '원하는 프로그램을 선택한 후 신청하기 버튼을 눌러주세요. 신청자 정보를 입력하고 결제를 완료하면 신청이 완료됩니다.',
  },
  {
    id: 2,
    question: '결제 취소 및 환불은 어떻게 하나요?',
    answer:
      '마이페이지 > 신청 내역에서 취소하고자 하는 프로그램을 선택한 후 취소하기 버튼을 눌러주세요.',
  },
  {
    id: 3,
    question: '아이 정보는 어떻게 수정하나요?',
    answer:
      '마이페이지 > 등록된 아이 정보에서 수정 버튼을 눌러 정보를 변경할 수 있습니다.',
  },
  {
    id: 4,
    question: '추천 점수는 어떻게 계산되나요?',
    answer:
      '추천 점수는 거리, 비용, 공공기관 우선, 연령 적합도, 신청 가능 여부 등을 종합하여 계산됩니다.',
  },
  {
    id: 5,
    question: '정부 지원금 신청은 어떻게 하나요?',
    answer:
      'MoMent는 정부 지원금을 직접 지급하지 않습니다. 다만, 조건에 맞는 지원금 정보를 안내하고 관련 신청 페이지로 연결합니다.',
  },
];

const CONTACT_OPTIONS: ContactOption[] = [
  {
    id: 'chat',
    label: '1:1 문의',
    icon: 'chatbubble-ellipses-outline',
    iconBg: '#EEF3FF',
    iconColor: '#4D5FD2',
  },
  {
    id: 'phone',
    label: '전화 문의',
    icon: 'call-outline',
    iconBg: '#F2FBF6',
    iconColor: '#228251',
  },
  {
    id: 'email',
    label: '이메일',
    icon: 'mail-outline',
    iconBg: '#F8FAFC',
    iconColor: '#64748B',
  },
];

export default function HelpCenterScreen({ onBack }: HelpCenterScreenProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SafeAreaView edges={['top']} style={s.safeArea}>
        <View style={s.header}>
          <TouchableOpacity
            style={s.headerSide}
            onPress={onBack}
            activeOpacity={0.72}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={25} color="#191919" />
          </TouchableOpacity>

          <Text style={s.headerTitle}>고객센터</Text>

          <View style={s.headerSide} />
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View style={s.contactRow}>
          {CONTACT_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.id}
              style={s.contactBtn}
              activeOpacity={0.74}
            >
              <View
                style={[
                  s.contactIconBox,
                  { backgroundColor: option.iconBg },
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={19}
                  color={option.iconColor}
                />
              </View>

              <Text style={s.contactLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.faqHeader}>
          <Ionicons name="help-circle-outline" size={17} color="#64748B" />
          <Text style={s.faqTitle}>자주 묻는 질문</Text>
        </View>

        <View style={s.faqList}>
          {FAQS.map(faq => {
            const isExpanded = expandedId === faq.id;

            return (
              <View key={faq.id} style={s.faqItem}>
                <TouchableOpacity
                  style={s.faqQuestion}
                  onPress={() => setExpandedId(isExpanded ? null : faq.id)}
                  activeOpacity={0.76}
                >
                  <Text style={s.faqQuestionText}>{faq.question}</Text>

                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#A8AFBA"
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={s.faqAnswer}>
                    <Text style={s.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={s.operatingCard}>
          <View style={s.operatingHeader}>
            <View style={s.operatingIconBox}>
              <Ionicons name="time-outline" size={18} color="#64748B" />
            </View>

            <Text style={s.operatingTitle}>운영시간 안내</Text>
          </View>

          <View style={s.operatingInfo}>
            <View style={s.operatingRow}>
              <Text style={s.operatingLabel}>평일</Text>
              <Text style={s.operatingValue}>10:00 - 18:00</Text>
            </View>

            <View style={s.operatingRow}>
              <Text style={s.operatingLabel}>점심시간</Text>
              <Text style={s.operatingValue}>12:00 - 13:00</Text>
            </View>

            <View style={s.operatingRow}>
              <Text style={s.operatingLabel}>주말 · 공휴일</Text>
              <Text style={s.operatingValue}>휴무</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  safeArea: {
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 52,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerSide: {
    width: 64,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: '#17191D',
    letterSpacing: -0.35,
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 40,
  },

  contactRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },

  contactBtn: {
    flex: 1,
    minHeight: 96,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 17,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  contactIconBox: {
    width: 38,
    height: 38,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  contactLabel: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.1,
  },

  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 15,
    paddingHorizontal: 2,
  },

  faqTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    color: '#17191D',
    letterSpacing: -0.25,
  },

  faqList: {
    gap: 13,
    marginBottom: 26,
  },

  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },

  faqQuestion: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 10,
  },

  faqQuestionText: {
    flex: 1,
    paddingRight: 8,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.15,
  },

  faqAnswer: {
    paddingHorizontal: 15,
    paddingBottom: 16,
    paddingTop: 1,
  },

  faqAnswerText: {
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '500',
    color: '#6B7280',
    letterSpacing: -0.1,
  },

  operatingCard: {
    marginTop: 2,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },

  operatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },

  operatingIconBox: {
    width: 34,
    height: 34,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  operatingTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
    color: '#17191D',
    letterSpacing: -0.15,
  },

  operatingInfo: {
    gap: 14,
  },

  operatingRow: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  operatingLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: -0.1,
  },

  operatingValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    color: '#17191D',
    letterSpacing: -0.1,
  },
});