import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api_client.dart';
import '../../core/app_theme.dart';
import '../../core/formatters.dart';
import '../../core/order_status.dart';
import '../../l10n/app_localizations.dart';
import '../../models/models.dart';
import '../../services/socket_service.dart';
import '../../widgets/state_views.dart';

class OrderDetailScreen extends StatefulWidget {
  const OrderDetailScreen({super.key, required this.orderId});

  final String orderId;

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  final _api = ApiClient.instance;

  Order? _order;
  bool _loading = true;
  bool _cancelling = false;
  Object? _error;
  StreamSubscription<Map<String, dynamic>>? _statusSub;

  @override
  void initState() {
    super.initState();
    _load();
    _statusSub = context.read<SocketService>().orderStatus.listen((event) {
      if (event['orderId'] == widget.orderId) _load(silent: true);
    });
  }

  @override
  void dispose() {
    _statusSub?.cancel();
    super.dispose();
  }

  Future<void> _load({bool silent = false}) async {
    if (!silent) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }
    try {
      final res = await _api.dio.get('/orders/${widget.orderId}');
      final order = Order.fromJson((res.data as Map)['data'] as Map<String, dynamic>);
      if (!mounted) return;
      setState(() {
        _order = order;
        _loading = false;
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

  Future<void> _cancelOrder() async {
    final l = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        content: Text(l.orders_cancel_confirm),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l.common_cancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: context.c.danger),
            child: Text(l.orders_cancelled),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    setState(() => _cancelling = true);
    try {
      await _api.dio.patch('/orders/${widget.orderId}/cancel', data: {'reason': ''});
      messenger.showSnackBar(SnackBar(content: Text(l.orders_cancelled)));
      await _load(silent: true);
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(errorText(e, l))));
    } finally {
      if (mounted) setState(() => _cancelling = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;
    final order = _order;

    return Scaffold(
      appBar: AppBar(
        title: Text(order?.orderNumber ?? l.orders_title),
      ),
      body: SafeArea(
        child: _loading
            ? const LoadingView()
            : _error != null || order == null
                ? ErrorView(
                    message: _error != null ? errorText(_error!, l) : l.common_error,
                    onRetry: _load,
                    retryLabel: l.common_retry,
                  )
                : ListView(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                    children: [
                      // Holat
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: c.surface,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: c.line.withValues(alpha: 0.6)),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  StatusBadge(
                                    label: statusLabel(l, order.status),
                                    color: statusColor(c, order.status),
                                  ),
                                  if (order.createdAt != null) ...[
                                    const SizedBox(height: 8),
                                    Text(
                                      formatDateTime(order.createdAt!),
                                      style: TextStyle(
                                        fontFamily: 'Inter',
                                        fontSize: 12,
                                        color: c.subtle,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            Icon(
                              switch (order.status) {
                                OrderStatus.pending => Icons.hourglass_top_rounded,
                                OrderStatus.confirmed => Icons.thumb_up_alt_outlined,
                                OrderStatus.packing => Icons.soup_kitchen_outlined,
                                OrderStatus.handedToTaxi => Icons.delivery_dining_rounded,
                                OrderStatus.delivered => Icons.check_circle_outline_rounded,
                                OrderStatus.cancelled => Icons.cancel_outlined,
                              },
                              size: 34,
                              color: statusColor(c, order.status),
                            ),
                          ],
                        ),
                      ),

                      // Taomlar
                      _section(l.orders_items),
                      _card(
                        c,
                        Column(
                          children: [
                            for (final item in order.items)
                              Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        '${item.name} ×${item.quantity}',
                                        style: TextStyle(
                                          fontFamily: 'Inter',
                                          fontSize: 14,
                                          color: c.fg,
                                        ),
                                      ),
                                    ),
                                    Text(
                                      formatPrice(item.price * item.quantity),
                                      style: TextStyle(
                                        fontFamily: 'Inter',
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: c.fg,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            Divider(color: c.line),
                            const SizedBox(height: 8),
                            _row(c, l.cart_subtotal, formatPrice(order.subtotal)),
                            _row(
                              c,
                              l.cart_delivery,
                              order.deliveryFee == 0 ? l.cart_free : formatPrice(order.deliveryFee),
                              valueColor: order.deliveryFee == 0 ? c.success : null,
                            ),
                            if (order.discount > 0)
                              _row(c, l.cart_discount, '-${formatPrice(order.discount)}',
                                  valueColor: c.success),
                            const SizedBox(height: 4),
                            _row(c, l.cart_total, formatPrice(order.total), bold: true),
                          ],
                        ),
                      ),

                      // Manzil / olib ketish
                      _section(order.isDelivery ? l.orders_address : l.checkout_pickup),
                      _card(
                        c,
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(
                              order.isDelivery
                                  ? Icons.location_on_outlined
                                  : Icons.storefront_rounded,
                              size: 20,
                              color: c.primary,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                order.isDelivery
                                    ? '${order.addressLabel ?? ''}\n${order.addressLine ?? ''}'.trim()
                                    : l.checkout_pickup,
                                style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 14,
                                  height: 1.4,
                                  color: c.fg,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // To'lov
                      _section(l.orders_payment),
                      _card(
                        c,
                        Row(
                          children: [
                            Icon(Icons.payments_outlined, size: 20, color: c.primary),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                paymentLabel(l, order.paymentMethod),
                                style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.fg),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Izoh
                      if (order.notes != null && order.notes!.isNotEmpty) ...[
                        _section(l.orders_notes),
                        _card(
                          c,
                          Text(
                            order.notes!,
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 14,
                              height: 1.4,
                              color: c.fg,
                            ),
                          ),
                        ),
                      ],

                      // Holat tarixi
                      if (order.statusHistory.isNotEmpty) ...[
                        _section(l.orders_history),
                        _card(
                          c,
                          Column(
                            children: [
                              for (final event in order.statusHistory)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 10),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Padding(
                                        padding: const EdgeInsets.only(top: 4),
                                        child: Container(
                                          width: 10,
                                          height: 10,
                                          decoration: BoxDecoration(
                                            color: statusColor(c, OrderStatus.parse(event.status)),
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              statusLabel(l, OrderStatus.parse(event.status)),
                                              style: TextStyle(
                                                fontFamily: 'Inter',
                                                fontSize: 13,
                                                fontWeight: FontWeight.w600,
                                                color: c.fg,
                                              ),
                                            ),
                                            if (event.timestamp != null)
                                              Text(
                                                formatDateTime(event.timestamp!),
                                                style: TextStyle(
                                                  fontFamily: 'Inter',
                                                  fontSize: 11,
                                                  color: c.subtle,
                                                ),
                                              ),
                                            if (event.note != null && event.note!.isNotEmpty)
                                              Text(
                                                event.note!,
                                                style: TextStyle(
                                                  fontFamily: 'Inter',
                                                  fontSize: 12,
                                                  color: c.subtle,
                                                ),
                                              ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],

                      if (order.canCancel) ...[
                        const SizedBox(height: 20),
                        OutlinedButton(
                          onPressed: _cancelling ? null : _cancelOrder,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: c.danger,
                            side: BorderSide(color: c.danger.withValues(alpha: 0.5)),
                          ),
                          child: _cancelling
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2.2),
                                )
                              : Text(l.orders_cancel_confirm.split('?').first),
                        ),
                      ],
                    ],
                  ),
      ),
    );
  }

  Widget _section(String title) => Padding(
        padding: const EdgeInsets.only(top: 18, bottom: 10),
        child: Text(title, style: Theme.of(context).textTheme.titleMedium),
      );

  Widget _card(BoyxonColors c, Widget child) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: c.surface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: c.line.withValues(alpha: 0.6)),
        ),
        child: child,
      );

  Widget _row(BoyxonColors c, String label, String value,
      {Color? valueColor, bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Text(label, style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.subtle)),
          const Spacer(),
          Text(
            value,
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: bold ? 16 : 14,
              fontWeight: bold ? FontWeight.w800 : FontWeight.w600,
              color: valueColor ?? c.fg,
            ),
          ),
        ],
      ),
    );
  }
}
