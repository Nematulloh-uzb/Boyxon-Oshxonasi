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
import '../../widgets/state_views.dart';
import 'dish_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _api = ApiClient.instance;
  final _searchCtrl = TextEditingController();
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
  String? _categoryId;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _loadInitial();
    _scrollCtrl.addListener(_onScroll);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchCtrl.dispose();
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
        if (_categoryId != null) 'category': _categoryId,
        if (_search.isNotEmpty) 'search': _search,
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

  void _selectCategory(String? id) {
    setState(() => _categoryId = id);
    _loadDishes();
  }

  void _openDish(Dish dish) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => DishScreen(slug: dish.slug)),
    );
  }

  void _addToCart(Dish dish) {
    context.read<CartService>().add(dish);
    final l = AppLocalizations.of(context);
    ScaffoldMessenger.of(context)
      ..clearSnackBars()
      ..showSnackBar(
        SnackBar(
          duration: const Duration(seconds: 1),
          content: Text(l.dish_added),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;
    final lang = context.watch<SettingsService>().languageCode;

    return Scaffold(
      body: SafeArea(
        child: _loading
            ? const LoadingView()
            : _error != null
                ? ErrorView(
                    message: errorText(_error!, l),
                    onRetry: _loadInitial,
                    retryLabel: l.common_retry,
                  )
                : RefreshIndicator(
                    color: c.primary,
                    onRefresh: _loadInitial,
                    child: CustomScrollView(
                      controller: _scrollCtrl,
                      slivers: [
                        SliverPadding(
                          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                          sliver: SliverToBoxAdapter(
                            child: TextField(
                              controller: _searchCtrl,
                              onChanged: _onSearchChanged,
                              decoration: InputDecoration(
                                hintText: l.home_search,
                                prefixIcon: Icon(Icons.search_rounded, color: c.subtle),
                                suffixIcon: _searchCtrl.text.isEmpty
                                    ? null
                                    : IconButton(
                                        icon: Icon(Icons.clear_rounded, size: 20, color: c.subtle),
                                        onPressed: () {
                                          _searchCtrl.clear();
                                          _onSearchChanged('');
                                        },
                                      ),
                              ),
                            ),
                          ),
                        ),

                        // Bepul yetkazish banneri
                        SliverToBoxAdapter(child: _FreeDeliveryBanner()),

                        // Mashhur taomlar
                        if (_featured.isNotEmpty && _search.isEmpty && _categoryId == null) ...[
                          SliverPadding(
                            padding: const EdgeInsets.fromLTRB(16, 18, 16, 0),
                            sliver: SliverToBoxAdapter(
                              child: Text(
                                l.home_featured,
                                style: Theme.of(context).textTheme.titleLarge,
                              ),
                            ),
                          ),
                          SliverToBoxAdapter(
                            child: SizedBox(
                              height: 168,
                              child: ListView.separated(
                                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                                scrollDirection: Axis.horizontal,
                                itemCount: _featured.length,
                                separatorBuilder: (_, __) => const SizedBox(width: 12),
                                itemBuilder: (context, i) => _featuredCard(_featured[i], lang),
                              ),
                            ),
                          ),
                        ],

                        // Kategoriyalar
                        SliverToBoxAdapter(
                          child: SizedBox(
                            height: 56,
                            child: ListView.separated(
                              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                              scrollDirection: Axis.horizontal,
                              itemCount: _categories.length + 1,
                              separatorBuilder: (_, __) => const SizedBox(width: 8),
                              itemBuilder: (context, i) {
                                if (i == 0) {
                                  return _categoryChip(l.home_all, _categoryId == null, () => _selectCategory(null));
                                }
                                final cat = _categories[i - 1];
                                return _categoryChip(
                                  cat.localizedName(lang),
                                  _categoryId == cat.id,
                                  () => _selectCategory(cat.id),
                                );
                              },
                            ),
                          ),
                        ),

                        if (_dishes.isEmpty)
                          SliverFillRemaining(
                            hasScrollBody: false,
                            child: EmptyView(
                              icon: Icons.search_off_rounded,
                              title: l.home_no_dishes,
                              subtitle: l.home_no_dishes_sub,
                            ),
                          )
                        else
                          SliverPadding(
                            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                            sliver: SliverGrid.builder(
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                mainAxisSpacing: 12,
                                crossAxisSpacing: 12,
                                childAspectRatio: 0.74,
                              ),
                              itemCount: _dishes.length,
                              itemBuilder: (context, i) {
                                final dish = _dishes[i];
                                return DishCard(
                                  dish: dish,
                                  title: dish.localizedName(lang),
                                  onTap: () => _openDish(dish),
                                  onAdd: () => _addToCart(dish),
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

  Widget _featuredCard(Dish dish, String lang) {
    final c = context.c;
    return SizedBox(
      width: 224,
      child: InkWell(
        onTap: () => _openDish(dish),
        borderRadius: BorderRadius.circular(20),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: c.line.withValues(alpha: 0.6)),
          ),
          clipBehavior: Clip.antiAlias,
          child: Stack(
            fit: StackFit.expand,
            children: [
              DishImage(url: dish.imageUrl),
              const DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Colors.transparent, Colors.black54, Colors.black87],
                    stops: [0.45, 0.75, 1],
                  ),
                ),
              ),
              Positioned(
                left: 12,
                right: 12,
                bottom: 12,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      dish.localizedName(lang),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontFamily: 'Epilogue',
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      formatPrice(dish.price),
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFFF39C12),
                      ),
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

  Widget _categoryChip(String label, bool selected, VoidCallback onTap) {
    final c = context.c;
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onTap(),
      selectedColor: c.primary,
      labelStyle: TextStyle(
        fontFamily: 'Inter',
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: selected ? Colors.white : c.fg,
      ),
      showCheckmark: false,
    );
  }
}

/// "Bepul yetkazishgacha X qoldi" banneri (savat bo'sh bo'lsa ko'rinmaydi).
class _FreeDeliveryBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;
    final cart = context.watch<CartService>();

    if (cart.isEmpty) return const SizedBox.shrink();

    final unlocked = cart.subtotal >= freeDeliveryFrom;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: unlocked
                ? [c.success, const Color(0xFF2EB872)]
                : [c.primary, c.accent],
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              unlocked
                  ? l.home_free_unlocked
                  : l.home_to_free(formatPrice(cart.toFree)),
              style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            if (!unlocked) ...[
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(999),
                child: LinearProgressIndicator(
                  value: cart.subtotal / freeDeliveryFrom,
                  minHeight: 6,
                  backgroundColor: Colors.white24,
                  valueColor: const AlwaysStoppedAnimation(Colors.white),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
