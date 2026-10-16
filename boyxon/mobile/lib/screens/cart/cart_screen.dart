import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api_client.dart';
import '../../core/app_theme.dart';
import '../../core/formatters.dart';
import '../../l10n/app_localizations.dart';
import '../../models/models.dart';
import '../../services/auth_service.dart';
import '../../services/cart_service.dart';
import '../../services/settings_service.dart';
import '../../widgets/quantity_stepper.dart';
import '../../widgets/state_views.dart';
import '../auth/login_screen.dart';
import 'checkout_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key, this.onGoMenu});

  /// Bo'sh savatda "Menyuga o'tish" uchun (Shell tab almashtirish).
  final VoidCallback? onGoMenu;

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final _api = ApiClient.instance;
  final _promoCtrl = TextEditingController();

  PromoResult? _promo;
  bool _promoBusy = false;

  @override
  void dispose() {
    _promoCtrl.dispose();
    super.dispose();
  }

  Future<void> _applyPromo() async {
    final l = AppLocalizations.of(context);
    final code = _promoCtrl.text.trim();
    if (code.isEmpty) return;
    final cart = context.read<CartService>();
    final messenger = ScaffoldMessenger.of(context);

    setState(() => _promoBusy = true);
    try {
      final res = await _api.dio.post('/promos/validate', data: {
        'code': code,
        'subtotal': cart.subtotal,
      });
      final promo = PromoResult.fromJson((res.data as Map)['data'] as Map<String, dynamic>);
      if (!mounted) return;
      setState(() => _promo = promo);
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(errorText(e, l))));
    } finally {
      if (mounted) setState(() => _promoBusy = false);
    }
  }

  Future<void> _checkout() async {
    final l = AppLocalizations.of(context);
    final auth = context.read<AuthService>();
    final navigator = Navigator.of(context);
    final messenger = ScaffoldMessenger.of(context);

    if (!auth.isLoggedIn) {
      final loggedIn = await navigator.push<bool>(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
      if (loggedIn != true || !mounted) return;
    } else if (auth.user?.emailVerified == false) {
      messenger.showSnackBar(SnackBar(content: Text(l.auth_verify_required)));
      return;
    }

    if (!mounted) return;
    navigator.push(
      MaterialPageRoute(builder: (_) => CheckoutScreen(promo: _promo)),
    );
  }

  Future<void> _clearCart() async {
    final l = AppLocalizations.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l.cart_empty),
        content: Text(l.cart_clear_confirm),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l.common_cancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: context.c.danger),
            child: Text(l.common_delete),
          ),
        ],
      ),
    );
    if (confirmed == true && mounted) {
      context.read<CartService>().clear();
      setState(() => _promo = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;
    final lang = context.watch<SettingsService>().languageCode;
    final cart = context.watch<CartService>();

    if (cart.isEmpty) {
      return Scaffold(
        body: SafeArea(
          child: EmptyView(
            icon: Icons.shopping_cart_outlined,
            title: l.cart_empty,
            subtitle: l.cart_empty_sub,
            action: FilledButton(
              onPressed: widget.onGoMenu,
              style: FilledButton.styleFrom(
                minimumSize: const Size(200, 48),
                padding: const EdgeInsets.symmetric(horizontal: 28),
              ),
              child: Text(l.cart_to_menu),
            ),
          ),
        ),
      );
    }

    final discount = _promo?.discount ?? 0;
    final total = cart.total(discount: discount);

    return Scaffold(
      appBar: AppBar(
        title: Text(l.cart_title),
        actions: [
          IconButton(
            tooltip: l.cart_clear,
            icon: const Icon(Icons.delete_sweep_outlined),
            onPressed: _clearCart,
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 140),
          children: [
            for (final line in cart.lines)
              _CartLineTile(
                line: line,
                lang: lang,
                onQuantity: (v) => context.read<CartService>().setQuantity(line.dish.id, v),
              ),
            const SizedBox(height: 8),
            _promoSection(l, c),
            const SizedBox(height: 14),
            _summary(l, c, cart, discount, total),
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
                  onPressed: _checkout,
                  child: Text(l.cart_checkout),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _promoSection(AppLocalizations l, BoyxonColors c) {
    final promo = _promo;
    if (promo != null) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: c.success.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: c.success.withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            Icon(Icons.local_offer_rounded, size: 18, color: c.success),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                l.cart_promo_ok(promo.code, formatPrice(promo.discount)),
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: c.success,
                ),
              ),
            ),
            IconButton(
              icon: Icon(Icons.close_rounded, size: 18, color: c.subtle),
              onPressed: () {
                _promoCtrl.clear();
                setState(() => _promo = null);
              },
            ),
          ],
        ),
      );
    }

    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _promoCtrl,
            textCapitalization: TextCapitalization.characters,
            decoration: InputDecoration(
              hintText: l.cart_promo,
              prefixIcon: Icon(Icons.local_offer_outlined, size: 18, color: c.subtle),
            ),
          ),
        ),
        const SizedBox(width: 10),
        SizedBox(
          height: 52,
          child: FilledButton(
            onPressed: _promoBusy ? null : _applyPromo,
            style: FilledButton.styleFrom(
              minimumSize: const Size(100, 52),
              backgroundColor: c.surfaceRaised,
              foregroundColor: c.primaryDark,
            ),
            child: _promoBusy
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2.2),
                  )
                : Text(l.cart_promo_apply),
          ),
        ),
      ],
    );
  }

  Widget _summary(AppLocalizations l, BoyxonColors c, CartService cart, int discount, int total) {
    Widget row(String label, String value, {Color? valueColor, bool bold = false}) {
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

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: c.line.withValues(alpha: 0.6)),
      ),
      child: Column(
        children: [
          row(l.cart_subtotal, formatPrice(cart.subtotal)),
          row(
            l.cart_delivery,
            cart.delivery == 0 ? l.cart_free : formatPrice(cart.delivery),
            valueColor: cart.delivery == 0 ? c.success : null,
          ),
          if (discount > 0)
            row(l.cart_discount, '-${formatPrice(discount)}', valueColor: c.success),
          if (cart.delivery > 0)
            Align(
              alignment: Alignment.centerLeft,
              child: Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(
                  l.home_to_free(formatPrice(cart.toFree)),
                  style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: c.primaryDark),
                ),
              ),
            ),
          Divider(color: c.line),
          const SizedBox(height: 8),
          row(l.cart_total, formatPrice(total), bold: true),
        ],
      ),
    );
  }
}

/// Savatdagi bitta taom qatori.
class _CartLineTile extends StatelessWidget {
  const _CartLineTile({
    required this.line,
    required this.lang,
    required this.onQuantity,
  });

  final CartLine line;
  final String lang;
  final ValueChanged<int> onQuantity;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: c.line.withValues(alpha: 0.6)),
      ),
      child: Row(
        children: [
          DishImage(
            url: line.dish.imageUrl,
            radius: BorderRadius.circular(14),
            width: 68,
            height: 68,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  line.dish.localizedName(lang),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: c.fg,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    QuantityStepper(
                      value: line.quantity,
                      compact: true,
                      onChanged: onQuantity,
                    ),
                    const Spacer(),
                    Text(
                      formatPrice(line.total),
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: c.primaryDark,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
