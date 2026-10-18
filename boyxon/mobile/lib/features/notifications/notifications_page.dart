import 'package:flutter/material.dart';
import 'package:material_symbols_icons/symbols.dart';

import '../../core/api/api_client.dart';
import '../../core/i18n/app_i18n.dart';
import '../../core/utils/formatters.dart';
import '../../data/services/notification_service.dart';
import '../../theme/app_text.dart';
import '../../theme/app_theme.dart';

/// Bildirishnomalar sahifasi (header'dagi qo'ng'iroq ikonkasi).
class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  List<AppNotification> _items = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final list = await NotificationService.I.list();
      if (!mounted) return;
      setState(() {
        _items = list;
        _loading = false;
        _error = null;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : context.tr('home.load_error');
      });
    }
  }

  Future<void> _markAll() async {
    try {
      await NotificationService.I.markAllRead();
      if (!mounted) return;
      setState(() {
        for (final n in _items) {
          n.isRead = true;
        }
      });
    } catch (e) {
      if (!mounted) return;
      _snack(e is ApiException ? e.message : context.tr('home.load_error'));
    }
  }

  Future<void> _openOne(AppNotification n) async {
    if (n.isRead) return;
    setState(() => n.isRead = true);
    try {
      await NotificationService.I.markRead(n.id);
    } catch (_) {}
  }

  void _snack(String msg) {
    ScaffoldMessenger.maybeOf(context)
      ?..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final hasUnread = _items.any((n) => !n.isRead);

    return Scaffold(
      backgroundColor: p.bg,
      appBar: AppBar(
        backgroundColor: p.bg,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: p.onSurface),
        title: Text(
          context.tr('nav.notifications'),
          style: AppText.headlineSm.copyWith(color: p.onSurface),
        ),
        actions: [
          if (hasUnread)
            TextButton(
              onPressed: _markAll,
              child: Text(
                context.tr('app.mark_all_read'),
                style: AppText.labelSm.copyWith(color: p.accent),
              ),
            ),
        ],
      ),
      body: _loading
          ? Center(child: CircularProgressIndicator(color: p.primary))
          : _error != null
              ? _errorBox(context)
              : _items.isEmpty
                  ? _emptyBox(context)
                  : RefreshIndicator(
                      color: p.primary,
                      onRefresh: _load,
                      child: ListView.separated(
                        padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
                        itemCount: _items.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 10),
                        itemBuilder: (context, i) => _item(context, _items[i]),
                      ),
                    ),
    );
  }

  Widget _item(BuildContext context, AppNotification n) {
    final p = context.palette;
    return Material(
      color: p.card,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => _openOne(n),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: n.isRead
                  ? p.hairline
                  : p.primary.withValues(alpha: 0.35),
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: n.isRead ? p.cardLow : p.primaryFixed,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  _iconForType(n.type),
                  size: 20,
                  color: n.isRead
                      ? p.onSurfaceVariant
                      : (p.dark ? p.onPrimaryFixed : const Color(0xFFA23F00)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            n.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppText.labelLg.copyWith(color: p.onSurface),
                          ),
                        ),
                        if (!n.isRead)
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: p.primary,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      n.message,
                      style: AppText.bodySm.copyWith(color: p.onSurfaceVariant),
                    ),
                    if (n.createdAt != null) ...[
                      const SizedBox(height: 6),
                      Text(
                        Fmt.dateTime(n.createdAt!),
                        style: AppText.bodySm.copyWith(color: p.outline),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _emptyBox(BuildContext context) {
    final p = context.palette;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Symbols.notifications_off, size: 48, color: p.outline),
            const SizedBox(height: 12),
            Text(
              context.tr('app.no_notifications'),
              textAlign: TextAlign.center,
              style: AppText.bodyMd.copyWith(color: p.onSurfaceVariant),
            ),
          ],
        ),
      ),
    );
  }

  Widget _errorBox(BuildContext context) {
    final p = context.palette;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Symbols.cloud_off, size: 48, color: p.outline),
            const SizedBox(height: 12),
            Text(
              _error ?? '',
              textAlign: TextAlign.center,
              style: AppText.bodyMd.copyWith(color: p.onSurfaceVariant),
            ),
            const SizedBox(height: 16),
            OutlinedButton(
              onPressed: () {
                setState(() {
                  _loading = true;
                  _error = null;
                });
                _load();
              },
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: p.primary),
                foregroundColor: p.primary,
              ),
              child: Text(context.tr('app.retry')),
            ),
          ],
        ),
      ),
    );
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'order':
        return Symbols.receipt_long;
      case 'promo':
        return Symbols.local_offer;
      case 'bonus':
        return Symbols.redeem;
      case 'new_dish':
        return Symbols.restaurant_menu;
      default:
        return Symbols.notifications;
    }
  }
}
