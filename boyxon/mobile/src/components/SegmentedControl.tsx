import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';

export interface SegmentItem {
  key: string;
  label: string;
  icon?: string;
}

interface SegmentedControlProps {
  items: SegmentItem[];
  value: string;
  onChange: (key: string) => void;
  /**
   * pill — dizayn 01 (Kirish/Ro'yxatdan o'tish): fon surface-container-low,
   * faol segment bg-primary-container (orange) oq matn.
   * solid — dizayn 03 (Yetkazib berish/Olib ketish): faol segment bg-primary.
   */
  variant?: 'pill' | 'solid';
}

export function SegmentedControl({ items, value, onChange, variant = 'pill' }: SegmentedControlProps) {
  const theme = useTheme();
  const { colors, radius } = theme;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.surfaceContainerLow,
          borderRadius: variant === 'pill' ? radius.full : radius.xl,
        },
      ]}
    >
      {items.map((item) => {
        const active = item.key === value;
        const bg = active
          ? variant === 'pill'
            ? colors.primaryContainer
            : colors.primary
          : 'transparent';
        const fg = active
          ? variant === 'pill'
            ? colors.onPrimary
            : colors.onPrimary
          : colors.onSurfaceVariant;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={({ pressed }) => [
              styles.item,
              {
                backgroundColor: bg,
                borderRadius: variant === 'pill' ? radius.full : radius.lg,
                opacity: pressed ? 0.9 : 1,
              },
              active && theme.shadows.card,
            ]}
          >
            {item.icon ? <Icon name={item.icon} size={18} color={fg} /> : null}
            <Text style={[variant === 'pill' ? theme.typography.labelLg : theme.typography.labelMd, { color: fg }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    padding: 4,
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
});
