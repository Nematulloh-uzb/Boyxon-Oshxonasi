import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';

export type ButtonVariant = 'gradient' | 'primary' | 'tonal' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'lg' | 'md' | 'sm';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconRight?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** Kenglikni to'liq egallash (default: true) */
  full?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  iconRight,
  loading,
  disabled,
  style,
  textStyle,
  full = true,
}: ButtonProps) {
  const theme = useTheme();
  const { colors, radius } = theme;

  const isDisabled = disabled || loading;

  const sizeStyle: ViewStyle =
    size === 'lg'
      ? { height: 48, borderRadius: radius.xl, paddingHorizontal: 16 }
      : size === 'md'
        ? { height: 44, borderRadius: radius.xl, paddingHorizontal: 16 }
        : { height: 32, borderRadius: radius.lg, paddingHorizontal: 12 };

  const textStyleBySize: TextStyle =
    size === 'sm' ? { ...theme.typography.labelSm } : { ...theme.typography.labelLg };

  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    gradient: { bg: 'transparent', fg: colors.onPrimary },
    primary: { bg: colors.primary, fg: colors.onPrimary },
    tonal: { bg: colors.surfaceContainerLow, fg: colors.primary },
    outline: { bg: 'transparent', fg: colors.onSurface, border: colors.outlineVariant },
    ghost: { bg: 'transparent', fg: colors.primary },
    danger: { bg: colors.error, fg: colors.onError },
  };
  const p = palette[variant];

  const inner = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator color={p.fg} size="small" />
      ) : (
        <>
          {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 18} color={p.fg} /> : null}
          <Text
            numberOfLines={1}
            style={[textStyleBySize, { color: p.fg, textAlign: 'center' }, textStyle]}
          >
            {title}
          </Text>
          {iconRight ? <Icon name={iconRight} size={size === 'sm' ? 16 : 18} color={p.fg} /> : null}
        </>
      )}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        full ? styles.full : styles.auto,
        sizeStyle,
        {
          backgroundColor: p.bg,
          borderWidth: p.border ? 1 : 0,
          borderColor: p.border,
          // Kontent vertikal markazda turadi (aks holda tepaga yopishadi).
          justifyContent: 'center',
          opacity: isDisabled ? 0.55 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
        },
        (variant === 'primary' || variant === 'gradient') && theme.shadows.card,
        style,
      ]}
    >
      {variant === 'gradient' ? (
        <LinearGradient
          colors={[colors.primaryContainer, colors.secondaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: (sizeStyle as ViewStyle).borderRadius as number }]}
        />
      ) : null}
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  full: { alignSelf: 'stretch' },
  auto: { alignSelf: 'flex-start' },
});
