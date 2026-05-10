import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
  onProfilePress: () => void;
}

type DetailType = 'main' | 'social' | 'terms' | 'policy';
type MenuAction = DetailType | 'privacy' | 'logout' | 'withdraw';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  id: MenuAction;
  label: string;
  icon: IconName;
  iconBg: string;
  iconColor: string;
  rightText?: string;
  danger?: boolean;
  disabled?: boolean;
}

const ACCOUNT_ITEMS: MenuItem[] = [
  {
    id: 'privacy',
    label: '개인정보 관리',
    icon: 'person-circle-outline',
    iconBg: '#FFF8D8',
    iconColor: '#8A6A00',
  },
  {
    id: 'social',
    label: '연결된 소셜 계정',
    icon: 'link-outline',
    iconBg: '#EEF3FF',
    iconColor: '#4D5FD2',
    rightText: '카카오',
  },
];

const INFO_ITEMS: MenuItem[] = [
  {
    id: 'terms',
    label: '이용약관',
    icon: 'document-text-outline',
    iconBg: '#F2FBF6',
    iconColor: '#228251',
  },
  {
    id: 'policy',
    label: '개인정보처리방침',
    icon: 'lock-closed-outline',
    iconBg: '#F5F3FF',
    iconColor: '#5F52C8',
  },
  {
    id: 'main',
    label: '앱 버전',
    icon: 'information-circle-outline',
    iconBg: '#F8FAFC',
    iconColor: '#64748B',
    rightText: 'v1.0.0',
    disabled: true,
  },
];

const MANAGE_ITEMS: MenuItem[] = [
  {
    id: 'logout',
    label: '로그아웃',
    icon: 'log-out-outline',
    iconBg: '#F8FAFC',
    iconColor: '#64748B',
  },
  {
    id: 'withdraw',
    label: '회원탈퇴',
    icon: 'trash-outline',
    iconBg: '#FFF1F2',
    iconColor: '#D94B58',
    danger: true,
  },
];

