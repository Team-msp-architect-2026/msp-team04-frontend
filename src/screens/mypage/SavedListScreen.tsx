import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';
import { mypageApi, BookmarkItem } from '../../api/mypage';

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

const formatPrice = (isFree: boolean, price: number): string => {
  if (isFree) return '무료';
  return price > 0 ? `월 ${price.toLocaleString()}원` : '무료';
};

export default function SavedListScreen({
  onBack,
  onApplyPress,
}: SavedListScreenProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mypageApi.getBookmarkList();
      setBookmarks(data);
    } catch (e) {
      console.error('북마크 목록 조회 실패', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleRemove = async (programId: number) => {
    try {
      await mypageApi.toggleBookmark(programId);
      setBookmarks((prev) => prev.filter((b) => b.programId !== programId));
    } catch (e) {
      console.error('북마크 해제 실패', e);
    }
  };

  const handleApplyPress = (item: BookmarkItem) => {
    if (!onApplyPress) return;
    const mapped: SavedProgram = {
      id: item.programId,
      title: item.title,
      organization: '',
      location: item.region ?? '',
      price: formatPrice(item.isFree, item.price),
      rating: Number(item.ratingAvg),
      isOpen: item.isRecruiting,
      emoji: '🎨',
      imageUrl: item.imageUrl ?? undefined,
    };
    onApplyPress(mapped);
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

      {loading ? (
        <View style={s.loadingBox}>
          <ActivityIndicator color="#8A6400" />
        </View>
      ) : (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {bookmarks.length > 0 ? (
            <View style={s.list}>
              {bookmarks.map((item) => (
                <View key={item.programId} style={s.card}>
                  <View style={s.cardMain}>
                    <View
                      style={[
                        s.thumbnailBox,
                        { backgroundColor: item.isRecruiting ? '#FFF8D8' : '#EEF0F3' },
                      ]}
                    >
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={s.thumbnailImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons name="image-outline" size={28} color="#C7CDD6" />
                      )}
                      {!item.isRecruiting && (
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
                            { backgroundColor: item.isRecruiting ? '#2E9B5B' : '#9AA1AC' },
                          ]}
                        />
                        <Text
                          style={[
                            s.statusText,
                            { color: item.isRecruiting ? '#2E9B5B' : '#8B929E' },
                          ]}
                        >
                          {item.isRecruiting ? '신청 가능' : '모집 마감'}
                        </Text>
                      </View>

                      <Text style={s.cardTitle} numberOfLines={1}>
                        {item.title}
                      </Text>

                      <View style={s.cardMeta}>
                        {item.region ? (
                          <View style={s.metaItem}>
                            <Ionicons name="location-outline" size={13} color="#9AA1AC" />
                            <Text style={s.metaText} numberOfLines={1}>
                              {item.region}
                            </Text>
                          </View>
                        ) : null}
                        <View style={s.metaItem}>
                          <Ionicons name="wallet-outline" size={13} color="#9AA1AC" />
                          <Text style={s.metaText} numberOfLines={1}>
                            {formatPrice(item.isFree, item.price)}
                          </Text>
                        </View>
                      </View>

                      <View style={s.ratingRow}>
                        <Ionicons name="star" size={12} color="#F2C94C" />
                        <Text style={s.ratingText}>{Number(item.ratingAvg).toFixed(1)}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={s.likeButton}
                      onPress={() => handleRemove(item.programId)}
                      activeOpacity={0.72}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="heart" size={20} color="#EF6F73" />
                    </TouchableOpacity>
                  </View>

                  <View style={s.cardFooter}>
                    <TouchableOpacity
                      style={[s.applyButton, !item.isRecruiting && s.applyButtonDisabled]}
                      onPress={() => handleApplyPress(item)}
                      disabled={!item.isRecruiting}
                      activeOpacity={0.78}
                    >
                      <Text
                        style={[
                          s.applyButtonText,
                          !item.isRecruiting && s.applyButtonTextDisabled,
                        ]}
                      >
                        {item.isRecruiting ? '신청하기' : '모집 마감'}
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
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F6F8' },
  safeArea: { backgroundColor: '#FFFFFF' },
  header: { height: 52, paddingHorizontal: 8, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F2F5', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerSide: { width: 64, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, lineHeight: 22, fontWeight: '800', color: '#17191D', letterSpacing: -0.35 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 32 },
  list: { gap: 14 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 22, borderWidth: 1, borderColor: '#EEF0F3', overflow: 'hidden', shadowColor: '#111827', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.035, shadowRadius: 14, elevation: 2 },
  cardMain: { minHeight: 126, flexDirection: 'row', alignItems: 'center', paddingLeft: 12, paddingRight: 2, paddingVertical: 12 },
  thumbnailBox: { width: 98, height: 98, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  thumbnailImage: { width: '100%', height: '100%' },
  closedOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(17, 24, 39, 0.52)', alignItems: 'center', justifyContent: 'center' },
  closedText: { fontSize: 13, lineHeight: 17, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.1 },
  cardContent: { flex: 1, minHeight: 102, paddingLeft: 16, paddingRight: 8, justifyContent: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, lineHeight: 14, fontWeight: '800', letterSpacing: -0.1 },
  cardTitle: { fontSize: 16, lineHeight: 21, fontWeight: '800', color: '#181A1F', letterSpacing: -0.3 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: 108 },
  metaText: { fontSize: 11, lineHeight: 14, fontWeight: '600', color: '#8B929E', letterSpacing: -0.1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  ratingText: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: '#5F6672', letterSpacing: -0.1 },
  likeButton: { width: 40, minHeight: 102, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 22 },
  cardFooter: { paddingHorizontal: 12, paddingTop: 11, paddingBottom: 12, borderTopWidth: 1, borderTopColor: '#F0F1F3' },
  applyButton: { height: 42, borderRadius: 15, backgroundColor: colors.primary.default, alignItems: 'center', justifyContent: 'center' },
  applyButtonDisabled: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  applyButtonText: { fontSize: 14, lineHeight: 18, fontWeight: '900', color: '#2A250A', letterSpacing: -0.2 },
  applyButtonTextDisabled: { color: '#A1A8B3' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 110, paddingHorizontal: 30 },
  emptyIconBox: { width: 62, height: 62, borderRadius: 24, backgroundColor: '#EEF0F3', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  emptyTitle: { fontSize: 15, lineHeight: 20, fontWeight: '800', color: '#6B7280', letterSpacing: -0.15 },
  emptySub: { marginTop: 6, fontSize: 12, lineHeight: 18, fontWeight: '500', color: '#9AA1AC', textAlign: 'center', letterSpacing: -0.1 },
});
