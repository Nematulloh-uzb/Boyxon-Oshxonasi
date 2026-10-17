import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';

interface QtyStepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  style?: StyleProp<ViewStyle>;
}

/** Dizayn 03: bg-surface-container rounded-lg, 28x28 oq tugmalar, w-7 raqam. */
export function QtyStepper({ value, onChange, min = 1, max = 20, style }: QtyStepperProps) {
  const theme = useTheme();
  const { colors, radius } = theme;

  const btn = (icon: string, delta: number, dim: boolean) => (
    <Pressable
      onPress={() => {
        if (dim) return;
        const next = value + delta;
        if (next < min || next > max) return;
        onChange(next);
      }}
      style={({ pressed }) => [
        styles.btn,
        theme.shadows.card,
        {
          backgroundColor: colors.surfaceContainerLowest,
          opacity: dim ? 0.4 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <Icon name={icon} size={16} color={colors.onSurface} />
    </Pressable>
  );

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surfaceContainer, borderRadius: radius.lg }, style]}>
      {btn('remove', -1, value <= min)}
      <Text style={[theme.typography.labelMd, styles.count, { color: colors.onSurface }]}>{value}</Text>
      {btn('add', 1, value >= max)}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
  },
  btn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    width: 28,
    textAlign: 'center',
  },
});
