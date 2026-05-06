import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../constants';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.white,
    marginRight: spacing.sm,
  },
  selected: {
    backgroundColor: colors.primary.default,
    borderColor: colors.primary.default,
  },
  text: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  selectedText: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold as '600',
  },
});