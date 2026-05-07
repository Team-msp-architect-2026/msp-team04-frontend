import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onBack: () => void;
}

type SettingKey = 'all' | 'application' | 'deadline' | 'recommendation' | 'community' | 'marketing';

const SETTING_ITEMS: { key: Exclude<SettingKey, 'all'>; icon: string; label: string; description: string }[] = [
  { key: 'application',    icon: 'calendar-outline',      label: '신청 알림',    description: '신청 승인, 결제 완료 등' },
  { key: 'deadline',       icon: 'notifications-outline', label: '마감 알림',    description: '관심 프로그램 마감 임박' },
  { key: 'recommendation', icon: 'sparkles-outline',      label: '추천 알림',    description: '맞춤 프로그램 추천' },
  { key: 'community',      icon: 'chatbubble-outline',    label: '커뮤니티 알림', description: '댓글, 좋아요 알림' },
  { key: 'marketing',      icon: 'megaphone-outline',     label: '마케팅 알림',  description: '이벤트, 혜택 정보' },
];

export default function NotificationSettingsScreen({ onBack }: Props) {
  const [settings, setSettings] = useState({
    all: true,
    application: true,
    deadline: true,
    recommendation: true,
    community: false,
    marketing: false,
  });

  const handleToggle = (key: SettingKey) => {
    if (key === 'all') {
      const newValue = !settings.all;
      setSettings({
        all: newValue,
        application: newValue,
        deadline: newValue,
        recommendation: newValue,
        community: newValue,
        marketing: newValue,
      });
    } else {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  return (
    <SafeAreaView style={s.root}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>알림 설정</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* 전체 알림 토글 */}
        <View style={s.masterCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={s.masterIconWrap}>
              <Ionicons name="notifications" size={22} color="#F9A825" />
            </View>
            <View>
              <Text style={s.masterLabel}>전체 알림</Text>
              <Text style={s.masterDesc}>모든 알림을 한번에 관리</Text>
            </View>
          </View>
          <Switch
            value={settings.all}
            onValueChange={() => handleToggle('all')}
            trackColor={{ false: '#E2E8F0', true: '#F9A825' }}
            thumbColor="#fff"
          />
        </View>

        {/* 개별 설정 */}
        <View style={s.settingsCard}>
          {SETTING_ITEMS.map((item, idx) => (
            <View
              key={item.key}
              style={[s.settingRow, idx < SETTING_ITEMS.length - 1 && s.settingRowBorder]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name={item.icon as any} size={20} color="#718096" />
                <View>
                  <Text style={s.settingLabel}>{item.label}</Text>
                  <Text style={s.settingDesc}>{item.description}</Text>
                </View>
              </View>
              <Switch
                value={settings[item.key]}
                onValueChange={() => handleToggle(item.key)}
                trackColor={{ false: '#E2E8F0', true: '#F9A825' }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        <Text style={s.footer}>알림 설정은 언제든지 변경할 수 있습니다</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F8FA' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },

  scroll: { padding: 16, gap: 12 },

  masterCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F0F0F0' },
  masterIconWrap: { width: 40, height: 40, borderRadius: 999, backgroundColor: '#FFF3CD', alignItems: 'center', justifyContent: 'center' },
  masterLabel: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  masterDesc: { fontSize: 12, color: '#888', marginTop: 2 },

  settingsCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F7F8FA' },
  settingLabel: { fontSize: 14, fontWeight: '500', color: '#1A1A1A' },
  settingDesc: { fontSize: 12, color: '#888', marginTop: 2 },

  footer: { fontSize: 12, color: '#A0AEC0', textAlign: 'center', marginTop: 8 },
});