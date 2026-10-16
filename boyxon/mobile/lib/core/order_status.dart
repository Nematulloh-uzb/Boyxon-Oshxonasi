import 'package:flutter/material.dart';

import '../l10n/app_localizations.dart';
import '../models/models.dart';
import 'app_theme.dart';

/// Buyurtma holati — tarjima va rang.
String statusLabel(AppLocalizations l, OrderStatus status) => switch (status) {
      OrderStatus.pending => l.status_pending,
      OrderStatus.confirmed => l.status_confirmed,
      OrderStatus.packing => l.status_packing,
      OrderStatus.handedToTaxi => l.status_handed_to_taxi,
      OrderStatus.delivered => l.status_delivered,
      OrderStatus.cancelled => l.status_cancelled,
    };

Color statusColor(BoyxonColors c, OrderStatus status) => switch (status) {
      OrderStatus.pending => c.accent,
      OrderStatus.confirmed => c.primary,
      OrderStatus.packing => c.primary,
      OrderStatus.handedToTaxi => const Color(0xFF3498DB),
      OrderStatus.delivered => c.success,
      OrderStatus.cancelled => c.danger,
    };

/// Status chip ranglari — web OrderDetailPage bilan bir xil:
/// pending → surface-raised; confirmed/handed → primary-100;
/// packing → primary-50; delivered → success/10; cancelled → danger/10.
(Color, Color) statusBadgeColors(BoyxonColors c, OrderStatus status) => switch (status) {
      OrderStatus.pending => (c.surfaceRaised, c.fg),
      OrderStatus.confirmed => (BoyxonPalette.primary100, BoyxonPalette.primary700),
      OrderStatus.packing => (BoyxonPalette.primary50, BoyxonPalette.primary700),
      OrderStatus.handedToTaxi => (BoyxonPalette.primary100, BoyxonPalette.primary700),
      OrderStatus.delivered => (c.success.withValues(alpha: 0.10), c.success),
      OrderStatus.cancelled => (c.danger.withValues(alpha: 0.10), c.danger),
    };

/// To'lov usuli — ko'rsatiladigan nom.
String paymentLabel(AppLocalizations l, PaymentMethod method) => switch (method) {
      PaymentMethod.cash => l.checkout_cash,
      PaymentMethod.payme => 'Payme',
      PaymentMethod.click => 'Click',
      PaymentMethod.uzum => 'Uzum Bank',
    };
