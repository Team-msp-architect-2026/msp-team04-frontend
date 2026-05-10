import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';

export interface SavedProgram {
  id: number;
  title: string;
  organization: string;
  location: string;
  price: string;
  rating: number;
  isOpen: boolean;
  emoji: string;
  imageUrl?: string;
}

interface SavedListScreenProps {
  onBack: () => void;
  onApplyPress?: (program: SavedProgram) => void;
}

const MOCK_SAVED_PROGRAMS: SavedProgram[] = [
  {
    id: 1,
    title: '구립 어린이 창의교실',
    organization: '서울시 교육청',
    location: '서울 강남구 역삼동',
    price: '무료',
    rating: 4.8,
    isOpen: true,
    emoji: '🎨',
  },
  {
    id: 2,
    title: '키즈 영어 스피킹 클래스',
    organization: '스마트 에듀',
    location: '서울 강남구 삼성동',
    price: '월 15만원',
    rating: 4.6,
    isOpen: true,
    emoji: '🗣️',
  },
  {
    id: 3,
    title: '초등 코딩 부트캠프',
    organization: '코드키즈',
    location: '온라인',
    price: '월 8만원',
    rating: 4.5,
    isOpen: false,
    emoji: '💻',
  },
  {
    id: 4,
    title: '아이돌봄 서비스',
    organization: '여성가족부',
    location: '가정 방문',
    price: '시간당 1,150원~',
    rating: 4.7,
    isOpen: true,
    emoji: '🏠',
  },
  {
    id: 5,
    title: '유아 발레 클래스',
    organization: '아트발레',
    location: '서울 서초구',
    price: '월 12만원',
    rating: 4.4,
    isOpen: true,
    emoji: '🩰',
  },
];

export default function SavedListScreen({
  onBack,
  onApplyPress,
}: SavedListScreenProps) {
  const [savedPrograms, setSavedPrograms] = useState(MOCK_SAVED_PROGRAMS);

  const handleRemove = (id: number) => {
    setSavedPrograms((prev) => prev.filter((program) => program.id !== id));
  };

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

          <Text style={s.headerTitle}>저장 목록</Text>

          <View style={s.headerSide} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {savedPrograms.length > 0 ? (
          <View style={s.list}>
            {savedPrograms.map((program) => (
              <View key={program.id} style={s.card}>
                <View style={s.cardMain}>
                  <View
                    style={[
                      s.thumbnailBox,
                      {
                        backgroundColor: program.isOpen
                          ? '#FFF8D8'
                          : '#EEF0F3',
                      },
                    ]}
                  >
                    {program.imageUrl ? (
                      <Image
                        source={{ uri: program.imageUrl }}
                        style={s.thumbnailImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={s.emoji}>{program.emoji}</Text>
                    )}

                    {!program.isOpen && (
                      <View style={s.closedOverlay}>
                        <Text style={s.closedText}>마감</Text>
                      </View>
                    )}
                  </View>

                  <View style={s.cardContent}>
                    <View style={s.statusRow}>
                      <View
                        style={[
                          s.statusDot,
                          {
                            backgroundColor: program.isOpen
                              ? '#2E9B5B'
                              : '#9AA1AC',
                          },
                        ]}
                      />
                      <Text
                        style={[
                          s.statusText,
                          {
                            color: program.isOpen ? '#2E9B5B' : '#8B929E',
                          },
                        ]}
                      >
                        {program.isOpen ? '신청 가능' : '모집 마감'}
                      </Text>
                    </View>

                    <Text style={s.cardTitle} numberOfLines={1}>
                      {program.title}
                    </Text>

                    <Text style={s.cardOrg} numberOfLines={1}>
                      {program.organization}
                    </Text>

                    <View style={s.cardMeta}>
                      <View style={s.metaItem}>
                        <Ionicons
                          name="location-outline"
                          size={13}
                          color="#9AA1AC"
                        />
                        <Text style={s.metaText} numberOfLines={1}>
                          {program.location}
                        </Text>
                      </View>

                      <View style={s.metaItem}>
                        <Ionicons
                          name="wallet-outline"
                          size={13}
                          color="#9AA1AC"
                        />
                        <Text style={s.metaText} numberOfLines={1}>
                          {program.price}
                        </Text>
                      </View>
                    </View>

                    <View style={s.ratingRow}>
                      <Ionicons name="star" size={12} color="#F2C94C" />
                      <Text style={s.ratingText}>{program.rating}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={s.likeButton}
                    onPress={() => handleRemove(program.id)}
                    activeOpacity={0.72}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="heart" size={20} color="#EF6F73" />
                  </TouchableOpacity>
                </View>

                <View style={s.cardFooter}>
                  <TouchableOpacity
                    style={[
                      s.applyButton,
                      !program.isOpen && s.applyButtonDisabled,
                    ]}
                    onPress={() => onApplyPress?.(program)}
                    disabled={!program.isOpen}
                    activeOpacity={0.78}
                  >
                    <Text
                      style={[
                        s.applyButtonText,
                        !program.isOpen && s.applyButtonTextDisabled,
                      ]}
                    >
                      {program.isOpen ? '신청하기' : '모집 마감'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={s.empty}>
            <View style={s.emptyIconBox}>
              <Ionicons name="heart-outline" size={31} color="#AEB4BE" />
            </View>
            <Text style={s.emptyTitle}>저장한 프로그램이 없습니다</Text>
            <Text style={s.emptySub}>
              관심 있는 프로그램을 저장하면 여기에서 다시 볼 수 있어요.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F6F8',
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
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 32,
  },

  list: {
    gap: 14,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EEF0F3',
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.035,
    shadowRadius: 14,
    elevation: 2,
  },

  cardMain: {
    minHeight: 126,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 2,
    paddingVertical: 12,
  },

  thumbnailBox: {
    width: 98,
    height: 98,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  thumbnailImage: {
    width: '100%',
    height: '100%',
  },

  emoji: {
    fontSize: 35,
  },

  closedOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.52)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closedText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },

  cardContent: {
    flex: 1,
    minHeight: 102,
    paddingLeft: 16,
    paddingRight: 8,
    justifyContent: 'center',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  statusText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: -0.1,
  },

  cardTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: '#181A1F',
    letterSpacing: -0.3,
  },

  cardOrg: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#8B929E',
    letterSpacing: -0.1,
  },

  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 108,
  },

  metaText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#8B929E',
    letterSpacing: -0.1,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },

  ratingText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#5F6672',
    letterSpacing: -0.1,
  },

  likeButton: {
    width: 40,
    minHeight: 102,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 22,
  },

  cardFooter: {
    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
  },

  applyButton: {
    height: 42,
    borderRadius: 15,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
  },

  applyButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  applyButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
    color: '#2A250A',
    letterSpacing: -0.2,
  },

  applyButtonTextDisabled: {
    color: '#A1A8B3',
  },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 110,
    paddingHorizontal: 30,
  },

  emptyIconBox: {
    width: 62,
    height: 62,
    borderRadius: 24,
    backgroundColor: '#EEF0F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: -0.15,
  },

  emptySub: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: '#9AA1AC',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});