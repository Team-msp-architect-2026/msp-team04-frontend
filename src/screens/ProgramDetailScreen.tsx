// src/screens/ProgramDetailScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants';

export interface ProgramDetail {
  id: number;
  title: string;
  organization: string;
  type: 'public' | 'private' | 'online' | 'government';
  location: string;
  address: string;
  distance: string;
  price: string;
  priceValue: number;
  rating: number;
  reviewCount: number;
  ageRange: string;
  schedule: string;
  score: number;
  isOpen: boolean;
  tags: string[];
  description: string;
  curriculum: string[];
  contact: string;
  website?: string;
  capacity: number;
  enrolled: number;
  startDate: string;
  endDate: string;
  isPartner: boolean;
  aiReason?: string;
  reviewChips?: string[];
  matchRate?: number;
}

interface Props {
  program: ProgramDetail;
  onBack: () => void;
  onApply: (program: ProgramDetail) => void;
  onGoHome: () => void;
}

const TYPE_LABELS = {
  public: '공공',
  private: '민간',
  online: '온라인',
  government: '정부지원',
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  public:     { bg: '#FFF3CD', text: '#d4a800' },
  private:    { bg: '#F3F4F6', text: '#718096' },
  online:     { bg: '#EBF8FF', text: '#2B6CB0' },
  government: { bg: '#F0FFF4', text: '#276749' },
};

const MOCK_REVIEWS = [
  { name: '김○○ 부모님', age: '만 5세', rating: 5, text: '선생님이 정말 친절하고 아이가 너무 좋아해요. 소규모라 집중적으로 케어해주셔서 만족도가 높아요.', date: '2025.03.15' },
  { name: '이○○ 부모님', age: '만 6세', rating: 5, text: '체계적인 커리큘럼이 인상적이에요. 아이의 발달에 확실히 도움이 됐어요.', date: '2025.03.08' },
  { name: '박○○ 부모님', age: '만 4세', rating: 4, text: '접근성이 좋고 선생님이 아이 개인 성향을 잘 파악해주세요.', date: '2025.02.28' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Text key={s} style={{ color: s <= Math.round(rating) ? '#F9A825' : '#E2E8F0', fontSize: 12 }}>★</Text>
      ))}
    </View>
  );
}

