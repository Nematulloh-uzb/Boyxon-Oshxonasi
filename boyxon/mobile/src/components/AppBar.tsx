import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getInitials } from '../lib/initials';
import { useAuthStore } from '../store/auth.store';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';

interface AppBarProps {
  /** Sarlavha ostidagi kichik yozuv (dizaynda: "Menyu", "Sozlamalar"...) */
  subtitle?: string;
  showSearch?: boolean;
  showBell?: boolean;
  showAvatar?: boolean;
  onSearchPress?: () => void;
  onBellPress?: () => void;
  onAvatarPress?: () => void;
}

/**
 * Dizayn shell'idagi yuqori panel: orange fon, chapda logo + brend,
 * o'ngda qidiruv/qo'ng'iroq (bildirishnoma) va avatar.
 */
export function AppBar({
  subtitle,
  showSearch = true,
  showBell = true,
  showAvatar = true,
  onSearchPress,
  onBellPress,
  onAvatarPress,
}: AppBarProps) {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const initials = getInitials(user?.name);

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.primaryContainer,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      <View style={[styles.logo, { backgroundColor: colors.surfaceContainerLowest }]}>
        <Icon name="restaurant" size={20} color={colors.primaryContainer} />
      </View>
      <View style={styles.titleBox}>
        <Text numberOfLines={1} style={[theme.typography.labelLg, { color: colors.onPrimary, fontFamily: 'Epilogue_700Bold', fontSize: 15, letterSpacing: -0.2 }]}>
          Boyxon Oshxonasi
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={[theme.typography.labelSm, { color: colors.onPrimary, opacity: 0.85 }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        {showSearch ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={6}
            onPress={onSearchPress}
            style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Icon name="search" size={22} color={colors.onPrimary} />
          </Pressable>
        ) : null}
        {showBell ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={6}
            onPress={onBellPress}
            style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Icon name="notifications" size={22} color={colors.onPrimary} />
            <View style={[styles.dot, { backgroundColor: colors.onPrimary }]} />
          </Pressable>
        ) : null}
        {showAvatar ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={6}
            onPress={onAvatarPress}
            style={({ pressed }) => [styles.avatar, { backgroundColor: colors.surfaceContainerLowest, opacity: pressed ? 0.8 : 1 }]}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} contentFit="cover" />
            ) : initials ? (
              <Text style={{ color: colors.primary, fontFamily: 'Epilogue_700Bold', fontSize: 13 }}>
                {initials}
              </Text>
            ) : (
              <Icon name="person" size={20} color={colors.primary} />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 10,
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: { flex: 1, minWidth: 0 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  dot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginLeft: 2,
  },
  avatarImg: { width: '100%', height: '100%' },
});
