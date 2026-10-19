import 'package:flutter/material.dart';
import 'package:material_symbols_icons/symbols.dart';

import '../../core/api/api_client.dart';
import '../../core/i18n/app_i18n.dart';
import '../../core/utils/formatters.dart';
import '../../data/models/order.dart';
import '../../data/services/admin_service.dart';
import '../../theme/app_text.dart';
import '../../theme/app_theme.dart';
import '../orders/order_detail_page.dart';

/// Admin panel (dizayn 05-admin): KPI kartalar, jonli buyurtmalar,
/// status filtri va tezkor amallar (qabul qilish / bekor qilish).
class AdminPage extends StatefulWidget {
  const AdminPage({super.key});

  @override
  State<AdminPage> createState() => AdminPageState();
}

class AdminPageState extends State<AdminPage> {
  static const _chips = [
    '',
    'pending',
    'confirmed',
    'packing',
    'handed_to_taxi',
    'delivered',
  ];

  final _searchCtrl = TextEditingController();

  Map<String, dynamic> _stats = const {};
  List<Order> _orders = [];
  String _status = '';
  String _search = '';
  bool _loading = true;
  String? _error;
  String? _updating;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  int _stat(String key) => (_stats[key] as num?)?.toInt() ?? 0;

  int get _ordersCount => _stat('ordersCount');

  List<Order> get _visible {
    final q = _search.trim().toLowerCase();
    if (q.isEmpty) return _orders;
    return _orders
        .where(
          (o) =>
              o.orderNumber.toLowerCase().contains(q) ||
              (o.userName ?? '').toLowerCase().contains(q) ||
              (o.userPhone ?? '').contains(q) ||
              '${o.total}'.contains(q),
        )
        .toList();
  }

  // ---- Amallar ----

