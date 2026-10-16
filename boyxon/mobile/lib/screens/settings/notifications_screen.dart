import 'package:flutter/material.dart';

import '../../core/api_client.dart';
import '../../core/app_theme.dart';
import '../../core/formatters.dart';
import '../../l10n/app_localizations.dart';
import '../../models/models.dart';
import '../../widgets/state_views.dart';

/// Bildirishnomalar ro'yxati — web `NotificationItem` bilan 1:1:
/// 36px doira ikonka + sarlavha/matn/sana, o'qilmaganlari primary-50 fon va nuqta.
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

  /// Web `NotificationItem` ikonkalari.
  IconData _iconFor(String type) => switch (type) {
        'order' => Icons.check_circle_outline_rounded,
        'promo' || 'bonus' => Icons.card_giftcard_rounded,
        'system' => Icons.info_outline_rounded,
        'new_dish' => Icons.restaurant_rounded,
        _ => Icons.notifications_none_rounded,
      };

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;

    Widget header() => Padding(
          padding: const EdgeInsets.fromLTRB(0, 20, 0, 12),
          child: Row(
            children: [
              GestureDetector(
                onTap: () => Navigator.of(context).maybePop(),
                behavior: HitTestBehavior.opaque,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.arrow_back_rounded, size: 16, color: c.fgMuted),
                    const SizedBox(width: 6),
                    Text(
                      l.common_back,
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: c.fgMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );

    Widget child;
    if (_loading) {
      child = Column(children: [header(), const Expanded(child: LoadingView())]);
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
    } else if (_items.isEmpty) {
      child = Column(
        children: [
          header(),
          Expanded(
            child: EmptyView(
              icon: Icons.notifications_off_outlined,
              title: l.notif_empty,
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
          itemCount: _items.length + 2,
          itemBuilder: (context, i) {
            if (i == 0) return header();
            if (i == _items.length + 1) {
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

            final item = _items[i - 1];
            return Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                decoration: BoxDecoration(
                  color: item.isRead
                      ? Colors.transparent
                      : BoyxonPalette.primary50.withValues(alpha: 0.6),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: const BoxDecoration(
                        color: BoyxonPalette.primary100,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        _iconFor(item.type),
                        size: 18,
                        color: BoyxonPalette.primaryDark,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: c.fg,
                            ),
                          ),
                          Text(
                            item.message,
                            style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.subtle),
                          ),
                          if (item.createdAt != null) ...[
                            const SizedBox(height: 2),
                            Text(
                              formatDateTime(item.createdAt!),
                              style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: c.subtle),
                            ),
                          ],
                        ],
                      ),
                    ),
                    if (!item.isRead)
                      Padding(
                        padding: const EdgeInsets.only(top: 8, left: 8),
                        child: Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: BoyxonPalette.primary,
                            shape: BoxShape.circle,
                          ),
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

    return Scaffold(body: SafeArea(child: child));
  }
}
