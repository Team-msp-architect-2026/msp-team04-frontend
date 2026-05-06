import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../constants';

type BadgeStatus = 'open' | 'closing' | 'closed' | 'government';

interface StatusBadgeProps {
  status: BadgeStatus;
}

const badgeConfig = {
  open: { label: '모집중', bg: colors.pin.open, text: colors.white },
  closing: { label: '마감임박', bg: colors.status.warning, text: colors.white },
  closed: { label: '마감', bg: colors.pin.closed, text: colors.white },
  government: { label: '정부지원', bg: colors.secondary.default, text: colors.text.primary },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = badgeConfig[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
});