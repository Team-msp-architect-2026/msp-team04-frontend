import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomTabBar from '../../components/BottomTabBar';
import CommonHeader from '../../components/CommonHeader';
import { colors } from '../../constants';

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

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  id: string;
  icon: IconName;
  label: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'applications',
    icon: 'clipboard-outline',
    label: '신청 내역',
  },
  {
    id: 'saved',
    icon: 'heart-outline',
    label: '저장 목록',
  },
  {
    id: 'community',
    icon: 'chatbubble-ellipses-outline',
    label: '커뮤니티 활동',
  },
  {
    id: 'notifications',
    icon: 'notifications-outline',
    label: '알림 설정',
  },
  {
    id: 'settings',
    icon: 'options-outline',
    label: '설정',
  },
  {
    id: 'help',
    icon: 'help-buoy-outline',
    label: '고객센터',
  },
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
  const displayName = userName || '사용자';
  const initial = displayName.trim().charAt(0) || 'M';
  const concerns = childConcerns?.filter(Boolean) ?? [];

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <CommonHeader
        variant="my"
        onSettingsPress={() => onNavigate('settings')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* 프로필 + 아이 정보 상단 섹션 */}
        <View style={s.profileSection}>
          <View style={s.profileRow}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initial}</Text>
            </View>

            <View style={s.profileInfo}>
              <Text style={s.profileName}>{displayName}</Text>
              <Text style={s.profileSub}>카카오 로그인</Text>
            </View>

            <TouchableOpacity
              style={s.editBtn}
              onPress={() => onEditProfile(displayName)}
              activeOpacity={0.72}
            >
              <Ionicons name="pencil" size={12} color="#747B86" />
              <Text style={s.editBtnText}>수정</Text>
            </TouchableOpacity>
          </View>

          <View style={s.profileDivider} />

          <View style={s.childSummary}>
            <View style={s.childSummaryTop}>
              <View style={s.childTextArea}>
                <Text style={s.childSummaryLabel}>등록된 아이 정보</Text>

                {hasChildInfo && childName ? (
                  <>
                    <View style={s.childTitleRow}>
                      <Text style={s.childSummaryName}>{childName}</Text>
                      {typeof childAge === 'number' && (
                        <Text style={s.childAgeText}>만 {childAge}세</Text>
                      )}
                    </View>

                    {concerns.length > 0 ? (
                      <View style={s.concernRow}>
                        {concerns.map((concern) => (
                          <View key={concern} style={s.concernChip}>
                            <Text style={s.concernChipText}>{concern}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={s.childSummarySub}>
                        관심사를 등록하면 추천 정확도가 더 좋아져요.
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={s.childSummaryEmpty}>
                      아직 등록된 정보가 없어요
                    </Text>
                    <Text style={s.childSummarySub}>
                      아이 정보를 등록하면 맞춤 추천을 받을 수 있어요.
                    </Text>
                  </>
                )}
              </View>

              <TouchableOpacity
                style={s.registerBtn}
                onPress={onRegisterChild}
                activeOpacity={0.72}
              >
                <Text style={s.registerBtnText}>
                  {hasChildInfo ? '수정하기' : '등록하기'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 메뉴 + 설정 + 로그아웃 통합 리스트 */}
        <View style={s.menuSection}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={s.menuItemWithBorder}
              onPress={() => onNavigate(item.id)}
              activeOpacity={0.72}
            >
              <View style={s.menuLeft}>
                <View style={s.menuIconWrap}>
                  <Ionicons name={item.icon} size={19} color="#8A929E" />
                </View>

                <Text style={s.menuLabel}>{item.label}</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#C7CDD6" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={s.menuItem}
            onPress={onLogout}
            activeOpacity={0.72}
          >
            <View style={s.menuLeft}>
              <View style={s.menuIconWrap}>
                <Ionicons name="log-out-outline" size={19} color="#9AA1AC" />
              </View>

              <Text style={s.logoutLabel}>로그아웃</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 앱 정보 */}
        <View style={s.appInfo}>
          <Text style={s.appInfoText}>MoMent v1.0.0</Text>
          <Text style={s.appInfoText}>자녀 맞춤 교육 돌봄 통합 플랫폼</Text>
        </View>
      </ScrollView>

      <BottomTabBar activeTab="my" onTabChange={onTabChange} />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },

  scroll: {
    paddingBottom: 20,
  },

  profileSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEFF3',
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  profileName: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '800',
    color: '#181A1F',
    letterSpacing: -0.25,
  },

  profileSub: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500',
    color: '#9299A3',
    letterSpacing: -0.1,
  },

  editBtn: {
    height: 32,
    paddingHorizontal: 11,
    borderRadius: 16,
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#E8EBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  editBtnText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    color: '#747B86',
  },

  profileDivider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginTop: 24,
    marginBottom: 24,
  },

  childSummary: {
    backgroundColor: '#FFFFFF',
  },

  childSummaryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  childTextArea: {
    flex: 1,
  },

  childSummaryLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#A0A7B2',
    marginBottom: 10,
    letterSpacing: -0.1,
  },

  childTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },

  childSummaryName: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: '#181A1F',
    letterSpacing: -0.25,
  },

  childAgeText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#747B86',
  },

  childSummaryEmpty: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#252A32',
    letterSpacing: -0.2,
  },

  childSummarySub: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#9299A3',
    letterSpacing: -0.1,
  },

  concernRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 14,
  },

  concernChip: {
    minHeight: 26,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 13,
    backgroundColor: '#FFF7D6',
    borderWidth: 1,
    borderColor: '#F2DE8A',
  },

  concernChipText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    color: '#7A6400',
  },

  registerBtn: {
    height: 32,
    paddingHorizontal: 13,
    borderRadius: 16,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  registerBtnText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
    color: '#2A250A',
  },

  menuSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ECEFF3',
  },

  menuItemWithBorder: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 22,
    paddingRight: 18,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F3',
  },

  menuItem: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 22,
    paddingRight: 18,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  menuIconWrap: {
    width: 26,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#20242B',
    letterSpacing: -0.25,
  },

  logoutLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#747B86',
    letterSpacing: -0.25,
  },

  appInfo: {
    paddingTop: 24,
    paddingBottom: 8,
    alignItems: 'center',
    gap: 4,
  },

  appInfoText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#ADB3BD',
  },
});