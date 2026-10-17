import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';
import { Icon } from './Icon';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'shopping-bag', title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <View style={styles.wrap}>
      <View style={[styles.circle, { backgroundColor: colors.surfaceContainerLow }]}>
        <Icon name={icon} size={40} color={colors.onSurfaceVariant} />
      </View>
      <Text style={[theme.typography.headlineSm, { color: colors.onSurface, textAlign: 'center' }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            theme.typography.bodyMd,
            { color: colors.onSurfaceVariant, textAlign: 'center', maxWidth: 280, marginTop: 4 },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
      {actionLabel ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          size="md"
          full={false}
          style={{ marginTop: 20, paddingHorizontal: 24 }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
});
