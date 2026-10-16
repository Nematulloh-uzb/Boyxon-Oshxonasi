import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api_client.dart';
import '../../core/app_theme.dart';
import '../../core/formatters.dart';
import '../../core/order_status.dart';
import '../../l10n/app_localizations.dart';
import '../../models/models.dart';
import '../../services/auth_service.dart';
import '../../services/socket_service.dart';
import '../../widgets/state_views.dart';
import '../auth/login_screen.dart';
import 'order_detail_screen.dart';

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
    final auth = context.watch<AuthService>();

    if (!auth.isLoggedIn) {
      return Scaffold(
        body: SafeArea(
          child: EmptyView(
            icon: Icons.lock_outline_rounded,
            title: l.auth_required_title,
            subtitle: l.auth_required_sub,
            action: FilledButton(
              style: FilledButton.styleFrom(
                minimumSize: const Size(200, 48),
                padding: const EdgeInsets.symmetric(horizontal: 28),
              ),
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              ),
              child: Text(l.auth_login),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(l.orders_title)),
      body: SafeArea(
        child: _loading
            ? const LoadingView()
            : _error != null
                ? ErrorView(
                    message: errorText(_error!, l),
                    onRetry: _load,
                    retryLabel: l.common_retry,
                  )
                : RefreshIndicator(
                    color: context.c.primary,
                    onRefresh: _load,
                    child: _orders.isEmpty
                        ? ListView(
                            children: [
                              SizedBox(height: MediaQuery.of(context).size.height * 0.18),
                              EmptyView(
                                icon: Icons.receipt_long_outlined,
                                title: l.orders_empty,
                                subtitle: l.orders_empty_sub,
                              ),
                            ],
                          )
                        : ListView.builder(
                            controller: _scrollCtrl,
                            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                            itemCount: _orders.length + (_loadingMore ? 1 : 0),
                            itemBuilder: (context, i) {
                              if (i >= _orders.length) {
                                return const Padding(
                                  padding: EdgeInsets.symmetric(vertical: 16),
                                  child: Center(
                                    child: SizedBox(
                                      width: 24,
                                      height: 24,
                                      child: CircularProgressIndicator(strokeWidth: 2.4),
                                    ),
                                  ),
                                );
                              }
                              return _OrderCard(order: _orders[i]);
                            },
                          ),
                  ),
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({required this.order});

  final Order order;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;

    final first = order.items.isNotEmpty ? order.items.first : null;
    final extra = order.items.length - 1;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: order.id)),
        ),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: c.surface,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: c.line.withValues(alpha: 0.6)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      order.orderNumber,
                      style: TextStyle(
                        fontFamily: 'Epilogue',
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: c.fg,
                      ),
                    ),
                  ),
                  StatusBadge(
                    label: statusLabel(l, order.status),
                    color: statusColor(c, order.status),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                order.createdAt == null ? '' : formatDateTime(order.createdAt!),
                style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: c.subtle),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      first == null
                          ? ''
                          : '${first.name} ×${first.quantity}${extra > 0 ? '  +$extra' : ''}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(fontFamily: 'Inter', fontSize: 13, color: c.fg),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    formatPrice(order.total),
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: c.primaryDark,
                    ),
                  ),
                  Icon(Icons.chevron_right_rounded, size: 20, color: c.subtle),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
