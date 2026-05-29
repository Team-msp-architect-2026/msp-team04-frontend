import React, { useEffect, useState } from 'react';
import BottomTabBar from '../../components/BottomTabBar';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../constants';
import { LinearGradient } from 'expo-linear-gradient';
import CommonHeader from '../../components/CommonHeader';
import { getPrograms } from '../../api/programApi';
 
 
// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────
interface ChildInfo {
  name: string;
  age: number;
  schoolStage?: string;
  concerns: string[];
  isDualIncome?: boolean;
}
 
interface HomeScreenProps {
  userName: string;
  onRecommendClick: () => void;
  onTabChange: (tab: string) => void;
  hasChildInfo: boolean;
  childInfo?: ChildInfo;
  onRegisterChild: () => void;
  onEditChild?: () => void;
  onMapClick?: () => void;
  onSupportClick?: () => void;
  onAiReportClick?: () => void;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
}
 
const communityPosts = [
  { id: 1, title: '7세 아이 수학 학원 고민이에요', comments: 23, likes: 45, category: '교육' },
  { id: 2, title: '맞벌이인데 방과후 돌봄 어떻게 하세요?', comments: 31, likes: 67, category: '돌봄' },
  { id: 3, title: '우리 동네 추천 영어 학원 공유해요', comments: 18, likes: 52, category: '교육' },
];
 
const supportBenefits = [
  {
    id: 1,
    icon: '👵🏻',
    iconBg: '#FFF1E8',
    title: '서울시 조부모 돌봄수당',
    tag: '신청 가능',
  },
  {
    id: 2,
    icon: '🏠',
    iconBg: '#EAFBF3',
    title: '아이돌봄 정부지원',
    tag: '신청 가능',
  },
  {
    id: 3,
    icon: '💡',
    iconBg: '#FFF4D8',
    title: '유아 문화체험 무료수업',
    tag: '무료',
  },
];
 
// ─────────────────────────────────────────────
// 이미지 컴포넌트
// ─────────────────────────────────────────────
 
function ChildImagePlaceholder({ size = 50 }: { size?: number }) {
  return (
    <Image
      source={require('../../../assets/moment-splash.png')}
      style={{ width: size, height: size, borderRadius: size / 4 }}
    />
  );
}
 
function AIImagePlaceholder() {
  return (
    <Image
      source={require('../../../assets/momentAiCharater.png')}
      style={styles.aiRobotImage}
      resizeMode="contain"
    />
  );
}
 
function RecommendImage() {
  return (
    <Image
      source={require('../../../assets/recommend-crayon.png')}
      style={styles.smallCardImage}
      resizeMode="contain"
    />
  );
}
 
function ApplyImage() {
  return (
    <Image
      source={require('../../../assets/apply-checklist.png')}
      style={styles.smallCardImage}
      resizeMode="contain"
    />
  );
}
 
// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
const BG = '#fff';
 
