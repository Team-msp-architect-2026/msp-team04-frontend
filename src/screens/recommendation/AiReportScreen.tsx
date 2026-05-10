import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const PALETTE = {
  bg: '#F5F6F8',
  card: '#FFFFFF',
  text: '#17191D',
  subText: '#6B7280',
  muted: '#9AA1AC',
  border: '#EEF0F3',
  softBorder: '#E8EDF3',
  yellow: '#FFF8D8',
  yellowDark: '#8A6A00',
  blue: '#EEF3FF',
  blueDark: '#4D5FD2',
  green: '#F2FBF6',
  greenDark: '#228251',
  purple: '#F5F3FF',
  purpleDark: '#5F52C8',
  black: '#17191D',
};

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
  {
    id: 1,
    title: '구립 미술교실',
    org: '강남구',
    date: '~ 05.30',
    imageUrl:
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    title: '독서 논술 교실',
    org: '서초구',
    date: '~ 05.13',
    imageUrl:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
  },
  {
    id: 3,
    title: '아이 체육교실',
    org: '송파구',
    date: '~ 05.25',
    imageUrl:
      'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop',
  },
  {
    id: 4,
    title: '유아 음악교실',
    org: '마포구',
    date: '~ 06.01',
    imageUrl:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
  },
  {
    id: 5,
    title: '영어 그림책',
    org: '강동구',
    date: '~ 05.20',
    imageUrl:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
  },
];

const AI_PROGRAMS = [
  {
    id: 1,
    title: '코딩 창의 클래스',
    match: 96,
    imageUrl:
      'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    title: '키즈 쿠킹 클래스',
    match: 93,
    imageUrl:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
  },
  {
    id: 3,
    title: '과학 실험 교실',
    match: 91,
    imageUrl:
      'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=400&h=300&fit=crop',
  },
  {
    id: 4,
    title: '발레 & 체육',
    match: 89,
    imageUrl:
      'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&h=300&fit=crop',
  },
  {
    id: 5,
    title: '창의 미술 교실',
    match: 88,
    imageUrl:
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
  },
  {
    id: 6,
    title: '영어 스토리텔링',
    match: 86,
    imageUrl:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
  },
  {
    id: 7,
    title: '유아 음악 교실',
    match: 85,
    imageUrl:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
  },
  {
    id: 8,
    title: '수학 사고력 교실',
    match: 83,
    imageUrl:
      'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=400&h=300&fit=crop',
  },
  {
    id: 9,
    title: '독서 논술 교실',
    match: 82,
    imageUrl:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
  },
  {
    id: 10,
    title: '태권도 교실',
    match: 80,
    imageUrl:
      'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop',
  },
  {
    id: 11,
    title: '로봇 조립 교실',
    match: 78,
    imageUrl:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
  },
  {
    id: 12,
    title: '자연 생태 체험',
    match: 76,
    imageUrl:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
  },
];

const SAVING_ROWS = [
  { label: '아이돌봄 지원금', value: '월 45,000원' },
  { label: '교육비 바우처', value: '월 30,000원' },
  { label: '무료 프로그램 활용', value: '월 45,000원' },
];

const REPORT_CHIPS: Array<{
  label: string;
  icon: IconName;
  bg: string;
  color: string;
}> = [
  {
    label: '지원금 3건',
    icon: 'cash-outline',
    bg: PALETTE.yellow,
    color: PALETTE.yellowDark,
  },
  {
    label: '무료 프로그램 5건',
    icon: 'gift-outline',
    bg: PALETTE.blue,
    color: PALETTE.blueDark,
  },
  {
    label: '추천 12건',
    icon: 'sparkles-outline',
    bg: PALETTE.purple,
    color: PALETTE.purpleDark,
  },
];

