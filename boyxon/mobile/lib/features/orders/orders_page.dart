import 'package:flutter/material.dart';
import 'package:material_symbols_icons/symbols.dart';

import '../../core/api/api_client.dart';
import '../../core/i18n/app_i18n.dart';
import '../../core/utils/formatters.dart';
import '../../data/models/order.dart';
import '../../data/services/order_service.dart';
import '../../theme/app_text.dart';
import '../../theme/app_theme.dart';
import 'order_detail_page.dart';

/// Buyurtmalarim ro'yxati.
class OrdersPage extends StatefulWidget {
  const OrdersPage({super.key});

  @override
  State<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends State<OrdersPage> {
  List<Order> _orders = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final (list, _) = await OrderService.I.myOrders();
      if (!mounted) return;
      setState(() {
        _orders = list;
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

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    return Scaffold(
      backgroundColor: p.bg,
      appBar: AppBar(
        backgroundColor: p.bg,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: p.onSurface),
        title: Text(
          context.tr('nav.orders'),
          style: AppText.headlineSm.copyWith(color: p.onSurface),
        ),
      ),
      body: _loading
          ? Center(child: CircularProgressIndicator(color: p.primary))
          : _error != null
              ? _errorBox(context)
              : _orders.isEmpty
                  ? _emptyBox(context)
                  : RefreshIndicator(
                      color: p.primary,
                      onRefresh: _load,
                      child: ListView.separated(
                        padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
                        itemCount: _orders.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 10),
                        itemBuilder: (context, i) => _card(context, _orders[i]),
                      ),
                    ),
    );
  }

  Widget _card(BuildContext context, Order order) {
    final p = context.palette;
    final locale = AppI18n.I.locale.value;
    final firstName =
        order.items.isNotEmpty ? order.items.first.nameFor(locale) : '';
    final more = order.items.length > 1 ? ' +${order.items.length - 1}' : '';

    return Material(
      color: p.card,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () async {
          await Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => OrderDetailPage(orderId: order.id),
            ),
          );
          _load();
        },
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: p.hairline),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      context.tr('app.order_number', {'number': order.orderNumber}),
                      style: AppText.labelLg.copyWith(color: p.onSurface),
                    ),
                  ),
                  _chip(context, order.status),
                ],
              ),
              if (order.createdAt != null) ...[
                const SizedBox(height: 4),
                Text(
                  Fmt.dateTime(order.createdAt!),
                  style: AppText.bodySm.copyWith(color: p.outline),
                ),
              ],
              const SizedBox(height: 8),
              Text(
                '$firstName$more',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppText.bodyMd.copyWith(color: p.onSurfaceVariant),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Text(
                    Fmt.money(order.total),
                    style: AppText.labelLg.copyWith(
                      color: p.accent,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const Spacer(),
                  Icon(Symbols.chevron_right, size: 20, color: p.outline),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _chip(BuildContext context, String status) {
    final p = context.palette;
    late final Color bg, fg;
    switch (status) {
      case 'delivered':
        bg = p.successBg;
        fg = p.successText;
        break;
      case 'cancelled':
        bg = p.errorBg;
        fg = p.errorText;
        break;
      case 'pending':
        bg = p.warningBg;
        fg = p.warningText;
        break;
      default:
        bg = p.primaryFixed;
        fg = p.dark ? p.onPrimaryFixed : const Color(0xFFA23F00);
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        context.tr('status.$status'),
        style: AppText.labelSm.copyWith(color: fg, fontWeight: FontWeight.w700),
      ),
    );
  }

  Widget _emptyBox(BuildContext context) {
    final p = context.palette;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Symbols.receipt_long, size: 48, color: p.outline),
          const SizedBox(height: 12),
          Text(
            context.tr('settings.no_orders'),
            style: AppText.bodyMd.copyWith(color: p.onSurfaceVariant),
          ),
        ],
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
}
