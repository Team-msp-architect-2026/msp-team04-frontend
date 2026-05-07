import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type BottomTabKey = 'home' | 'recommend' | 'apply' | 'community' | 'my';

interface BottomTabItem {
  key: BottomTabKey;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
  sizeOffset?: number;
}

interface BottomTabBarProps {
  activeTab: BottomTabKey;
  onTabChange: (tab: BottomTabKey) => void;
}

const TABS: BottomTabItem[] = [
  {
    key: 'home',
    label: '홈',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
  },
  {
    key: 'recommend',
    label: '맞춤추천',
    activeIcon: 'compass',
    inactiveIcon: 'compass-outline',
    sizeOffset: 2,
  },
  {
    key: 'apply',
    label: '모집중',
    activeIcon: 'document-text',
    inactiveIcon: 'document-text-outline',
  },
  {
    key: 'community',
    label: '커뮤니티',
    activeIcon: 'chatbubble-ellipses',
    inactiveIcon: 'chatbubble-ellipses-outline',
  },
  {
    key: 'my',
    label: 'MY',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
  },
];

export default function BottomTabBar({
  activeTab,
  onTabChange,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safeArea, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      <View style={styles.container}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              hitSlop={8}
              style={({ pressed }) => [
                styles.tabItem,
                pressed && styles.tabItemPressed,
              ]}
            >
              <View style={styles.iconArea}>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.inactiveIcon}
                  size={(isActive ? 23 : 22) + (tab.sizeOffset ?? 0)}
                  color={isActive ? '#111827' : '#B6BCC6'}
                />
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },

  container: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
  },

  tabItem: {
    flex: 1,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
    paddingBottom: 4,
  },

  tabItemPressed: {
    opacity: 0.62,
  },

  iconArea: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },

  tabLabel: {
    fontSize: 10.5,
    lineHeight: 13,
    letterSpacing: -0.25,
    textAlign: 'center',
  },

  tabLabelActive: {
    color: '#111827',
    fontWeight: '800',
  },

  tabLabelInactive: {
    color: '#A8ADB5',
    fontWeight: '600',
  },
});