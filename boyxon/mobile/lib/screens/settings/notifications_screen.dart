import 'package:flutter/material.dart';

import '../../core/api_client.dart';
import '../../core/app_theme.dart';
import '../../core/formatters.dart';
import '../../l10n/app_localizations.dart';
import '../../models/models.dart';
import '../../widgets/state_views.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final _api = ApiClient.instance;
  final _scrollCtrl = ScrollController();

  List<AppNotification> _items = [];
  bool _loading = true;
  bool _loadingMore = false;
  Object? _error;
  int _page = 1;
  int _pages = 1;

  @override
  void initState() {
    super.initState();
    _load();
    _scrollCtrl.addListener(() {
      if (_scrollCtrl.position.pixels >= _scrollCtrl.position.maxScrollExtent - 300) {
        _loadMore();
      }
    });
  }

  @override
  void dispose() {
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await _api.dio.get('/users/me/notifications', queryParameters: {
        'page': 1,
        'limit': 20,
      });
      final body = res.data as Map;
      final items = (body['data'] as List)
          .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
          .toList();
      final pagination = body['pagination'] as Map?;
      if (!mounted) return;
      setState(() {
        _items = items;
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
      final res = await _api.dio.get('/users/me/notifications', queryParameters: {
        'page': _page + 1,
        'limit': 20,
      });
      final body = res.data as Map;
      final more = (body['data'] as List)
          .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
          .toList();
      final pagination = body['pagination'] as Map?;
      if (!mounted) return;
      setState(() {
        _items = [..._items, ...more];
        _page = ((pagination?['page'] ?? _page + 1) as num).toInt();
        _pages = ((pagination?['pages'] ?? _pages) as num).toInt();
        _loadingMore = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loadingMore = false);
    }
  }

  IconData _iconFor(String type) => switch (type) {
        'order' => Icons.receipt_long_outlined,
        'promo' => Icons.local_offer_outlined,
        'new_dish' => Icons.restaurant_menu_rounded,
        'bonus' => Icons.stars_rounded,
        _ => Icons.campaign_outlined,
      };

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;

    return Scaffold(
      appBar: AppBar(title: Text(l.notif_title)),
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
                    color: c.primary,
                    onRefresh: _load,
                    child: _items.isEmpty
                        ? ListView(
                            children: [
                              SizedBox(height: MediaQuery.of(context).size.height * 0.18),
                              EmptyView(
                                icon: Icons.notifications_off_outlined,
                                title: l.notif_empty,
                              ),
                            ],
                          )
                        : ListView.builder(
                            controller: _scrollCtrl,
                            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                            itemCount: _items.length + (_loadingMore ? 1 : 0),
                            itemBuilder: (context, i) {
                              if (i >= _items.length) {
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
                              final item = _items[i];
                              return Container(
                                margin: const EdgeInsets.only(bottom: 10),
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: c.surface,
                                  borderRadius: BorderRadius.circular(18),
                                  border: Border.all(
                                    color: item.isRead
                                        ? c.line.withValues(alpha: 0.6)
                                        : c.primary.withValues(alpha: 0.4),
                                  ),
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Icon(_iconFor(item.type), size: 22, color: c.primary),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            item.title,
                                            style: TextStyle(
                                              fontFamily: 'Inter',
                                              fontSize: 14,
                                              fontWeight:
                                                  item.isRead ? FontWeight.w500 : FontWeight.w700,
                                              color: c.fg,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            item.message,
                                            style: TextStyle(
                                              fontFamily: 'Inter',
                                              fontSize: 13,
                                              height: 1.4,
                                              color: c.subtle,
                                            ),
                                          ),
                                          if (item.createdAt != null) ...[
                                            const SizedBox(height: 6),
                                            Text(
                                              formatDateTime(item.createdAt!),
                                              style: TextStyle(
                                                fontFamily: 'Inter',
                                                fontSize: 11,
                                                color: c.subtle,
                                              ),
                                            ),
                                          ],
                                        ],
                                      ),
                                    ),
                                    if (!item.isRead)
                                      Container(
                                        margin: const EdgeInsets.only(top: 4, left: 8),
                                        width: 8,
                                        height: 8,
                                        decoration: BoxDecoration(
                                          color: c.primary,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                  ],
                                ),
                              );
                            },
                          ),
                  ),
      ),
    );
  }
}
