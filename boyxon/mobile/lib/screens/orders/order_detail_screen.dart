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
import '../../widgets/ui_kit.dart';

/// Buyurtma tafsiloti — web `OrderDetailPage` bilan 1:1:
/// karta ichida sarlavha + Orqaga, o'ngga tekislangan raqam/sana,
/// keyin bo'limlar (mijoz, taomlar, hisob-kitob, holat, manzil, to'lov, izoh).
/// Qo'shimcha (app'dagi mavjud funksiya): real-time yangilanish, holat tarixi,
/// bekor qilish tugmasi.
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

    Widget child;
    if (_loading) {
      child = const LoadingView();
    } else if (_error != null || _order == null) {
      // Web: markazda danger matn + outline "Orqaga".
      child = Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                _error != null ? errorText(_error!, l) : l.orders_not_found,
                textAlign: TextAlign.center,
                style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.danger),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: 200,
                child: OutlinePill(
                  label: l.common_back,
                  onPressed: () => Navigator.of(context).maybePop(),
                ),
              ),
            ],
          ),
        ),
      );
    } else {
      child = _detail(l, c, _order!);
    }

    return Scaffold(body: SafeArea(child: child));
  }

  Widget _detail(AppLocalizations l, BoyxonColors c, Order order) {
    Widget inlineRow(String label, String value) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 4),
        child: Text.rich(
          TextSpan(
            text: '$label: ',
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: c.fg,
            ),
            children: [
              TextSpan(
                text: value,
                style: const TextStyle(fontWeight: FontWeight.w400),
              ),
            ],
          ),
        ),
      );
    }

    Widget section(String title, Widget child) {
      return Container(
        width: double.infinity,
        margin: const EdgeInsets.only(top: 16),
        padding: const EdgeInsets.only(top: 16),
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(color: c.line.withValues(alpha: 0.6)),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: c.fg,
              ),
            ),
            const SizedBox(height: 8),
            child,
          ],
        ),
      );
    }

    Widget rightBlock(String label, String value) {
      return Align(
        alignment: Alignment.centerRight,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '$label:',
              style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.subtle),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: c.fg,
              ),
            ),
          ],
        ),
      );
    }

    final (statusBg, statusFg) = statusBadgeColors(c, order.status);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: c.surface,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 2,
                offset: const Offset(0, 1),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Sarlavha + Orqaga.
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      l.orders_detail_title,
                      style: TextStyle(
                        fontFamily: 'Epilogue',
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        height: 1.2,
                        color: c.fg,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  OutlinePill(
                    label: l.common_back,
                    expand: false,
                    onPressed: () => Navigator.of(context).maybePop(),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // O'ngga tekislangan raqam va sana.
              rightBlock(l.orders_label_number, order.orderNumber),
              const SizedBox(height: 16),
              if (order.createdAt != null) ...[
                rightBlock(l.orders_label_date, formatDateTime(order.createdAt!)),
                const SizedBox(height: 16),
              ],

              // Mijoz ma'lumotlari.
              section(
                l.orders_label_customer,
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    inlineRow(l.common_name, order.userName ?? '—'),
                    inlineRow(l.common_phone, order.userPhone ?? '—'),
                  ],
                ),
              ),

              // Taomlar.
              section(
                l.orders_items,
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    for (final item in order.items)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(
                                item.name,
                                style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 14,
                                  height: 1.3,
                                  color: c.fg,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              '${item.quantity} × ${formatPrice(item.price)} = '
                              '${formatPrice(item.price * item.quantity)}',
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 14,
                                height: 1.3,
                                color: c.fg,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),

              // Hisob-kitob.
              section(
                l.orders_label_totals,
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    inlineRow(l.cart_subtotal, formatPrice(order.subtotal)),
                    if (order.discount > 0)
                      inlineRow(l.cart_discount, '-${formatPrice(order.discount)}'),
                    if (order.deliveryFee > 0)
                      inlineRow(l.cart_delivery, formatPrice(order.deliveryFee)),
                    Container(
                      width: double.infinity,
                      margin: const EdgeInsets.only(top: 4),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        border: Border(
                          top: BorderSide(color: c.line.withValues(alpha: 0.4)),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${l.cart_total}:',
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                              color: c.fg,
                            ),
                          ),
                          Text(
                            formatPrice(order.total),
                            style: const TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                              color: BoyxonPalette.primaryDark,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Holat.
              section(
                l.orders_label_status,
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                  decoration: BoxDecoration(
                    color: statusBg,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    statusLabel(l, order.status),
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: statusFg,
                    ),
                  ),
                ),
              ),

              // Manzil (yetkazishda).
              if (order.isDelivery && order.addressLine != null)
                section(
                  l.orders_address,
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      inlineRow(l.common_label, order.addressLabel ?? '—'),
                      inlineRow(l.common_address, order.addressLine ?? '—'),
                    ],
                  ),
                ),

              // To'lov usuli.
              section(
                l.orders_payment,
                Text(
                  paymentLabel(l, order.paymentMethod),
                  style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.fg),
                ),
              ),

              // Izoh.
              if (order.notes != null && order.notes!.isNotEmpty)
                section(
                  l.orders_notes,
                  Text(
                    order.notes!,
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 14,
                      height: 1.4,
                      color: c.subtle,
                    ),
                  ),
                ),

              // Holat tarixi (app qo'shimchasi).
              if (order.statusHistory.isNotEmpty)
                section(
                  l.orders_history,
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
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
          ),
        ),

        // Bekor qilish (app qo'shimchasi) — faqat pending/confirmed holatda.
        if (order.canCancel) ...[
          const SizedBox(height: 16),
          OutlinePill(
            label: _cancelling ? '...' : l.orders_cancel_confirm.replaceAll('?', ''),
            foreground: c.danger,
            borderColor: c.danger.withValues(alpha: 0.5),
            onPressed: _cancelling ? null : _cancelOrder,
          ),
        ],
      ],
    );
  }
}
