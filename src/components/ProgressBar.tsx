import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../constants';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

export default function ProgressBar({ current, total, showLabel = true }: ProgressBarProps) {
  const percent = Math.min((current / total) * 100, 100);
  return (
    <View>
      {showLabel && (
        <Text style={styles.label}>{current}/{total}명</Text>
      )}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  track: {
    height: 6,
    backgroundColor: colors.border.default,
    borderRadius: 3,
  },
  fill: {
    height: 6,
    backgroundColor: colors.primary.default,
    borderRadius: 3,
  },
});
