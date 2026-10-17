import { Tabs } from 'expo-router';
import React from 'react';
import { Text, type ColorValue } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../components/Icon';
import { useCartStore } from '../../store/cart.store';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Dizayn (02/03/04): h-16 pastki navigatsiya — Asosiy / Savat / Sozlamalar.
 * expo-router 58'ning standart Tabs API'si + Material-3 uslub sozlamalari.
 */
export default function TabsLayout() {
  const theme = useTheme();
  const { colors, typography } = theme;
  const { t } = useTranslation();
  const cartCount = useCartStore((s) => s.lines.reduce((acc, l) => acc + l.quantity, 0));

  const renderLabel = (focused: boolean, color: ColorValue | undefined, text: string) => (
    <Text
      style={[
        typography.labelSm,
        { color, fontFamily: focused ? 'Inter_600SemiBold' : 'Inter_500Medium' },
      ]}
    >
      {text}
    </Text>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
        },
        tabBarItemStyle: { paddingTop: 6 },
        tabBarBadgeStyle: {
          backgroundColor: colors.primaryContainer,
          color: colors.onPrimary,
          fontSize: 9,
          fontWeight: '700',
          minWidth: 15,
          height: 15,
          lineHeight: 14,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: ({ focused, color }) =>
            renderLabel(focused, color, t('nav.home', { defaultValue: 'Asosiy' })),
          tabBarIcon: ({ color }) => <Icon name="roofing" size={22} color={color as string | undefined} />,
        }}
      />
      <Tabs.Screen
        name="savat"
        options={{
          tabBarLabel: ({ focused, color }) =>
            renderLabel(focused, color, t('nav.cart', { defaultValue: 'Savat' })),
          tabBarIcon: ({ color }) => <Icon name="shopping-bag" size={22} color={color as string | undefined} />,
          tabBarBadge: cartCount > 0 ? (cartCount > 99 ? '99+' : cartCount) : undefined,
        }}
      />
      <Tabs.Screen
        name="sozlamalar"
        options={{
          tabBarLabel: ({ focused, color }) =>
            renderLabel(focused, color, t('nav.settings', { defaultValue: 'Sozlamalar' })),
          tabBarIcon: ({ color }) => <Icon name="settings" size={22} color={color as string | undefined} />,
        }}
      />
    </Tabs>
  );
}
