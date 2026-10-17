import 'package:flutter/material.dart';

import '../core/app_theme.dart';
import '../core/formatters.dart';
import '../core/order_status.dart';
import '../l10n/app_localizations.dart';
import '../models/models.dart';

/// Buyurtma kartasi (ro'yxatlar uchun) — web'dagi kabi:
/// chapda raqam + sana·taomlar soni, o'ngda jami + holat matni.
class OrderCard extends StatelessWidget {
  const OrderCard({super.key, required this.order, this.onTap});

  final Order order;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;

    return Material(
      color: c.surface,
      borderRadius: BorderRadius.circular(20),
      clipBehavior: Clip.antiAlias,
      child: Ink(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: c.line.withValues(alpha: 0.6)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 2,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        order.orderNumber,
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: c.fg,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        [
                          if (order.createdAt != null) formatDateTime(order.createdAt!),
                          l.orders_dishes_count(order.items.length),
                        ].join(' · '),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: c.subtle),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      formatPrice(order.total),
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: BoyxonPalette.primaryDark,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      statusLabel(l, order.status),
                      style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: c.subtle),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