export default function HomeScreen({
  userName, onRecommendClick, onTabChange,
  hasChildInfo, childInfo, onRegisterChild,
  onEditChild, onMapClick, onSupportClick,
  onSearchClick, onNotificationClick,
  onAiReportClick,
}: HomeScreenProps) {
 
  // ── API 데이터 상태 ──
  const [freeList, setFreeList] = useState<any[]>([]);
  const [urgentList, setUrgentList] = useState<any[]>([]);
 
  useEffect(() => {
    getPrograms()
      .then((res) => {
        const items: any[] = res.data?.content ?? [];
        setFreeList(items.filter((p) => p.isFree).slice(0, 5));
        setUrgentList(items.filter((p) => p.isRecruiting).slice(0, 5));
      })
      .catch((e) => console.error('프로그램 목록 조회 실패:', e));
  }, []);
 
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
 
      <CommonHeader
        variant="home"
        unreadCount={3}
        onSearchPress={onSearchClick}
        onNotificationPress={onNotificationClick}
      />
 
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
 
 
        {/* ══ 미등록 상태 ══ */}
        {!hasChildInfo ? (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>안녕하세요,{'\n'}{userName}님 👋</Text>
                <Text style={styles.heroSub}>
                  아이 정보를 등록하면{'\n'}
                  <Text style={styles.heroHL}>맞춤 추천 · 지원금 · AI 분석</Text>을{'\n'}
                  한번에 확인할 수 있어요!
                </Text>
              </View>
              <Image
                source={require('../../../assets/character2.png')}
                style={styles.heroCharacterImage}
                resizeMode="contain"
              />
            </View>
 
            <TouchableOpacity style={styles.registerCard} onPress={onRegisterChild} activeOpacity={0.85}>
              <View style={styles.registerIconWrap}>
                <Ionicons name="person-add" size={22} color="#d4a800" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.registerTitle}>아이 정보 등록하기</Text>
                <Text style={styles.registerSub}>등록 후 AI 맞춤 추천을 받아보세요</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </TouchableOpacity>
          </>
        ) : (
          /* ══ 등록 완료 상태 ══ */
          <>
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>{userName}님, 반가워요!</Text>
              <Text style={styles.subGreeting}>오늘도 아이에게 딱 맞는 프로그램을 찾아볼까요?</Text>
            </View>
 
            {childInfo && (
              <View style={styles.childCard}>
                <ChildImagePlaceholder size={50} />
                <View style={{ flex: 1 }}>
                  <View style={styles.childNameRow}>
                    <Text style={styles.childName}>{childInfo.name}</Text>
                    <Text style={styles.childAge}>
                      {childInfo.age}세{childInfo.schoolStage ? ` · ${childInfo.schoolStage}` : ''}
                    </Text>
                  </View>
                  <View style={styles.concernRow}>
                    {childInfo.concerns.map((c) => (
                      <View key={c} style={styles.concernChip}>
                        <Text style={styles.concernText}>{c}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                {onEditChild && (
                  <TouchableOpacity
                    onPress={onEditChild}
                    style={{
                      width: 32, height: 32, borderRadius: 16,
                      backgroundColor: '#F3F4F6',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="pencil" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
 
        {/* ════════════════════════════════════════
            ▼ 흰색 메인 섹션 시작
        ════════════════════════════════════════ */}
        <View style={styles.mainSection}>
 
          {/* ── AI 분석 3-그리드 (등록 완료 시만 표시) ── */}
          {childInfo && (
            <View style={styles.mainGrid}>
              {/* 왼쪽 큰 카드 */}
              <TouchableOpacity style={styles.bigCard} onPress={onAiReportClick} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#e6f5ff', '#FFFFFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0.52, y: 0.42 }}
                  style={styles.bigCardGradient}
                >
                  <View style={styles.bigCardTextArea}>
                    <Text style={styles.bigCardTitle}>AI 육아{'\n'}종합 분석</Text>
                    <View style={styles.bigCardBadge}>
                      <Text style={styles.bigCardBadgeText}>12개 추천</Text>
                    </View>
                  </View>
                  <View style={styles.bigCardImageArea}>
                    <AIImagePlaceholder />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
 
              {/* 오른쪽 작은 카드 2개 */}
              <View style={styles.smallCol}>
                <TouchableOpacity style={styles.smallCard} onPress={onRecommendClick} activeOpacity={0.85}>
                  <Text style={styles.smallCardTitle}>맞춤 추천</Text>
                  <RecommendImage />
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallCard} onPress={() => onTabChange('apply')} activeOpacity={0.85}>
                  <Text style={styles.smallCardTitle}>모집중 보기</Text>
                  <ApplyImage />
                </TouchableOpacity>
              </View>
            </View>
          )}
 
          {/* ── 이런 서비스도 있어요 ── */}
          <View style={styles.serviceSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>이런 서비스도 있어요</Text>
            </View>
 
            <View style={styles.serviceRow}>
              {[
                { image: require('../../../assets/map-pin.png'),  label: '내 주변\n찾기',       action: onMapClick },
                { image: require('../../../assets/wallet.png'),   label: '지원금\n확인',        action: onSupportClick },
                { image: require('../../../assets/post-it.png'),  label: '무료·공공\n프로그램', action: () => {} },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.serviceCard}
                  onPress={item.action}
                  activeOpacity={0.8}
                >
                  <Image source={item.image} style={styles.serviceImage} resizeMode="contain" />
                  <Text style={styles.serviceLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
 
          {/* ══ 놓치고 있는 지원 혜택 ══ */}
          <View style={styles.grayBlock}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>놓치고 있는 지원 혜택</Text>
              </View>
              <TouchableOpacity onPress={onSupportClick}>
                <Text style={styles.moreText}>전체보기</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.benefitListCard}>
              {supportBenefits.map((b, index) => (
                <TouchableOpacity
                  key={b.id}
                  style={[
                    styles.benefitRow,
                    index !== supportBenefits.length - 1 && styles.benefitRowBorder,
                  ]}
                  onPress={onSupportClick}
                  activeOpacity={0.75}
                >
                  <View style={[styles.benefitIconBox, { backgroundColor: b.iconBg }]}>
                    <Text style={styles.benefitIcon}>{b.icon}</Text>
                  </View>
                  <Text style={styles.benefitTitle}>{b.title}</Text>
                  <View style={styles.benefitTag}>
                    <Text style={styles.benefitTagText}>{b.tag}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#B8C0C8" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
 
          {/* ── 무료·공공 프로그램 (API 데이터) ── */}
          <View style={styles.whiteBlock}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>무료·공공 프로그램</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.moreText}>더보기</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {freeList.length > 0 ? (
                freeList.map((p) => (
                  <View key={p.id} style={styles.programCard}>
                    <View style={[styles.programImg, { backgroundColor: '#BAE6FD' }]} />
                    <Text style={styles.programTitle} numberOfLines={2}>{p.name}</Text>
                    <Text style={styles.programLoc}>{p.region} · 무료</Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: '#bbb', fontSize: 13, paddingVertical: 12 }}>불러오는 중...</Text>
              )}
            </ScrollView>
          </View>
 
          {/* ══ AI 맞춤 추천 TOP 3 ══ */}
          <View style={styles.grayBlock}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}> AI 맞춤 추천 TOP 3</Text>
              {hasChildInfo && (
                <TouchableOpacity onPress={onRecommendClick}>
                  <Text style={styles.moreText}>더보기</Text>
                </TouchableOpacity>
              )}
            </View>
            {hasChildInfo && childInfo ? (
              <View style={styles.aiTopListCard}>
                {[
                  {
                    id: 1,
                    emoji: '🏆',
                    iconBg: '#FFF4D8',
                    title: '창의 코딩 클래스',
                    reason: '또래 아이들에게 인기 있는 STEM 프로그램',
                  },
                  {
                    id: 2,
                    emoji: '🥈',
                    iconBg: '#EEF3FF',
                    title: '발레 & 체육 통합반',
                    reason: '신체·정서 발달에 도움이 되는 활동',
                  },
                  {
                    id: 3,
                    emoji: '🥉',
                    iconBg: '#FFF1E8',
                    title: '영어 스토리텔링',
                    reason: '언어 발달 시기에 맞는 영어 프로그램',
                  },
                ].map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.aiTopRow,
                      index !== 2 && styles.aiTopRowBorder,
                    ]}
                    onPress={onRecommendClick}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.aiTopIconBox, { backgroundColor: item.iconBg }]}>
                      <Text style={styles.aiTopEmoji}>{item.emoji}</Text>
                    </View>
                    <View style={styles.aiTopTextBox}>
                      <Text style={styles.aiTopTitle}>{item.title}</Text>
                      <Text style={styles.aiTopSub} numberOfLines={1}>
                        {item.reason}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#B8C0C8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <Text style={{ fontSize: 30 }}>🤖</Text>
                <Text style={styles.emptyTitle}>아이 정보 입력 후 TOP 3 받아보세요</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={onRegisterChild}>
                  <Text style={styles.emptyBtnText}>지금 등록하기</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
 
          {/* ── 오늘 마감 임박 (API 데이터) ── */}
          <View style={styles.whiteBlock}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>오늘 마감 임박 프로그램</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.moreText}>더보기</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {urgentList.length > 0 ? (
                urgentList.map((p) => (
                  <View key={p.id} style={[styles.programCard, { position: 'relative' }]}>
                    <View style={[styles.programImg, { backgroundColor: '#FFE9E9' }]} />
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentBadgeText}>모집중</Text>
                    </View>
                    <Text style={styles.programTitle} numberOfLines={2}>{p.name}</Text>
                    <Text style={styles.programLoc}>{p.region} · {p.category}</Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: '#bbb', fontSize: 13, paddingVertical: 12 }}>불러오는 중...</Text>
              )}
            </ScrollView>
          </View>
 
          {/* ══ 커뮤니티 인기글 ══ */}
          <View style={styles.grayBlock}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}> 커뮤니티 인기글</Text>
              <TouchableOpacity onPress={() => onTabChange('community')}>
                <Text style={styles.moreText}>더보기</Text>
              </TouchableOpacity>
            </View>
            {communityPosts.map((post) => (
              <TouchableOpacity key={post.id} style={styles.listCard}>
                <View style={styles.postCat}>
                  <Text style={styles.postCatText}>{post.category}</Text>
                </View>
                <Text style={[styles.listTitle, { flex: 1 }]} numberOfLines={1}>{post.title}</Text>
                <View style={styles.postStats}>
                  <Text style={styles.postStat}>💬 {post.comments}</Text>
                  <Text style={styles.postStat}>❤️ {post.likes}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
 
          <View style={{ height: 40 }} />
 
        </View>
        {/* ▲ mainSection 끝 */}
 
      </ScrollView>
 
      <BottomTabBar activeTab="home" onTabChange={onTabChange} />
 
    </View>
  );
}
 
// ─────────────────────────────────────────────
// 스타일
// ─────────────────────────────────────────────
const SHADOW = {
  shadowColor: '#000' as const,
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
};
 
const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: BG },
  scroll:           { paddingHorizontal: 16, paddingTop: 8 },
 
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff' },
  logo:             { fontSize: 22, fontWeight: '800', color: '#FFD93D', letterSpacing: -0.5 },
  headerRight:      { flexDirection: 'row', gap: 2 },
  iconBtn:          { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  notiBadge:        { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: '#f87171', borderWidth: 2, borderColor: '#fff' },
 
  heroCard:         { padding: 18, borderRadius: 22, backgroundColor: '#FFF9E8', minHeight: 165, position: 'relative', overflow: 'hidden', width: '100%' },
  heroText:         { width: '62%', zIndex: 2 },
  heroTitle:        { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 10, lineHeight: 26 },
  heroSub:          { fontSize: 13, color: '#666', lineHeight: 20 },
  heroHL:           { color: '#d4a800', fontWeight: '700' },
  heroCharacterImage: { position: 'absolute', right: 12, bottom: 6, width: 120, height: 120 },
 
  registerCard:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1.5, borderColor: '#FFD93D', borderStyle: 'dashed' },
  registerIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center' },
  registerTitle:    { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  registerSub:      { fontSize: 11.5, color: '#aaa', marginTop: 1 },
 
  greetingRow:      { marginTop: 4, marginBottom: 12 },
  greeting:         { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  subGreeting:      { fontSize: 12, color: '#999', marginTop: 2 },
 
  childCard:        { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 14, ...SHADOW },
  childNameRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  childName:        { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  childAge:         { fontSize: 12, color: '#aaa' },
  concernRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  concernChip:      { backgroundColor: '#F7F8FA', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 2, borderWidth: 1, borderColor: '#E5E7EB' },
  concernText:      { fontSize: 11, color: '#666' },
 
  mainSection: {
    backgroundColor: '#fff',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 0,
  },
 
  grayBlock: {
    backgroundColor: '#fff',
    paddingTop: 24,
    paddingBottom: 8,
  },
 
  whiteBlock: {
    backgroundColor: '#fff',
    paddingTop: 24,
    paddingBottom: 8,
  },
 
  serviceSection: {
    marginTop: 32,
    marginBottom: 8,
  },
 
  mainGrid:         { flexDirection: 'row', gap: 10, height: 220 },
 
  bigCard:          { flex: 1.15, borderRadius: 18, overflow: 'hidden', ...SHADOW },
  bigCardGradient:  { flex: 1, borderRadius: 18, padding: 16, position: 'relative' },
  bigCardTextArea:  { position: 'absolute', top: 16, left: 16, width: 120, zIndex: 2 },
  bigCardTitle:     { fontSize: 15, fontWeight: '700', color: '#1a1a1a', lineHeight: 22 },
  bigCardBadge:     { backgroundColor: '#5BB8FF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 8 },
  bigCardBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  bigCardImageArea: { position: 'absolute', right: -4, bottom: 6, width: 155, height: 155, alignItems: 'flex-end', justifyContent: 'flex-end' },
  aiRobotImage:     { width: 150, height: 150 },
 
  smallCol:         { flex: 1, gap: 10 },
  smallCard:        { flex: 1, borderRadius: 18, padding: 14, backgroundColor: '#fff', position: 'relative', overflow: 'hidden', ...SHADOW },
  smallCardTitle:   { position: 'absolute', top: 16, left: 14, fontSize: 13, fontWeight: '700', color: '#1a1a1a', zIndex: 2 },
  smallCardImage:   { position: 'absolute', right: 12, bottom: 10, width: 58, height: 58 },
 
  serviceRow:       { flexDirection: 'row', gap: 8, marginBottom: 4 },
  serviceCard:      { flex: 1, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center', gap: 6, backgroundColor: '#fff', ...SHADOW },
  serviceImage:     { width: 32, height: 32 },
  serviceIconWrap:  { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.75)', alignItems: 'center', justifyContent: 'center' },
  serviceLabel:     { fontSize: 10.5, color: '#555', textAlign: 'center', fontWeight: '500', lineHeight: 15 },
 
  sectionHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitleRow:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sectionTitle:     { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  moreText:         { fontSize: 12, color: '#bbb' },
 
  benefitListCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 4,
    ...SHADOW,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  benefitRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F3',
  },
  benefitIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitIcon: {
    fontSize: 21,
  },
  benefitTitle: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  benefitTag: {
    backgroundColor: '#FFD93D',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  benefitTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#191919',
  },
 
  hScroll:          { marginHorizontal: -16, paddingLeft: 16 },
  programCard:      { width: 148, marginRight: 10, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', ...SHADOW },
  programImg:       { width: '100%', height: 96 },
  programTitle:     { fontSize: 12, fontWeight: '600', color: '#1a1a1a', padding: 10, paddingBottom: 2 },
  programLoc:       { fontSize: 11, color: '#bbb', paddingHorizontal: 10, paddingBottom: 10 },
  urgentBadge:      { position: 'absolute', top: 8, left: 8, backgroundColor: '#FA8C16', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  urgentBadgeText:  { fontSize: 10, color: '#fff', fontWeight: '700' },
 
  aiTopListCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 4,
    ...SHADOW,
  },
  aiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  aiTopRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F3',
  },
  aiTopIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTopEmoji: {
    fontSize: 21,
  },
  aiTopTextBox: {
    flex: 1,
  },
  aiTopTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  aiTopSub: {
    fontSize: 11,
    color: '#B5B5B5',
    marginTop: 3,
  },
 
  listCard:         { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 8, ...SHADOW },
  listEmoji:        { fontSize: 20, width: 30, textAlign: 'center' },
  listTitle:        { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  listSub:          { fontSize: 11, color: '#bbb', marginTop: 2 },
 
  emptyBox:         { backgroundColor: '#FFFBEB', borderRadius: 16, padding: 20, alignItems: 'center', gap: 8 },
  emptyTitle:       { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  emptyBtn:         { backgroundColor: '#FFD93D', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, marginTop: 4 },
  emptyBtnText:     { fontSize: 12, fontWeight: '700', color: '#1a1a1a' },
 
  postCat:          { backgroundColor: '#EAF6FF', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  postCatText:      { fontSize: 10, fontWeight: '700', color: '#2a6fa8' },
  postStats:        { flexDirection: 'row', gap: 8 },
  postStat:         { fontSize: 11, color: '#bbb' },
 
  bottomTab:        { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  tabItem:          { flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 4, gap: 2 },
  tabLabel:         { fontSize: 10, color: '#aaa' },
  tabLabelActive:   { color: '#FFD93D', fontWeight: '700' },
});