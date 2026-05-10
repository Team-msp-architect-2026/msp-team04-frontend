import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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

const STATUS_LABELS = {
  pending: '승인대기',
  confirmed: '신청완료',
  completed: '수강완료',
  cancelled: '취소됨',
};

const STATUS_COLORS = {
  pending: '#D89B00',
  confirmed: '#2E9B5B',
  completed: '#8B929E',
  cancelled: '#E45B5B',
};

const MOCK_APPLICATIONS: Application[] = [
  {
    id: 1,
    title: '구립 어린이 창의교실',
    organization: '서울시 교육청',
    status: 'confirmed',
    date: '2024.03.15',
    location: '서울 강남구 역삼동',
    price: '무료',
    imageUrl:
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    title: '초등 코딩 교실 (2기)',
    organization: '강남구청',
    status: 'pending',
    date: '2024.03.20',
    location: '서울 강남구 삼성동',
    price: '월 5만원',
    imageUrl:
      'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=300&fit=crop',
  },
];

export default function MyApplicationsScreen({
  onBack,
  onApplicationPress,
}: MyApplicationsScreenProps) {
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
      </SafeAreaView>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_APPLICATIONS.length > 0 ? (
          MOCK_APPLICATIONS.map((app) => (
            <TouchableOpacity
              key={app.id}
              style={s.card}
              activeOpacity={0.74}
              onPress={() => onApplicationPress?.(app)}
            >
              <Image source={{ uri: app.imageUrl }} style={s.thumbnail} />

              <View style={s.cardContent}>
                <View style={s.statusRow}>
                  <View
                    style={[
                      s.statusDot,
                      { backgroundColor: STATUS_COLORS[app.status] },
                    ]}
                  />
                  <Text
                    style={[
                      s.statusText,
                      { color: STATUS_COLORS[app.status] },
                    ]}
                  >
                    {STATUS_LABELS[app.status]}
                  </Text>
                </View>

                <Text style={s.cardTitle} numberOfLines={1}>
                  {app.title}
                </Text>

                <Text style={s.cardOrg} numberOfLines={1}>
                  {app.organization}
                </Text>

                <View style={s.cardMeta}>
                  <View style={s.metaItem}>
                    <Ionicons
                      name="calendar-outline"
                      size={13}
                      color="#9AA1AC"
                    />
                    <Text style={s.metaText}>{app.date}</Text>
                  </View>

                  <View style={s.metaItem}>
                    <Ionicons
                      name="location-outline"
                      size={13}
                      color="#9AA1AC"
                    />
                    <Text style={s.metaText}>
                      {app.location.split(' ').slice(-1)[0]}
                    </Text>
                  </View>
                </View>

                <Text style={s.priceText}>{app.price}</Text>
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
    </View>
  );
}

const s = StyleSheet.create({
  container: {
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
    paddingBottom: 30,
    gap: 14,
  },

  card: {
    minHeight: 120,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF0F3',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.035,
    shadowRadius: 14,
    elevation: 2,
  },

  thumbnail: {
    width: 112,
    height: 120,
    backgroundColor: '#E5E7EB',
  },

  cardContent: {
    flex: 1,
    minHeight: 120,
    paddingLeft: 18,
    paddingRight: 10,
    paddingVertical: 15,
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
    gap: 12,
    marginTop: 10,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  metaText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#8B929E',
    letterSpacing: -0.1,
  },

  priceText: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#5F6672',
    letterSpacing: -0.1,
  },

  chevron: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 96,
  },

  emptyIconBox: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: '#EEF0F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    color: '#9AA1AC',
  },
});