  /// AppShell admin tabiga o'tganda chaqiradi — "jonli" ro'yxat darhol
  /// yangilanadi (IndexedStack sahifani bir marta yuklab, saqlab turadi).
  Future<void> refresh() => _load();

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _loading = _orders.isEmpty;
      _error = null;
    });
    try {
      final results = await Future.wait<Object?>([
        AdminService.I.stats(),
        AdminService.I.orders(
          status: _status.isEmpty ? null : _status,
          page: 1,
          limit: 50,
        ),
      ]);
      if (!mounted) return;
      setState(() {
        _stats = results[0] as Map<String, dynamic>;
        _orders = (results[1] as (List<Order>, PaginationInfo?)).$1;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : context.tr('home.load_error');
      });
    }
  }

  Future<void> _setStatus(Order o, String status) async {
    setState(() => _updating = o.id);
    try {
      await AdminService.I.updateOrderStatus(o.id, status);
      if (!mounted) return;
      _snack(context.tr('app.status_updated'));
      await _load();
    } on ApiException catch (e) {
      if (mounted) _snack(e.message);
    } catch (_) {
      if (mounted) _snack(context.tr('home.load_error'));
    } finally {
      if (mounted) setState(() => _updating = null);
    }
  }

  Future<void> _cancelOrder(Order o) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(context.tr('app.cancel_order_q'), style: AppText.headlineSm),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(context.tr('common.no')),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: context.palette.error,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(context.tr('common.yes')),
          ),
        ],
      ),
    );
    if (ok == true && mounted) await _setStatus(o, 'cancelled');
  }

  void _snack(String msg) {
    if (!mounted || msg.isEmpty) return;
    ScaffoldMessenger.maybeOf(context)
      ?..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(msg)));
  }

  String _ago(BuildContext context, DateTime? d) {
    if (d == null) return '';
    final diff = DateTime.now().difference(d.toLocal());
    if (diff.inMinutes < 1) return context.tr('app.now');
    if (diff.inMinutes < 60) {
      return context.tr('app.min_ago', {'n': '${diff.inMinutes}'});
    }
    if (diff.inHours < 24) {
      return context.tr('app.hours_ago', {'n': '${diff.inHours}'});
    }
    return context.tr('app.days_ago', {'n': '${diff.inDays}'});
  }

  // ---- UI ----

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final ordersCount = _ordersCount;
    final pendingOrders = _stat('pendingOrders');
    final loadingMore = _loading && _orders.isNotEmpty;

    return Scaffold(
      backgroundColor: p.bg,
      body: SafeArea(
        bottom: false,
        child: _error != null && _orders.isEmpty
            ? _errorBox(context)
            : RefreshIndicator(
                color: p.primary,
                onRefresh: _load,
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
                  children: [
                    _headerCard(context),
                    const SizedBox(height: 10),
                    _searchBar(context),
                    const SizedBox(height: 18),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              context.tr('app.admin_today'),
                              style: AppText.headlineSm.copyWith(
                                color: p.onSurface,
                              ),
                            ),
                          ),
                          if (loadingMore)
                            const SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: _kpi(
                            context,
                            icon: Symbols.account_balance_wallet,
                            value: _grouped(_stat('revenue')),
                            label: '${context.tr('admin.revenue')} (so\'m)',
                            iconBg: p.primaryFixed,
                            iconFg: p.dark
                                ? p.onPrimaryFixed
                                : const Color(0xFF63330D),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _kpi(
                            context,
                            icon: Symbols.receipt_long,
                            value: '$ordersCount',
                            label: context.tr('admin.today_orders'),
                            chip:
                                '${context.tr('common.active')}: $pendingOrders',
                            iconBg: p.cardHigh,
                            iconFg: p.primary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: _kpi(
                            context,
                            icon: Symbols.restaurant_menu,
                            value: '${_stat('dishes')}',
                            label: context.tr('admin.active_dishes'),
                            iconBg: p.successBg,
                            iconFg: p.successText,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _kpi(
                            context,
                            icon: Symbols.group,
                            value: '${_stat('users')}',
                            label: context.tr('admin.total_users'),
                            iconBg: p.warningBg,
                            iconFg: p.warningText,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Text(
                          context.tr('app.admin_live_orders'),
                          style: AppText.headlineSm.copyWith(
                            color: p.onSurface,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: p.primary,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const Spacer(),
                        GestureDetector(
                          onTap: () {
                            if (_status.isEmpty) return;
                            setState(() {
                              _status = '';
                              _orders = [];
                              _loading = true;
                            });
                            _load();
                          },
                          child: Row(
                            children: [
                              Text(
                                context.tr('app.admin_all'),
                                style: AppText.labelSm.copyWith(
                                  color: p.primary,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              Icon(
                                Symbols.chevron_right,
                                size: 16,
                                color: p.primary,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    _chipsRow(context, ordersCount),
                    const SizedBox(height: 12),
                    if (_loading && _orders.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 48),
                        child: Center(
                          child: CircularProgressIndicator(color: p.primary),
                        ),
                      )
                    else if (_visible.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 40),
                        child: Column(
                          children: [
                            Icon(Symbols.inbox, size: 44, color: p.outline),
                            const SizedBox(height: 10),
                            Text(
                              context.tr('admin.orders_empty'),
                              style: AppText.bodyMd.copyWith(
                                color: p.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      )
                    else
                      for (final o in _visible) ...[
                        _orderCard(context, o),
                        const SizedBox(height: 10),
                      ],
                  ],
                ),
              ),
      ),
    );
  }

  Widget _headerCard(BuildContext context) {
    final p = context.palette;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(color: p.shadow, blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              color: p.successText,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: p.successText.withValues(alpha: 0.45),
                  blurRadius: 8,
                  spreadRadius: 2,
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        'Boyxon Oshxonasi',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppText.labelLg.copyWith(color: p.onSurface),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 7,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: p.successBg,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        context.tr('app.admin_live'),
                        style: AppText.labelSm.copyWith(
                          color: p.successText,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  context.tr('app.admin_hours'),
                  style: AppText.bodySm.copyWith(color: p.onSurfaceVariant),
                ),
              ],
            ),
          ),
          IconButton(
            style: IconButton.styleFrom(backgroundColor: p.cardLow),
            onPressed: _load,
            icon: Icon(Symbols.sync, size: 20, color: p.onSurface),
          ),
        ],
      ),
    );
  }

  Widget _searchBar(BuildContext context) {
    final p = context.palette;
    return Container(
      height: 42,
      decoration: BoxDecoration(
        color: p.cardLow,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          const SizedBox(width: 12),
          Icon(Symbols.search, size: 19, color: p.outline),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: _searchCtrl,
              onChanged: (v) => setState(() => _search = v),
              style: AppText.bodyMd.copyWith(color: p.onSurface),
              cursorColor: p.primary,
              decoration: InputDecoration(
                isDense: true,
                filled: false,
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                contentPadding: EdgeInsets.zero,
                hintText: context.tr('app.admin_search_ph'),
                hintStyle: AppText.bodyMd.copyWith(color: p.outline),
              ),
            ),
          ),
          const SizedBox(width: 12),
        ],
      ),
    );
  }

  Widget _kpi(
    BuildContext context, {
    required IconData icon,
    required String value,
    required String label,
    String? chip,
    required Color iconBg,
    required Color iconFg,
  }) {
    final p = context.palette;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(color: p.shadow, blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: iconBg,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 18, color: iconFg),
              ),
              const Spacer(),
              if (chip != null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 7,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: p.cardLow,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    chip,
                    style: AppText.labelSm.copyWith(
                      color: p.onSurfaceVariant,
                      fontSize: 10,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppText.headlineSm.copyWith(
              color: p.onSurface,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppText.labelSm.copyWith(color: p.onSurfaceVariant),
          ),
        ],
      ),
    );
  }

  Widget _chipsRow(BuildContext context, int ordersCount) {
    final p = context.palette;
    return SizedBox(
      height: 36,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _chips.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          final key = _chips[i];
          final active = _status == key;
          final label = key.isEmpty
              ? '${context.tr('app.admin_all')} ($ordersCount)'
              : context.tr('status.$key');
          return GestureDetector(
            onTap: () {
              if (_status == key) return;
              setState(() {
                _status = key;
                _orders = [];
                _loading = true;
              });
              _load();
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              padding: const EdgeInsets.symmetric(horizontal: 14),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: active ? p.primary : p.card,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(
                  color: active ? p.primary : p.hairline,
                ),
              ),
              child: Text(
                label,
                style: AppText.labelSm.copyWith(
                  color: active ? Colors.white : p.onSurface,
                  fontWeight: active ? FontWeight.w600 : FontWeight.w500,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _orderCard(BuildContext context, Order o) {
    final p = context.palette;
    final locale = AppI18n.I.locale.value;

    late final Color bar, chipBg, chipFg;
    switch (o.status) {
      case 'pending':
        bar = p.error;
        chipBg = p.errorBg;
        chipFg = p.errorText;
        break;
      case 'handed_to_taxi':
        bar = p.accent;
        chipBg = p.warningBg;
        chipFg = p.warningText;
        break;
      case 'delivered':
        bar = p.successText;
        chipBg = p.successBg;
        chipFg = p.successText;
        break;
      case 'cancelled':
        bar = p.error;
        chipBg = p.errorBg;
        chipFg = p.errorText;
        break;
      default:
        bar = p.primary;
        chipBg = p.primaryFixed;
        chipFg = p.dark ? p.onPrimaryFixed : const Color(0xFFA23F00);
    }

    final (nextStatus, nextLabel) = switch (o.status) {
      'pending' => ('confirmed', context.tr('app.admin_accept')),
      'confirmed' => ('packing', context.tr('app.admin_start')),
      'packing' => ('handed_to_taxi', context.tr('app.admin_ready')),
      'handed_to_taxi' => ('delivered', context.tr('status.delivered')),
      _ => (null, null),
    };

    final itemsText = o.items
        .take(3)
        .map((it) => '${it.nameFor(locale)} ${it.quantity}x')
        .join(', ');

    return Container(
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(color: p.shadow, blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          Positioned(
            left: 0,
            top: 0,
            bottom: 0,
            child: Container(width: 4, color: bar),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 12, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                '#${o.orderNumber}',
                                style: AppText.labelLg.copyWith(
                                  color: p.onSurface,
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(width: 8),
                              if (o.createdAt != null)
                                Text(
                                  _ago(context, o.createdAt),
                                  style: AppText.bodySm.copyWith(
                                    color: o.status == 'pending'
                                        ? p.error
                                        : p.onSurfaceVariant,
                                    fontSize: 11,
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            [
                              o.userName,
                              (o.userPhone ?? '').isNotEmpty
                                  ? '(${o.userPhone})'
                                  : null,
                            ].whereType<String>().join(' '),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppText.labelMd.copyWith(color: p.onSurface),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: chipBg,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (o.status == 'handed_to_taxi') ...[
                            Icon(Symbols.moped, size: 13, color: chipFg),
                            const SizedBox(width: 3),
                          ],
                          Text(
                            context.tr('status.${o.status}'),
                            style: AppText.labelSm.copyWith(
                              color: chipFg,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: p.cardLow,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text.rich(
                        TextSpan(
                          text: itemsText,
                          style: AppText.bodySm.copyWith(color: p.onSurface),
                          children: [
                            TextSpan(
                              text:
                                  '  (${context.tr('app.admin_items_total', {'count': '${o.items.length}'})})',
                              style: AppText.bodySm.copyWith(color: p.outline),
                            ),
                          ],
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Text(
                            Fmt.money(o.total),
                            style: AppText.labelMd.copyWith(
                              color: p.onSurface,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const Spacer(),
                          if (o.paymentStatus == 'paid')
                            Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: Row(
                                children: [
                                  Icon(
                                    Symbols.check,
                                    size: 13,
                                    color: p.successText,
                                  ),
                                  const SizedBox(width: 3),
                                  Text(
                                    '${_payLabel(context, o.paymentMethod)} · ${context.tr('app.paid')}',
                                    style: AppText.labelSm.copyWith(
                                      color: p.successText,
                                    ),
                                  ),
                                ],
                              ),
                            )
                          else
                            Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: Text(
                                _payLabel(context, o.paymentMethod),
                                style: AppText.labelSm.copyWith(
                                  color: p.onSurfaceVariant,
                                ),
                              ),
                            ),
                          if (!o.isPickup && (o.addressText ?? '').isNotEmpty)
                            Flexible(
                              child: Text(
                                o.addressText!,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppText.labelSm.copyWith(
                                  color: p.onSurfaceVariant,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                if (_updating == o.id)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8),
                    child: Center(
                      child: SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(strokeWidth: 2.5),
                      ),
                    ),
                  )
                else
                  Row(
                    children: [
                      if (nextStatus != null) ...[
                        Expanded(
                          child: _actionBtn(
                            context,
                            label: nextLabel!,
                            icon: Symbols.check_circle,
                            bg: p.toastBg,
                            fg: Colors.white,
                            onTap: () => _setStatus(o, nextStatus),
                          ),
                        ),
                        const SizedBox(width: 8),
                      ],
                      _actionBtn(
                        context,
                        label: context.tr('app.details'),
                        icon: Symbols.receipt,
                        bg: p.cardHigh,
                        fg: p.onSurface,
                        compact: true,
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute<void>(
                            builder: (_) => OrderDetailPage(
                              orderId: o.id,
                              admin: true,
                            ),
                          ),
                        ),
                      ),
                      if (o.isActive) ...[
                        const SizedBox(width: 8),
                        _actionBtn(
                          context,
                          label: context.tr('app.cancel_order'),
                          icon: Symbols.close,
                          bg: p.errorBg,
                          fg: p.errorText,
                          compact: true,
                          onTap: () => _cancelOrder(o),
                        ),
                      ],
                    ],
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionBtn(
    BuildContext context, {
    required String label,
    required IconData icon,
    required Color bg,
    required Color fg,
    required VoidCallback onTap,
    bool compact = false,
  }) {
    return Material(
      color: bg,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: onTap,
        child: Container(
          height: 40,
          padding: EdgeInsets.symmetric(horizontal: compact ? 12 : 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 17, color: fg),
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppText.labelMd.copyWith(color: fg),
                ),
              ),
            ],
          ),
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

  String _payLabel(BuildContext context, String m) {
    switch (m) {
      case 'payme':
        return 'Payme';
      case 'click':
        return 'Click';
      case 'uzum':
        return 'Uzum Bank';
      default:
        return context.tr('app.cash');
    }
  }

  /// "18 450 000 so'm" → "18 450 000" (KPI kartada so'm alohida yoziladi).
  String _grouped(int v) => Fmt.money(v).replaceAll(" so'm", '');
}