export default function ProgramDetailScreen({ program, onBack, onApply, onGoHome }: Props) {
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'review'>('info');

  const spotsLeft = program.capacity - program.enrolled;
  const enrolledPct = Math.round((program.enrolled / program.capacity) * 100);
  const matchRate = program.matchRate ?? program.score;
  const reviewChips = program.reviewChips ?? ['선생님 친절', '소규모 수업', '만족도 높음', '체계적 커리큘럼', '아이가 좋아함'];
  const typeStyle = TYPE_COLORS[program.type] ?? { bg: '#F3F4F6', text: '#718096' };

  const aiReasons = [
    program.aiReason ?? '아이의 고민 영역에 최적화된 프로그램',
    '비슷한 연령대 부모 만족도 1위 프로그램',
    program.distance !== '-'
      ? `${program.location} 위치, ${program.distance} 이내`
      : '온라인으로 어디서나 수강 가능',
    program.priceValue === 0
      ? '무료 이용 가능 (정부/공공 지원)'
      : `월 ${program.price} — 합리적인 비용`,
  ];

  return (
    <SafeAreaView style={s.root}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>프로그램 상세</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={s.headerBtn} onPress={() => setIsLiked(!isLiked)}>
            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? '#E53E3E' : '#1A1A1A'} />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn}>
            <Ionicons name="share-outline" size={22} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* 히어로 영역 (이미지 대체) */}
        <View style={s.hero}>
          <View style={s.heroImagePlaceholder}>
            <Text style={s.heroEmoji}>🏫</Text>
          </View>
          {/* 배지들 */}
          <View style={s.heroBadges}>
            <View style={[s.typeBadge, { backgroundColor: typeStyle.bg }]}>
              <Text style={[s.typeBadgeText, { color: typeStyle.text }]}>{TYPE_LABELS[program.type]}</Text>
            </View>
            {program.isPartner && (
              <View style={s.partnerBadge}>
                <Text style={s.partnerBadgeText}>MoMent 제휴</Text>
              </View>
            )}
            <View style={s.aiBadge}>
              <Text style={s.aiBadgeText}>✦ AI {matchRate}%</Text>
            </View>
          </View>
          <View style={s.scoreBadge}>
            <Text style={s.scoreBadgeText}>{program.score}점</Text>
          </View>
        </View>

        <View style={s.content}>
          {/* 제목 */}
          <View style={s.titleSection}>
            <Text style={s.org}>{program.organization}</Text>
            <Text style={s.title}>{program.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <Ionicons name="star" size={14} color={colors.primary.default} />
              <Text style={s.ratingNum}>{program.rating}</Text>
              <Text style={s.ratingCount}>({program.reviewCount}개 후기)</Text>
            </View>
          </View>

          {/* 빠른 정보 4칸 */}
          <View style={s.quickGrid}>
            {[
              { icon: 'location-outline', label: '위치', value: program.distance },
              { icon: 'wallet-outline', label: '비용', value: program.price },
              { icon: 'people-outline', label: '대상', value: program.ageRange },
              { icon: 'time-outline', label: '일정', value: program.schedule },
            ].map((item) => (
              <View key={item.label} style={s.quickCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <Ionicons name={item.icon as any} size={14} color="#718096" />
                  <Text style={s.quickLabel}>{item.label}</Text>
                </View>
                <Text style={s.quickValue} numberOfLines={1}>{item.value}</Text>
              </View>
            ))}
          </View>

          {/* AI 배너 */}
          <View style={s.aiBanner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 14, color: '#3182CE' }}>✦</Text>
              <Text style={s.aiBannerText}>비슷한 부모들이 가장 만족한 프로그램이에요</Text>
            </View>
            <View style={s.aiBannerBadge}>
              <Text style={s.aiBannerBadgeText}>{matchRate}%</Text>
            </View>
          </View>

          {/* 모집 현황 */}
          <View style={s.enrollCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={s.enrollTitle}>모집 현황</Text>
              <Text style={[s.enrollSpots, { color: spotsLeft <= 5 ? '#E53E3E' : '#38A169' }]}>
                {spotsLeft}자리 남음
              </Text>
            </View>
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: `${enrolledPct}%` as any }]} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={s.enrollMeta}>{program.enrolled}명 신청</Text>
              <Text style={s.enrollMeta}>정원 {program.capacity}명</Text>
            </View>
          </View>

          {/* 탭 */}
          <View style={s.tabBar}>
            {(['info', 'review'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[s.tab, activeTab === tab && s.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                  {tab === 'info' ? '상세정보' : `후기 (${program.reviewCount})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── 상세정보 탭 ── */}
          {activeTab === 'info' && (
            <>
              {/* AI 추천 이유 */}
              <View style={s.aiReasonCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Text style={{ fontSize: 13, color: '#3182CE' }}>✦</Text>
                  <Text style={s.aiReasonTitle}>AI 추천 이유</Text>
                </View>
                {aiReasons.map((r, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <Text style={s.aiCheck}>✓</Text>
                    <Text style={s.aiReasonText}>{r}</Text>
                  </View>
                ))}
              </View>

              {/* 프로그램 소개 */}
              <View style={s.section}>
                <Text style={s.sectionTitle}>프로그램 소개</Text>
                <Text style={s.sectionBody}>{program.description}</Text>
              </View>

              {/* 상세 정보 */}
              <View style={s.section}>
                <Text style={s.sectionTitle}>상세 정보</Text>
                <View style={s.infoTable}>
                  {[
                    { label: '운영 기간', value: `${program.startDate} ~ ${program.endDate}` },
                    { label: '운영 시간', value: program.schedule },
                    { label: '대상 연령', value: program.ageRange },
                    { label: '수업 인원', value: `최대 ${program.capacity}명` },
                    { label: '위치', value: program.address },
                  ].map((d, idx, arr) => (
                    <View key={d.label} style={[s.infoRow, idx < arr.length - 1 && s.infoRowBorder]}>
                      <Text style={s.infoLabel}>{d.label}</Text>
                      <Text style={s.infoValue}>{d.value}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 커리큘럼 */}
              <View style={s.section}>
                <Text style={s.sectionTitle}>커리큘럼</Text>
                {program.curriculum.map((item, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <Ionicons name="checkmark-circle" size={16} color="#38A169" style={{ marginTop: 1 }} />
                    <Text style={s.sectionBody}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* AI 후기 키워드 */}
              <View style={s.section}>
                <Text style={s.sectionTitle}>AI 후기 키워드 분석</Text>
                <View style={s.chipRow}>
                  {reviewChips.map((chip) => (
                    <View key={chip} style={s.chip}>
                      <Text style={s.chipText}>{chip}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 위치 */}
              <View style={s.section}>
                <Text style={s.sectionTitle}>위치</Text>
                <View style={s.mapPlaceholder}>
                  <Ionicons name="location" size={32} color="#CBD5E0" />
                  <Text style={{ fontSize: 12, color: '#A0AEC0', marginTop: 4 }}>지도 준비중</Text>
                </View>
                <Text style={s.sectionBody}>{program.address}</Text>
              </View>

              {/* 문의 */}
              <View style={[s.section, s.contactCard]}>
                <Text style={s.sectionTitle}>문의</Text>
                <TouchableOpacity
                  style={s.contactRow}
                  onPress={() => Linking.openURL(`tel:${program.contact}`)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="call-outline" size={16} color="#718096" />
                    <Text style={s.contactText}>{program.contact}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#CBD5E0" />
                </TouchableOpacity>
                {program.website && (
                  <TouchableOpacity
                    style={[s.contactRow, { borderTopWidth: 1, borderTopColor: '#F0F0F0' }]}
                    onPress={() => Linking.openURL(program.website!)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="globe-outline" size={16} color="#718096" />
                      <Text style={s.contactText}>홈페이지 방문</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#CBD5E0" />
                  </TouchableOpacity>
                )}
              </View>

              {/* 태그 */}
              <View style={s.chipRow}>
                {program.tags.map((tag, i) => (
                  <View key={i} style={s.tagChip}>
                    <Text style={s.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* ── 후기 탭 ── */}
          {activeTab === 'review' && (
            <>
              {/* 평점 요약 */}
              <View style={s.ratingCard}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={s.ratingBig}>{program.rating}</Text>
                  <StarRating rating={program.rating} />
                  <Text style={s.ratingCountSmall}>{program.reviewCount}개 후기</Text>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  {[5, 4, 3, 2, 1].map((s2) => (
                    <View key={s2} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 11, color: '#718096', width: 8 }}>{s2}</Text>
                      <View style={s.ratingBarBg}>
                        <View style={[s.ratingBarFill, {
                          width: s2 === 5 ? '85%' : s2 === 4 ? '12%' : '3%',
                        }]} />
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* AI 키워드 */}
              <View style={[s.section, { marginTop: 0 }]}>
                <Text style={s.sectionTitle}>AI 후기 키워드 분석</Text>
                <View style={s.chipRow}>
                  {reviewChips.map((chip) => (
                    <View key={chip} style={s.chip}>
                      <Text style={s.chipText}>{chip}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 리뷰 목록 */}
              {MOCK_REVIEWS.map((r, i) => (
                <View key={i} style={s.reviewCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={s.reviewAvatar}>
                        <Text style={{ fontSize: 14 }}>👩</Text>
                      </View>
                      <View>
                        <Text style={s.reviewName}>{r.name}</Text>
                        <Text style={s.reviewAge}>{r.age} 부모님</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <StarRating rating={r.rating} />
                      <Text style={s.reviewDate}>{r.date}</Text>
                    </View>
                  </View>
                  <Text style={s.reviewText}>{r.text}</Text>
                </View>
              ))}
            </>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* ── 하단 고정 CTA ── */}
      <View style={s.cta}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <View>
            <Text style={s.ctaPriceLabel}>월 수강료</Text>
            <Text style={s.ctaPrice}>{program.price}</Text>
          </View>
          {spotsLeft <= 5 && program.isOpen && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.ctaUrgent}>잔여 {spotsLeft}석</Text>
              <Text style={s.ctaUrgentSub}>빠른 신청 권장</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={s.ctaHomeBtn} onPress={onGoHome}>
            <Ionicons name="home-outline" size={20} color="#4A5568" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.ctaApplyBtn, !program.isOpen && s.ctaApplyBtnDisabled]}
            onPress={() => program.isOpen && onApply(program)}
            disabled={!program.isOpen}
          >
            <Text style={s.ctaApplyText}>
              {program.isOpen
                ? program.isPartner ? '신청하기' : '신청 페이지로 이동'
                : '모집 마감'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },

  scroll: { paddingBottom: 20 },
  content: { paddingHorizontal: 16 },

  hero: { height: 200, backgroundColor: '#EBF8FF', justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: 0 },
  heroImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  heroEmoji: { fontSize: 64 },
  heroBadges: { position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', gap: 6 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  typeBadgeText: { fontSize: 11, fontWeight: '600' },
  partnerBadge: { backgroundColor: '#FFF3CD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  partnerBadgeText: { fontSize: 11, fontWeight: '600', color: '#d4a800' },
  aiBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#3182CE' },
  aiBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  scoreBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  scoreBadgeText: { fontSize: 13, fontWeight: '700', color: colors.primary.default },

  titleSection: { paddingTop: 16, marginBottom: 16 },
  org: { fontSize: 12, color: '#888', marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  ratingNum: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  ratingCount: { fontSize: 13, color: '#888' },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  quickCard: { width: '47%', backgroundColor: '#F7F8FA', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  quickLabel: { fontSize: 11, color: '#718096' },
  quickValue: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },

  aiBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#EBF8FF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#BEE3F8', marginBottom: 16 },
  aiBannerText: { fontSize: 13, fontWeight: '600', color: '#1A365D', flex: 1 },
  aiBannerBadge: { backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  aiBannerBadgeText: { fontSize: 13, fontWeight: '700', color: '#3182CE' },

  enrollCard: { backgroundColor: '#F0FFF4', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#C6F6D5', marginBottom: 16 },
  enrollTitle: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  enrollSpots: { fontSize: 13, fontWeight: '700' },
  progressBar: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#38A169', borderRadius: 999 },
  enrollMeta: { fontSize: 11, color: '#718096' },

  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary.default },
  tabText: { fontSize: 14, color: '#888', fontWeight: '500' },
  tabTextActive: { color: colors.primary.default, fontWeight: '700' },

  aiReasonCard: { backgroundColor: '#EBF8FF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#BEE3F8', marginBottom: 20 },
  aiReasonTitle: { fontSize: 13, fontWeight: '700', color: '#1A365D' },
  aiCheck: { color: '#3182CE', fontWeight: '700', fontSize: 12, marginTop: 2 },
  aiReasonText: { fontSize: 12, color: '#2B6CB0', lineHeight: 20, flex: 1 },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 },
  sectionBody: { fontSize: 13, color: '#718096', lineHeight: 21 },

  infoTable: { borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 12 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  infoLabel: { fontSize: 12, color: '#718096', fontWeight: '500', minWidth: 72 },
  infoValue: { fontSize: 12, fontWeight: '600', color: '#2D3748', textAlign: 'right', flex: 1 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: '#EBF8FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: '#BEE3F8' },
  chipText: { fontSize: 11, fontWeight: '600', color: '#2B6CB0' },
  tagChip: { backgroundColor: '#F7F8FA', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB' },
  tagText: { fontSize: 11, color: '#718096' },

  mapPlaceholder: { height: 140, backgroundColor: '#F7F8FA', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },

  contactCard: { backgroundColor: '#F7F8FA', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  contactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  contactText: { fontSize: 13, color: '#1A1A1A' },

  ratingCard: { flexDirection: 'row', gap: 16, backgroundColor: '#F9F9F9', borderRadius: 14, padding: 16, marginBottom: 20 },
  ratingBig: { fontSize: 36, fontWeight: '800', color: '#1A202C', lineHeight: 40 },
  ratingCountSmall: { fontSize: 11, color: '#A0AEC0', marginTop: 4 },
  ratingBarBg: { flex: 1, height: 6, backgroundColor: '#E2E8F0', borderRadius: 999, overflow: 'hidden' },
  ratingBarFill: { height: '100%', backgroundColor: '#F9A825', borderRadius: 999 },

  reviewCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 14, padding: 16, marginBottom: 12 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 999, backgroundColor: '#FFF3CD', justifyContent: 'center', alignItems: 'center' },
  reviewName: { fontSize: 12, fontWeight: '700', color: '#2D3748' },
  reviewAge: { fontSize: 10, color: '#A0AEC0' },
  reviewDate: { fontSize: 10, color: '#CBD5E0', marginTop: 2 },
  reviewText: { fontSize: 12, color: '#4A5568', lineHeight: 20 },

  cta: { borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28 },
  ctaPriceLabel: { fontSize: 12, color: '#A0AEC0' },
  ctaPrice: { fontSize: 20, fontWeight: '800', color: '#1A202C' },
  ctaUrgent: { fontSize: 11, color: '#E53E3E', fontWeight: '700' },
  ctaUrgentSub: { fontSize: 11, color: '#A0AEC0' },
  ctaHomeBtn: { width: 48, height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' },
  ctaApplyBtn: { flex: 1, height: 48, borderRadius: 14, backgroundColor: '#667EEA', justifyContent: 'center', alignItems: 'center' },
  ctaApplyBtnDisabled: { backgroundColor: '#CBD5E0' },
  ctaApplyText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});