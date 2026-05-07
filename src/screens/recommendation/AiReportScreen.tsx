import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';

interface ChildInfo {
  name: string;
  age: number;
  concerns: string[];
}

interface AiReportScreenProps {
  childInfo: ChildInfo;
  userName: string;
  onBack: () => void;
  onSelectProgram?: () => void;
}

const SUBSIDY_ITEMS = [
  {
    id: 1,
    icon: '💰',
    title: '서울시 조부모 돌봄수당',
    desc: '만 12세 이하 자녀를 돌보는 조부모에게 월 30만 원 지급. 소득 무관 지원 가능',
    tag: '신청 가능',
    amount: '월 30만원',
  },
  {
    id: 2,
    icon: '🧒',
    title: '아이돌봄 장기지원 서비스',
    desc: '시간제·영아종일제 돌봄 서비스. 맞벌이 및 양육 공백 가정 우선 지원',
    tag: '신청 가능',
    amount: '최대 70% 할인',
  },
  {
    id: 3,
    icon: '🎓',
    title: '교육비 바우처 지원',
    desc: '아이행복카드를 통해 어린이집·유치원 교육비 자동 차감. 기준 중위소득 이하 대상',
    tag: '신청 가능',
    amount: '월 최대 45만원',
  },
];

const FREE_PROGRAMS = [
  { id: 1, title: '구립 미술교실',  org: '강남구', date: '~ 05.30', imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop' },
  { id: 2, title: '독서 논술 교실', org: '서초구', date: '~ 05.13', imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop' },
  { id: 3, title: '아이 체육교실',  org: '송파구', date: '~ 05.25', imageUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop' },
  { id: 4, title: '유아 음악교실',  org: '마포구', date: '~ 06.01', imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop' },
  { id: 5, title: '영어 그림책',    org: '강동구', date: '~ 05.20', imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop' },
];

const AI_PROGRAMS = [
  { id: 1,  title: '코딩 창의 클래스',  match: 96, imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=300&fit=crop' },
  { id: 2,  title: '키즈 쿠킹 클래스',  match: 93, imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop' },
  { id: 3,  title: '과학 실험 교실',    match: 91, imageUrl: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=400&h=300&fit=crop' },
  { id: 4,  title: '발레 & 체육',       match: 89, imageUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&h=300&fit=crop' },
  { id: 5,  title: '창의 미술 교실',    match: 88, imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop' },
  { id: 6,  title: '영어 스토리텔링',   match: 86, imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop' },
  { id: 7,  title: '유아 음악 교실',    match: 85, imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop' },
  { id: 8,  title: '수학 사고력 교실',  match: 83, imageUrl: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=400&h=300&fit=crop' },
  { id: 9,  title: '독서 논술 교실',    match: 82, imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop' },
  { id: 10, title: '태권도 교실',       match: 80, imageUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop' },
  { id: 11, title: '로봇 조립 교실',    match: 78, imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop' },
  { id: 12, title: '자연 생태 체험',    match: 76, imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop' },
];

const SAVING_ROWS = [
  { label: '아이돌봄 지원금',   value: '월 45,000원' },
  { label: '교육비 바우처',      value: '월 30,000원' },
  { label: '무료 프로그램 활용', value: '월 45,000원' },
];

export default function AiReportScreen({
  childInfo,
  userName,
  onBack,
  onSelectProgram,
}: AiReportScreenProps) {
  const [expandedSubsidy, setExpandedSubsidy] = useState<number | null>(null);
  const [showAllAi, setShowAllAi] = useState(false);

  const displayedAiPrograms = showAllAi ? AI_PROGRAMS : AI_PROGRAMS.slice(0, 4);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>AI 육아 종합 분석 리포트</Text>
        <TouchableOpacity style={s.headerBtn}>
          <Ionicons name="share-outline" size={22} color="#555" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 히어로 배너 ── */}
        <View style={s.heroBanner}>
          <Text style={s.heroLabel}>✨ AI 육아 종합 분석</Text>
          <Text style={s.heroTitle}>
            {childInfo.name}에게 맞는{'\n'}육아 지원 혜택을 찾았어요
          </Text>

          {/* 매칭 점수 카드 */}
          <View style={s.scoreCard}>
            {/* 원형 차트 (간단히 View로 표현) */}
            <View style={s.scoreCircleOuter}>
              <View style={s.scoreCircleInner}>
                <Text style={s.scoreText}>94%</Text>
              </View>
            </View>
            <View style={s.scoreInfo}>
              <Text style={s.scoreTitle}>AI 종합 매칭 점수</Text>
              <Text style={s.scoreDesc}>
                우리 아이에게 딱 맞는{'\n'}혜택을 찾았어요!
              </Text>
            </View>
          </View>

          {/* 요약 칩 */}
          <View style={s.chipRow}>
            {[
              { label: '💰 지원금 3건',       color: '#b8860b' },
              { label: '🆓 무료 프로그램 5건', color: '#2a6fa8' },
              { label: '🎯 추천 12건',         color: '#4A5568' },
            ].map((chip) => (
              <View key={chip.label} style={s.chip}>
                <Text style={[s.chipText, { color: chip.color }]}>{chip.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── 1. 지원금 ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              1. 받을 수 있는 지원금{' '}
              <Text style={{ color: '#d4a800' }}>3건</Text>
            </Text>
            <TouchableOpacity style={s.moreBtn}>
              <Text style={s.moreBtnText}>전체보기</Text>
              <Ionicons name="chevron-forward" size={12} color="#aaa" />
            </TouchableOpacity>
          </View>

          {SUBSIDY_ITEMS.map((item) => (
            <View key={item.id} style={s.subsidyCard}>
              <TouchableOpacity
                style={s.subsidyRow}
                onPress={() =>
                  setExpandedSubsidy(expandedSubsidy === item.id ? null : item.id)
                }
                activeOpacity={0.7}
              >
                <Text style={s.subsidyIcon}>{item.icon}</Text>
                <View style={s.subsidyInfo}>
                  <Text style={s.subsidyTitle}>{item.title}</Text>
                  <Text style={s.subsidyAmount}>{item.amount}</Text>
                </View>
                <View style={s.subsidyTag}>
                  <Text style={s.subsidyTagText}>{item.tag}</Text>
                </View>
              </TouchableOpacity>

              {expandedSubsidy === item.id && (
                <View style={s.subsidyExpanded}>
                  <Text style={s.subsidyDesc}>{item.desc}</Text>
                  <View style={s.subsidyBtnRow}>
                    <TouchableOpacity style={s.subsidyBtnOutline}>
                      <Text style={s.subsidyBtnOutlineText}>자세히 보기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.subsidyBtnFill}>
                      <Text style={s.subsidyBtnFillText}>신청하기</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* ── 2. 무료 공공 프로그램 ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              2. 무료 공공 프로그램{' '}
              <Text style={{ color: '#2a6fa8' }}>5건</Text>
            </Text>
            <TouchableOpacity style={s.moreBtn}>
              <Text style={s.moreBtnText}>전체보기</Text>
              <Ionicons name="chevron-forward" size={12} color="#aaa" />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.hScroll}
          >
            {FREE_PROGRAMS.map((p) => (
              <TouchableOpacity key={p.id} style={s.freeProgramCard} activeOpacity={0.8}>
                <Image source={{ uri: p.imageUrl }} style={s.freeProgramImage} />
                <View style={s.freeProgramInfo}>
                  <Text style={s.freeProgramTitle} numberOfLines={1}>{p.title}</Text>
                  <Text style={s.freeProgramOrg}>{p.org}</Text>
                  <View style={s.freeProgramBadge}>
                    <Text style={s.freeProgramBadgeText}>무료 · {p.date}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── 3. AI 추천 프로그램 ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              3. AI 추천 프로그램{' '}
              <Text style={{ color: '#3182CE' }}>12건</Text>
            </Text>
            <TouchableOpacity
              style={s.moreBtn}
              onPress={() => setShowAllAi(!showAllAi)}
            >
              <Text style={s.moreBtnText}>{showAllAi ? '접기' : '전체보기'}</Text>
              <Ionicons
                name={showAllAi ? 'chevron-up' : 'chevron-forward'}
                size={12}
                color="#aaa"
              />
            </TouchableOpacity>
          </View>

          {/* 2열 그리드 */}
          <View style={s.aiGrid}>
            {displayedAiPrograms.map((p, idx) => (
              <TouchableOpacity
                key={p.id}
                style={[s.aiCard, idx % 2 === 0 ? { marginRight: 6 } : { marginLeft: 6 }]}
                activeOpacity={0.8}
              >
                <View>
                  <Image source={{ uri: p.imageUrl }} style={s.aiCardImage} />
                  <View style={s.matchBadge}>
                    <Text style={s.matchBadgeText}>매칭 {p.match}%</Text>
                  </View>
                </View>
                <View style={s.aiCardInfo}>
                  <Text style={s.aiCardTitle} numberOfLines={1}>{p.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {!showAllAi && (
            <TouchableOpacity
              style={s.showAllBtn}
              onPress={() => setShowAllAi(true)}
            >
              <Text style={s.showAllBtnText}>전체 12건 보기 ↓</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── 4. 이번 달 예상 절감 효과 ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>4. 이번 달 예상 절감 효과</Text>
          <View style={s.savingCard}>
            <View style={s.savingTop}>
              <Text style={s.savingEmoji}>💰</Text>
              <Text style={s.savingDesc}>
                현재 지원사업과 무료 프로그램을{'\n'}활용하면 월 평균
              </Text>
            </View>
            <Text style={s.savingAmount}>120,000원</Text>
            <Text style={s.savingSubDesc}>절감 가능해요!</Text>

            <View style={s.savingDivider} />

            {SAVING_ROWS.map((row) => (
              <View key={row.label} style={s.savingRow}>
                <View style={s.savingRowLeft}>
                  <Ionicons name="checkmark-circle" size={14} color="#156938" />
                  <Text style={s.savingRowLabel}>{row.label}</Text>
                </View>
                <Text style={s.savingRowValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 하단 여백 (버튼 높이만큼) */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* ── 하단 고정 버튼 ── */}
      <View style={s.bottomBar}>
        <TouchableOpacity style={s.shareBtn}>
          <Ionicons name="share-outline" size={20} color="#4A5568" />
        </TouchableOpacity>
        <TouchableOpacity style={s.selectBtn} onPress={onSelectProgram}>
          <Text style={s.selectBtnText}>맞춤 일정 설정하기</Text>
        </TouchableOpacity>
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
  headerTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },

  // 스크롤
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // 히어로 배너
  heroBanner: {
    margin: 16,
    borderRadius: 20,
    backgroundColor: '#FFD966',
    borderWidth: 1,
    borderColor: '#F0EDD8',
    padding: 20,
  },
  heroLabel: { fontSize: 11, fontWeight: '700', color: '#6e4e08', marginBottom: 4 },
  heroTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', lineHeight: 26, marginBottom: 16 },

  // 점수 카드
  scoreCard: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  scoreCircleOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 6,
    borderColor: '#FFD966',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  scoreCircleInner: { alignItems: 'center', justifyContent: 'center' },
  scoreText: { fontSize: 18, fontWeight: '800', color: '#b8860b' },
  scoreInfo: { flex: 1 },
  scoreTitle: { fontSize: 13, fontWeight: '700', color: '#1A202C' },
  scoreDesc: { fontSize: 12, color: '#718096', marginTop: 4, lineHeight: 18 },

  // 요약 칩
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chipText: { fontSize: 11, fontWeight: '700' },

  // 섹션 공통
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  moreBtnText: { fontSize: 12, color: '#aaa' },

  // 지원금 카드
  subsidyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 10,
    overflow: 'hidden',
  },
  subsidyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  subsidyIcon: { fontSize: 24 },
  subsidyInfo: { flex: 1 },
  subsidyTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  subsidyAmount: { fontSize: 12, fontWeight: '600', color: '#2a6fa8', marginTop: 2 },
  subsidyTag: {
    backgroundColor: '#FFD966',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  subsidyTagText: { fontSize: 10, fontWeight: '700', color: '#7B5E00' },
  subsidyExpanded: { paddingHorizontal: 16, paddingBottom: 14 },
  subsidyDesc: { fontSize: 12, color: '#718096', lineHeight: 20, marginBottom: 12 },
  subsidyBtnRow: { flexDirection: 'row', gap: 8 },
  subsidyBtnOutline: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F7F8FA',
    alignItems: 'center',
  },
  subsidyBtnOutlineText: { fontSize: 12, fontWeight: '600', color: '#4A5568' },
  subsidyBtnFill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFD966',
    alignItems: 'center',
  },
  subsidyBtnFillText: { fontSize: 12, fontWeight: '700', color: '#7B5E00' },

  // 무료 프로그램 가로 스크롤
  hScroll: { paddingRight: 16, gap: 10 },
  freeProgramCard: {
    width: 130,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  freeProgramImage: { width: '100%', height: 90 },
  freeProgramInfo: { padding: 10 },
  freeProgramTitle: { fontSize: 12, fontWeight: '700', color: '#1A202C', marginBottom: 2 },
  freeProgramOrg: { fontSize: 10, color: '#A0AEC0' },
  freeProgramBadge: {
    marginTop: 6,
    backgroundColor: '#EBF8FF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  freeProgramBadgeText: { fontSize: 10, fontWeight: '600', color: '#2a6fa8' },

  // AI 추천 그리드
  aiGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  aiCard: {
    width: '50%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 12,
  },
  aiCardImage: { width: '100%', height: 90 },
  matchBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#3182CE',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  matchBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  aiCardInfo: { padding: 10 },
  aiCardTitle: { fontSize: 12, fontWeight: '700', color: '#1A202C' },
  showAllBtn: {
    marginTop: 4,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  showAllBtnText: { fontSize: 13, fontWeight: '600', color: '#4A5568' },

  // 절감 효과 카드
  savingCard: {
    backgroundColor: '#EAF6FF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  savingTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  savingEmoji: { fontSize: 28 },
  savingDesc: { fontSize: 13, color: '#718096', lineHeight: 20 },
  savingAmount: { fontSize: 30, fontWeight: '800', color: '#1A202C', marginBottom: 2 },
  savingSubDesc: { fontSize: 13, color: '#718096', marginBottom: 16 },
  savingDivider: { height: 1, backgroundColor: '#E2E8F0', marginBottom: 14 },
  savingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  savingRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  savingRowLabel: { fontSize: 13, color: '#4A5568' },
  savingRowValue: { fontSize: 13, fontWeight: '700', color: '#2a6fa8' },

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
  shareBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFD966',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectBtnText: { fontSize: 15, fontWeight: '700', color: '#7B5E00' },
});