import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../constants';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const handleMockKakaoLogin = () => {
    console.log('카카오 로그인 성공 가정');
    onLoginSuccess();
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <Text style={styles.logo}>MoMent</Text>
        <Text style={styles.subtitle}>우리 아이 맞춤 교육 · 돌봄 추천 서비스</Text>
      </View>

      <TouchableOpacity style={styles.kakaoButton} onPress={handleMockKakaoLogin}>
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
  logoArea: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 38,
    fontWeight: '700',
    color: colors.primary.default,
  },
  subtitle: {
    marginTop: 10,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  kakaoText: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: '#191919',
  },
  policy: {
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
});