export default function AiReportScreen({
  childInfo,
  onBack,
  onSelectProgram,
}: AiReportScreenProps) {
  const [expandedSubsidy, setExpandedSubsidy] = useState<number | null>(null);
  const [showAllAi, setShowAllAi] = useState(false);

  const displayedAiPrograms = showAllAi ? AI_PROGRAMS : AI_PROGRAMS.slice(0, 4);

  return (
    <View style={s.container}>
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

          <Text style={s.headerTitle}>AI 육아 종합 분석 리포트</Text>

          <View style={s.headerSide} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.heroCard}>
          <Text style={s.heroTitle}>
            {childInfo.name}에게 맞는{'\n'}육아 지원 혜택을 찾았어요!
          </Text>

          <View style={s.scoreCard}>
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

          <View style={s.chipRow}>
            {REPORT_CHIPS.map(chip => (
              <View
                key={chip.label}
                style={[s.chip, { backgroundColor: chip.bg }]}
              >
                <Ionicons name={chip.icon} size={13} color={chip.color} />
                <Text style={[s.chipText, { color: chip.color }]}>
                  {chip.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              1. 받을 수 있는 지원금{' '}
              <Text style={s.sectionCountYellow}>3건</Text>
            </Text>

            <TouchableOpacity style={s.moreBtn} activeOpacity={0.72}>
              <Text style={s.moreBtnText}>전체보기</Text>
              <Ionicons name="chevron-forward" size={13} color={PALETTE.muted} />
            </TouchableOpacity>
          </View>

          {SUBSIDY_ITEMS.map(item => {
            const isExpanded = expandedSubsidy === item.id;

            return (
              <View key={item.id} style={s.subsidyCard}>
                <TouchableOpacity
                  style={s.subsidyRow}
                  onPress={() => setExpandedSubsidy(isExpanded ? null : item.id)}
                  activeOpacity={0.76}
                >
                  <View style={s.subsidyIconBox}>
                    <Text style={s.subsidyIcon}>{item.icon}</Text>
                  </View>

                  <View style={s.subsidyInfo}>
                    <Text style={s.subsidyTitle}>{item.title}</Text>
                    <Text style={s.subsidyAmount}>{item.amount}</Text>
                  </View>

                  <View style={s.subsidyRight}>
                    <View style={s.subsidyTag}>
                      <Text style={s.subsidyTagText}>{item.tag}</Text>
                    </View>

                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={17}
                      color={PALETTE.muted}
                    />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={s.subsidyExpanded}>
                    <Text style={s.subsidyDesc}>{item.desc}</Text>

                    <View style={s.subsidyBtnRow}>
                      <TouchableOpacity
                        style={s.subsidyBtnOutline}
                        activeOpacity={0.74}
                      >
                        <Text style={s.subsidyBtnOutlineText}>자세히 보기</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={s.subsidyBtnFill}
                        activeOpacity={0.74}
                      >
                        <Text style={s.subsidyBtnFillText}>신청하기</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              2. 무료 공공 프로그램{' '}
              <Text style={s.sectionCountBlue}>5건</Text>
            </Text>

            <TouchableOpacity style={s.moreBtn} activeOpacity={0.72}>
              <Text style={s.moreBtnText}>전체보기</Text>
              <Ionicons name="chevron-forward" size={13} color={PALETTE.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.hScroll}
          >
            {FREE_PROGRAMS.map(program => (
              <TouchableOpacity
                key={program.id}
                style={s.freeProgramCard}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: program.imageUrl }}
                  style={s.freeProgramImage}
                />

                <View style={s.freeProgramInfo}>
                  <Text style={s.freeProgramTitle} numberOfLines={1}>
                    {program.title}
                  </Text>
                  <Text style={s.freeProgramOrg}>{program.org}</Text>

                  <View style={s.freeProgramBadge}>
                    <Text style={s.freeProgramBadgeText}>
                      무료 · {program.date}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              3. AI 추천 프로그램 <Text style={s.sectionCountBlue}>12건</Text>
            </Text>

            <TouchableOpacity
              style={s.moreBtn}
              onPress={() => setShowAllAi(!showAllAi)}
              activeOpacity={0.72}
            >
              <Text style={s.moreBtnText}>
                {showAllAi ? '접기' : '전체보기'}
              </Text>
              <Ionicons
                name={showAllAi ? 'chevron-up' : 'chevron-forward'}
                size={13}
                color={PALETTE.muted}
              />
            </TouchableOpacity>
          </View>

          <View style={s.aiGrid}>
            {displayedAiPrograms.map(program => (
              <TouchableOpacity
                key={program.id}
                style={s.aiCard}
                activeOpacity={0.8}
              >
                <View>
                  <Image source={{ uri: program.imageUrl }} style={s.aiCardImage} />
                  <View style={s.matchBadge}>
                    <Text style={s.matchBadgeText}>
                      매칭 {program.match}%
                    </Text>
                  </View>
                </View>

                <View style={s.aiCardInfo}>
                  <Text style={s.aiCardTitle} numberOfLines={1}>
                    {program.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {!showAllAi && (
            <TouchableOpacity
              style={s.showAllBtn}
              onPress={() => setShowAllAi(true)}
              activeOpacity={0.74}
            >
              <Text style={s.showAllBtnText}>전체 12건 보기</Text>
              <Ionicons name="chevron-down" size={15} color={PALETTE.subText} />
            </TouchableOpacity>
          )}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>4. 이번 달 예상 절감 효과</Text>

          <View style={s.savingCard}>
            <View style={s.savingTop}>
              <View style={s.savingIconBox}>
                <Ionicons name="wallet-outline" size={24} color="#2563EB" />
              </View>

              <Text style={s.savingDesc}>
                현재 지원사업과 무료 프로그램을{'\n'}활용하면 월 평균
              </Text>
            </View>

            <Text style={s.savingAmount}>120,000원</Text>
            <Text style={s.savingSubDesc}>절감 가능해요!</Text>

            <View style={s.savingDivider} />

            {SAVING_ROWS.map(row => (
              <View key={row.label} style={s.savingRow}>
                <View style={s.savingRowLeft}>
                  <Ionicons
                    name="checkmark-circle"
                    size={15}
                    color={PALETTE.greenDark}
                  />
                  <Text style={s.savingRowLabel}>{row.label}</Text>
                </View>

                <Text style={s.savingRowValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.bottomSpacer} />
      </ScrollView>

      <View style={s.bottomBar}>
        <TouchableOpacity
          style={s.selectBtn}
          onPress={onSelectProgram}
          activeOpacity={0.82}
        >
          <Text style={s.selectBtnText}>맞춤 추천 보러가기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.bg,
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
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: PALETTE.text,
    letterSpacing: -0.35,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },

  heroCard: {
    marginHorizontal: 16,
    marginBottom: 36,
    borderRadius: 26,
    backgroundColor: PALETTE.card,
    borderWidth: 1,
    borderColor: PALETTE.border,
    padding: 18,
    shadowColor: '#111827',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  heroTitle: {
    marginTop: 2,
    marginBottom: 18,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.65,
  },

  scoreCard: {
    marginBottom: 14,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: PALETTE.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  scoreCircleOuter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 7,
    borderColor: '#111827',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scoreCircleInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  scoreText: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.35,
  },

  scoreInfo: {
    flex: 1,
  },

  scoreTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.2,
  },

  scoreDesc: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: PALETTE.subText,
    letterSpacing: -0.1,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  chipText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    letterSpacing: -0.1,
  },

  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },

  sectionHeader: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.25,
  },

  sectionCountYellow: {
    color: PALETTE.yellowDark,
  },

  sectionCountBlue: {
    color: PALETTE.blueDark,
  },

  moreBtn: {
    height: 30,
    paddingLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  moreBtnText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  subsidyCard: {
    marginBottom: 10,
    borderRadius: 18,
    backgroundColor: PALETTE.card,
    borderWidth: 1,
    borderColor: PALETTE.border,
    overflow: 'hidden',
  },

  subsidyRow: {
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  subsidyIconBox: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: PALETTE.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  subsidyIcon: {
    fontSize: 21,
  },

  subsidyInfo: {
    flex: 1,
  },

  subsidyTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.15,
  },

  subsidyAmount: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: PALETTE.blueDark,
  },

  subsidyRight: {
    alignItems: 'flex-end',
    gap: 7,
  },

  subsidyTag: {
    height: 24,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: PALETTE.green,
    alignItems: 'center',
    justifyContent: 'center',
  },

  subsidyTagText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '900',
    color: PALETTE.greenDark,
  },

  subsidyExpanded: {
    paddingHorizontal: 16,
    paddingBottom: 15,
  },

  subsidyDesc: {
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '500',
    color: PALETTE.subText,
    letterSpacing: -0.1,
    marginBottom: 13,
  },

  subsidyBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },

  subsidyBtnOutline: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PALETTE.softBorder,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  subsidyBtnOutlineText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: PALETTE.subText,
  },

  subsidyBtnFill: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    backgroundColor: PALETTE.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  subsidyBtnFillText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  hScroll: {
    paddingRight: 16,
    gap: 10,
  },

  freeProgramCard: {
    width: 132,
    borderRadius: 18,
    backgroundColor: PALETTE.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PALETTE.border,
  },

  freeProgramImage: {
    width: '100%',
    height: 92,
    backgroundColor: '#E5E7EB',
  },

  freeProgramInfo: {
    padding: 10,
  },

  freeProgramTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.1,
  },

  freeProgramOrg: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    color: PALETTE.muted,
  },

  freeProgramBadge: {
    marginTop: 7,
    alignSelf: 'flex-start',
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: PALETTE.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  freeProgramBadgeText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '900',
    color: PALETTE.blueDark,
  },

  aiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  aiCard: {
    width: '48.5%',
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: PALETTE.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PALETTE.border,
  },

  aiCardImage: {
    width: '100%',
    height: 94,
    backgroundColor: '#E5E7EB',
  },

  matchBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(17,24,39,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  matchBadgeText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  aiCardInfo: {
    padding: 10,
  },

  aiCardTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.1,
  },

  showAllBtn: {
    marginTop: 2,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.softBorder,
    backgroundColor: PALETTE.card,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },

  showAllBtnText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: PALETTE.subText,
  },

  savingCard: {
    marginTop: 13,
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  savingTop: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  savingIconBox: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  savingDesc: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    color: PALETTE.subText,
    letterSpacing: -0.1,
  },

  savingAmount: {
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.8,
  },

  savingSubDesc: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: PALETTE.subText,
  },

  savingDivider: {
    height: 1,
    backgroundColor: '#DBEAFE',
    marginVertical: 16,
  },

  savingRow: {
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  savingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  savingRowLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: PALETTE.subText,
  },

  savingRowValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    color: PALETTE.blueDark,
  },

  bottomSpacer: {
    height: 98,
  },

  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: PALETTE.border,
  },

  selectBtn: {
    height: 50,
    borderRadius: 16,
    backgroundColor: PALETTE.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectBtnText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});