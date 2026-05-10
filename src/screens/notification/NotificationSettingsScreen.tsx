import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onBack: () => void;
}

type SettingKey =
  | 'all'
  | 'application'
  | 'deadline'
  | 'recommendation'
  | 'community'
  | 'marketing';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingItem {
  key: Exclude<SettingKey, 'all'>;
  icon: IconName;
  label: string;
  description: string;
  accentBg: string;
  accentColor: string;
}

const SETTING_ITEMS: SettingItem[] = [
  {
    key: 'application',
    icon: 'receipt-outline',
    label: '신청 알림',
    description: '신청 승인, 결제 완료 등',
    accentBg: '#FFF8D8',
    accentColor: '#8A6A00',
  },
  {
    key: 'deadline',
    icon: 'time-outline',
    label: '마감 알림',
    description: '관심 프로그램 마감 임박',
    accentBg: '#FFF1F2',
    accentColor: '#D94B58',
  },
  {
    key: 'recommendation',
    icon: 'sparkles-outline',
    label: '추천 알림',
    description: '맞춤 프로그램 추천',
    accentBg: '#EEF3FF',
    accentColor: '#4D5FD2',
  },
  {
    key: 'community',
    icon: 'chatbubble-ellipses-outline',
    label: '커뮤니티 알림',
    description: '댓글, 좋아요 알림',
    accentBg: '#F2FBF6',
    accentColor: '#228251',
  },
  {
    key: 'marketing',
    icon: 'megaphone-outline',
    label: '마케팅 알림',
    description: '이벤트, 혜택 정보',
    accentBg: '#F5F3FF',
    accentColor: '#5F52C8',
  },
];

function Toggle({
  value,
  onPress,
}: {
  value: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[s.toggleTrack, value && s.toggleTrackOn]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <View style={[s.toggleThumb, value && s.toggleThumbOn]} />
    </TouchableOpacity>
  );
}

export default function NotificationSettingsScreen({ onBack }: Props) {
  const [settings, setSettings] = useState<Record<SettingKey, boolean>>({
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

      return;
    }

    setSettings(prev => {
      const next = {
        ...prev,
        [key]: !prev[key],
      };

      const everyEnabled = SETTING_ITEMS.every(item => next[item.key]);

      return {
        ...next,
        all: everyEnabled,
      };
    });
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

          <Text style={s.headerTitle}>알림 설정</Text>

          <View style={s.headerSide} />
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View style={s.masterCard}>
          <View style={s.masterLeft}>
            <View style={s.masterIconWrap}>
              <Ionicons
                name="notifications-outline"
                size={19}
                color="#8A6A00"
              />
            </View>

            <View style={s.textBox}>
              <Text style={s.masterLabel}>전체 알림</Text>
              <Text style={s.masterDesc}>모든 알림을 한 번에 관리해요</Text>
            </View>
          </View>

          <Toggle value={settings.all} onPress={() => handleToggle('all')} />
        </View>

        <View style={s.settingsCard}>
          {SETTING_ITEMS.map((item, idx) => {
            const enabled = settings[item.key];

            return (
              <View
                key={item.key}
                style={[
                  s.settingRow,
                  idx < SETTING_ITEMS.length - 1 && s.settingRowBorder,
                ]}
              >
                <View style={s.settingLeft}>
                  <View
                    style={[
                      s.settingIconWrap,
                      { backgroundColor: item.accentBg },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={16}
                      color={item.accentColor}
                    />
                  </View>

                  <View style={s.textBox}>
                    <Text style={s.settingLabel}>{item.label}</Text>
                    <Text style={s.settingDesc}>{item.description}</Text>
                  </View>
                </View>

                <Toggle
                  value={enabled}
                  onPress={() => handleToggle(item.key)}
                />
              </View>
            );
          })}
        </View>

        <Text style={s.footer}>알림 설정은 언제든지 변경할 수 있습니다</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 12,
  },

  masterCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  masterLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 12,
  },

  masterIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#FFF8D8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  masterLabel: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.15,
  },

  masterDesc: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#8B929E',
    letterSpacing: -0.1,
  },

  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },

  settingRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
  },

  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 12,
  },

  settingIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textBox: {
    flex: 1,
  },

  settingLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.1,
  },

  settingDesc: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#8B929E',
    letterSpacing: -0.1,
  },

  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 3,
    backgroundColor: '#E5E8EE',
    justifyContent: 'center',
  },

  toggleTrackOn: {
    backgroundColor: '#17191D',
  },

  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#111827',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    transform: [{ translateX: 0 }],
  },

  toggleThumbOn: {
    transform: [{ translateX: 18 }],
  },

  footer: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: '#9AA1AC',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});