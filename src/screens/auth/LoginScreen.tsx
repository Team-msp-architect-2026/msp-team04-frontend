import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../constants';
import * as WebBrowser from 'expo-web-browser';
import { tokenStorage } from '../../api/tokenStorage';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

const KAKAO_CLIENT_ID = 'f4c7c025c81b57486c08a43afd423e5d';
const REDIRECT_URI = 'https://destiny-why-aloe.ngrok-free.dev/auth/kakao';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const handleKakaoLogin = async () => {
  try {
    const appReturnUrl = Linking.createURL('auth');

    const authUrl =
      `https://kauth.kakao.com/oauth/authorize` +
      `?response_type=code` +
      `&client_id=${KAKAO_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&state=${encodeURIComponent(appReturnUrl)}`;

    console.log('앱 복귀 URL:', appReturnUrl);
    console.log('카카오 인증 URL:', authUrl);

    const result = await WebBrowser.openAuthSessionAsync(authUrl, appReturnUrl);
    console.log('카카오 로그인 결과:', result);

    if (result.type === 'success' && result.url) {
      const parsedUrl = Linking.parse(result.url);

      const accessTokenParam = parsedUrl.queryParams?.accessToken;
      const refreshTokenParam = parsedUrl.queryParams?.refreshToken;

      const accessToken = Array.isArray(accessTokenParam)
        ? accessTokenParam[0]
        : accessTokenParam;

      const refreshToken = Array.isArray(refreshTokenParam)
        ? refreshTokenParam[0]
        : refreshTokenParam;

      if (!accessToken || !refreshToken) {
        console.error('토큰을 받지 못했어요.', result.url);
        return;
      }

      await tokenStorage.setAccessToken(accessToken);
      await tokenStorage.setRefreshToken(refreshToken);

      onLoginSuccess();
    }
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