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
import '../orders/order_detail_screen.dart';

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

  Future<void> _pickAddress() async {
    final l = AppLocalizations.of(context);
    final result = await showModalBottomSheet<Object>(
      context: context,
      builder: (context) => SafeArea(
        child: ListView(
          shrinkWrap: true,
          padding: const EdgeInsets.symmetric(vertical: 12),
          children: [
            for (final a in _addresses)
              ListTile(
                leading: Icon(
                  a.id == _addressId
                      ? Icons.radio_button_checked_rounded
                      : Icons.radio_button_off_rounded,
                  color: context.c.primary,
                ),
                title: Text(a.label),
                subtitle: Text(a.address),
                onTap: () => Navigator.of(context).pop(a),
              ),
            ListTile(
              leading: Icon(Icons.add_location_alt_outlined, color: context.c.primary),
              title: Text(l.checkout_add_address),
              onTap: () => Navigator.of(context).pop('new'),
            ),
          ],
        ),
      ),
    );

    if (!mounted || result == null) return;
    if (result is Address) {
      setState(() => _addressId = result.id);
    } else if (result == 'new') {
      await _addAddress();
    }
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
      // Yangi manzilни tanlash (label+address bo'yicha topamiz).
      Address? created;
      for (final a in list) {
        if (a.label == address.label && a.address == address.address) created = a;
      }
      setState(() => _addressId = created?.id ?? list.lastOrNull?.id);
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
    final navigator = Navigator.of(context);
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
      await showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (dialogContext) => AlertDialog(
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: context.c.success.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.check_rounded, size: 36, color: context.c.success),
              ),
              const SizedBox(height: 14),
              Text(
                l.checkout_done_title,
                textAlign: TextAlign.center,
                style: Theme.of(dialogContext).textTheme.titleLarge,
              ),
              const SizedBox(height: 6),
              Text(
                l.checkout_done_sub(order.orderNumber),
                textAlign: TextAlign.center,
                style: Theme.of(dialogContext).textTheme.bodySmall,
              ),
            ],
          ),
          actions: [
            FilledButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: Text(l.checkout_to_orders),
            ),
          ],
        ),
      );

      if (!mounted) return;
      navigator.pushReplacement(
        MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: order.id)),
      );
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
    final cart = context.watch<CartService>();
    final discount = widget.promo?.discount ?? 0;
    final fee = _deliveryType == 'pickup' || cart.subtotal >= freeDeliveryFrom ? 0 : deliveryFee;
    final total = cart.subtotal + fee - discount;
    final address = _selectedAddress;

    return Scaffold(
      appBar: AppBar(title: Text(l.checkout_title)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 140),
          children: [
            _sectionTitle(l.checkout_delivery_type),
            SizedBox(
              width: double.infinity,
              child: SegmentedButton<String>(
                segments: [
                  ButtonSegment(
                    value: 'delivery',
                    label: Text(l.checkout_delivery),
                    icon: const Icon(Icons.delivery_dining_rounded, size: 18),
                  ),
                  ButtonSegment(
                    value: 'pickup',
                    label: Text(l.checkout_pickup),
                    icon: const Icon(Icons.storefront_rounded, size: 18),
                  ),
                ],
                selected: {_deliveryType},
                onSelectionChanged: (s) => setState(() => _deliveryType = s.first),
                showSelectedIcon: false,
              ),
            ),

            if (_deliveryType == 'delivery') ...[
              _sectionTitle(l.checkout_address),
              Container(
                decoration: BoxDecoration(
                  color: c.surface,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: c.line.withValues(alpha: 0.6)),
                ),
                child: ListTile(
                  leading: Icon(Icons.location_on_outlined, color: c.primary),
                  title: Text(
                    address?.label ?? l.checkout_no_address,
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: c.fg,
                    ),
                  ),
                  subtitle: address == null
                      ? null
                      : Text(
                          address.address,
                          style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: c.subtle),
                        ),
                  trailing: _addingAddress
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2.2),
                        )
                      : Icon(Icons.chevron_right_rounded, color: c.subtle),
                  onTap: _addingAddress ? null : _pickAddress,
                ),
              ),
            ],

            _sectionTitle(l.checkout_payment),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final method in PaymentMethod.values)
                  ChoiceChip(
                    label: Text(_paymentLabel(l, method)),
                    selected: _payment == method,
                    showCheckmark: false,
                    selectedColor: c.primary,
                    labelStyle: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: _payment == method ? Colors.white : c.fg,
                    ),
                    onSelected: (_) => setState(() => _payment = method),
                  ),
              ],
            ),

            _sectionTitle(l.checkout_notes),
            TextField(
              controller: _notesCtrl,
              maxLines: 2,
              decoration: InputDecoration(hintText: l.checkout_notes_hint),
            ),

            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: c.surface,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: c.line.withValues(alpha: 0.6)),
              ),
              child: Column(
                children: [
                  _row(l, c, l.cart_subtotal, formatPrice(cart.subtotal)),
                  _row(l, c, l.cart_delivery,
                      fee == 0 ? l.cart_free : formatPrice(fee),
                      valueColor: fee == 0 ? c.success : null),
                  if (discount > 0)
                    _row(l, c, l.cart_discount, '-${formatPrice(discount)}', valueColor: c.success),
                  Divider(color: c.line),
                  const SizedBox(height: 8),
                  _row(l, c, l.cart_total, formatPrice(total), bold: true),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          decoration: BoxDecoration(
            color: c.surface,
            border: Border(top: BorderSide(color: c.line)),
          ),
          child: Row(
            children: [
              Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(l.cart_total, style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: c.subtle)),
                  Text(
                    formatPrice(total),
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: c.fg,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              SizedBox(
                width: 190,
                child: FilledButton(
                  onPressed: _placing ? null : _placeOrder,
                  child: _placing
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(strokeWidth: 2.4, color: Colors.white),
                        )
                      : Text(l.checkout_place),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _paymentLabel(AppLocalizations l, PaymentMethod method) => switch (method) {
        PaymentMethod.cash => l.checkout_cash,
        PaymentMethod.payme => 'Payme',
        PaymentMethod.click => 'Click',
        PaymentMethod.uzum => 'Uzum Bank',
      };

  Widget _sectionTitle(String title) => Padding(
        padding: const EdgeInsets.only(top: 18, bottom: 10),
        child: Text(title, style: Theme.of(context).textTheme.titleMedium),
      );

  Widget _row(AppLocalizations l, BoyxonColors c, String label, String value,
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
