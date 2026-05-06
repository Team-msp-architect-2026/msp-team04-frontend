import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants';

interface MyPageScreenProps {
  userName: string;
  hasChildInfo: boolean;
  childName?: string;
  childAge?: number;
  childConcerns?: string[];
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onRegisterChild: () => void;
  onEditProfile: (name: string) => void;
  onNavigate: (screen: string) => void;
}

const CONCERN_EMOJIS: Record<string, string> = {
  '학습': '📚',
  '친구 관계': '👫',
  '성격': '💝',
  '진로': '🎯',
  '기타': '✨',
};

const MENU_ITEMS = [
  { id: 'applications', icon: 'document-text', label: '신청 내역', badge: '2' },
  { id: 'saved', icon: 'heart', label: '저장 목록', badge: '5' },
  { id: 'community', icon: 'chatbubbles', label: '커뮤니티 활동', badge: null },
];

const SETTINGS_ITEMS = [
  { id: 'notifications', icon: 'notifications', label: '알림 설정' },
  { id: 'settings', icon: 'settings', label: '설정' },
  { id: 'help', icon: 'help-circle', label: '고객센터' },
];

export default function MyPageScreen({
  userName,
  hasChildInfo,
  childName,
  childAge,
  childConcerns,
  onTabChange,
  onLogout,
  onRegisterChild,
  onEditProfile,
  onNavigate,
}: MyPageScreenProps) {
  return (
    <SafeAreaView style={s.root}>
      {/* 헤더 */}
      <View style={s.header}>
        <Text style={s.logo}>MoMent</Text>
        <TouchableOpacity style={s.iconBtn} onPress={() => onNavigate('settings')}>
          <Ionicons name="settings" size={22} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* 프로필 카드 */}
        <View style={s.profileSection}>
          <View style={s.profileRow}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{userName.charAt(0)}</Text>
            </View>
            <View style={s.profileInfo}>
              <Text style={s.profileName}>{userName}</Text>
              <Text style={s.profileSub}>카카오 로그인</Text>
            </View>
            <TouchableOpacity style={s.editBtn} onPress={() => onEditProfile(userName)}>
              <Ionicons name="pencil" size={12} color="#888" />
              <Text style={s.editBtnText}>수정</Text>
            </TouchableOpacity>
          </View>

          {/* 아이 정보 요약 */}
          <View style={s.childSummary}>
            <View style={s.childSummaryTop}>
              <View style={{ flex: 1 }}>
                <Text style={s.childSummaryLabel}>등록된 아이 정보</Text>
                {hasChildInfo && childName ? (
                  <>
                    <Text style={s.childSummaryName}>{childName} · {childAge}세</Text>
                    {childConcerns && childConcerns.length > 0 && (
                      <View style={s.concernRow}>
                        {childConcerns.map(concern => (
                          <View key={concern} style={s.concernChip}>
                            <Text style={s.concernChipText}>
                              {CONCERN_EMOJIS[concern] || '✨'} {concern}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <Text style={s.childSummaryEmpty}>아직 등록된 정보가 없어요</Text>
                )}
              </View>
              <TouchableOpacity style={s.registerBtn} onPress={onRegisterChild}>
                <Text style={s.registerBtnText}>{hasChildInfo ? '수정하기' : '등록하기'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 메뉴 */}
        <View style={s.menuSection}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[s.menuItem, idx !== MENU_ITEMS.length - 1 && s.menuItemBorder]}
              onPress={() => onNavigate(item.id)}
            >
              <View style={s.menuLeft}>
                <Ionicons name={item.icon as any} size={20} color="#888" />
                <Text style={s.menuLabel}>{item.label}</Text>
                {item.badge && (
                  <View style={s.badge}>
                    <Text style={s.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* 설정 */}
        <View style={s.menuSection}>
          {SETTINGS_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[s.menuItem, idx !== SETTINGS_ITEMS.length - 1 && s.menuItemBorder]}
              onPress={() => onNavigate(item.id)}
            >
              <View style={s.menuLeft}>
                <Ionicons name={item.icon as any} size={20} color="#888" />
                <Text style={s.menuLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* 로그아웃 */}
        <View style={s.menuSection}>
          <TouchableOpacity style={s.menuItem} onPress={onLogout}>
            <View style={s.menuLeft}>
              <Ionicons name="log-out" size={20} color="#888" />
              <Text style={s.menuLabel}>로그아웃</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 앱 정보 */}
        <View style={s.appInfo}>
          <Text style={s.appInfoText}>MoMent v1.0.0</Text>
          <Text style={s.appInfoText}>자녀 맞춤 교육 돌봄 통합 플랫폼</Text>
        </View>
      </ScrollView>

      {/* 하단 탭 */}
      <View style={s.bottomTab}>
        {[
          { key: 'home', icon: 'home', label: '홈' },
          { key: 'recommend', icon: 'sparkles', label: '추천' },
          { key: 'apply', icon: 'document-text', label: '신청' },
          { key: 'community', icon: 'chatbubbles', label: '커뮤니티' },
          { key: 'my', icon: 'person', label: '마이' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={s.tabItem}
            onPress={() => onTabChange(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={22}
              color={tab.key === 'my' ? colors.primary.default : '#aaa'}
            />
            <Text style={[s.tabLabel, tab.key === 'my' && s.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  logo: { fontSize: 20, fontWeight: '700', color: colors.primary.default },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },

  scroll: { paddingBottom: 20 },

  profileSection: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary.default, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  profileSub: { fontSize: 13, color: '#888', marginTop: 2 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  editBtnText: { fontSize: 12, color: '#888' },

  childSummary: { marginTop: 12, backgroundColor: '#FFF9E6', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FFE08A' },
  childSummaryTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  childSummaryLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  childSummaryName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  childSummaryEmpty: { fontSize: 13, fontWeight: '500', color: '#1A1A1A', marginTop: 2 },
  concernRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  concernChip: { backgroundColor: '#FFF3CD', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  concernChipText: { fontSize: 11, fontWeight: '600', color: colors.primary.default },
  registerBtn: { backgroundColor: colors.primary.default, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  registerBtnText: { fontSize: 12, fontWeight: '600', color: '#1A1A1A' },

  menuSection: { backgroundColor: '#fff', marginTop: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F0F0F0' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { fontSize: 14, fontWeight: '500', color: '#1A1A1A' },
  badge: { backgroundColor: colors.primary.default, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#1A1A1A' },

  appInfo: { padding: 24, alignItems: 'center', gap: 4 },
  appInfoText: { fontSize: 12, color: '#aaa' },

  bottomTab: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 6, gap: 2 },
  tabLabel: { fontSize: 10, color: '#aaa' },
  tabLabelActive: { color: colors.primary.default, fontWeight: '600' },
});
