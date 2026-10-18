import 'dart:async';

import 'package:flutter/material.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/api/api_client.dart';
import '../../core/i18n/app_i18n.dart';
import '../../core/session/session_controller.dart';
import '../../data/models/category.dart';
import '../../data/models/dish.dart';
import '../../data/services/menu_service.dart';
import '../../data/services/notification_service.dart';
import '../../data/services/user_service.dart';
import '../../theme/app_text.dart';
import '../../theme/app_theme.dart';
import '../cart/cart_controller.dart';
import '../notifications/notifications_page.dart';
import 'dish_card.dart';
import 'dish_sheet.dart';

/// Menyu (bosh) ekrani — dizayn 02-menu-light/dark.
class HomePage extends StatefulWidget {
  const HomePage({super.key, this.onOpenCart, this.onOpenSettings});

  /// Header'dagi savat ikonkasi uchun (tab almashtirish).
  final VoidCallback? onOpenCart;

  /// Avatarga bosilganda (Sozlamalar tabi).
  final VoidCallback? onOpenSettings;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  static const _pushPromptKey = 'boyxon-push-dismissed';

  final _searchCtrl = TextEditingController();
  final _searchFocus = FocusNode();
  Timer? _debounce;
  Timer? _toastTimer;

  List<Category> _categories = [];
  List<Dish> _dishes = [];
  String? _selectedCat;
  String _sort = 'popular';
  String _search = '';
  int? _total;
  bool _showAll = false;
  bool _loading = true;
  String? _error;
  bool _pushDismissed = false;
  int _unread = 0;
  String? _toast;

  @override
  void initState() {
    super.initState();
    _load();
    _loadExtras();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _toastTimer?.cancel();
    _searchCtrl.dispose();
    _searchFocus.dispose();
    super.dispose();
  }

  // ---- Ma'lumot ----

  Future<void> _loadExtras() async {
    final sp = await SharedPreferences.getInstance();
    if (mounted) {
      setState(() => _pushDismissed = sp.getBool(_pushPromptKey) ?? false);
    }
    try {
      final c = await NotificationService.I.unreadCount();
      if (mounted) setState(() => _unread = c);
    } catch (_) {
      // Bildirishnoma xizmati ishlamasa — badge ko'rsatilmaydi.
    }
  }