export default function SettingsScreen({
  onBack,
  onLogout,
  onProfilePress,
}: SettingsScreenProps) {
  const [detailType, setDetailType] = useState<DetailType>('main');

  const isDetail = detailType !== 'main';

  const getHeaderTitle = () => {
    if (detailType === 'social') return '연결된 소셜 계정';
    if (detailType === 'terms') return '이용약관';
    if (detailType === 'policy') return '개인정보처리방침';

    return '설정';
  };

  const handleBack = () => {
    if (isDetail) {
      setDetailType('main');
      return;
    }

    onBack();
  };

  const handleMenuPress = (item: MenuItem) => {
    if (item.disabled) return;

    if (item.id === 'privacy') {
      onProfilePress();
      return;
    }

    if (item.id === 'logout') {
      onLogout();
      return;
    }

    if (item.id === 'withdraw') {
      Alert.alert(
        '회원탈퇴',
        'MVP에서는 회원탈퇴 API 연동 전이라 실제 탈퇴 처리는 아직 지원하지 않습니다.',
        [{ text: '확인' }],
      );
      return;
    }

    if (item.id === 'social' || item.id === 'terms' || item.id === 'policy') {
      setDetailType(item.id);
    }
  };

  const renderMenuSection = (title: string, items: MenuItem[]) => {
    return (
      <View style={s.sectionBlock}>
        <Text style={s.sectionLabel}>{title}</Text>

        <View style={s.menuSection}>
          {items.map((item, index) => {
            const hasBorder = index < items.length - 1;

            return (
              <TouchableOpacity
                key={`${title}-${item.label}`}
                style={[s.menuItem, hasBorder && s.menuItemBorder]}
                onPress={() => handleMenuPress(item)}
                activeOpacity={item.disabled ? 1 : 0.74}
                disabled={item.disabled}
              >
                <View style={s.menuLeft}>
                  <View
                    style={[
                      s.iconBox,
                      {
                        backgroundColor: item.iconBg,
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={17}
                      color={item.iconColor}
                    />
                  </View>

                  <Text style={[s.menuLabel, item.danger && s.dangerText]}>
                    {item.label}
                  </Text>
                </View>

                <View style={s.menuRight}>
                  {!!item.rightText && (
                    <Text style={s.menuSub}>{item.rightText}</Text>
                  )}

                  {!item.disabled && (
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#C7CDD6"
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderSocialDetail = () => {
    return (
      <View style={s.detailCard}>
        <View style={[s.detailIconBox, { backgroundColor: '#EEF3FF' }]}>
          <Ionicons name="link-outline" size={24} color="#4D5FD2" />
        </View>

        <Text style={s.detailTitle}>연결된 소셜 계정</Text>
        <Text style={s.detailDesc}>
          현재 MoMent 계정은 카카오 OAuth 로그인을 기준으로 연결되어
          있습니다.
        </Text>

        <View style={s.connectedCard}>
          <View style={s.connectedLeft}>
            <View style={s.kakaoBadge}>
              <Text style={s.kakaoText}>K</Text>
            </View>

            <View>
              <Text style={s.connectedTitle}>카카오</Text>
              <Text style={s.connectedSub}>소셜 로그인 연결됨</Text>
            </View>
          </View>

          <View style={s.connectedStatus}>
            <Text style={s.connectedStatusText}>활성</Text>
          </View>
        </View>

        <Text style={s.detailNotice}>
          계정 연결 해제 기능은 추후 백엔드 인증 정책과 함께 제공될
          예정입니다.
        </Text>
      </View>
    );
  };

  const renderTermsDetail = () => {
    return (
      <View style={s.termsCard}>
        <Text style={s.termsTitle}>MoMent 이용약관</Text>
        <Text style={s.termsSub}>시행일자 2026.04.19</Text>

        <View style={s.termsDivider} />

        <Text style={s.articleTitle}>제1조 목적</Text>
        <Text style={s.articleText}>
          본 약관은 MoMent가 제공하는 자녀 맞춤 교육·돌봄 정보 추천 및
          신청 지원 서비스의 이용 조건과 절차, 회원과 서비스 제공자의
          권리·의무 및 책임사항을 규정함을 목적으로 합니다.
        </Text>

        <Text style={s.articleTitle}>제2조 서비스의 제공</Text>
        <Text style={s.articleText}>
          MoMent는 교육·돌봄 프로그램 정보 조회, 자녀 프로필 기반 맞춤
          추천, 정부 지원 혜택 안내, 프로그램 신청 및 결제 지원, 커뮤니티,
          알림 서비스를 제공합니다.
        </Text>

        <Text style={s.articleTitle}>제3조 회원의 의무</Text>
        <Text style={s.articleText}>
          회원은 서비스 이용 시 정확한 정보를 입력해야 하며, 타인의 정보를
          무단으로 사용하거나 서비스 운영을 방해하는 행위를 해서는 안
          됩니다.
        </Text>

        <Text style={s.articleTitle}>제4조 신청 및 결제</Text>
        <Text style={s.articleText}>
          회원은 프로그램별 모집 조건과 결제 정보를 확인한 뒤 신청해야
          하며, 결제 완료 여부에 따라 신청 상태가 확정될 수 있습니다.
        </Text>

        <Text style={s.articleTitle}>제5조 서비스 변경 및 중단</Text>
        <Text style={s.articleText}>
          회사는 서비스 운영상 필요한 경우 서비스의 전부 또는 일부를
          변경하거나 일시적으로 중단할 수 있으며, 중요한 변경 사항은 앱 내
          공지 또는 알림을 통해 안내합니다.
        </Text>

        <Text style={s.articleTitle}>제6조 면책사항</Text>
        <Text style={s.articleText}>
          MoMent는 공공데이터 및 제휴 기관이 제공한 정보를 기반으로
          서비스를 제공하며, 외부 기관의 사정에 따라 프로그램 정보가 변경될
          수 있습니다.
        </Text>
      </View>
    );
  };

  const renderPolicyDetail = () => {
    return (
      <View style={s.termsCard}>
        <Text style={s.termsTitle}>개인정보처리방침</Text>
        <Text style={s.termsSub}>시행일자 2026.04.19</Text>

        <View style={s.termsDivider} />

        <Text style={s.articleTitle}>1. 수집하는 개인정보 항목</Text>
        <Text style={s.articleText}>
          MoMent는 서비스 제공을 위해 카카오 로그인 식별 정보, 보호자 이름,
          연락처, 프로필 이미지, 자녀 이름, 자녀 생년월일, 관심사, 프로그램
          신청 및 결제 이력 등을 수집할 수 있습니다.
        </Text>

        <Text style={s.articleTitle}>2. 개인정보의 이용 목적</Text>
        <Text style={s.articleText}>
          수집한 개인정보는 회원 식별, 자녀 맞춤 추천 제공, 프로그램 신청 및
          결제 처리, 알림 발송, 커뮤니티 이용, 고객 문의 응대, 서비스 품질
          개선 목적으로 이용됩니다.
        </Text>

        <Text style={s.articleTitle}>3. 개인정보의 보관 및 파기</Text>
        <Text style={s.articleText}>
          개인정보는 회원이 서비스를 이용하는 기간 동안 보관되며, 회원 탈퇴
          또는 수집 목적 달성 시 관련 법령에 따라 지체 없이 파기됩니다.
        </Text>

        <Text style={s.articleTitle}>4. 개인정보의 제3자 제공</Text>
        <Text style={s.articleText}>
          MoMent는 법령에 따른 경우를 제외하고 회원의 동의 없이 개인정보를
          외부에 제공하지 않습니다. 다만 프로그램 신청 및 결제 처리에 필요한
          범위에서는 관련 기관 또는 결제 대행사와 정보가 연동될 수 있습니다.
        </Text>

        <Text style={s.articleTitle}>5. 개인정보의 안전성 확보 조치</Text>
        <Text style={s.articleText}>
          MoMent는 개인정보 보호를 위해 접근 권한 관리, 암호화, 로그 관리,
          네트워크 접근 통제 등 안전성 확보 조치를 적용합니다.
        </Text>

        <Text style={s.articleTitle}>6. 이용자의 권리</Text>
        <Text style={s.articleText}>
          회원은 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며,
          개인정보 삭제 또는 처리 정지를 요청할 수 있습니다.
        </Text>
      </View>
    );
  };

  const renderDetail = () => {
    if (detailType === 'social') return renderSocialDetail();
    if (detailType === 'terms') return renderTermsDetail();
    if (detailType === 'policy') return renderPolicyDetail();

    return null;
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SafeAreaView edges={['top']} style={s.safeArea}>
        <View style={s.header}>
          <TouchableOpacity
            style={s.headerSide}
            onPress={handleBack}
            activeOpacity={0.72}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={25} color="#191919" />
          </TouchableOpacity>

          <Text style={s.headerTitle}>{getHeaderTitle()}</Text>

          <View style={s.headerSide} />
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {isDetail ? (
          renderDetail()
        ) : (
          <>
            {renderMenuSection('계정', ACCOUNT_ITEMS)}
            {renderMenuSection('정보', INFO_ITEMS)}
            {renderMenuSection('계정 관리', MANAGE_ITEMS)}

            <Text style={s.footerText}>
              MoMent 설정은 서비스 운영 정책에 따라 순차적으로 확장됩니다.
            </Text>
          </>
        )}
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
  },

  sectionBlock: {
    marginBottom: 14,
  },

  sectionLabel: {
    marginBottom: 8,
    paddingHorizontal: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#8B929E',
    letterSpacing: -0.15,
  },

  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },

  menuItem: {
    minHeight: 60,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
  },

  menuLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 12,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuLabel: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.1,
  },

  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  menuSub: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#8B929E',
  },

  dangerText: {
    color: '#D94B58',
  },

  footerText: {
    marginTop: 8,
    paddingHorizontal: 8,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: '#9AA1AC',
    textAlign: 'center',
    letterSpacing: -0.1,
  },

  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },

  detailIconBox: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: '#FFF8D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  detailTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '900',
    color: '#17191D',
    letterSpacing: -0.35,
  },

  detailDesc: {
    marginTop: 9,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    letterSpacing: -0.15,
  },

  detailNotice: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: '#9AA1AC',
    textAlign: 'center',
    letterSpacing: -0.1,
  },

  connectedCard: {
    width: '100%',
    marginTop: 18,
    minHeight: 66,
    borderRadius: 15,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF0F3',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  connectedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  kakaoBadge: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: '#FEE500',
    alignItems: 'center',
    justifyContent: 'center',
  },

  kakaoText: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
    color: '#191919',
  },

  connectedTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },

  connectedSub: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#8B929E',
  },

  connectedStatus: {
    height: 25,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  connectedStatusText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    color: '#4D5FD2',
  },

  termsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 22,
  },

  termsTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    color: '#17191D',
    letterSpacing: -0.35,
  },

  termsSub: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: '#8B929E',
  },

  termsDivider: {
    height: 1,
    backgroundColor: '#EEF0F3',
    marginTop: 16,
    marginBottom: 18,
  },

  articleTitle: {
    marginTop: 16,
    marginBottom: 7,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '900',
    color: '#17191D',
    letterSpacing: -0.2,
  },

  articleText: {
    fontSize: 13,
    lineHeight: 22,
    fontWeight: '500',
    color: '#5F6673',
    letterSpacing: -0.15,
  },
});