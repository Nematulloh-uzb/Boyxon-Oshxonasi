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
import '../../widgets/ui_kit.dart';
import '../auth/login_screen.dart';
import 'checkout_screen.dart';

/// Savat sahifasi — web `CartPage` bilan 1:1:
/// sarlavha → cho'ntakda qoladigan pul chizig'i → qatorlar → promo →
/// hisob-kitob → pastdagi checkout paneli.
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
            icon: Icons.shopping_bag_rounded,
            title: l.cart_empty,
            titleSize: 20,
            subtitle: l.cart_empty_sub,
            muted: true,
            action: GradientButton(
              label: l.cart_to_menu,
              expand: false,
              onPressed: widget.onGoMenu,
            ),
          ),
        ),
      );
    }

    final discount = _promo?.discount ?? 0;
    final total = cart.total(discount: discount);
    final toFree = cart.toFree;
    final freeText = toFree > 0
        ? l.cart_free_hint(formatPrice(toFree), formatPrice(deliveryFee))
        : l.cart_free_done(formatPrice(deliveryFee));

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 16),
          children: [
            Text(
              l.cart_title,
              style: TextStyle(
                fontFamily: 'Epilogue',
                fontSize: 24,
                fontWeight: FontWeight.w800,
                height: 1.2,
                color: c.fg,
              ),
            ),
            const SizedBox(height: 16),

            // Cho'ntakda qoladigan pul chizig'i.
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: BoyxonPalette.primary50,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                freeText,
                style: const TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: BoyxonPalette.primary700,
                ),
              ),
            ),
            const SizedBox(height: 16),

            for (final line in cart.lines) ...[
              _CartLineTile(
                line: line,
                lang: lang,
                onQuantity: (v) => context.read<CartService>().setQuantity(line.dish.id, v),
                onRemove: () {
                  context.read<CartService>().remove(line.dish.id);
                  if (cart.lines.length == 1) setState(() => _promo = null);
                },
              ),
              const SizedBox(height: 12),
            ],

            _promoSection(l, c),
            const SizedBox(height: 20),
            CartSummary(
              subtotal: cart.subtotal,
              deliveryFee: cart.delivery,
              discount: discount,
              total: total,
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: c.surface,
          border: Border(top: BorderSide(color: c.line)),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    freeText,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: BoyxonPalette.primary700,
                    ),
                  ),
                  Text.rich(
                    TextSpan(
                      text: '${l.cart_total}: ',
                      style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: c.subtle),
                      children: [
                        TextSpan(
                          text: formatPrice(total),
                          style: const TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 12,
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
            const SizedBox(width: 12),
            GradientButton(label: l.cart_checkout, expand: false, onPressed: _checkout),
          ],
        ),
      ),
    );
  }

  Widget _promoSection(AppLocalizations l, BoyxonColors c) {
    final promo = _promo;
    if (promo != null) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: Container(
          padding: const EdgeInsets.fromLTRB(12, 4, 4, 4),
          decoration: BoxDecoration(
            color: c.success.withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
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
                icon: Icon(Icons.close_rounded, size: 18, color: c.success),
                onPressed: () {
                  _promoCtrl.clear();
                  setState(() => _promo = null);
                },
              ),
            ],
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _promoCtrl,
              textCapitalization: TextCapitalization.characters,
              style: TextStyle(fontFamily: 'Inter', fontSize: 15, color: c.fg),
              decoration: InputDecoration(hintText: l.cart_promo),
            ),
          ),
          const SizedBox(width: 8),
          GradientButton(
            label: l.cart_promo_apply,
            size: GradientButtonSize.md,
            expand: false,
            loading: _promoBusy,
            onPressed: _applyPromo,
          ),
        ],
      ),
    );
  }

  Widget _summary(AppLocalizations l, BoyxonColors c, CartService cart, int discount, int total) {
    final toFree = cart.toFree;
    final progress = (cart.subtotal / freeDeliveryFrom).clamp(0.0, 1.0);

    Widget row(String label, String value, {Color? valueColor}) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Row(
          children: [
            Text(label, style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.subtle)),
            const Spacer(),
            Text(
              value,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: valueColor ?? c.fg,
              ),
            ),
          ],
        ),
      );
    }

    return CardBox(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          row(l.cart_subtotal, formatPrice(cart.subtotal)),
          row(
            l.cart_delivery,
            cart.delivery == 0 ? l.cart_free : formatPrice(cart.delivery),
          ),
          if (discount > 0)
            row(l.cart_discount, '−${formatPrice(discount)}', valueColor: c.success),
          if (cart.subtotal > 0 && toFree > 0)
            Container(
              width: double.infinity,
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: BoyxonPalette.primary50,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l.cart_free_hint(formatPrice(toFree), formatPrice(deliveryFee)),
                    style: const TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: BoyxonPalette.primary700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: LinearProgressIndicator(
                      value: progress,
                      minHeight: 6,
                      backgroundColor: BoyxonPalette.primary100,
                      valueColor: const AlwaysStoppedAnimation(BoyxonPalette.primary),
                    ),
                  ),
                ],
              ),
            ),
          if (cart.subtotal >= freeDeliveryFrom)
            Container(
              width: double.infinity,
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: c.success.withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                l.cart_free_done(formatPrice(deliveryFee)),
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: c.success,
                ),
              ),
            ),
          Container(
            padding: const EdgeInsets.only(top: 10),
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: c.line)),
            ),
            child: Row(
              children: [
                Text(
                  l.cart_total,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: c.fg,
                  ),
                ),
                const Spacer(),
                Text(
                  formatPrice(total),
                  style: const TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: BoyxonPalette.primaryDark,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Savatdagi bitta taom qatori — web `CartItem` bilan 1:1.
class _CartLineTile extends StatelessWidget {
  const _CartLineTile({
    required this.line,
    required this.lang,
    required this.onQuantity,
    required this.onRemove,
  });

  final CartLine line;
  final String lang;
  final ValueChanged<int> onQuantity;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final l = AppLocalizations.of(context);
    final hasImage = line.dish.imageUrl != null && line.dish.imageUrl!.isNotEmpty;

    return CardBox(
      padding: const EdgeInsets.all(12),
      radius: 20,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 80x80 rasm (web: h-20 w-20 rounded-2xl bg-muted).
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: SizedBox(
              width: 80,
              height: 80,
              child: hasImage
                  ? DishImage(url: line.dish.imageUrl)
                  : Container(
                      color: c.placeholderBg,
                      alignment: Alignment.center,
                      child: Text(
                        l.dish_no_image,
                        style: TextStyle(fontFamily: 'Inter', fontSize: 10, color: c.subtle),
                      ),
                    ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        line.dish.localizedName(lang),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: c.fg,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: onRemove,
                      child: Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Icon(Icons.delete_outline_rounded, size: 16, color: c.subtle),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  formatPrice(line.dish.price),
                  style: const TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: BoyxonPalette.primaryDark,
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
                    const SizedBox(width: 12),
                    Text(
                      formatPrice(line.total),
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: c.fg,
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
