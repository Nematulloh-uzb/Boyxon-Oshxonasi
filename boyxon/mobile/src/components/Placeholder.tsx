import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';

interface PlaceholderProps {
  /** Kvadrat o'lcham (default 96 — dizayndagi w-24 h-24) */
  size?: number;
  icon?: string;
  /** "Rasm yo'q" yozuvi ko'rsatilsinmi (kichik o'lchamlarda o'chiriladi) */
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Dizayn: rasm yo'q — surface-container-low fon, outline ikonka 40%, "Rasm yo'q". */
export function Placeholder({ size = 96, icon = 'restaurant', showLabel = true, style }: PlaceholderProps) {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          backgroundColor: colors.surfaceContainerLow,
        },
        style,
      ]}
    >
      <Icon name={icon} size={size >= 80 ? 30 : 22} color={colors.outline} style={styles.icon} />
      {showLabel && size >= 80 ? (
        <Text style={[theme.typography.bodySm, { color: colors.onSurfaceVariant, marginTop: 4, fontWeight: '500' }]}>
          {"Rasm yo'q"}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  icon: { opacity: 0.4 },
});
