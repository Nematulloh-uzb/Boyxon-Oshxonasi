import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { OrderStatus } from '../api/types';
import { ORDER_STATUS_LABELS } from '../lib/orderStatus';
import { useTheme } from '../theme/ThemeProvider';

/** Buyurtma statusi chipi (dizayn tilida — fixed/tone ranglar). */
export function OrderStatusChip({ status }: { status: OrderStatus }) {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();

  const map: Record<OrderStatus, { bg: string; fg: string }> = {
    pending: { bg: colors.primaryFixed, fg: colors.onPrimaryFixed },
    confirmed: { bg: colors.secondaryFixed, fg: colors.onSecondaryFixed },
    packing: { bg: colors.surfaceContainerHigh, fg: colors.onSurface },
    handed_to_taxi: { bg: colors.secondaryContainer, fg: colors.onSecondaryContainer },
    delivered: { bg: colors.tertiaryFixed, fg: colors.onTertiaryFixedVariant },
    cancelled: { bg: colors.errorContainer, fg: colors.onErrorContainer },
  };
  const c = map[status];

  return (
    <View style={[styles.chip, { backgroundColor: c.bg }]}>
      <Text
        style={[
          theme.typography.labelSm,
          { color: c.fg, fontFamily: 'Inter_600SemiBold' },
        ]}
      >
        {t(`status.${status}`, { defaultValue: ORDER_STATUS_LABELS[status] })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
});
