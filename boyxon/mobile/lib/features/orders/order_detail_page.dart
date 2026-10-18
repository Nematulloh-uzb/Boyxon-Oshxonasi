import 'package:flutter/material.dart';
import 'package:material_symbols_icons/symbols.dart';

import '../../core/api/api_client.dart';
import '../../core/i18n/app_i18n.dart';
import '../../core/utils/formatters.dart';
import '../../data/models/order.dart';
import '../../data/services/admin_service.dart';
import '../../data/services/order_service.dart';
import '../../theme/app_text.dart';
import '../../theme/app_theme.dart';

/// Bitta buyurtma tafsiloti + status tarixi.
///
/// `admin: true` bo'lsa — `/api/admin/orders/:id` orqali yuklanadi va
/// mijoz amallari (bekor qilish, baholash) ko'rsatilmaydi.
class OrderDetailPage extends StatefulWidget {
  const OrderDetailPage({super.key, required this.orderId, this.admin = false});

  final String orderId;
  final bool admin;

  @override
  State<OrderDetailPage> createState() => _OrderDetailPageState();
}

class _OrderDetailPageState extends State<OrderDetailPage> {
  Order? _order;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final o = widget.admin
          ? await AdminService.I.orderDetail(widget.orderId)
          : await OrderService.I.byId(widget.orderId);
      if (!mounted) return;
      setState(() {
        _order = o;
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

  void _snack(String msg) {
    if (!mounted || msg.isEmpty) return;
    ScaffoldMessenger.maybeOf(context)
      ?..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(msg)));
  }

