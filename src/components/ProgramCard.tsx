import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../constants';
import StatusBadge from './StatusBadge';

type BadgeStatus = 'open' | 'closing' | 'closed' | 'government';

interface ProgramCardProps {
  imageUrl?: string;
  tag: string;
  title: string;
  organization: string;
  distance?: string;
  cost: string;
  rating?: number;
  status: BadgeStatus;
  onPress: () => void;
}

export default function ProgramCard({
  imageUrl,
  tag,
  title,
  organization,
  distance,
  cost,
  rating,
  status,
  onPress,
}: ProgramCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imagePlaceholder}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.noImage} />
        )}
        <View style={styles.badgeWrapper}>
          <StatusBadge status={status} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.tag}>{tag}</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.organization}>{organization}</Text>

        <View style={styles.footer}>
          <Text style={styles.cost}>{cost}</Text>
          <View style={styles.right}>
            {distance && <Text style={styles.distance}>📍 {distance}</Text>}
            {rating && <Text style={styles.rating}>⭐ {rating.toFixed(1)}</Text>}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  imagePlaceholder: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  noImage: {
    width: '100%',
    height: 160,
    backgroundColor: colors.secondary[100],
  },
  badgeWrapper: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  body: {
    padding: spacing.md,
  },
  tag: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold as '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  organization: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cost: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.text.primary,
  },
  right: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  distance: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  rating: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
});