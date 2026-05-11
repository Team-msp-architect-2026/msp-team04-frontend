import React, { useEffect, useMemo, useState } from 'react';
import { reviewApi, ReviewItem } from '../../api/review';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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

type ProgramType = ProgramDetail['type'];

const PALETTE = {
  text: '#111827',
  subText: '#64748B',
  muted: '#94A3B8',
  border: '#E8EDF3',
  softBorder: '#EEF2F6',
  bg: '#FFFFFF',
  softBg: '#F8FAFC',
  yellow: '#F2CF52',
  yellowDark: '#B88900',
  primary: '#6377F2',
  primaryDark: '#4D5FD2',
  primarySoft: '#F3F5FF',
  primaryBorder: '#DCE2FF',
  blue: '#2D8DCE',
  blueSoft: '#F7FBFF',
  coral: '#E58B84',
  coralDark: '#B85A52',
  coralSoft: '#FFF7F5',
  coralBorder: '#F4DAD5',
  red: '#E05252',
  green: '#45A46A',
};

const TYPE_LABELS: Record<ProgramType, string> = {
  public: '공공',
  private: '민간',
  online: '온라인',
  government: '정부지원',
};



function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(star => (
        <Text
          key={star}
          style={[
            styles.star,
            {
              fontSize: size,
              color: star <= Math.round(rating) ? '#F8B400' : '#E2E8F0',
            },
          ]}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

function InfoPill({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'yellow' | 'primary';
}) {
  const pillStyle =
    tone === 'yellow'
      ? styles.pillYellow
      : tone === 'primary'
        ? styles.pillPrimary
        : styles.pillDefault;

  const textStyle =
    tone === 'yellow'
      ? styles.pillTextYellow
      : tone === 'primary'
        ? styles.pillTextPrimary
        : styles.pillTextDefault;

  return (
    <View style={[styles.pill, pillStyle]}>
      <Text style={[styles.pillText, textStyle]}>{children}</Text>
    </View>
  );
}

export default function ProgramDetailScreen({
  program,
  onBack,
  onApply,
  onGoHome,
}: Props) {
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'review'>('info');
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  const matchRate = program.matchRate ?? program.score;
  const spotsLeft = Math.max(program.capacity - program.enrolled, 0);
  const safeCapacity = Math.max(program.capacity, 1);
  const enrolledPct = Math.min(
    100,
    Math.round((program.enrolled / safeCapacity) * 100),
  );

  const reviewChips = program.reviewChips?.length
    ? program.reviewChips
    : ['선생님 친절', '소규모 수업', '피드백 좋음', '아이가 좋아함'];

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewLoading(true);
      try {
        const data = await reviewApi.getReviewList(program.id);
        setReviews(data);
      } catch (e) {
        setReviews([]);
      } finally {
        setReviewLoading(false);
      }
    };
    fetchReviews();
  }, [program.id]);

  const aiReasons = useMemo(
    () => [
      program.aiReason ??
        '소규모 수업과 선생님 피드백을 원하는 조건에 잘 맞는 프로그램입니다.',
      program.distance !== '-'
        ? `${program.location} 위치, ${program.distance} 거리라 이동 부담이 적어요.`
        : '온라인 수업으로 이동 부담 없이 참여할 수 있어요.',
      program.priceValue === 0
        ? '무료 또는 공공 지원 프로그램이라 비용 부담이 낮아요.'
        : `${program.price}으로 예산 조건에 맞춰 검토하기 좋아요.`,
      `${program.ageRange} 대상 수업이라 자녀 연령 조건과 잘 맞아요.`,
    ],
    [program],
  );

  const handleOpenWebsite = () => {
    if (!program.website) {
      return;
    }

    Linking.openURL(program.website);
  };

  const handleCall = () => {
    if (!program.contact) {
      return;
    }

    Linking.openURL(`tel:${program.contact}`);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
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
          프로그램 상세
        </Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setIsLiked(prev => !prev)}
          activeOpacity={0.75}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={23}
            color={isLiked ? PALETTE.red : PALETTE.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summarySection}>
          <View style={styles.heroCard}>
            <View style={styles.heroIconCircle}>
              <Text style={styles.heroEmoji}>🏫</Text>
            </View>
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />
          </View>

          <View style={styles.summaryContent}>
            <View style={styles.badgeRow}>
              <InfoPill>{TYPE_LABELS[program.type]}</InfoPill>

              {program.isPartner && (
                <InfoPill tone="yellow">MoMent 제휴</InfoPill>
              )}

              <InfoPill tone="primary">AI 매칭 {matchRate}%</InfoPill>
            </View>

            <Text style={styles.organization}>{program.organization}</Text>
            <Text style={styles.title}>{program.title}</Text>

            <View style={styles.ratingLine}>
              <Ionicons name="star" size={14} color="#F8B400" />
              <Text style={styles.ratingValue}>{program.rating}</Text>
              <Text style={styles.ratingMeta}>
                ({program.reviewCount}개 후기)
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.quickGrid}>
            <View style={styles.quickCard}>
              <View style={styles.quickLabelRow}>
                <Ionicons name="location-outline" size={14} color={PALETTE.muted} />
                <Text style={styles.quickLabel}>위치</Text>
              </View>
              <Text style={styles.quickValue} numberOfLines={1}>
                {program.distance}
              </Text>
            </View>

            <View style={styles.quickCard}>
              <View style={styles.quickLabelRow}>
                <Ionicons name="card-outline" size={14} color={PALETTE.muted} />
                <Text style={styles.quickLabel}>비용</Text>
              </View>
              <Text style={styles.quickValue} numberOfLines={1}>
                {program.price}
              </Text>
            </View>

            <View style={styles.quickCard}>
              <View style={styles.quickLabelRow}>
                <Ionicons name="people-outline" size={14} color={PALETTE.muted} />
                <Text style={styles.quickLabel}>대상</Text>
              </View>
              <Text style={styles.quickValue} numberOfLines={1}>
                {program.ageRange}
              </Text>
            </View>

            <View style={styles.quickCard}>
              <View style={styles.quickLabelRow}>
                <Ionicons name="time-outline" size={14} color={PALETTE.muted} />
                <Text style={styles.quickLabel}>일정</Text>
              </View>
              <Text style={styles.quickValue} numberOfLines={1}>
                {program.schedule}
              </Text>
            </View>
          </View>

          <View style={styles.capacityCard}>
            <View style={styles.capacityHeader}>
              <Text style={styles.capacityTitle}>모집 현황</Text>

              <View style={styles.capacityRemainBadge}>
                <View style={styles.capacityRemainDot} />
                <Text style={styles.capacityRemainText}>
                  {program.isOpen ? `잔여 ${spotsLeft}석` : '모집 마감'}
                </Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${enrolledPct}%`,
                    backgroundColor: PALETTE.primary,
                  },
                ]}
              />
            </View>

            <View style={styles.capacityMetaRow}>
              <Text style={styles.capacityMeta}>{program.enrolled}명 신청</Text>
              <Text style={styles.capacityMeta}>정원 {program.capacity}명</Text>
            </View>
          </View>

          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'info' && styles.tabButtonActive]}
              onPress={() => setActiveTab('info')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'info' && styles.tabTextActive,
                ]}
              >
                상세정보
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'review' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab('review')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'review' && styles.tabTextActive,
                ]}
              >
                후기 ({program.reviewCount})
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'info' ? (
            <View style={styles.tabContent}>
              <View style={styles.aiReasonCard}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="sparkles" size={15} color={PALETTE.primary} />
                  <Text style={styles.aiReasonTitle}>AI 추천 이유</Text>
                </View>

                <View style={styles.reasonList}>
                  {aiReasons.map(reason => (
                    <View key={reason} style={styles.reasonItem}>
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={PALETTE.primary}
                        style={styles.reasonIcon}
                      />
                      <Text style={styles.reasonText}>{reason}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>프로그램 소개</Text>
                <Text style={styles.sectionBody}>{program.description}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>상세 정보</Text>

                <View style={styles.infoTable}>
                  {[
                    {
                      label: '운영 기간',
                      value: `${program.startDate} ~ ${program.endDate}`,
                    },
                    { label: '운영 시간', value: program.schedule },
                    { label: '대상 연령', value: program.ageRange },
                    { label: '수업 인원', value: `최대 ${program.capacity}명` },
                    { label: '위치', value: program.address },
                  ].map((item, index, arr) => (
                    <View
                      key={item.label}
                      style={[
                        styles.infoRow,
                        index < arr.length - 1 && styles.infoRowBorder,
                      ]}
                    >
                      <Text style={styles.infoLabel}>{item.label}</Text>
                      <Text style={styles.infoValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>커리큘럼</Text>

                <View style={styles.curriculumList}>
                  {program.curriculum.map((item, index) => (
                    <View key={`${item}-${index}`} style={styles.curriculumItem}>
                      <View style={styles.curriculumCheck}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                      <Text style={styles.curriculumText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>AI 후기 키워드 분석</Text>

                <View style={styles.chipRow}>
                  {reviewChips.map(chip => (
                    <View key={chip} style={styles.keywordChip}>
                      <Text style={styles.keywordChipText}>{chip}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>위치</Text>

                <View style={styles.mapBox}>
                  <Ionicons name="location" size={34} color="#CBD5E1" />
                  <Text style={styles.mapText}>지도 준비중</Text>
                </View>

                <Text style={styles.addressText}>{program.address}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>문의</Text>

                <View style={styles.contactCard}>
                  <TouchableOpacity
                    style={styles.contactRow}
                    onPress={handleCall}
                    activeOpacity={0.75}
                  >
                    <View style={styles.contactLeft}>
                      <Ionicons name="call-outline" size={16} color={PALETTE.muted} />
                      <Text style={styles.contactText}>{program.contact}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                  </TouchableOpacity>

                  {program.website && (
                    <TouchableOpacity
                      style={[styles.contactRow, styles.contactRowBorder]}
                      onPress={handleOpenWebsite}
                      activeOpacity={0.75}
                    >
                      <View style={styles.contactLeft}>
                        <Ionicons
                          name="globe-outline"
                          size={16}
                          color={PALETTE.muted}
                        />
                        <Text style={styles.contactText}>홈페이지 방문</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>태그</Text>

                <View style={styles.tagSection}>
                  {program.tags.map(tag => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.tabContent}>
              <View style={styles.reviewSummaryCard}>
                <View style={styles.reviewScoreBox}>
                  <Text style={styles.reviewScore}>{program.rating}</Text>
                  <StarRating rating={program.rating} size={13} />
                  <Text style={styles.reviewTotalText}>
                    {program.reviewCount}개 후기
                  </Text>
                </View>

                <View style={styles.ratingBars}>
                  {[5, 4, 3, 2, 1].map(score => (
                    <View key={score} style={styles.ratingBarRow}>
                      <Text style={styles.ratingBarLabel}>{score}</Text>
                      <View style={styles.ratingBarTrack}>
                        <View
                          style={[
                            styles.ratingBarFill,
                            {
                              width:
                                score === 5
                                  ? '82%'
                                  : score === 4
                                    ? '14%'
                                    : score === 3
                                      ? '4%'
                                      : '2%',
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>AI 후기 키워드 분석</Text>

                <View style={styles.chipRow}>
                  {reviewChips.map(chip => (
                    <View key={chip} style={styles.keywordChip}>
                      <Text style={styles.keywordChipText}>{chip}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.reviewList}>
                {reviewLoading ? (
                  <Text style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                    불러오는 중...
                  </Text>
                ) : reviews.length === 0 ? (
                  <Text style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                    아직 후기가 없습니다.
                  </Text>
                ) : (
                  reviews.map(review => (
                    <View key={review.reviewId} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewerLeft}>
                          <View style={styles.reviewerAvatar}>
                            <Text style={styles.reviewerAvatarText}>부</Text>
                          </View>
                          <View>
                            <Text style={styles.reviewName}>익명 부모님</Text>
                            <Text style={styles.reviewAge}>보호자</Text>
                          </View>
                        </View>
                        <View style={styles.reviewRatingBox}>
                          <StarRating rating={review.rating} size={11} />
                          <Text style={styles.reviewDate}>
                            {review.createdAt.slice(0, 10).replace(/-/g, '.')}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.reviewText}>{review.content}</Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.ctaWrap}>
        <View style={styles.ctaSummaryRow}>
          <View style={styles.ctaPriceBlock}>
            <Text style={styles.ctaLabel}>월 수강료</Text>
            <Text style={styles.ctaPrice}>{program.price}</Text>
          </View>

          {program.isOpen && (
            <View style={styles.ctaSeatBadge}>
              <View style={styles.ctaSeatDot} />
              <Text style={styles.ctaSeatText}>잔여 {spotsLeft}석</Text>
            </View>
          )}
        </View>

        <View style={styles.ctaButtonRow}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={onGoHome}
            activeOpacity={0.78}
          >
            <Ionicons name="home-outline" size={20} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.applyButton,
              !program.isOpen && styles.applyButtonDisabled,
            ]}
            onPress={() => program.isOpen && onApply(program)}
            disabled={!program.isOpen}
            activeOpacity={0.85}
          >
            <Text style={styles.applyButtonText}>
              {program.isOpen
                ? program.isPartner
                  ? '신청하기'
                  : '신청 페이지로 이동'
                : '모집 마감'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
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

  scrollView: {
    flex: 1,
    backgroundColor: PALETTE.bg,
  },

  scrollContent: {
    paddingBottom: 168,
  },

  summarySection: {
    backgroundColor: PALETTE.bg,
  },

  heroCard: {
    height: 148,
    backgroundColor: '#F7F9FD',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  heroIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  heroEmoji: {
    fontSize: 40,
  },

  heroGlowOne: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(99,119,242,0.08)',
    right: 30,
    top: 24,
  },

  heroGlowTwo: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(242,207,82,0.08)',
    left: 34,
    bottom: -10,
  },

  summaryContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F8FA',
  },

  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 12,
  },

  pill: {
    height: 25,
    paddingHorizontal: 10,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pillDefault: {
    backgroundColor: '#FAFBFC',
    borderColor: '#E8EDF3',
  },

  pillYellow: {
    backgroundColor: '#FFF9E5',
    borderColor: '#F7E5A1',
  },

  pillPrimary: {
    backgroundColor: PALETTE.primarySoft,
    borderColor: PALETTE.primaryBorder,
  },

  pillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: -0.1,
  },

  pillTextDefault: {
    color: '#667085',
  },

  pillTextYellow: {
    color: PALETTE.yellowDark,
  },

  pillTextPrimary: {
    color: PALETTE.primaryDark,
  },

  organization: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.muted,
    marginBottom: 5,
  },

  title: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.6,
  },

  ratingLine: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  ratingValue: {
    fontSize: 13,
    fontWeight: '900',
    color: PALETTE.text,
  },

  ratingMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: PALETTE.muted,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },

  quickCard: {
    width: '48.5%',
    minHeight: 74,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },

  quickLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  quickLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  quickValue: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.2,
  },

  capacityCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginBottom: 20,
  },

  capacityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  capacityTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: PALETTE.text,
  },

  capacityRemainBadge: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: PALETTE.coralSoft,
    borderWidth: 1,
    borderColor: PALETTE.coralBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  capacityRemainDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PALETTE.coral,
  },

  capacityRemainText: {
    fontSize: 12,
    fontWeight: '900',
    color: PALETTE.coralDark,
    letterSpacing: -0.15,
  },

  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E9EEF5',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
  },

  capacityMetaRow: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  capacityMeta: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A8B9B',
  },

  tabBar: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.softBorder,
    flexDirection: 'row',
    marginBottom: 0,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  tabButtonActive: {
    borderBottomColor: PALETTE.primary,
  },

  tabText: {
    fontSize: 14,
    fontWeight: '800',
    color: PALETTE.muted,
    letterSpacing: -0.2,
  },

  tabTextActive: {
    color: PALETTE.primaryDark,
  },

  tabContent: {
    paddingTop: 24,
    gap: 28,
  },

  aiReasonCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 14,
  },

  aiReasonTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.2,
  },

  reasonList: {
    gap: 12,
  },

  reasonItem: {
    flexDirection: 'row',
    gap: 8,
  },

  reasonIcon: {
    marginTop: 3,
  },

  reasonText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 22,
    fontWeight: '600',
    color: PALETTE.subText,
    letterSpacing: -0.15,
  },

  section: {
    gap: 14,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.3,
  },

  sectionBody: {
    fontSize: 13,
    lineHeight: 23,
    fontWeight: '600',
    color: PALETTE.subText,
    letterSpacing: -0.2,
  },

  infoTable: {
    borderRadius: 17,
    borderWidth: 1,
    borderColor: PALETTE.border,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },

  infoRow: {
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.softBorder,
  },

  infoLabel: {
    width: 76,
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    lineHeight: 18,
  },

  curriculumList: {
    gap: 12,
  },

  curriculumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  curriculumCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: PALETTE.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  curriculumText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.subText,
    lineHeight: 20,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  keywordChip: {
    minHeight: 28,
    paddingHorizontal: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.primaryBorder,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  keywordChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: PALETTE.primaryDark,
  },

  mapBox: {
    height: 136,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: PALETTE.softBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mapText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.muted,
  },

  addressText: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.subText,
  },

  contactCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },

  contactRow: {
    minHeight: 50,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  contactRowBorder: {
    borderTopWidth: 1,
    borderTopColor: PALETTE.softBorder,
  },

  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  contactText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },

  tagSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 4,
  },

  tagChip: {
    minHeight: 28,
    paddingHorizontal: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: PALETTE.softBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tagText: {
    fontSize: 11,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  reviewSummaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    gap: 18,
  },

  reviewScoreBox: {
    width: 86,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reviewScore: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -1,
  },

  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  star: {
    includeFontPadding: false,
  },

  reviewTotalText: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: '700',
    color: PALETTE.muted,
  },

  ratingBars: {
    flex: 1,
    justifyContent: 'center',
    gap: 7,
  },

  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  ratingBarLabel: {
    width: 10,
    fontSize: 11,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  ratingBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },

  ratingBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: PALETTE.primary,
  },

  reviewList: {
    gap: 14,
  },

  reviewCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: PALETTE.bg,
    padding: 15,
  },

  reviewHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },

  reviewerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  reviewerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF7DB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  reviewerAvatarText: {
    fontSize: 12,
    fontWeight: '900',
    color: PALETTE.yellowDark,
  },

  reviewName: {
    fontSize: 13,
    fontWeight: '900',
    color: PALETTE.text,
  },

  reviewAge: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
    color: PALETTE.muted,
  },

  reviewRatingBox: {
    alignItems: 'flex-end',
    gap: 4,
  },

  reviewDate: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B6C2D0',
  },

  reviewText: {
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '600',
    color: PALETTE.subText,
    letterSpacing: -0.15,
  },

  ctaWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: PALETTE.softBorder,
    backgroundColor: PALETTE.bg,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },

  ctaSummaryRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  ctaPriceBlock: {
    justifyContent: 'center',
  },

  ctaLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: PALETTE.muted,
  },

  ctaPrice: {
    marginTop: 2,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    color: PALETTE.text,
    letterSpacing: -0.7,
  },

  ctaSeatBadge: {
    minHeight: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: PALETTE.coralSoft,
    borderWidth: 1,
    borderColor: PALETTE.coralBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  ctaSeatDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PALETTE.coral,
  },

  ctaSeatText: {
    fontSize: 12,
    fontWeight: '900',
    color: PALETTE.coralDark,
    letterSpacing: -0.15,
  },

  ctaButtonRow: {
    flexDirection: 'row',
    gap: 10,
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

  applyButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: PALETTE.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  applyButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },

  applyButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.25,
  },
});