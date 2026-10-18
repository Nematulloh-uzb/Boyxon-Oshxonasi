import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:provider/provider.dart';

import '../../core/api/api_client.dart';
import '../../core/i18n/app_i18n.dart';
import '../../core/session/session_controller.dart';
import '../../core/utils/formatters.dart';
import '../../data/models/dish.dart';
import '../../data/services/user_service.dart';
import '../../theme/app_text.dart';
import '../../theme/app_theme.dart';
import 'dish_card.dart';

/// Taom tafsiloti — pastdan chiqadigan panel.
///
/// [onAdd] — savatga qo'shilganda chaqiriladi (menyu ekranidagi toast uchun).
Future<void> showDishSheet(
  BuildContext context,
  Dish dish, {
  void Function(Dish dish, int qty)? onAdd,
}) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: context.palette.card,
    builder: (_) => _DishSheet(dish: dish, onAdd: onAdd),
  );
}

class _DishSheet extends StatefulWidget {
  const _DishSheet({required this.dish, this.onAdd});

  final Dish dish;
  final void Function(Dish dish, int qty)? onAdd;

  @override
  State<_DishSheet> createState() => _DishSheetState();
}

class _DishSheetState extends State<_DishSheet> {
  int _qty = 1;
  bool _fav = false;
  bool _favBusy = false;

  @override
  void initState() {
    super.initState();
    final user = context.read<SessionController>().user;
    _fav = user?.favorites.contains(widget.dish.id) ?? false;
  }

  void _snack(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.maybeOf(context)
      ?..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(msg)));
  }

  Future<void> _toggleFav() async {
    if (_favBusy) return;
    final session = context.read<SessionController>();
    if (!session.isAuthed) {
      _snack(context.tr('auth.signin'));
      return;
    }
    setState(() => _favBusy = true);
    try {
      final nowFav = await UserService.I.toggleFavorite(widget.dish.id);
      await session.refreshUser();
      if (mounted) setState(() => _fav = nowFav);
    } on ApiException catch (e) {
      _snack(e.message);
    } catch (_) {
      _snack(context.tr('common.error'));
    } finally {
      if (mounted) setState(() => _favBusy = false);
    }
  }

  void _submit() {
    widget.onAdd?.call(widget.dish, _qty);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final d = widget.dish;
    final locale = AppI18n.I.locale.value;
    final img = d.image;

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.paddingOf(context).bottom + 8),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: SizedBox(
                  height: 200,
                  width: double.infinity,
                  child: (img != null && img.isNotEmpty)
                      ? CachedNetworkImage(
                          imageUrl: img,
                          fit: BoxFit.cover,
                          placeholder: (_, _) => Container(color: p.cardLow),
                          errorWidget: (_, _, _) => _placeholder(context),
                        )
                      : _placeholder(context),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          d.nameFor(locale),
                          style: AppText.headlineSm.copyWith(color: p.onSurface),
                        ),
                      ),
                      Material(
                        color: _fav ? p.primaryFixed : p.cardLow,
                        shape: const CircleBorder(),
                        child: InkWell(
                          customBorder: const CircleBorder(),
                          onTap: _toggleFav,
                          child: Padding(
                            padding: const EdgeInsets.all(10),
                            child: Icon(
                              _fav ? Icons.favorite : Icons.favorite_border,
                              size: 22,
                              color: _fav ? p.onPrimaryFixed : p.onSurfaceVariant,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Icons.star, size: 16, color: p.primary),
                      const SizedBox(width: 4),
                      Text(
                        d.rating.toStringAsFixed(1),
                        style: AppText.labelMd.copyWith(color: p.onSurface),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        context.tr('dish.reviews_count', {'count': '${d.reviewCount}'}),
                        style: AppText.bodySm.copyWith(color: p.onSurfaceVariant),
                      ),
                      if (d.categoryName != null && d.categoryName!.isNotEmpty) ...[
                        Text(' • ', style: AppText.bodySm.copyWith(color: p.outline)),
                        Text(
                          d.categoryName!,
                          style: AppText.bodySm.copyWith(color: p.onSurfaceVariant),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    d.descriptionFor(locale),
                    style: AppText.bodyMd.copyWith(color: p.onSurfaceVariant),
                  ),
                  if (d.tags.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        for (final t in d.tags.take(6))
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: p.cardLow,
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              t,
                              style: AppText.labelSm.copyWith(color: p.onSurfaceVariant),
                            ),
                          ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Icon(Symbols.schedule, size: 16, color: p.onSurfaceVariant),
                      const SizedBox(width: 4),
                      Text(
                        '${d.deliveryTime} ${context.tr('app.minutes_short')}',
                        style: AppText.bodySm.copyWith(color: p.onSurfaceVariant),
                      ),
                      if (d.calories != null && d.calories! > 0) ...[
                        const SizedBox(width: 16),
                        Icon(Symbols.local_fire_department, size: 16, color: p.onSurfaceVariant),
                        const SizedBox(width: 4),
                        Text(
                          '${d.calories} ${context.tr('app.calories_short')}',
                          style: AppText.bodySm.copyWith(color: p.onSurfaceVariant),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      _QtyStepper(
                        value: _qty,
                        onChanged: (v) => setState(() => _qty = v < 1 ? 1 : v),
                      ),
                      const Spacer(),
                      Text(
                        Fmt.money(d.price * _qty),
                        style: AppText.headlineSm.copyWith(color: p.accent),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Material(
                    borderRadius: BorderRadius.circular(12),
                    child: Ink(
                      height: 50,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [p.gradientStart, p.gradientMid],
                        ),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(color: p.shadow, blurRadius: 16, offset: const Offset(0, 6)),
                        ],
                      ),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(12),
                        onTap: _submit,
                        child: Center(
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Symbols.shopping_bag, size: 18, color: Colors.white),
                              const SizedBox(width: 8),
                              Text(
                                context.tr('dish.add_to_cart'),
                                style: AppText.labelLg.copyWith(color: Colors.white),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
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
            iconForCategory(widget.dish.categorySlug),
            size: 54,
            color: p.outline.withValues(alpha: 0.4),
          ),
          const SizedBox(height: 6),
          Text(
            context.tr('dish.no_image'),
            style: AppText.bodyMd.copyWith(color: p.onSurfaceVariant),
          ),
        ],
      ),
    );
  }
}

/// Miqdor tanlash (− / +).
class _QtyStepper extends StatelessWidget {
  const _QtyStepper({required this.value, required this.onChanged});

  final int value;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    return Container(
      decoration: BoxDecoration(
        color: p.cardLow,
        borderRadius: BorderRadius.circular(999),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
      child: Row(
        children: [
          IconButton(
            onPressed: () => onChanged(value - 1),
            icon: Icon(Symbols.remove, size: 20, color: p.onSurface),
            visualDensity: VisualDensity.compact,
            splashRadius: 20,
          ),
          SizedBox(
            width: 28,
            child: Text(
              '$value',
              textAlign: TextAlign.center,
              style: AppText.labelLg.copyWith(color: p.onSurface),
            ),
          ),
          IconButton(
            onPressed: () => onChanged(value + 1),
            icon: Icon(Symbols.add, size: 20, color: p.primary),
            visualDensity: VisualDensity.compact,
            splashRadius: 20,
          ),
        ],
      ),
    );
  }
}
