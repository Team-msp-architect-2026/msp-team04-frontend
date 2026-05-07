import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

type HeaderVariant = 'home' | 'apply' | 'community' | 'my';

interface CommonHeaderProps {
  variant: HeaderVariant;
  unreadCount?: number;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
}

const TITLE_MAP: Record<Exclude<HeaderVariant, 'home'>, string> = {
  apply: '모집중',
  community: '커뮤니티',
  my: '마이페이지',
};

export default function CommonHeader({
  variant,
  unreadCount = 0,
  onSearchPress,
  onNotificationPress,
  onSettingsPress,
}: CommonHeaderProps) {
  const isHome = variant === 'home';
  const isMy = variant === 'my';
  const showSearchAndNotification =
    variant === 'home' || variant === 'apply' || variant === 'community';

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.leftArea}>
          {isHome ? (
            <Text style={styles.logo}>MoMent</Text>
          ) : (
            <Text style={styles.title}>
              {TITLE_MAP[variant as Exclude<HeaderVariant, 'home'>]}
            </Text>
          )}
        </View>

        <View style={styles.rightArea}>
          {showSearchAndNotification && (
            <>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onSearchPress}
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="search-outline" size={18} color="#5F6672" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={onNotificationPress}
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="notifications-outline" size={18} color="#5F6672" />
                {unreadCount > 0 && <View style={styles.badge} />}
              </TouchableOpacity>
            </>
          )}

          {isMy && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onSettingsPress}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="settings-outline" size={19} color="#5F6672" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },

  header: {
    minHeight: 40,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
  },

  leftArea: {
    flex: 1,
    justifyContent: 'center',
  },

  rightArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    marginLeft: 12,
  },

  logo: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: '#F2CF52',
  },

  title: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: '#191919',
  },

  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  badge: {
    position: 'absolute',
    top: 4,
    right: 3,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FF7B72',
    borderWidth: 1.4,
    borderColor: '#FFFFFF',
  },
});