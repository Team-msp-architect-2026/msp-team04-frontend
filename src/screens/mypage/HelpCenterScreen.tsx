import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';

interface HelpCenterScreenProps {
  onBack: () => void;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  { id: 1, question: '프로그램 신청은 어떻게 하나요?', answer: '원하는 프로그램을 선택한 후 \'신청하기\' 버튼을 눌러주세요. 신청자 정보를 입력하고 결제를 완료하면 신청이 완료됩니다.' },
  { id: 2, question: '결제 취소 및 환불은 어떻게 하나요?', answer: '마이페이지 > 신청 내역에서 취소하고자 하는 프로그램을 선택한 후 \'취소하기\' 버튼을 눌러주세요.' },
  { id: 3, question: '아이 정보는 어떻게 수정하나요?', answer: '마이페이지 > 등록된 아이 정보에서 \'수정\' 버튼을 눌러 정보를 변경할 수 있습니다.' },
  { id: 4, question: '추천 점수는 어떻게 계산되나요?', answer: '추천 점수는 거리(30%), 비용(25%), 공공기관 우선(20%), 연령 적합도(15%), 신청 가능 여부(10%)를 종합하여 계산됩니다.' },
  { id: 5, question: '정부 지원금 신청은 어떻게 하나요?', answer: 'MoMent는 정부 지원금을 직접 지급하지 않습니다. 다만, 회원님의 자격 조건에 맞는 지원금 정보를 안내해드리고, 복지로나 지자체 신청 페이지로 연결해드립니다.' },
];

export default function HelpCenterScreen({ onBack }: HelpCenterScreenProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>고객센터</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* 문의 옵션 */}
        <View style={s.contactRow}>
          <TouchableOpacity style={s.contactBtn}>
            <Ionicons name="chatbubble" size={24} color={colors.primary.default} />
            <Text style={s.contactLabel}>1:1 문의</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.contactBtn}>
            <Ionicons name="call" size={24} color={colors.primary.default} />
            <Text style={s.contactLabel}>전화 문의</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.contactBtn}>
            <Ionicons name="mail" size={24} color={colors.primary.default} />
            <Text style={s.contactLabel}>이메일</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <View style={s.faqHeader}>
          <Ionicons name="help-circle" size={16} color={colors.primary.default} />
          <Text style={s.faqTitle}>자주 묻는 질문</Text>
        </View>
        <View style={s.faqList}>
          {FAQS.map(faq => (
            <View key={faq.id} style={s.faqItem}>
              <TouchableOpacity
                style={s.faqQuestion}
                onPress={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              >
                <Text style={s.faqQuestionText}>{faq.question}</Text>
                <Ionicons
                  name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#888"
                />
              </TouchableOpacity>
              {expandedId === faq.id && (
                <View style={s.faqAnswer}>
                  <Text style={s.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* 운영 시간 */}
        <View style={s.infoBox}>
          <Text style={s.infoTitle}>운영 시간 안내</Text>
          <Text style={s.infoText}>평일 09:00 - 18:00 (점심시간 12:00 - 13:00)</Text>
          <Text style={s.infoText}>주말 및 공휴일 휴무</Text>
          <View style={s.infoDivider} />
          <Text style={s.infoText}>고객센터: 1588-0000</Text>
          <Text style={s.infoText}>이메일: help@moment.com</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  scroll: { padding: 16, paddingBottom: 40 },

  contactRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  contactBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  contactLabel: { fontSize: 12, fontWeight: '500', color: '#1A1A1A' },

  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  faqTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  faqList: { gap: 8, marginBottom: 20 },
  faqItem: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden' },
  faqQuestion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  faqQuestionText: { fontSize: 14, fontWeight: '500', color: '#1A1A1A', flex: 1, paddingRight: 8 },
  faqAnswer: { paddingHorizontal: 16, paddingBottom: 16 },
  faqAnswerText: { fontSize: 13, color: '#888', lineHeight: 20 },

  infoBox: { backgroundColor: '#FFF9E6', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FFE08A', gap: 4 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  infoText: { fontSize: 12, color: '#888' },
  infoDivider: { height: 1, backgroundColor: '#FFE08A', marginVertical: 8 },
});