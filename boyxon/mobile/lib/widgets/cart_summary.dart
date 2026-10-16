import 'package:flutter/material.dart';

import '../core/app_theme.dart';
import '../core/constants.dart';
import '../core/formatters.dart';
import '../l10n/app_localizations.dart';
import 'ui_kit.dart';

/// Hisob-kitob kartasi — web `CartSummary` bilan 1:1.
/// Yetkazish "bepul" emas — mijozning cho'ntagida qoladigan pul sifatida.
class CartSummary extends StatelessWidget {
  const CartSummary({
    super.key,
    required this.subtotal,
    required this.deliveryFee,
    required this.discount,
    required this.total,
  });

  final int subtotal;
  final int deliveryFee;
  final int discount;
  final int total;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;
    final toFree = (freeDeliveryFrom - subtotal).clamp(0, freeDeliveryFrom);
    final progress = (subtotal / freeDeliveryFrom).clamp(0.0, 1.0);

    Widget row(String label, String value, {Color? valueColor}) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Row(
          children: [
            Text(label, style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.subtle)),
            const Spacer(),
            Text(
              value,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: valueColor ?? c.fg,
              ),
            ),
          ],
        ),
      );
    }

    return CardBox(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          row(l.cart_subtotal, formatPrice(subtotal)),
          row(l.cart_delivery, deliveryFee == 0 ? l.cart_free : formatPrice(deliveryFee)),
          if (discount > 0) row(l.cart_discount, '−${formatPrice(discount)}', valueColor: c.success),
          if (subtotal > 0 && toFree > 0)
            Container(
              width: double.infinity,
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: BoyxonPalette.primary50,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l.cart_free_hint(formatPrice(toFree), formatPrice(deliveryFee)),
                    style: const TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: BoyxonPalette.primary700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: LinearProgressIndicator(
                      value: progress,
                      minHeight: 6,
                      backgroundColor: BoyxonPalette.primary100,
                      valueColor: const AlwaysStoppedAnimation(BoyxonPalette.primary),
                    ),
                  ),
                ],
              ),
            ),
          if (subtotal >= freeDeliveryFrom)
            Container(
              width: double.infinity,
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: c.success.withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                l.cart_free_done(formatPrice(deliveryFee)),
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: c.success,
                ),
              ),
            ),
          Container(
            padding: const EdgeInsets.only(top: 10),
            decoration: BoxDecoration(border: Border(top: BorderSide(color: c.line))),
            child: Row(
              children: [
                Text(
                  l.cart_total,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: c.fg,
                  ),
                ),
                const Spacer(),
                Text(
                  formatPrice(total),
                  style: const TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: BoyxonPalette.primaryDark,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
