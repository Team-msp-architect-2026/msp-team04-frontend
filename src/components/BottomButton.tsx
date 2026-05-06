import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, typography, spacing } from '../constants';

interface BottomButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function BottomButton({
  label,
  onPress,
  disabled = false,
}: BottomButtonProps) {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={styles.text}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  button: {
    backgroundColor: colors.primary.default,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: colors.border.default,
  },
  text: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold as '700',
    color: colors.text.primary,
  },
});