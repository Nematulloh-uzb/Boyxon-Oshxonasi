import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api_client.dart';
import '../../core/app_theme.dart';
import '../../l10n/app_localizations.dart';
import '../../models/models.dart';
import '../../services/auth_service.dart';
import '../../services/socket_service.dart';
import '../../widgets/order_card.dart';
import '../../widgets/state_views.dart';
import '../../widgets/ui_kit.dart';
import '../auth/login_screen.dart';
import 'order_detail_screen.dart';

/// Buyurtmalar ro'yxati — web `SettingsPage` buyurtmalar guruhi bilan bir xil
/// karta uslubi (orderNumber + sana·taomlar soni | jami + holat matni).
class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final _api = ApiClient.instance;
  final _scrollCtrl = ScrollController();

  List<Order> _orders = [];
  bool _loading = true;
  bool _loadingMore = false;
  Object? _error;
  int _page = 1;
  int _pages = 1;
  StreamSubscription<Map<String, dynamic>>? _statusSub;
  AuthService? _auth;
  bool _wasLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(_onScroll);
    _statusSub = context.read<SocketService>().orderStatus.listen((_) => _load(silent: true));
    // Cold start'da hali login bo'lmagan bo'lsa so'rov yubormaymiz — aks holda
    // "Token topilmadi" xatosi saqlanib qolib, kirgandan keyin ham ko'rinadi.
    // Login bo'lganda _onAuth avtomatik yuklaydi.
    final auth = context.read<AuthService>();
    _auth = auth;
    _wasLoggedIn = auth.isLoggedIn;
    auth.addListener(_onAuth);
    if (_wasLoggedIn) {
      _load();
    } else {
      _loading = false;
    }
  }

  /// Login/logout holati o'zgarganda ro'yxatni yangilash.
  void _onAuth() {
    final loggedIn = _auth?.isLoggedIn ?? false;
    if (loggedIn == _wasLoggedIn) return;
    _wasLoggedIn = loggedIn;
    if (loggedIn) {
      _load();
    } else if (mounted) {
      setState(() {
        _orders = [];
        _error = null;
        _loading = false;
      });
    }
  }

  @override
  void dispose() {
    _auth?.removeListener(_onAuth);
    _statusSub?.cancel();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollCtrl.position.pixels >= _scrollCtrl.position.maxScrollExtent - 300) {
      _loadMore();
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
      final res = await _api.dio.get('/users/me/orders', queryParameters: {'page': 1, 'limit': 10});
      final body = res.data as Map;
      final orders = (body['data'] as List)
          .map((e) => Order.fromJson(e as Map<String, dynamic>))
          .toList();
      final pagination = body['pagination'] as Map?;
      if (!mounted) return;
      setState(() {
        _orders = orders;
        _page = ((pagination?['page'] ?? 1) as num).toInt();
        _pages = ((pagination?['pages'] ?? 1) as num).toInt();
        _loading = false;
        _error = null;
      });
    } catch (e) {
      if (!mounted) return;
      if (!silent) {
        setState(() {
          _error = e;
          _loading = false;
        });
      }
    }
  }

  Future<void> _loadMore() async {
    if (_loadingMore || _loading || _page >= _pages) return;
    setState(() => _loadingMore = true);
    try {
      final res = await _api.dio.get(
        '/users/me/orders',
        queryParameters: {'page': _page + 1, 'limit': 10},
      );
      final body = res.data as Map;
      final more = (body['data'] as List)
          .map((e) => Order.fromJson(e as Map<String, dynamic>))
          .toList();
      final pagination = body['pagination'] as Map?;
      if (!mounted) return;
      setState(() {
        _orders = [..._orders, ...more];
        _page = ((pagination?['page'] ?? _page + 1) as num).toInt();
        _pages = ((pagination?['pages'] ?? _pages) as num).toInt();
        _loadingMore = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loadingMore = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;
    final auth = context.watch<AuthService>();

    if (!auth.isLoggedIn) {
      return Scaffold(
        body: SafeArea(
          child: EmptyView(
            icon: Icons.lock_outline_rounded,
            title: l.auth_required_title,
            subtitle: l.auth_required_sub,
            action: GradientButton(
              label: l.auth_login,
              expand: false,
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              ),
            ),
          ),
        ),
      );
    }

    Widget header() => Padding(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
          child: Text(
            l.orders_title,
            style: TextStyle(
              fontFamily: 'Epilogue',
              fontSize: 24,
              fontWeight: FontWeight.w800,
              height: 1.2,
              color: c.fg,
            ),
          ),
        );

    Widget child;
    if (_loading) {
      child = Column(
        children: [
          header(),
          const Expanded(child: LoadingView()),
        ],
      );
    } else if (_error != null) {
      child = Column(
        children: [
          header(),
          Expanded(
            child: ErrorView(
              message: errorText(_error!, l),
              onRetry: _load,
              retryLabel: l.common_retry,
            ),
          ),
        ],
      );
    } else if (_orders.isEmpty) {
      child = Column(
        children: [
          header(),
          Expanded(
            child: EmptyView(
              icon: Icons.receipt_long_outlined,
              title: l.orders_empty,
              subtitle: l.orders_empty_sub,
            ),
          ),
        ],
      );
    } else {
      child = RefreshIndicator(
        color: c.primary,
        onRefresh: _load,
        child: ListView.builder(
          controller: _scrollCtrl,
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          itemCount: _orders.length + 2,
          itemBuilder: (context, i) {
            if (i == 0) return header();
            if (i == _orders.length + 1) {
              if (!_loadingMore) return const SizedBox(height: 8);
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Center(
                  child: SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(strokeWidth: 2.4, color: c.primary),
                  ),
                ),
              );
            }
            final order = _orders[i - 1];
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: OrderCard(
                order: order,
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: order.id)),
                ),
              ),
            );
          },
        ),
      );
    }

    return Scaffold(body: SafeArea(child: child));
  }
}
