import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usersApi } from '../api/users.api';
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

  // Qo'ng'iroq badge'i — o'qilmagan bildirishnomalar soni (dizayn 02).
  const unreadQ = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => usersApi.unreadCount(),
    enabled: !!user,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const unread = unreadQ.data?.data?.count ?? 0;

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
            {unread > 0 ? (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.secondaryContainer, borderColor: colors.onPrimary },
                ]}
              >
                <Text style={styles.badgeText}>{unread > 9 ? '9+' : String(unread)}</Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}
        {showAvatar ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={6}
            onPress={onAvatarPress}
            style={({ pressed }) => [styles.avatar, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} contentFit="cover" />
            ) : (
              <Icon name="person" size={20} color={colors.onPrimary} />
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
  badge: {
    position: 'absolute',
    top: 3,
    right: 1,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    lineHeight: 12,
    fontFamily: 'Inter_600SemiBold',
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
