import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../store/cart.store';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';

const TAB_META: Record<string, { icon: string; labelKey: string; defaultLabel: string }> = {
  index: { icon: 'roofing', labelKey: 'nav.home', defaultLabel: 'Asosiy' },
  savat: { icon: 'shopping-bag', labelKey: 'nav.cart', defaultLabel: 'Savat' },
  sozlamalar: { icon: 'settings', labelKey: 'nav.settings', defaultLabel: 'Sozlamalar' },
};

/** Dizayn: h-16, 3 ta yorliq (Asosiy / Savat / Sozlamalar), savat badge bilan. */
export function BottomTabs({ state, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const cartCount = useCartStore((s) => s.lines.reduce((acc, l) => acc + l.quantity, 0));

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.surface,
          paddingBottom: insets.bottom,
        },
        theme.shadows.raised,
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const meta = TAB_META[route.name] ?? { icon: 'circle', labelKey: route.name, defaultLabel: route.name };
        const showBadge = route.name === 'savat' && cartCount > 0;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name as never);
              }
            }}
            style={styles.item}
          >
            <View>
              <Icon name={meta.icon} size={22} color={focused ? colors.primary : colors.onSurfaceVariant} />
              {showBadge ? (
                <View style={[styles.badge, { backgroundColor: colors.primaryContainer }]}>
                  <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[
                theme.typography.labelSm,
                {
                  color: focused ? colors.primary : colors.onSurfaceVariant,
                  fontFamily: focused ? 'Inter_600SemiBold' : 'Inter_500Medium',
                },
              ]}
            >
              {t(meta.labelKey, { defaultValue: meta.defaultLabel })}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  item: {
    minWidth: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -9,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: 'white', fontSize: 9, fontWeight: '700', lineHeight: 12 },
});
