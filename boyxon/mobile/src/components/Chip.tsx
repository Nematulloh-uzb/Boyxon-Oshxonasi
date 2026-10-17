import React from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Dizayn 02: kategoriya chipi — px-4 py-2 rounded-full label-md shadow-sm. */
export function Chip({ label, active, onPress, style }: ChipProps) {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        theme.shadows.card,
        {
          backgroundColor: active ? colors.primaryContainer : colors.surfaceContainerLowest,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      <Text
        style={[
          theme.typography.labelMd,
          { color: active ? colors.onPrimary : colors.onSurfaceVariant },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
