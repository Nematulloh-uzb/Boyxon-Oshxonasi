import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Dizayn: "Ommabop taomlar" + o'ngda primary rangli "Barchasi (28)". */
export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <View style={styles.row}>
      <Text style={[theme.typography.headlineSm, { color: colors.onSurface, letterSpacing: -0.2, flex: 1 }]}>
        {title}
      </Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={[theme.typography.labelSm, { color: colors.primary, fontWeight: '500' }]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
