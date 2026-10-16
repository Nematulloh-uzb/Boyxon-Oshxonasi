import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api_client.dart';
import '../../core/app_theme.dart';
import '../../core/formatters.dart';
import '../../l10n/app_localizations.dart';
import '../../models/models.dart';
import '../../services/cart_service.dart';
import '../../services/settings_service.dart';
import '../../widgets/quantity_stepper.dart';
import '../../widgets/state_views.dart';

class DishScreen extends StatefulWidget {
  const DishScreen({super.key, required this.slug});

  final String slug;

  @override
  State<DishScreen> createState() => _DishScreenState();
}

class _DishScreenState extends State<DishScreen> {
  final _api = ApiClient.instance;

  Dish? _dish;
  bool _loading = true;
  Object? _error;
  int _qty = 1;

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
      if (!mounted) return;
      setState(() {
        _dish = dish;
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
    context.read<CartService>().add(dish, qty: _qty);
    final l = AppLocalizations.of(context);
    ScaffoldMessenger.of(context)
      ..clearSnackBars()
      ..showSnackBar(SnackBar(content: Text(l.dish_added)));
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;
    final lang = context.watch<SettingsService>().languageCode;
    final dish = _dish;

    return Scaffold(
      body: _loading
          ? const SafeArea(child: LoadingView())
          : _error != null || dish == null
              ? SafeArea(
                  child: Column(
                    children: [
                      Align(
                        alignment: Alignment.centerLeft,
                        child: IconButton(
                          icon: const Icon(Icons.arrow_back_rounded),
                          onPressed: () => Navigator.of(context).maybePop(),
                        ),
                      ),
                      Expanded(
                        child: ErrorView(
                          message: _error != null ? errorText(_error!, l) : l.dish_not_found,
                          onRetry: _load,
                          retryLabel: l.common_retry,
                        ),
                      ),
                    ],
                  ),
                )
              : CustomScrollView(
                  slivers: [
                    SliverAppBar(
                      expandedHeight: 280,
                      pinned: true,
                      leading: Padding(
                        padding: const EdgeInsets.all(6),
                        child: Material(
                          color: Theme.of(context).cardColor.withValues(alpha: 0.9),
                          shape: const CircleBorder(),
                          child: IconButton(
                            icon: const Icon(Icons.arrow_back_rounded),
                            onPressed: () => Navigator.of(context).maybePop(),
                          ),
                        ),
                      ),
                      flexibleSpace: FlexibleSpaceBar(
                        background: DishImage(url: dish.imageUrl),
                      ),
                    ),
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              dish.localizedName(lang),
                              style: Theme.of(context).textTheme.headlineMedium,
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.star_rounded, size: 18, color: Color(0xFFF39C12)),
                                const SizedBox(width: 4),
                                Text(
                                  dish.rating.toStringAsFixed(1),
                                  style: TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: c.fg,
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Icon(Icons.schedule_rounded, size: 16, color: c.subtle),
                                const SizedBox(width: 4),
                                Text(
                                  l.dish_min('${dish.deliveryTime}'),
                                  style: TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 13,
                                    color: c.subtle,
                                  ),
                                ),
                                if (dish.calories != null) ...[
                                  const SizedBox(width: 14),
                                  Icon(Icons.local_fire_department_rounded, size: 16, color: c.subtle),
                                  const SizedBox(width: 4),
                                  Text(
                                    l.dish_kcal('${dish.calories}'),
                                    style: TextStyle(
                                      fontFamily: 'Inter',
                                      fontSize: 13,
                                      color: c.subtle,
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            if (dish.tags.isNotEmpty) ...[
                              const SizedBox(height: 14),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: [
                                  for (final tag in dish.tags)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                      decoration: BoxDecoration(
                                        color: c.primary.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(999),
                                      ),
                                      child: Text(
                                        tag,
                                        style: TextStyle(
                                          fontFamily: 'Inter',
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: c.primaryDark,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ],
                            if (dish.localizedDescription(lang).isNotEmpty) ...[
                              const SizedBox(height: 24),
                              Text(l.dish_about, style: Theme.of(context).textTheme.titleMedium),
                              const SizedBox(height: 8),
                              Text(
                                dish.localizedDescription(lang),
                                style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 14,
                                  height: 1.5,
                                  color: c.subtle,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
      bottomNavigationBar: dish == null || _error != null
          ? null
          : SafeArea(
              child: Container(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                decoration: BoxDecoration(
                  color: c.surface,
                  border: Border(top: BorderSide(color: c.line)),
                ),
                child: Row(
                  children: [
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          formatPrice(dish.price),
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                            color: c.primaryDark,
                          ),
                        ),
                        if (dish.oldPrice != null && dish.oldPrice! > dish.price)
                          Text(
                            formatPrice(dish.oldPrice!),
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 12,
                              color: c.subtle,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                      ],
                    ),
                    const Spacer(),
                    QuantityStepper(
                      value: _qty,
                      compact: true,
                      onChanged: (v) => setState(() => _qty = v < 1 ? 1 : v),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: FilledButton(
                        onPressed: _addToCart,
                        style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(48)),
                        child: Text(l.dish_add),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
