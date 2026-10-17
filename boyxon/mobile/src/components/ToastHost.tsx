import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore } from '../store/toast.store';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';

/** Global toast — ekranlar tepasida chiqadi (dizayn 02: "Savatga qo'shildi..." ). */
export function ToastHost() {
  const theme = useTheme();
  const { colors, isDark } = theme;
  const insets = useSafeAreaInsets();
  const toasts = useToastStore((s) => s.toasts);
  const hide = useToastStore((s) => s.hide);

  if (toasts.length === 0) return null;

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + 8 }]}>
      {toasts.map((toast) => {
        const success = toast.kind === 'success';
        const error = toast.kind === 'error';
        const bg = success
          ? isDark
            ? colors.tertiaryContainer
            : colors.tertiary
          : error
            ? colors.errorContainer
            : colors.inverseSurface;
        const fg = success
          ? isDark
            ? colors.onTertiaryContainer
            : colors.onTertiary
          : error
            ? colors.onErrorContainer
            : colors.inverseOnSurface;
        const iconName = success ? 'check-circle' : error ? 'error-outline' : 'info-outline';
        return (
          <Pressable
            key={toast.id}
            onPress={() => hide(toast.id)}
            style={[styles.toast, { backgroundColor: bg }, theme.shadows.modal]}
          >
            <Icon
              name={iconName}
              size={18}
              color={success && !isDark ? colors.tertiaryFixed : fg}
            />
            <Text
              numberOfLines={2}
              style={[theme.typography.labelMd, { color: fg, flex: 1 }]}
            >
              {toast.title}
            </Text>
            <Icon name="close" size={16} color={fg} style={{ opacity: 0.8 }} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    gap: 8,
    zIndex: 999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
});
