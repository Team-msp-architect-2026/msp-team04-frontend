import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { mypageApi, ApplicationListItem, ApplicationStatus } from '../../api/mypage';

interface MyApplicationsScreenProps {
  onBack: () => void;
  onApplicationPress?: (application: Application) => void;
}

export interface Application {
  id: number;
  title: string;
  organization: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: string;
  location: string;
  price: string;
  imageUrl: string;
}

type FilterStatus = 'ALL' | ApplicationStatus;

const FILTER_TABS: { key: FilterStatus; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'CONFIRMED', label: '신청완료' },
  { key: 'PENDING', label: '승인대기' },
  { key: 'CANCELLED', label: '취소' },
];

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: '승인대기',
  PAYMENT_READY: '결제대기',
  CONFIRMED: '신청완료',
  CANCELLED: '취소됨',
  FAILED: '실패',
};

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  PENDING: '#D89B00',
  PAYMENT_READY: '#3E6DCC',
  CONFIRMED: '#2E9B5B',
  CANCELLED: '#8B929E',
  FAILED: '#E45B5B',
};

const HIDDEN_STATUSES: ApplicationStatus[] = ['PAYMENT_READY', 'FAILED'];

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
};

export default function MyApplicationsScreen({
  onBack,
  onApplicationPress,
}: MyApplicationsScreenProps) {
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');

  const fetchApplications = useCallback(async (status: FilterStatus) => {
    setLoading(true);
    try {
      const data = await mypageApi.getApplicationList(
        status === 'ALL' ? undefined : status,
      );
      setApplications(data.filter(item => !HIDDEN_STATUSES.includes(item.applicationStatus)));
    } catch (e) {
      console.error('신청 내역 조회 실패', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications(filterStatus);
  }, [filterStatus, fetchApplications]);

  const handleApplicationPress = (item: ApplicationListItem) => {
    if (!onApplicationPress) return;
    const mapped: Application = {
      id: item.applicationId,
      title: item.programTitle,
      organization: item.institutionName ?? '',
      status: mapStatus(item.applicationStatus),
      date: formatDate(item.appliedAt),
      location: item.region ?? '',
      price: '',
      imageUrl: item.imageUrl ?? '',
    };
    onApplicationPress(mapped);
  };

  const mapStatus = (status: ApplicationStatus): Application['status'] => {
    switch (status) {
      case 'CONFIRMED': return 'confirmed';
      case 'CANCELLED': return 'cancelled';
      case 'FAILED': return 'cancelled';
      default: return 'pending';
    }
  };

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
          <Text style={s.headerTitle}>신청 내역</Text>
          <View style={s.headerSide} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.filterScroll}
          contentContainerStyle={s.filterContent}
        >
          {FILTER_TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[s.filterChip, filterStatus === tab.key && s.filterChipActive]}
              onPress={() => setFilterStatus(tab.key)}
              activeOpacity={0.75}
            >
              <Text style={[s.filterChipText, filterStatus === tab.key && s.filterChipTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
          {applications.length > 0 ? (
            applications.map((item) => (
              <TouchableOpacity
                key={item.applicationId}
                style={s.card}
                activeOpacity={0.74}
                onPress={() => handleApplicationPress(item)}
              >
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={s.thumbnail} />
                ) : (
                  <View style={[s.thumbnail, s.thumbnailFallback]}>
                    <Ionicons name="image-outline" size={24} color="#C7CDD6" />
                  </View>
                )}

                <View style={s.cardContent}>
                  <View style={s.statusRow}>
                    <View
                      style={[
                        s.statusDot,
                        { backgroundColor: STATUS_COLORS[item.applicationStatus] },
                      ]}
                    />
                    <Text
                      style={[
                        s.statusText,
                        { color: STATUS_COLORS[item.applicationStatus] },
                      ]}
                    >
                      {STATUS_LABELS[item.applicationStatus]}
                    </Text>
                  </View>

                  <Text style={s.cardTitle} numberOfLines={1}>
                    {item.programTitle}
                  </Text>

                  <Text style={s.cardOrg} numberOfLines={1}>
                    {item.institutionName ?? '-'}
                  </Text>

                  <View style={s.cardMeta}>
                    <View style={s.metaItem}>
                      <Ionicons name="calendar-outline" size={13} color="#9AA1AC" />
                      <Text style={s.metaText}>{formatDate(item.appliedAt)}</Text>
                    </View>
                    {item.region ? (
                      <View style={s.metaItem}>
                        <Ionicons name="location-outline" size={13} color="#9AA1AC" />
                        <Text style={s.metaText}>{item.region}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                <View style={s.chevron}>
                  <Ionicons name="chevron-forward" size={18} color="#C7CDD6" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={s.empty}>
              <View style={s.emptyIconBox}>
                <Ionicons name="calendar-outline" size={30} color="#AEB4BE" />
              </View>
              <Text style={s.emptyText}>신청 내역이 없습니다</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },
  safeArea: { backgroundColor: '#FFFFFF' },
  header: { height: 52, paddingHorizontal: 8, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F2F5', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerSide: { width: 64, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, lineHeight: 22, fontWeight: '800', color: '#17191D', letterSpacing: -0.35 },
  filterScroll: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: { height: 32, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E8EDF3', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  filterChipActive: { borderColor: '#F3E3A3', backgroundColor: '#FFF9E8' },
  filterChipText: { fontSize: 12, fontWeight: '800', color: '#64748B' },
  filterChipTextActive: { color: '#8A6400' },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 30, gap: 14 },
  card: { minHeight: 120, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#EEF0F3', shadowColor: '#111827', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.035, shadowRadius: 14, elevation: 2 },
  thumbnail: { width: 112, height: 120, backgroundColor: '#E5E7EB' },
  thumbnailFallback: { alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1, minHeight: 120, paddingLeft: 18, paddingRight: 10, paddingVertical: 15, justifyContent: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, lineHeight: 14, fontWeight: '800', letterSpacing: -0.1 },
  cardTitle: { fontSize: 16, lineHeight: 21, fontWeight: '800', color: '#181A1F', letterSpacing: -0.3 },
  cardOrg: { marginTop: 3, fontSize: 12, lineHeight: 16, fontWeight: '600', color: '#8B929E', letterSpacing: -0.1 },
  cardMeta: { flexDirection: 'row', gap: 12, marginTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, lineHeight: 14, fontWeight: '600', color: '#8B929E', letterSpacing: -0.1 },
  chevron: { width: 34, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 96 },
  emptyIconBox: { width: 58, height: 58, borderRadius: 22, backgroundColor: '#EEF0F3', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyText: { fontSize: 14, lineHeight: 19, fontWeight: '700', color: '#9AA1AC' },
});
