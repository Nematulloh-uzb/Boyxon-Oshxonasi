import 'package:flutter/material.dart';

import '../core/app_theme.dart';
import '../core/formatters.dart';
import '../l10n/app_localizations.dart';
import '../models/models.dart';
import 'state_views.dart';
import 'ui_kit.dart';

/// Menyudagi taom kartochkasi — web `DishCard` bilan 1:1:
/// 4:3 rasm → nom (Epilogue 16 semibold) + reyting yulduzi → 2 qator tavsif →
/// tayyorlanish vaqti + parhez/top badgelari → narx + dumaloq "+" (40x40).
class DishCard extends StatelessWidget {
  const DishCard({
    super.key,
    required this.dish,
    required this.lang,
    required this.onTap,
    this.onAdd,
  });

  final Dish dish;

  /// Joriy til (`uz` / `ru` / `en`) — nom va tavsif shu tilda ko'rsatiladi.
  final String lang;
  final VoidCallback onTap;
  final VoidCallback? onAdd;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final l = AppLocalizations.of(context);
    final hasOldPrice = dish.oldPrice != null && dish.oldPrice! > dish.price;
    final hasImage = dish.imageUrl != null && dish.imageUrl!.isNotEmpty;
    final isVegetarian = dish.tags.contains('vegetarian');

    return Material(
      color: c.surface,
      borderRadius: BorderRadius.circular(20),
      clipBehavior: Clip.antiAlias,
      child: Ink(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: c.line.withValues(alpha: 0.6)),
        ),
        child: InkWell(
          onTap: onTap,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Web: aspect-[4/3] rasm; rasm yo'q/xato bo'lsa — DishPlaceholder.
              if (hasImage)
                AspectRatio(
                  aspectRatio: 4 / 3,
                  child: DishImage(url: dish.imageUrl),
                )
              else
                const DishPlaceholder(),
              Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Nom + reyting.
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            dish.localizedName(lang),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontFamily: 'Epilogue',
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: c.fg,
                              height: 1.2,
                            ),
                          ),
                        ),
                        if (dish.rating > 0) ...[
                          const SizedBox(width: 8),
                          StarRating(rating: dish.rating),
                        ],
                      ],
                    ),
                    const SizedBox(height: 8),
                    // Tavsif — 2 qator.
                    Text(
                      dish.localizedDescription(lang),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 14,
                        height: 1.35,
                        color: c.subtle,
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Tayyorlanish vaqti + badgelar.
                    Row(
                      children: [
                        Icon(Icons.timer_outlined, size: 14, color: c.subtle),
                        const SizedBox(width: 4),
                        Text(
                          '${dish.deliveryTime} ${l.dish_min_short}',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 12,
                            height: 1.35,
                            color: c.subtle,
                          ),
                        ),
                        if (isVegetarian) ...[
                          const SizedBox(width: 12),
                          BadgePill(label: l.dish_diet, tone: BadgeTone.success),
                        ],
                        if (dish.isFeatured) ...[
                          const SizedBox(width: 6),
                          BadgePill(label: l.dish_top, tone: BadgeTone.promo),
                        ],
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Narx + savatga qo'shish.
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                formatPrice(dish.price),
                                style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: c.fg,
                                  height: 1.2,
                                ),
                              ),
                              if (hasOldPrice)
                                Text(
                                  formatPrice(dish.oldPrice!),
                                  style: TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 12,
                                    color: c.subtle,
                                    height: 1.2,
                                    decoration: TextDecoration.lineThrough,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        if (onAdd != null)
                          Material(
                            color: c.primary,
                            shape: const CircleBorder(),
                            child: InkWell(
                              onTap: onAdd,
                              customBorder: const CircleBorder(),
                              child: const SizedBox(
                                width: 40,
                                height: 40,
                                child: Icon(Icons.add_rounded, size: 20, color: Colors.white),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