  Future<void> _cancel() async {
    final reasonCtrl = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          context.tr('app.cancel_order_q'),
          style: AppText.headlineSm,
        ),
        content: TextField(
          controller: reasonCtrl,
          maxLines: 2,
          decoration: InputDecoration(hintText: context.tr('app.reason_ph')),
        ),
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
            child: Text(context.tr('app.confirm')),
          ),
        ],
      ),
    );
    final reason = reasonCtrl.text.trim();
    reasonCtrl.dispose();
    if (ok != true || !mounted) return;
    try {
      await OrderService.I.cancel(
        widget.orderId,
        reason: reason.isEmpty ? null : reason,
      );
      if (mounted) _snack(context.tr('app.cancelled_ok'));
      await _load();
    } on ApiException catch (e) {
      _snack(e.message);
    } catch (_) {
      if (mounted) _snack(context.tr('home.load_error'));
    }
  }

  Future<void> _review() async {
    var rating = 5;
    final textCtrl = TextEditingController();
    final sent = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => AlertDialog(
          title: Text(
            context.tr('app.review_title'),
            style: AppText.headlineSm,
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  for (var i = 1; i <= 5; i++)
                    GestureDetector(
                      onTap: () => setLocal(() => rating = i),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: Icon(
                          i <= rating ? Icons.star : Icons.star_border,
                          size: 30,
                          color: context.palette.primary,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: textCtrl,
                minLines: 2,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: context.tr('app.review_hint'),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: Text(context.tr('common.cancel')),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: Text(context.tr('app.send')),
            ),
          ],
        ),
      ),
    );
    final text = textCtrl.text.trim();
    textCtrl.dispose();
    if (sent != true || !mounted) return;
    try {
      await OrderService.I.review(
        widget.orderId,
        rating: rating,
        text: text.isEmpty ? null : text,
      );
      if (mounted) _snack(context.tr('app.review_thanks'));
    } on ApiException catch (e) {
      _snack(e.message);
    } catch (_) {
      if (mounted) _snack(context.tr('home.load_error'));
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final order = _order;

    return Scaffold(
      backgroundColor: p.bg,
      appBar: AppBar(
        backgroundColor: p.bg,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: p.onSurface),
        title: Text(
          order != null
              ? context.tr('app.order_number', {'number': order.orderNumber})
              : context.tr('nav.orders'),
          style: AppText.headlineSm.copyWith(color: p.onSurface),
        ),
      ),
      body: _loading
          ? Center(child: CircularProgressIndicator(color: p.primary))
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Symbols.cloud_off, size: 48, color: p.outline),
                        const SizedBox(height: 12),
                        Text(
                          _error!,
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
                )
              : ListView(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
                  children: [
                    _hero(context, order!),
                    const SizedBox(height: 12),
                    _timeline(context, order),
                    const SizedBox(height: 12),
                    _info(context, order),
                    const SizedBox(height: 12),
                    _items(context, order),
                    const SizedBox(height: 12),
                    _summary(context, order),
                    const SizedBox(height: 18),
                    if (order.isActive && !widget.admin)
                      OutlinedButton.icon(
                        onPressed: _cancel,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: p.error,
                          side: BorderSide(color: p.error.withValues(alpha: 0.5)),
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        icon: const Icon(Symbols.cancel, size: 18),
                        label: Text(
                          context.tr('app.cancel_order'),
                          style: AppText.labelLg.copyWith(color: p.error),
                        ),
                      ),
                    if (order.isDelivered && !widget.admin)
                      FilledButton.icon(
                        onPressed: _review,
                        style: FilledButton.styleFrom(
                          backgroundColor: p.primary,
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        icon: const Icon(Symbols.star, size: 18, color: Colors.white),
                        label: Text(
                          context.tr('app.review'),
                          style: AppText.labelLg.copyWith(color: Colors.white),
                        ),
                      ),
                  ],
                ),
    );
  }

  Widget _hero(BuildContext context, Order order) {
    final p = context.palette;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: p.hairline),
        boxShadow: [
          BoxShadow(color: p.shadow, blurRadius: 14, offset: const Offset(0, 6)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _chip(context, order.status),
              const Spacer(),
              if (order.createdAt != null)
                Text(
                  Fmt.dateTime(order.createdAt!),
                  style: AppText.bodySm.copyWith(color: p.outline),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(
                order.isPickup ? Symbols.directions_walk : Symbols.two_wheeler,
                size: 18,
                color: p.onSurfaceVariant,
              ),
              const SizedBox(width: 6),
              Text(
                order.isPickup
                    ? context.tr('cart.pickup')
                    : context.tr('cart.delivery'),
                style: AppText.labelMd.copyWith(color: p.onSurfaceVariant),
              ),
              const Spacer(),
              Text(
                Fmt.money(order.total),
                style: AppText.headlineSm.copyWith(color: p.accent),
              ),
            ],
          ),
          if (order.estimatedDeliveryAt != null && order.isActive) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Symbols.schedule, size: 16, color: p.onSurfaceVariant),
                const SizedBox(width: 6),
                Text(
                  Fmt.dateTime(order.estimatedDeliveryAt!),
                  style: AppText.bodySm.copyWith(color: p.onSurfaceVariant),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _timeline(BuildContext context, Order order) {
    final p = context.palette;
    final stages = order.isCancelled
        ? const <String>[]
        : (order.isPickup
            ? const ['pending', 'confirmed', 'packing', 'delivered']
            : const ['pending', 'confirmed', 'packing', 'handed_to_taxi', 'delivered']);

    final rows = <Widget>[];

    if (order.isCancelled) {
      rows.add(_timelineRow(
        context,
        label: context.tr('status.cancelled'),
        time: order.statusHistory.isNotEmpty ? order.statusHistory.last.timestamp : null,
        state: 'cancelled',
      ));
    } else {
      for (var i = 0; i < stages.length; i++) {
        final s = stages[i];
        final reached = order.reached(s);
        final isCurrent = order.status == s;
        DateTime? time;
        for (final h in order.statusHistory) {
          if (h.status == s) {
            time = h.timestamp;
            break;
          }
        }
        rows.add(_timelineRow(
          context,
          label: context.tr('status.$s'),
          time: time,
          state: isCurrent ? 'current' : (reached ? 'done' : 'future'),
          last: i == stages.length - 1,
        ));
      }
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: p.hairline),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: rows),
    );
  }

  Widget _timelineRow(
    BuildContext context, {
    required String label,
    DateTime? time,
    required String state,
    bool last = true,
  }) {
    final p = context.palette;
    late final Color dot;
    switch (state) {
      case 'done':
        dot = p.successText;
        break;
      case 'current':
        dot = p.primary;
        break;
      case 'cancelled':
        dot = p.error;
        break;
      default:
        dot = p.outlineVariant;
    }
    final done = state == 'done' || state == 'current' || state == 'cancelled';
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 12,
                height: 12,
                margin: const EdgeInsets.only(top: 3),
                decoration: BoxDecoration(color: dot, shape: BoxShape.circle),
              ),
              if (!last)
                Expanded(
                  child: Container(
                    width: 2,
                    color: done ? dot.withValues(alpha: 0.4) : p.outlineVariant,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: last ? 0 : 16),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      label,
                      style: AppText.labelMd.copyWith(
                        color: state == 'future' ? p.onSurfaceVariant : p.onSurface,
                        fontWeight:
                            state == 'current' ? FontWeight.w700 : FontWeight.w500,
                      ),
                    ),
                  ),
                  if (time != null)
                    Text(
                      Fmt.dateTime(time),
                      style: AppText.bodySm.copyWith(color: p.outline),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _info(BuildContext context, Order order) {
    final p = context.palette;

    Widget row(IconData icon, String label, String value) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, size: 18, color: p.onSurfaceVariant),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: AppText.labelSm.copyWith(color: p.onSurfaceVariant),
                    ),
                    const SizedBox(height: 1),
                    Text(
                      value,
                      style: AppText.bodyMd.copyWith(color: p.onSurface),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: p.hairline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (widget.admin && (order.userName ?? '').isNotEmpty)
            row(
              Symbols.person,
              'Mijoz',
              [order.userName, order.userPhone]
                  .whereType<String>()
                  .where((e) => e.isNotEmpty)
                  .join(' · '),
            ),
          if (!order.isPickup && order.addressText != null)
            row(
              Symbols.location_on,
              context.tr('cart.address'),
              [order.addressLabel, order.addressText]
                  .whereType<String>()
                  .where((e) => e.isNotEmpty)
                  .join(' · '),
            ),
          row(
            Symbols.credit_card,
            context.tr('cart.payment_method'),
            _payLabel(context, order.paymentMethod),
          ),
          if (order.courierName != null && order.courierName!.isNotEmpty)
            row(Symbols.delivery_dining, 'Kuryer', order.courierName!),
          if (order.notes != null && order.notes!.isNotEmpty)
            row(Symbols.sticky_note_2, context.tr('cart.notes'), order.notes!),
          if (order.isCancelled &&
              order.cancelReason != null &&
              order.cancelReason!.isNotEmpty)
            row(Symbols.info, context.tr('status.cancelled'), order.cancelReason!),
        ],
      ),
    );
  }

  Widget _items(BuildContext context, Order order) {
    final p = context.palette;
    final locale = AppI18n.I.locale.value;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: p.hairline),
      ),
      child: Column(
        children: [
          for (final it in order.items)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 5),
              child: Row(
                children: [
                  Container(
                    constraints: const BoxConstraints(minWidth: 34),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: p.cardLow,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${it.quantity}×',
                      textAlign: TextAlign.center,
                      style: AppText.labelMd.copyWith(color: p.onSurfaceVariant),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      it.nameFor(locale),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppText.bodyMd.copyWith(color: p.onSurface),
                    ),
                  ),
                  Text(
                    Fmt.money(it.lineTotal),
                    style: AppText.labelMd.copyWith(color: p.onSurface),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _summary(BuildContext context, Order order) {
    final p = context.palette;

    Widget row(String label, String value, {Color? color, bool bold = false}) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            Expanded(
              child: Text(
                label,
                style: AppText.bodyMd.copyWith(color: p.onSurfaceVariant),
              ),
            ),
            Text(
              value,
              style: AppText.labelLg.copyWith(
                color: color ?? p.onSurface,
                fontWeight: bold ? FontWeight.w700 : FontWeight.w600,
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: p.hairline),
      ),
      child: Column(
        children: [
          row(context.tr('cart.subtotal'), Fmt.money(order.subtotal)),
          if (order.deliveryFee > 0)
            row(context.tr('cart.delivery_fee'), Fmt.money(order.deliveryFee)),
          if (order.discount > 0)
            row(
              '${context.tr('cart.discount')}'
              '${order.promoCode != null ? ' (${order.promoCode})' : ''}',
              '-${Fmt.money(order.discount)}',
              color: p.successText,
            ),
          Container(
            height: 1,
            color: p.cardHigh,
            margin: const EdgeInsets.symmetric(vertical: 8),
          ),
          row(
            context.tr('cart.total'),
            Fmt.money(order.total),
            color: p.accent,
            bold: true,
          ),
        ],
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
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        context.tr('status.$status'),
        style: AppText.labelMd.copyWith(color: fg, fontWeight: FontWeight.w700),
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
}
