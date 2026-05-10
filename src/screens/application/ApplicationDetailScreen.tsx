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
import type { Application } from './MyApplicationsScreen';

interface ApplicationDetailScreenProps {
  application: Application;
  onBack: () => void;
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

export default function ApplicationDetailScreen({
  application,
  onBack,
}: ApplicationDetailScreenProps) {
  const statusColor = STATUS_COLORS[application.status];

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

          <Text style={s.headerTitle}>신청 상세</Text>

          <View style={s.headerSide} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.heroCard}>
          <Image source={{ uri: application.imageUrl }} style={s.heroImage} />

          <View style={s.heroContent}>
            <View style={s.statusRow}>
              <View style={[s.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[s.statusText, { color: statusColor }]}>
                {STATUS_LABELS[application.status]}
              </Text>
            </View>

            <Text style={s.title}>{application.title}</Text>
            <Text style={s.organization}>{application.organization}</Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>신청 정보</Text>

          <View style={s.infoGroup}>
            <InfoRow
              label="신청 번호"
              value={`MOMENT-${String(application.id).padStart(4, '0')}`}
            />
            <InfoRow label="신청일" value={application.date} />
            <InfoRow label="상태" value={STATUS_LABELS[application.status]} />
            <InfoRow label="결제 금액" value={application.price} isLast />
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>프로그램 정보</Text>

          <View style={s.infoGroup}>
            <InfoRow label="운영 기관" value={application.organization} />
            <InfoRow label="위치" value={application.location} isLast />
          </View>
        </View>

        <View style={s.noticeBox}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#8B929E"
          />
          <Text style={s.noticeText}>
            신청 취소 및 변경은 프로그램 운영 기관 정책에 따라 달라질 수 있어요.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

function InfoRow({ label, value, isLast = false }: InfoRowProps) {
  return (
    <View style={[s.infoRow, !isLast && s.infoDivider]}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
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
    paddingTop: 12,
    paddingBottom: 34,
  },

  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF0F3',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.035,
    shadowRadius: 14,
    elevation: 2,
  },

  heroImage: {
    width: '100%',
    height: 164,
    backgroundColor: '#E5E7EB',
  },

  heroContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  statusText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: -0.1,
  },

  title: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '900',
    color: '#17191D',
    letterSpacing: -0.4,
  },

  organization: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#8B929E',
    letterSpacing: -0.1,
  },

  section: {
    marginTop: 18,
  },

  sectionTitle: {
    paddingHorizontal: 2,
    marginBottom: 8,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: -0.2,
  },

  infoGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF0F3',
    overflow: 'hidden',
  },

  infoRow: {
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
  },

  infoLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: -0.15,
  },

  infoValue: {
    flex: 1,
    marginLeft: 16,
    textAlign: 'right',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: '#20242B',
    letterSpacing: -0.15,
  },

  noticeBox: {
    marginTop: 18,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#EEF2F7',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: '#7B8491',
    letterSpacing: -0.1,
  },
});