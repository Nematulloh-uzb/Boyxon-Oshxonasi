import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api_client.dart';
import '../../core/app_theme.dart';
import '../../core/constants.dart';
import '../../core/formatters.dart';
import '../../l10n/app_localizations.dart';
import '../../models/models.dart';
import '../../services/cart_service.dart';
import '../../services/settings_service.dart';
import '../../widgets/dish_card.dart';
import '../../widgets/dish_filter_sheet.dart';
import '../../widgets/state_views.dart';
import '../../widgets/ui_kit.dart';
import 'dish_screen.dart';

/// Bosh sahifa — web `HomePage` bilan 1:1:
/// salomlashuv → qidiruv + filtr → hero banner → kategoriyalar →
/// "Mashhur taomlar" (gorizontal) → "Barcha taomlar" (grid).
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _api = ApiClient.instance;
  final _searchCtrl = TextEditingController();
  final _searchFocus = FocusNode();
  final _scrollCtrl = ScrollController();
  Timer? _debounce;

  List<Category> _categories = [];
  List<Dish> _featured = [];
  List<Dish> _dishes = [];

  bool _loading = true;
  bool _loadingMore = false;
  Object? _error;

  int _page = 1;
  int _pages = 1;
  int _total = 0;
  // Server `category` parametrini **slug** bo'yicha filtrlaydi (web ham shunday
  // yuboradi) — _id emas, slug saqlanadi.
  String? _categorySlug;
  String _search = '';
  DishFilterValues _filters = const DishFilterValues();

  @override
  void initState() {
    super.initState();
    _loadInitial();
    _scrollCtrl.addListener(_onScroll);
    _searchFocus.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchCtrl.dispose();
    _searchFocus.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollCtrl.position.pixels >= _scrollCtrl.position.maxScrollExtent - 400) {
      _loadMore();
    }
  }

  Map<String, dynamic> _dishQuery({required int page}) => {
        'page': page,
        'limit': 12,
        if (_categorySlug != null) 'category': _categorySlug,
        if (_search.isNotEmpty) 'search': _search,
        if (_filters.minPrice != null) 'minPrice': _filters.minPrice,
        if (_filters.maxPrice != null) 'maxPrice': _filters.maxPrice,
        if (_filters.rating != null) 'rating': _filters.rating,
        if (_filters.tags != null && _filters.tags!.isNotEmpty) 'tags': _filters.tags,
        if (_filters.sort != null) 'sort': _filters.sort,
      };

  Future<void> _loadInitial() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = await Future.wait<Response>([
        _api.dio.get('/categories'),
        _api.dio.get('/dishes/featured'),
        _api.dio.get('/dishes', queryParameters: _dishQuery(page: 1)),
      ]);

      final cats = ((results[0].data as Map)['data'] as List)
          .map((e) => Category.fromJson(e as Map<String, dynamic>))
          .toList();
      final featured = ((results[1].data as Map)['data'] as List)
          .map((e) => Dish.fromJson(e as Map<String, dynamic>))
          .toList();
      final paged = results[2].data as Map;
      final dishes = (paged['data'] as List)
          .map((e) => Dish.fromJson(e as Map<String, dynamic>))
          .toList();
      final pagination = paged['pagination'] as Map?;

      if (!mounted) return;
      setState(() {
        _categories = cats;
        _featured = featured;
        _dishes = dishes;
        _page = ((pagination?['page'] ?? 1) as num).toInt();
        _pages = ((pagination?['pages'] ?? 1) as num).toInt();
        _total = ((pagination?['total'] ?? dishes.length) as num).toInt();
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

  Future<void> _loadDishes() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await _api.dio.get('/dishes', queryParameters: _dishQuery(page: 1));
      final paged = res.data as Map;
      final dishes = (paged['data'] as List)
          .map((e) => Dish.fromJson(e as Map<String, dynamic>))
          .toList();
      final pagination = paged['pagination'] as Map?;
      if (!mounted) return;
      setState(() {
        _dishes = dishes;
        _page = ((pagination?['page'] ?? 1) as num).toInt();
        _pages = ((pagination?['pages'] ?? 1) as num).toInt();
        _total = ((pagination?['total'] ?? dishes.length) as num).toInt();
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

  Future<void> _loadMore() async {
    if (_loadingMore || _loading || _page >= _pages) return;
    setState(() => _loadingMore = true);
    try {
      final res = await _api.dio.get('/dishes', queryParameters: _dishQuery(page: _page + 1));
      final paged = res.data as Map;
      final more = (paged['data'] as List)
          .map((e) => Dish.fromJson(e as Map<String, dynamic>))
          .toList();
      final pagination = paged['pagination'] as Map?;
      if (!mounted) return;
      setState(() {
        _dishes = [..._dishes, ...more];
        _page = ((pagination?['page'] ?? _page + 1) as num).toInt();
        _pages = ((pagination?['pages'] ?? _pages) as num).toInt();
        _total = ((pagination?['total'] ?? _total) as num).toInt();
        _loadingMore = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loadingMore = false);
    }
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      _search = value.trim();
      _loadDishes();
    });
  }

  void _selectCategory(String? slug) {
    setState(() => _categorySlug = slug);
    _loadDishes();
  }

  Future<void> _openFilter() async {
    final result = await showDishFilterSheet(context, _filters);
    if (result == null || !mounted) return;
    setState(() => _filters = result);
    _loadDishes();
  }

  void _openDish(Dish dish) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => DishScreen(slug: dish.slug)),
    );
  }

  void _addToCart(Dish dish, String lang) {
    context.read<CartService>().add(dish);
    final l = AppLocalizations.of(context);
    ScaffoldMessenger.of(context)
      ..clearSnackBars()
      ..showSnackBar(
        SnackBar(
          duration: const Duration(seconds: 2),
          content: Text(l.dish_added_name(dish.localizedName(lang))),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;
    final lang = context.watch<SettingsService>().languageCode;
    final width = MediaQuery.sizeOf(context).width;
    final itemWidth = (width - 32 - 16) / 2;
    final itemExtent = itemWidth * 0.75 + 176;

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          color: c.primary,
          onRefresh: _loadInitial,
          child: CustomScrollView(
            controller: _scrollCtrl,
            slivers: [
              // Salomlashuv.
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                sliver: SliverToBoxAdapter(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${l.home_greeting} 👋',
                        style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.subtle),
                      ),
                      Text(
                        l.home_title,
                        style: TextStyle(
                          fontFamily: 'Epilogue',
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          height: 1.2,
                          color: c.fg,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Qidiruv + filtr tugmasi.
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                sliver: SliverToBoxAdapter(child: _searchRow(c, l)),
              ),

              // Hero banner.
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
                sliver: SliverToBoxAdapter(child: _heroBanner(l, c)),
              ),

              // Kategoriyalar.
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(0, 24, 0, 0),
                sliver: SliverToBoxAdapter(
                  child: _loading
                      ? _categorySkeleton()
                      : SizedBox(
                          height: 36,
                          child: ListView.separated(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            scrollDirection: Axis.horizontal,
                            itemCount: _categories.length + 1,
                            separatorBuilder: (_, _) => const SizedBox(width: 8),
                            itemBuilder: (context, i) {
                              if (i == 0) {
                                return _categoryChip(
                                  Icons.grid_view_rounded,
                                  l.home_all,
                                  _categorySlug == null,
                                  () => _selectCategory(null),
                                );
                              }
                              final cat = _categories[i - 1];
                              return _categoryChip(
                                categoryIcon(cat.icon),
                                cat.localizedName(lang),
                                _categorySlug == cat.slug,
                                () => _selectCategory(cat.slug),
                              );
                            },
                          ),
                        ),
                ),
              ),

              // Mashhur taomlar (gorizontal).
              if (_loading || _featured.isNotEmpty) ...[
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
                  sliver: SliverToBoxAdapter(
                    child: Text(
                      l.home_featured,
                      style: TextStyle(
                        fontFamily: 'Epilogue',
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: c.fg,
                      ),
                    ),
                  ),
                ),
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 368,
                    child: _loading
                        ? ListView.separated(
                            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                            scrollDirection: Axis.horizontal,
                            itemCount: 3,
                            separatorBuilder: (_, _) => const SizedBox(width: 16),
                            itemBuilder: (_, _) => const SkeletonBox(width: 256, height: 356, radius: 20),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                            scrollDirection: Axis.horizontal,
                            itemCount: _featured.length,
                            separatorBuilder: (_, _) => const SizedBox(width: 16),
                            itemBuilder: (context, i) => SizedBox(
                              width: 256,
                              child: DishCard(
                                dish: _featured[i],
                                lang: lang,
                                onTap: () => _openDish(_featured[i]),
                                onAdd: () => _addToCart(_featured[i], lang),
                              ),
                            ),
                          ),
                  ),
                ),
              ],

              // Barcha taomlar sarlavhasi.
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
                sliver: SliverToBoxAdapter(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        l.home_all_dishes,
                        style: TextStyle(
                          fontFamily: 'Epilogue',
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: c.fg,
                        ),
                      ),
                      Text(
                        l.home_items_count(_total),
                        style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.subtle),
                      ),
                    ],
                  ),
                ),
              ),

              // Grid / holatlar.
              if (_loading)
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                  sliver: SliverGrid.builder(
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 16,
                      crossAxisSpacing: 16,
                      mainAxisExtent: itemExtent,
                    ),
                    itemCount: 4,
                    itemBuilder: (_, _) => const SkeletonBox(radius: 20),
                  ),
                )
              else if (_error != null)
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                  sliver: SliverToBoxAdapter(
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: c.danger.withValues(alpha: 0.10),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Column(
                        children: [
                          Text(
                            l.home_load_error,
                            textAlign: TextAlign.center,
                            style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.danger),
                          ),
                          const SizedBox(height: 8),
                          GestureDetector(
                            onTap: _loadDishes,
                            child: Text(
                              l.common_retry,
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: BoyxonPalette.primaryDark,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              else if (_dishes.isEmpty)
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: EmptyView(
                    icon: Icons.restaurant_rounded,
                    title: l.home_no_dishes,
                    subtitle: l.home_no_dishes_hint,
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                  sliver: SliverGrid.builder(
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 16,
                      crossAxisSpacing: 16,
                      mainAxisExtent: itemExtent,
                    ),
                    itemCount: _dishes.length,
                    itemBuilder: (context, i) {
                      final dish = _dishes[i];
                      return DishCard(
                        dish: dish,
                        lang: lang,
                        onTap: () => _openDish(dish),
                        onAdd: () => _addToCart(dish, lang),
                      );
                    },
                  ),
                ),

              if (_loadingMore)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    child: Center(
                      child: SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(strokeWidth: 2.4, color: c.primary),
                      ),
                    ),
                  ),
                ),

              const SliverToBoxAdapter(child: SizedBox(height: 16)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _searchRow(BoyxonColors c, AppLocalizations l) {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 48,
            decoration: BoxDecoration(
              color: c.surface,
              borderRadius: BorderRadius.circular(999),
              border: Border.all(color: _searchFocus.hasFocus ? c.primary : c.line),
            ),
            child: Row(
              children: [
                const SizedBox(width: 14),
                Icon(Icons.search_rounded, size: 20, color: c.subtle),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _searchCtrl,
                    focusNode: _searchFocus,
                    onChanged: _onSearchChanged,
                    style: TextStyle(fontFamily: 'Inter', fontSize: 15, color: c.fg),
                    decoration: InputDecoration.collapsed(
                      hintText: l.home_search,
                      hintStyle: TextStyle(fontFamily: 'Inter', fontSize: 15, color: c.subtle),
                    ),
                  ),
                ),
                if (_searchCtrl.text.isNotEmpty)
                  GestureDetector(
                    onTap: () {
                      _searchCtrl.clear();
                      _onSearchChanged('');
                      setState(() {});
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      child: Icon(Icons.close_rounded, size: 18, color: c.subtle),
                    ),
                  )
                else
                  const SizedBox(width: 14),
              ],
            ),
          ),
        ),
        const SizedBox(width: 8),
        Material(
          color: c.surface,
          shape: StadiumBorder(side: BorderSide(color: c.line)),
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: _openFilter,
            child: SizedBox(
              width: 48,
              height: 48,
              child: Icon(Icons.tune_rounded, size: 20, color: c.fgMuted),
            ),
          ),
        ),
      ],
    );
  }

  Widget _heroBanner(AppLocalizations l, BoyxonColors c) {
    final cart = context.watch<CartService>();
    final subtotal = cart.subtotal;
    final unlocked = subtotal >= freeDeliveryFrom;
    final progress = (subtotal / freeDeliveryFrom).clamp(0.0, 1.0);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: BoyxonPalette.heroGradient,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l.home_new_season,
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.white.withValues(alpha: 0.8),
            ),
          ),
          Text(
            l.home_promo_title,
            style: const TextStyle(
              fontFamily: 'Epilogue',
              fontSize: 24,
              fontWeight: FontWeight.w800,
              height: 1.2,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            l.home_promo_code,
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 14,
              color: Colors.white.withValues(alpha: 0.8),
            ),
          ),
          const SizedBox(height: 16),
          if (unlocked)
            Text(
              l.home_promo_unlocked(formatPrice(deliveryFee)),
              style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            )
          else ...[
            Text(
              l.home_promo_progress(
                formatPrice(subtotal == 0 ? freeDeliveryFrom : freeDeliveryFrom - subtotal),
                formatPrice(deliveryFee),
              ),
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.white.withValues(alpha: 0.9),
              ),
            ),
            if (subtotal > 0) ...[
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(999),
                child: LinearProgressIndicator(
                  value: progress,
                  minHeight: 8,
                  backgroundColor: Colors.white.withValues(alpha: 0.25),
                  valueColor: const AlwaysStoppedAnimation(Colors.white),
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }

  Widget _categorySkeleton() {
    return SizedBox(
      height: 36,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: 6,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (_, _) => const SkeletonBox(width: 96, height: 36, radius: 999),
      ),
    );
  }

  Widget _categoryChip(IconData icon, String label, bool selected, VoidCallback onTap) {
    final c = context.c;
    return Material(
      color: selected ? BoyxonPalette.primary : c.surface,
      shape: StadiumBorder(side: BorderSide(color: selected ? BoyxonPalette.primary : c.line)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 16, color: selected ? Colors.white : c.fgMuted),
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: selected ? Colors.white : c.fgMuted,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
