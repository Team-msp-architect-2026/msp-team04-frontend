import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

const TOAST_CONFIG: Record<ToastType, { bg: string; icon: string; iconColor: string }> = {
  success: { bg: '#38A169', icon: 'checkmark-circle',    iconColor: '#fff' },
  error:   { bg: '#E53E3E', icon: 'close-circle',        iconColor: '#fff' },
  warning: { bg: '#D69E2E', icon: 'warning',             iconColor: '#fff' },
  info:    { bg: '#3182CE', icon: 'information-circle',  iconColor: '#fff' },
};

export default function Toast({
  visible,
  message,
  type = 'info',
  duration = 2500,
  onHide,
}: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const config = TOAST_CONFIG[type];

  useEffect(() => {
    if (visible) {
      // 나타나기
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // duration 후 사라지기
      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[s.wrap, { opacity }]}>
      <View style={[s.toast, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon as any} size={18} color={config.iconColor} />
        <Text style={s.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    maxWidth: '100%',
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
});

// ── Toast를 쉽게 쓰기 위한 훅 ──────────────────────────────
import { useState } from 'react';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return { toast, showToast, hideToast };
}