  Future<void> _load({bool silent = false}) async {
    if (!silent) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }
    try {
      if (_categories.isEmpty) {
        _categories = await MenuService.I.categories();
      }

      final searching = _search.trim().isNotEmpty;
      final List<Dish> list;
      int? total;

      if (!searching && _selectedCat == null && !_showAll) {
        list = await MenuService.I.featured();
      } else {
        final r = await MenuService.I.dishes(
          search: searching ? _search.trim() : null,
          category: _selectedCat,
          sort: _sort,
          page: 1,
          limit: 50,
        );
        list = r.$1;
        total = r.$2?.total;
      }

      if (!mounted) return;
      setState(() {
        _dishes = list;
        if (total != null) _total = total;
        _loading = false;
        _error = null;
      });
      if (_total == null) unawaited(_loadTotal());
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : context.tr('home.load_error');
      });
    }
  }

  /// "Barchasi (28)" uchun umumiy soni (yengil so'rov).
  Future<void> _loadTotal() async {
    try {
      final r = await MenuService.I.dishes(page: 1, limit: 1);
      if (mounted && r.$2 != null) setState(() => _total = r.$2!.total);
    } catch (_) {}
  }

  // ---- Amallar ----

  void _showToast(String text) {
    _toastTimer?.cancel();
    setState(() => _toast = text);
    _toastTimer = Timer(const Duration(milliseconds: 2600), () {
      if (mounted) setState(() => _toast = null);
    });
  }

  void _addToCart(Dish dish, int qty) {
    context.read<CartController>().add(dish, quantity: qty);
    _showToast(
      context.tr('app.cart_added', {'name': dish.nameFor(AppI18n.I.locale.value)}),
    );
  }

  void _onSearchChanged(String v) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      if (!mounted) return;
      setState(() => _search = v);
      _load();
    });
  }

  Future<void> _openSort() async {
    final p = context.palette;
    final options = <(String, String)>[
      ('popular', context.tr('app.sort_popular')),
      ('price_asc', context.tr('app.sort_price_asc')),
      ('price_desc', context.tr('app.sort_price_desc')),
      ('rating', context.tr('app.sort_rating')),
    ];
    final picked = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: p.card,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 6, 20, 6),
              child: Text(
                context.tr('app.filters'),
                style: AppText.headlineSm.copyWith(color: p.onSurface),
              ),
            ),
            for (final o in options)
              ListTile(
                title: Text(
                  o.$2,
                  style: AppText.bodyMd.copyWith(color: p.onSurface),
                ),
                trailing: _sort == o.$1
                    ? Icon(Symbols.check, size: 20, color: p.primary)
                    : null,
                onTap: () => Navigator.pop(ctx, o.$1),
              ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
    if (!mounted || picked == null || picked == _sort) return;
    setState(() {
      _sort = picked;
      _showAll = true; // saralash — to'liq ro'yxat ustida
    });
    _load();
  }

  Future<void> _dismissPush() async {
    if (!mounted) return;
    setState(() => _pushDismissed = true);
    final sp = await SharedPreferences.getInstance();
    await sp.setBool(_pushPromptKey, true);
  }

  Future<void> _enablePush() async {
    await _dismissPush();
    if (!mounted) return;
    final session = context.read<SessionController>();
    if (!session.isAuthed) return;
    try {
      await UserService.I.updatePushEnabled(true);
      await session.refreshUser();
      if (mounted) _showToast(context.tr('settings.saved'));
    } on ApiException catch (e) {
      if (mounted) _showToast(e.message);
    } catch (_) {}
  }

  // ---- UI ----

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final session = context.watch<SessionController>();
    final cart = context.watch<CartController>();
    final user = session.user;

    return Scaffold(
      backgroundColor: p.bg,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            _header(context, cart),
            Expanded(
              child: RefreshIndicator(
                color: p.primary,
                onRefresh: () => _load(silent: true),
                child: ListView(
                  padding: const EdgeInsets.only(bottom: 28),
                  children: [
                    _toastBar(context),
                    _greeting(context, user?.name, user?.initials),
                    _searchBar(context),
                    _promoBanner(context),
                    if (!_pushDismissed) _pushCard(context),
                    _chips(context),
                    _sectionHeader(context),
                    ..._list(context),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _header(BuildContext context, CartController cart) {
    final p = context.palette;
    return Container(
      decoration: BoxDecoration(
        color: p.navBg,
        border: Border(bottom: BorderSide(color: p.hairline)),
      ),
      padding: const EdgeInsets.fromLTRB(16, 8, 8, 8),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: p.primary,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Symbols.restaurant, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Boyxon Oshxonasi',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppText.labelLg.copyWith(
                    color: p.onSurface,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Text(
                  context.tr('nav.menu'),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppText.labelSm.copyWith(color: p.accent),
                ),
              ],
            ),
          ),
          _iconBtn(
            Symbols.search,
            onTap: () => _searchFocus.requestFocus(),
          ),
          _iconBtn(
            Symbols.notifications,
            badge: _unread,
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute<void>(builder: (_) => const NotificationsPage()),
            ),
          ),
          _iconBtn(
            Symbols.shopping_bag,
            badge: cart.itemCount,
            onTap: widget.onOpenCart,
          ),
        ],
      ),
    );
  }

  Widget _iconBtn(IconData icon, {int badge = 0, VoidCallback? onTap}) {
    final p = context.palette;
    return Material(
      color: Colors.transparent,
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Icon(icon, size: 22, color: p.onSurface),
              if (badge > 0)
                Positioned(
                  top: -6,
                  right: -8,
                  child: Container(
                    constraints: const BoxConstraints(minWidth: 16),
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                    decoration: BoxDecoration(
                      color: p.primary,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      badge > 99 ? '99+' : '$badge',
                      textAlign: TextAlign.center,
                      style: AppText.labelSm.copyWith(
                        color: Colors.white,
                        fontSize: 9,
                        height: 1.4,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _toastBar(BuildContext context) {
    final p = context.palette;
    return AnimatedSize(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOut,
      alignment: Alignment.topCenter,
      child: _toast == null
          ? const SizedBox(width: double.infinity)
          : Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 2),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: p.toastBg,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: p.shadow,
                      blurRadius: 12,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Icon(
                      Symbols.check_circle,
                      size: 18,
                      color: p.dark ? p.toastText : const Color(0xFF7EFBA4),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _toast!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppText.labelMd.copyWith(color: p.toastText),
                      ),
                    ),
                    GestureDetector(
                      onTap: () => setState(() => _toast = null),
                      child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Icon(
                          Symbols.close,
                          size: 16,
                          color: p.toastText.withValues(alpha: 0.8),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _greeting(BuildContext context, String? name, String? initials) {
    final p = context.palette;
    final firstName = (name != null && name.trim().isNotEmpty)
        ? name.trim().split(RegExp(r'\s+')).first
        : '';
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 2),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  context.tr('app.greeting_name', {'name': firstName}),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppText.headlineSm.copyWith(
                    color: p.onSurface,
                    letterSpacing: -0.2,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  context.tr('home.title'),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppText.bodyMd.copyWith(color: p.onSurfaceVariant),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          GestureDetector(
            onTap: widget.onOpenSettings,
            child: Container(
              width: 44,
              height: 44,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: p.primaryFixed,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: p.shadow,
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Text(
                initials ?? '?',
                style: AppText.headlineSm.copyWith(
                  color: p.onPrimaryFixed,
                  fontSize: 16,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _searchBar(BuildContext context) {
    final p = context.palette;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Row(
        children: [
          Expanded(
            child: Container(
              height: 46,
              decoration: BoxDecoration(
                color: p.card,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: p.hairline),
                boxShadow: [
                  BoxShadow(
                    color: p.shadow,
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Row(
                children: [
                  const SizedBox(width: 12),
                  Icon(Symbols.search, size: 20, color: p.onSurfaceVariant),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _searchCtrl,
                      focusNode: _searchFocus,
                      onChanged: _onSearchChanged,
                      textInputAction: TextInputAction.search,
                      onSubmitted: (v) {
                        _debounce?.cancel();
                        setState(() => _search = v);
                        _load();
                      },
                      style: AppText.bodyMd.copyWith(color: p.onSurface),
                      cursorColor: p.primary,
                      decoration: InputDecoration(
                        isDense: true,
                        filled: false,
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: EdgeInsets.zero,
                        hintText: context.tr('home.search_placeholder'),
                        hintStyle: AppText.bodyMd.copyWith(color: p.outline),
                      ),
                    ),
                  ),
                  if (_searchCtrl.text.isNotEmpty)
                    GestureDetector(
                      onTap: () {
                        _searchCtrl.clear();
                        _debounce?.cancel();
                        setState(() => _search = '');
                        _load();
                      },
                      child: Icon(Symbols.close, size: 18, color: p.onSurfaceVariant),
                    ),
                  const SizedBox(width: 10),
                ],
              ),
            ),
          ),
          const SizedBox(width: 10),
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: p.card,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: p.hairline),
              boxShadow: [
                BoxShadow(
                  color: p.shadow,
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: _openSort,
                child: Icon(
                  Symbols.tune,
                  size: 20,
                  color: (_showAll && _sort != 'popular')
                      ? p.primary
                      : p.onSurfaceVariant,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _promoBanner(BuildContext context) {
    final p = context.palette;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [p.gradientStart, p.gradientMid, p.gradientEnd],
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: p.shadow,
              blurRadius: 18,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Stack(
          children: [
            Positioned(
              right: -24,
              bottom: -24,
              child: Container(
                width: 128,
                height: 128,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.10),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      context.tr('app.promo_badge'),
                      style: AppText.labelSm.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 250),
                    child: Text(
                      context.tr('app.promo_title'),
                      style: AppText.headlineLgMobile.copyWith(
                        color: Colors.white,
                        height: 1.15,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Material(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(8),
                          onTap: () {
                            setState(() {
                              _showAll = true;
                              _selectedCat = null;
                              _search = '';
                              _searchCtrl.clear();
                            });
                            _load();
                          },
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 9,
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  context.tr('app.promo_cta'),
                                  style: AppText.labelMd.copyWith(color: p.primaryDeep),
                                ),
                                const SizedBox(width: 6),
                                Icon(
                                  Symbols.arrow_forward,
                                  size: 16,
                                  color: p.primaryDeep,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const Spacer(),
                      Container(
                        width: 14,
                        height: 6,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
                      const SizedBox(width: 4),
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.5),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.5),
                          shape: BoxShape.circle,
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
    );
  }

  Widget _pushCard(BuildContext context) {
    final p = context.palette;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: p.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: p.hairline),
          boxShadow: [
            BoxShadow(color: p.shadow, blurRadius: 10, offset: const Offset(0, 4)),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: p.primaryFixed,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                Symbols.notifications_active,
                size: 20,
                color: p.dark ? p.onPrimaryFixed : const Color(0xFFA23F00),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    context.tr('app.push_title'),
                    style: AppText.labelLg.copyWith(color: p.onSurface),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    context.tr('app.push_desc'),
                    style: AppText.bodySm.copyWith(color: p.onSurfaceVariant),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Material(
                        color: p.primary,
                        borderRadius: BorderRadius.circular(6),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(6),
                          onTap: _enablePush,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 6,
                            ),
                            child: Text(
                              context.tr('app.push_enable'),
                              style: AppText.labelSm.copyWith(color: Colors.white),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Material(
                        color: p.cardHigh,
                        borderRadius: BorderRadius.circular(6),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(6),
                          onTap: _dismissPush,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 6,
                            ),
                            child: Text(
                              context.tr('app.push_later'),
                              style: AppText.labelSm.copyWith(color: p.onSurfaceVariant),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            GestureDetector(
              onTap: _dismissPush,
              child: Padding(
                padding: const EdgeInsets.all(2),
                child: Icon(
                  Symbols.close,
                  size: 16,
                  color: p.onSurfaceVariant.withValues(alpha: 0.6),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _chips(BuildContext context) {
    if (_categories.isEmpty) return const SizedBox.shrink();
    final p = context.palette;
    final locale = AppI18n.I.locale.value;
    return SizedBox(
      height: 42,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 3),
        itemCount: _categories.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          final c = _categories[i];
          final active = _selectedCat == c.slug;
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedCat = active ? null : c.slug;
                _showAll = _selectedCat != null;
              });
              _load();
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 160),
              padding: const EdgeInsets.symmetric(horizontal: 14),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: active ? p.primary : p.card,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(
                  color: active
                      ? p.primary
                      : p.outlineVariant.withValues(alpha: 0.5),
                ),
                boxShadow: [
                  BoxShadow(
                    color: p.shadow,
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (c.icon != null && c.icon!.isNotEmpty) ...[
                    Icon(
                      iconForCategory(c.slug),
                      size: 15,
                      color: active ? Colors.white : p.onSurfaceVariant,
                    ),
                    const SizedBox(width: 6),
                  ],
                  Text(
                    c.nameFor(locale),
                    style: AppText.labelSm.copyWith(
                      color: active ? Colors.white : p.onSurfaceVariant,
                      fontWeight: active ? FontWeight.w600 : FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _sectionHeader(BuildContext context) {
    final p = context.palette;
    final locale = AppI18n.I.locale.value;
    final searching = _search.trim().isNotEmpty;

    String? catName;
    if (_selectedCat != null) {
      for (final c in _categories) {
        if (c.slug == _selectedCat) {
          catName = c.nameFor(locale);
          break;
        }
      }
    }

    final String title;
    if (searching) {
      title = context.tr('app.results');
    } else if (catName != null) {
      title = catName;
    } else if (_showAll) {
      title = context.tr('home.all_dishes');
    } else {
      title = context.tr('app.popular');
    }

    final showViewAll = !searching && _selectedCat == null && !_showAll;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 10),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppText.headlineSm.copyWith(color: p.onSurface),
            ),
          ),
          if (showViewAll)
            GestureDetector(
              onTap: () {
                setState(() => _showAll = true);
                _load();
              },
              child: Text(
                _total != null
                    ? '${context.tr('home.view_all')} ($_total)'
                    : context.tr('home.view_all'),
                style: AppText.labelSm.copyWith(
                  color: p.accent,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
    );
  }

  List<Widget> _list(BuildContext context) {
    final p = context.palette;

    if (_error != null && _dishes.isEmpty) {
      return [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 40),
          child: Column(
            children: [
              Icon(Symbols.cloud_off, size: 44, color: p.outline),
              const SizedBox(height: 12),
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: AppText.bodyMd.copyWith(color: p.onSurfaceVariant),
              ),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: () => _load(),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: p.primary),
                  foregroundColor: p.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                child: Text(context.tr('app.retry')),
              ),
            ],
          ),
        ),
      ];
    }

    if (_loading && _dishes.isEmpty) {
      return [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 56),
          child: Center(
            child: CircularProgressIndicator(color: p.primary),
          ),
        ),
      ];
    }

    if (_dishes.isEmpty) {
      return [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 40),
          child: Column(
            children: [
              Icon(Symbols.search_off, size: 44, color: p.outline),
              const SizedBox(height: 12),
              Text(
                context.tr('home.no_dishes'),
                style: AppText.labelLg.copyWith(color: p.onSurface),
              ),
              const SizedBox(height: 6),
              Text(
                context.tr('home.no_dishes_hint'),
                textAlign: TextAlign.center,
                style: AppText.bodySm.copyWith(color: p.onSurfaceVariant),
              ),
            ],
          ),
        ),
      ];
    }

    return [
      for (final d in _dishes)
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
          child: DishCard(
            dish: d,
            onTap: () => showDishSheet(context, d, onAdd: _addToCart),
            onAdd: () => _addToCart(d, 1),
          ),
        ),
      if (_loading)
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 14),
          child: Center(
            child: SizedBox(
              width: 22,
              height: 22,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                color: p.primary,
              ),
            ),
          ),
        ),
    ];
  }
}
