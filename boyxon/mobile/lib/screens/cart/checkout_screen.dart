import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api_client.dart';
import '../../core/app_theme.dart';
import '../../core/constants.dart';
import '../../core/formatters.dart';
import '../../l10n/app_localizations.dart';
import '../../models/models.dart';
import '../../services/auth_service.dart';
import '../../services/cart_service.dart';
import '../../widgets/address_form_sheet.dart';
import '../../widgets/cart_summary.dart';
import '../../widgets/ui_kit.dart';
import '../orders/order_detail_screen.dart';

/// Buyurtmani rasmiylashtirish — web `CheckoutSheet` bilan 1:1:
/// yetkazish turi → manzil → to'lov usuli → izoh → hisob-kitob → tasdiqlash.
/// Muvaffaqiyatda — web'dagi success ko'rinishi (check + buyurtma raqami).
class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key, this.promo});

  /// Savatda qo'llanilgan promokod (bo'lsa).
  final PromoResult? promo;

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _api = ApiClient.instance;
  final _notesCtrl = TextEditingController();

  String _deliveryType = 'delivery';
  String? _addressId;
  PaymentMethod _payment = PaymentMethod.cash;
  bool _placing = false;
  bool _addingAddress = false;
  Order? _placed;

  @override
  void initState() {
    super.initState();
    final addresses = context.read<AuthService>().user?.addresses ?? const [];
    if (addresses.isNotEmpty) {
      final def = addresses.firstWhere((a) => a.isDefault, orElse: () => addresses.first);
      _addressId = def.id;
    }
  }

  @override
  void dispose() {
    _notesCtrl.dispose();
    super.dispose();
  }

  List<Address> get _addresses =>
      context.read<AuthService>().user?.addresses ?? const [];

  Address? get _selectedAddress {
    for (final a in _addresses) {
      if (a.id == _addressId) return a;
    }
    return null;
  }

  Future<void> _addAddress() async {
    if (_addingAddress) return;
    final l = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);

    final address = await showAddressFormSheet(context);
    if (address == null || !mounted) return;

    setState(() => _addingAddress = true);
    try {
      final res = await _api.dio.post('/users/me/addresses', data: address.toJson());
      final list = ((res.data as Map)['data'] as List)
          .map((e) => Address.fromJson(e as Map<String, dynamic>))
          .toList();
      if (!mounted) return;
      // Yangi manzilni tanlash (label+address bo'yicha topamiz).
      Address? created;
      for (final a in list) {
        if (a.label == address.label && a.address == address.address) created = a;
      }
      setState(() => _addressId = created?.id ?? (list.isNotEmpty ? list.last.id : null));
      await context.read<AuthService>().reloadMe();
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(errorText(e, l))));
    } finally {
      if (mounted) setState(() => _addingAddress = false);
    }
  }

  Future<void> _placeOrder() async {
    final l = AppLocalizations.of(context);
    final cart = context.read<CartService>();
    final messenger = ScaffoldMessenger.of(context);
    final address = _selectedAddress;

    if (_deliveryType == 'delivery' && address == null) {
      messenger.showSnackBar(SnackBar(content: Text(l.checkout_address_needed)));
      return;
    }

    setState(() => _placing = true);
    try {
      final res = await _api.dio.post('/orders', data: {
        'items': [
          for (final line in cart.lines)
            {'dish': line.dish.id, 'quantity': line.quantity},
        ],
        'deliveryType': _deliveryType,
        if (_deliveryType == 'delivery' && address != null)
          'address': {'label': address.label, 'address': address.address},
        'paymentMethod': _payment.apiValue,
        if (widget.promo != null) 'promoCode': widget.promo!.code,
        if (_notesCtrl.text.trim().isNotEmpty) 'notes': _notesCtrl.text.trim(),
      });
      final order = Order.fromJson((res.data as Map)['data'] as Map<String, dynamic>);
      cart.clear();

      if (!mounted) return;
      setState(() => _placed = order);
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(errorText(e, l))));
    } finally {
      if (mounted) setState(() => _placing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;
    final placed = _placed;

    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Sheet sarlavhasi: title + yopish (web Sheet bilan bir xil).
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 12, 0),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      placed != null ? l.checkout_done_title : l.checkout_title,
                      style: TextStyle(
                        fontFamily: 'Epilogue',
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: c.fg,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).maybePop(),
                    icon: Icon(Icons.close_rounded, size: 22, color: c.subtle),
                  ),
                ],
              ),
            ),
            Expanded(
              child: placed != null ? _successView(l, c, placed) : _formView(l, c),
            ),
          ],
        ),
      ),
    );
  }

  Widget _successView(AppLocalizations l, BoyxonColors c, Order order) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 24),
      children: [
        Icon(Icons.check_circle_rounded, size: 64, color: c.success),
        const SizedBox(height: 16),
        Text(
          order.orderNumber,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: 'Epilogue',
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: c.fg,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          l.checkout_track,
          textAlign: TextAlign.center,
          style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.subtle),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: OutlinePill(
                label: l.cart_go_home,
                onPressed: () => Navigator.of(context).maybePop(),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: GradientButton(
                label: l.checkout_to_orders,
                onPressed: () => Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: order.id)),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _formView(AppLocalizations l, BoyxonColors c) {
    final cart = context.watch<CartService>();
    final discount = widget.promo?.discount ?? 0;
    final fee = _deliveryType == 'pickup' || cart.subtotal >= freeDeliveryFrom ? 0 : deliveryFee;
    final total = (cart.subtotal + fee - discount).clamp(0, 1 << 31);
    final canPlace = !_placing &&
        cart.lines.isNotEmpty &&
        (_deliveryType != 'delivery' || _addressId != null);

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      children: [
        _deliveryToggle(c, l),
        const SizedBox(height: 20),

        if (_deliveryType == 'delivery') ...[
          _label(l.checkout_address, c),
          if (_addresses.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              decoration: BoxDecoration(
                color: BoyxonPalette.primary50,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                l.checkout_no_address,
                style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.subtle),
              ),
            )
          else
            for (final a in _addresses) ...[
              _addressCard(a, c),
              const SizedBox(height: 8),
            ],
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton.icon(
              onPressed: _addingAddress ? null : _addAddress,
              icon: _addingAddress
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.add_location_alt_outlined, size: 18),
              label: Text(l.checkout_add_address),
            ),
          ),
          const SizedBox(height: 4),
        ],

        _label(l.checkout_payment, c),
        LayoutBuilder(
          builder: (context, constraints) {
            final w = (constraints.maxWidth - 8) / 2;
            return Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final method in PaymentMethod.values)
                  SizedBox(width: w, child: _paymentCard(method, c, l)),
              ],
            );
          },
        ),
        const SizedBox(height: 20),

        if (widget.promo != null) ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: c.success.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              l.cart_promo_ok(widget.promo!.code, formatPrice(widget.promo!.discount)),
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: c.success,
              ),
            ),
          ),
          const SizedBox(height: 20),
        ],

        _label(l.checkout_notes, c),
        TextField(
          controller: _notesCtrl,
          maxLines: 2,
          style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.fg),
          decoration: InputDecoration(
            hintText: l.checkout_notes_hint,
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: c.line),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: c.line),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: c.primary),
            ),
          ),
        ),
        const SizedBox(height: 20),

        CartSummary(
          subtotal: cart.subtotal,
          deliveryFee: fee,
          discount: discount,
          total: total,
        ),
        const SizedBox(height: 20),

        GradientButton(
          label: _placing ? l.cart_processing : l.checkout_place,
          size: GradientButtonSize.lg,
          onPressed: canPlace ? _placeOrder : null,
        ),
      ],
    );
  }

  Widget _deliveryToggle(BoyxonColors c, AppLocalizations l) {
    Widget segment(String value, IconData icon, String label) {
      final active = _deliveryType == value;
      return Expanded(
        child: GestureDetector(
          onTap: () => setState(() => _deliveryType = value),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 10),
            decoration: BoxDecoration(
              color: active ? c.surface : Colors.transparent,
              borderRadius: BorderRadius.circular(12),
              boxShadow: active
                  ? [
                      BoxShadow(
                        color: const Color(0xFF5D4037).withValues(alpha: 0.08),
                        blurRadius: 4,
                        offset: const Offset(0, 1),
                      ),
                    ]
                  : null,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, size: 16, color: active ? BoyxonPalette.primary700 : c.subtle),
                const SizedBox(width: 8),
                Text(
                  label,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: active ? BoyxonPalette.primary700 : c.subtle,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: c.placeholderBg,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          segment('delivery', Icons.delivery_dining_rounded, l.checkout_delivery),
          const SizedBox(width: 8),
          segment('pickup', Icons.storefront_rounded, l.checkout_pickup),
        ],
      ),
    );
  }

  Widget _addressCard(Address a, BoyxonColors c) {
    final active = a.id == _addressId;
    return GestureDetector(
      onTap: () => setState(() => _addressId = a.id),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: active ? BoyxonPalette.primary50 : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: active ? c.primary : c.line),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              a.label,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: c.fg,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              a.address,
              style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: c.subtle),
            ),
          ],
        ),
      ),
    );
  }

  Widget _paymentCard(PaymentMethod method, BoyxonColors c, AppLocalizations l) {
    final active = _payment == method;
    final (icon, label) = switch (method) {
      PaymentMethod.payme => (Icons.smartphone_rounded, 'Payme'),
      PaymentMethod.click => (Icons.touch_app_rounded, 'Click'),
      PaymentMethod.uzum => (Icons.account_balance_wallet_rounded, 'Uzum Bank'),
      PaymentMethod.cash => (Icons.payments_rounded, l.checkout_cash),
    };
    final fg = active ? BoyxonPalette.primary700 : c.fg;

    return GestureDetector(
      onTap: () => setState(() => _payment = method),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: active ? BoyxonPalette.primary50 : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: active ? c.primary : c.line),
        ),
        child: Row(
          children: [
            Icon(icon, size: 16, color: fg),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: fg,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _label(String text, BoyxonColors c) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(
          text,
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: c.fgMuted,
          ),
        ),
      );
}
