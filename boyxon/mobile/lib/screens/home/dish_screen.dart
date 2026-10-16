import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api_client.dart';
import '../../core/app_theme.dart';
import '../../core/formatters.dart';
import '../../l10n/app_localizations.dart';
import '../../models/models.dart';
import '../../services/cart_service.dart';
import '../../services/settings_service.dart';
import '../../widgets/state_views.dart';
import '../../widgets/ui_kit.dart';

/// Bitta taom sahifasi — web `DishPage` bilan 1:1:
/// orqaga havola → karta (16:9 rasm, sarlavha + reyting, meta, tavsif,
/// narx + "Savatga qo'shish") → sharhlar bo'limi.
class DishScreen extends StatefulWidget {
  const DishScreen({super.key, required this.slug});

  final String slug;

  @override
  State<DishScreen> createState() => _DishScreenState();
}

class _DishScreenState extends State<DishScreen> {
  final _api = ApiClient.instance;

  Dish? _dish;
  List<_Review> _reviews = [];
  bool _loading = true;
  Object? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await _api.dio.get('/dishes/${Uri.encodeComponent(widget.slug)}');
      final data = (res.data as Map)['data'] as Map;
      final dish = Dish.fromJson(data['dish'] as Map<String, dynamic>);
      final reviews = ((data['reviews'] ?? []) as List)
          .map((e) => _Review.fromJson(e as Map<String, dynamic>))
          .toList();
      if (!mounted) return;
      setState(() {
        _dish = dish;
        _reviews = reviews;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e;
        _loading = false;
      });
    }
  }

  void _addToCart() {
    final dish = _dish;
    if (dish == null) return;
    context.read<CartService>().add(dish, qty: 1);
    final l = AppLocalizations.of(context);
    final lang = context.read<SettingsService>().languageCode;
    ScaffoldMessenger.of(context)
      ..clearSnackBars()
      ..showSnackBar(SnackBar(content: Text(l.dish_added_name(dish.localizedName(lang)))));
  }

  void _back() => Navigator.of(context).maybePop();

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;
    final lang = context.watch<SettingsService>().languageCode;
    final dish = _dish;

    Widget backRow() => GestureDetector(
          onTap: _back,
          behavior: HitTestBehavior.opaque,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.arrow_back_rounded, size: 16, color: c.fgMuted),
              const SizedBox(width: 6),
              Text(
                l.dish_back_to_menu,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: c.fgMuted,
                ),
              ),
            ],
          ),
        );

    Widget content;
    if (_loading) {
      content = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          backRow(),
          const SizedBox(height: 16),
          const ClipRRect(
            borderRadius: BorderRadius.all(Radius.circular(20)),
            child: AspectRatio(aspectRatio: 16 / 9, child: SkeletonBox(radius: 20)),
          ),
          const SizedBox(height: 16),
          const SkeletonBox(width: 220, height: 28, radius: 8),
          const SizedBox(height: 12),
          const SkeletonBox(height: 16, radius: 8),
          const SizedBox(height: 8),
          const SkeletonBox(width: 260, height: 16, radius: 8),
        ],
      );
    } else if (_error != null || dish == null) {
      content = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          backRow(),
          const SizedBox(height: 60),
          Center(
            child: Column(
              children: [
                Text(
                  l.dish_not_found,
                  style: TextStyle(fontFamily: 'Inter', fontSize: 15, color: c.subtle),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: 220,
                  child: OutlinePill(
                    label: l.dish_back_to_menu,
                    icon: Icons.arrow_back_rounded,
                    onPressed: _back,
                  ),
                ),
              ],
            ),
          ),
        ],
      );
    } else {
      final hasImage = dish.imageUrl != null && dish.imageUrl!.isNotEmpty;
      final hasOldPrice = dish.oldPrice != null && dish.oldPrice! > dish.price;

      content = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          backRow(),
          const SizedBox(height: 16),

          // Asosiy karta.
          CardBox(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (hasImage)
                  AspectRatio(aspectRatio: 16 / 9, child: DishImage(url: dish.imageUrl))
                else
                  const DishPlaceholder(),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Sarlavha + reyting.
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              dish.localizedName(lang),
                              style: TextStyle(
                                fontFamily: 'Epilogue',
                                fontSize: 24,
                                fontWeight: FontWeight.w800,
                                height: 1.15,
                                color: c.fg,
                              ),
                            ),
                          ),
                          if (dish.rating > 0) ...[
                            const SizedBox(width: 12),
                            Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: StarRating(rating: dish.rating, iconSize: 16, fontSize: 14),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Vaqt / kaloriya / badgelar.
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          Icon(Icons.timer_outlined, size: 14, color: c.subtle),
                          Text(
                            '${dish.deliveryTime} ${l.dish_min_short}',
                            style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: c.subtle),
                          ),
                          if (dish.calories != null && dish.calories! > 0)
                            Text(
                              l.dish_kcal('${dish.calories}'),
                              style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: c.subtle),
                            ),
                          if (dish.tags.contains('vegetarian'))
                            BadgePill(label: l.dish_vegetarian, tone: BadgeTone.success),
                          if (dish.tags.contains('spicy'))
                            BadgePill(label: l.dish_spicy, tone: BadgeTone.danger),
                          if (dish.isFeatured) BadgePill(label: l.dish_top, tone: BadgeTone.promo),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Tavsif.
                      Text(
                        l.dish_description.toUpperCase(),
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.6,
                          color: c.subtle,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        dish.localizedDescription(lang),
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 15,
                          height: 1.6,
                          color: c.fgMuted,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Divider(color: c.line, height: 1),
                      const SizedBox(height: 16),

                      // Narx + savatga qo'shish.
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                FittedBox(
                                  fit: BoxFit.scaleDown,
                                  alignment: Alignment.centerLeft,
                                  child: Text(
                                    formatPrice(dish.price),
                                    style: TextStyle(
                                      fontFamily: 'Epilogue',
                                      fontSize: 24,
                                      fontWeight: FontWeight.w700,
                                      height: 1.15,
                                      color: BoyxonPalette.primaryDark,
                                    ),
                                  ),
                                ),
                                if (hasOldPrice)
                                  Text(
                                    formatPrice(dish.oldPrice!),
                                    style: TextStyle(
                                      fontFamily: 'Inter',
                                      fontSize: 14,
                                      color: c.subtle,
                                      decoration: TextDecoration.lineThrough,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          GradientButton(
                            label: l.dish_add_to_cart,
                            size: GradientButtonSize.lg,
                            expand: false,
                            onPressed: _addToCart,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Sharhlar.
          Text.rich(
            TextSpan(
              text: l.dish_reviews,
              style: TextStyle(
                fontFamily: 'Epilogue',
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: c.fg,
              ),
              children: [
                const TextSpan(text: ' '),
                TextSpan(
                  text: l.dish_reviews_count(dish.reviewCount),
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 14,
                    fontWeight: FontWeight.w400,
                    color: c.subtle,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          if (_reviews.isNotEmpty)
            Column(
              children: [
                for (final r in _reviews) ...[
                  CardBox(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                r.userName,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                  color: c.fg,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            StarRating(rating: r.rating, iconSize: 14, fontSize: 12),
                          ],
                        ),
                        if (r.comment.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(
                            r.comment,
                            style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.subtle),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
              ],
            )
          else
            CardBox(
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Text(
                  l.dish_no_reviews,
                  style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.subtle),
                ),
              ),
            ),
        ],
      );
    }

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          child: content,
        ),
      ),
    );
  }
}

/// Sharh (web `Review` interfeysi).
class _Review {
  final double rating;
  final String comment;
  final String userName;

  _Review.fromJson(Map<String, dynamic> json)
      : rating = ((json['rating'] ?? 0) as num).toDouble(),
        comment = (json['comment'] ?? '') as String,
        userName = ((json['user'] as Map?)?['name'] ?? '—') as String;
}
