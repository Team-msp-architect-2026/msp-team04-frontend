import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../constants';
import * as WebBrowser from 'expo-web-browser';
import { tokenStorage } from '../../api/tokenStorage';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

const KAKAO_CLIENT_ID = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;
const REDIRECT_URI = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI;

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const handleKakaoLogin = async () => {
  try {
    if (!KAKAO_CLIENT_ID || !REDIRECT_URI) {
      throw new Error('Kakao login env is missing');
    }

    const appReturnUrl = Linking.createURL('auth');

    const authUrl =
      `https://kauth.kakao.com/oauth/authorize` +
      `?response_type=code` +
      `&client_id=${KAKAO_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&prompt=login` +
      `&state=${encodeURIComponent(appReturnUrl)}`;

    console.log('앱 복귀 URL:', appReturnUrl);
    console.log('카카오 인증 URL:', authUrl);

    // WebBrowser 대신 기본 브라우저로 열기
    await Linking.openURL(authUrl);

  } catch (e) {
    console.error('카카오 로그인 실패', e);
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <Text style={styles.logo}>MoMent</Text>
        <Text style={styles.subtitle}>우리 아이 맞춤 교육 · 돌봄 추천 서비스</Text>
      </View>

      <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
        <Text style={styles.kakaoText}>카카오로 시작하기</Text>
      </TouchableOpacity>

      <Text style={styles.policy}>
        로그인 시 이용약관 및 개인정보처리방침에 동의한 것으로 간주됩니다.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 180,
    paddingBottom: 80,
  },
  logoArea: { alignItems: 'center' },
  logo: { fontSize: 38, fontWeight: '700', color: colors.primary.default },
  subtitle: { marginTop: 10, fontSize: typography.fontSize.sm, color: colors.text.secondary },
  kakaoButton: { backgroundColor: '#FEE500', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  kakaoText: { fontSize: typography.fontSize.base, fontWeight: '700', color: '#191919' },
  policy: { textAlign: 'center', fontSize: typography.fontSize.xs, color: colors.text.secondary },
});