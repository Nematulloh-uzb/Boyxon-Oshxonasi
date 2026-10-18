import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:material_symbols_icons/symbols.dart';

import '../../core/i18n/app_i18n.dart';
import '../../core/utils/formatters.dart';
import '../../data/models/dish.dart';
import '../../theme/app_text.dart';
import '../../theme/app_theme.dart';

/// Taom kartasi (dizayn 02: "Ommabop taomlar" ro'yxati).
class DishCard extends StatelessWidget {
  const DishCard({super.key, required this.dish, this.onTap, this.onAdd});

  final Dish dish;
  final VoidCallback? onTap;
  final VoidCallback? onAdd;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final locale = AppI18n.I.locale.value;
    return Material(
      color: p.card,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _thumb(context),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      dish.nameFor(locale),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppText.labelLg.copyWith(color: p.onSurface),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      dish.descriptionFor(locale),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppText.bodySm.copyWith(color: p.onSurfaceVariant),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(Icons.star, size: 14, color: p.primary),
                                  const SizedBox(width: 3),
                                  Text(
                                    dish.rating.toStringAsFixed(1),
                                    style: AppText.labelSm.copyWith(
                                      color: p.onSurface,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  if (dish.reviewCount > 0) ...[
                                    const SizedBox(width: 3),
                                    Text(
                                      '(${dish.reviewCount})',
                                      style: AppText.bodySm.copyWith(
                                        color: p.onSurfaceVariant.withValues(alpha: 0.7),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 1),
                              Text(
                                Fmt.money(dish.price),
                                style: AppText.labelLg.copyWith(
                                  color: p.accent,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),
                        _addButton(context),
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

  Widget _thumb(BuildContext context) {
    final p = context.palette;
    final img = dish.image;
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: SizedBox(
        width: 96,
        height: 96,
        child: (img != null && img.isNotEmpty)
            ? CachedNetworkImage(
                imageUrl: img,
                fit: BoxFit.cover,
                placeholder: (_, _) => Container(color: p.cardLow),
                errorWidget: (_, _, _) => _placeholder(context),
              )
            : _placeholder(context),
      ),
    );
  }

  Widget _placeholder(BuildContext context) {
    final p = context.palette;
    return Container(
      color: p.cardLow,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            iconForCategory(dish.categorySlug),
            size: 30,
            color: p.outline.withValues(alpha: 0.4),
          ),
          const SizedBox(height: 4),
          Text(
            context.tr('dish.no_image'),
            style: AppText.bodySm.copyWith(
              color: p.onSurfaceVariant,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _addButton(BuildContext context) {
    final p = context.palette;
    return Material(
      color: p.primary,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onAdd,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Symbols.add, size: 16, color: Colors.white),
              const SizedBox(width: 4),
              Text(
                context.tr('dish.add'),
                style: AppText.labelSm.copyWith(color: Colors.white),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Kategoriya slug'iga mos ikonka (rasm yo'q holatda).
IconData iconForCategory(String? slug) {
  switch (slug) {
    case 'shorvalar':
    case 'shorva':
      return Symbols.soup_kitchen;
    case 'palovlar':
    case 'palov':
      return Symbols.rice_bowl;
    case 'somsa':
    case 'non':
    case 'nonlar':
      return Symbols.bakery_dining;
    case 'kaboblar':
    case 'kabob':
      return Symbols.kebab_dining;
    case 'shirinliklar':
    case 'shirinlik':
      return Symbols.cake;
    case 'ichimliklar':
    case 'ichimlik':
      return Symbols.local_cafe;
    case 'salatlar':
    case 'salat':
      return Symbols.eco;
    default:
      return Symbols.restaurant;
  }
}
