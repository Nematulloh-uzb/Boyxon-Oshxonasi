import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:provider/provider.dart';

import '../../core/api/api_client.dart';
import '../../core/config/app_config.dart';
import '../../core/i18n/app_i18n.dart';
import '../../core/session/session_controller.dart';
import '../../core/utils/formatters.dart';
import '../../data/models/order.dart';
import '../../data/models/user.dart';
import '../../data/services/order_service.dart';
import '../../data/services/user_service.dart';
import '../../theme/app_text.dart';
import '../../theme/app_theme.dart';
import '../home/dish_card.dart';
import '../orders/order_detail_page.dart';
import '../address/map_picker_page.dart';
import 'cart_controller.dart';

/// Savat + checkout ekrani (dizayn 03-cart-checkout).
class CartPage extends StatefulWidget {
  const CartPage({super.key, this.onOpenHome, this.onOpenMenu});

  final VoidCallback? onOpenHome;
  final VoidCallback? onOpenMenu;

  @override
  State<CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  final _promoCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();

  String _payment = 'payme';
  bool _busy = false;
  bool _seeded = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _seed());
  }

  @override
  void dispose() {
    _promoCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  /// Standart manzil va izohni tiklash.
  void _seed() {
    if (_seeded || !mounted) return;
    _seeded = true;
    final cart = context.read<CartController>();
    final user = context.read<SessionController>().user;
    if (cart.address == null && user != null && user.addresses.isNotEmpty) {
      final def = user.addresses.firstWhere(
        (a) => a.isDefault,
        orElse: () => user.addresses.first,
      );
      cart.setAddress(def);
    }
    if (cart.notes.isNotEmpty && _notesCtrl.text.isEmpty) {
      _notesCtrl.text = cart.notes;
    }
  }

  void _snack(String msg) {
    if (!mounted || msg.isEmpty) return;
    ScaffoldMessenger.maybeOf(context)
      ?..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(msg)));
  }

  // ---- Amallar ----

  Future<void> _confirmClear() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          context.tr('app.clear_cart'),
          style: AppText.headlineSm,
        ),
        content: Text(
          '${context.tr('app.clear_cart')}?',
          style: AppText.bodyMd,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(context.tr('common.cancel')),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(context.tr('app.confirm')),
          ),
        ],
      ),
    );
    if (ok == true && mounted) context.read<CartController>().clear();
  }

  Future<void> _applyPromo() async {
    final cart = context.read<CartController>();
    final code = _promoCtrl.text.trim();
    if (code.isEmpty) return;
    final ok = await cart.applyPromo(code);
    if (!mounted) return;
    if (ok) {
      _promoCtrl.clear();
      _snack(context.tr('cart.promo_applied', {'code': cart.promoCode ?? code}));
    } else {
      _snack(cart.promoMessage ?? context.tr('cart.promo_invalid'));
    }
  }

  Future<void> _pickAddress() async {
    final p = context.palette;
    final session = context.read<SessionController>();
    final cart = context.read<CartController>();
    final addresses = session.user?.addresses ?? const <Address>[];

    final picked = await showModalBottomSheet<Object>(
      context: context,
      backgroundColor: p.card,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 6),
              child: Text(
                context.tr('cart.address_select'),
                style: AppText.headlineSm.copyWith(color: p.onSurface),
              ),
            ),
            if (addresses.isEmpty)
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 2, 20, 10),
                child: Text(
                  context.tr('cart.no_address'),
                  style: AppText.bodySm.copyWith(color: p.onSurfaceVariant),
                ),
              ),
            for (final a in addresses)
              ListTile(
                leading: Icon(Symbols.location_on, color: p.onSurfaceVariant),
                title: Text(a.label, style: AppText.bodyMd.copyWith(color: p.onSurface)),
                subtitle: Text(
                  a.address,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppText.bodySm.copyWith(color: p.onSurfaceVariant),
                ),
                trailing: cart.address?.address == a.address
                    ? Icon(Symbols.check_circle, size: 20, color: p.primary)
                    : null,
                onTap: () => Navigator.pop(ctx, a),
              ),
            ListTile(
              leading: Icon(Symbols.add_location_alt, color: p.primary),
              title: Text(
                context.tr('settings.address_add'),
                style: AppText.bodyMd.copyWith(color: p.primary),
              ),
              onTap: () => Navigator.pop(ctx, 'new'),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );

    if (!mounted || picked == null) return;
    if (picked is Address) {
      cart.setAddress(picked);
    } else if (picked == 'new') {
      await _addNewAddress();
    }
  }

  Future<void> _addNewAddress() async {
    final labelCtrl = TextEditingController();
    final addrCtrl = TextEditingController();
    MapPickResult? pick;
    final saved = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          context.tr('settings.address_add'),
          style: AppText.headlineSm,
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: labelCtrl,
              decoration: InputDecoration(
                hintText: context.tr('settings.address_label_ph'),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: addrCtrl,
              maxLines: 2,
              decoration: InputDecoration(
                hintText: context.tr('settings.address_text_ph'),
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () async {
                  final result = await Navigator.of(ctx).push<MapPickResult>(
                    MaterialPageRoute(builder: (_) => const MapPickerPage()),
                  );
                  if (result != null) {
                    pick = result;
                    addrCtrl.text = result.address;
                  }
                },
                icon: const Icon(Symbols.map, size: 18),
                label: Text(context.tr('settings.pick_on_map')),
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
            child: Text(context.tr('common.save')),
          ),
        ],
      ),
    );

    final label = labelCtrl.text.trim();
    final text = addrCtrl.text.trim();
    labelCtrl.dispose();
    addrCtrl.dispose();

    if (saved != true || !mounted) return;
    if (label.isEmpty || text.isEmpty) {
      _snack(context.tr('settings.address_required'));
      return;
    }
    try {
      final session = context.read<SessionController>();
      final isFirst = session.user?.addresses.isEmpty ?? true;
      await UserService.I.addAddress(
        Address(label: label, address: text, isDefault: isFirst, lat: pick?.lat, lng: pick?.lng),
      );
      await session.refreshUser();
      if (!mounted) return;
      final list = session.user?.addresses ?? const <Address>[];
      if (list.isNotEmpty) context.read<CartController>().setAddress(list.last);
      _snack(context.tr('settings.address_added'));
    } on ApiException catch (e) {
      _snack(e.message);
    } catch (_) {
      _snack(context.tr('home.load_error'));
    }
  }

  Future<void> _placeOrder() async {
    final cart = context.read<CartController>();
    if (cart.isEmpty || _busy) return;

    if (cart.deliveryType == 'delivery' && cart.address == null) {
      _snack(context.tr('cart.no_address'));
      return;
    }

    setState(() => _busy = true);
    try {
      final order = await OrderService.I.create(
        items: cart.orderItems(),
        deliveryType: cart.deliveryType,
        address: cart.deliveryType == 'delivery' ? cart.address?.toJson() : null,
        paymentMethod: _payment,
        promoCode: cart.promoCode,
        notes: cart.notes,
      );
      cart.clear();
      if (!mounted) return;
      await _showSuccess(order);
    } on ApiException catch (e) {
      _snack(e.message);
    } catch (_) {
      if (mounted) _snack(context.tr('home.load_error'));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _showSuccess(Order order) async {
    final p = context.palette;
    final est = order.estimatedDeliveryAt != null
        ? order.estimatedDeliveryAt!.difference(DateTime.now()).inMinutes
        : 45;
    final stages = order.isPickup
        ? ['confirmed', 'packing', 'delivered']
        : ['confirmed', 'packing', 'handed_to_taxi'];

    final goHome = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        backgroundColor: p.card,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(color: p.successBg, shape: BoxShape.circle),
                  child: Center(
                    child: Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: p.successText,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(color: p.shadow, blurRadius: 10, offset: const Offset(0, 4)),
                        ],
                      ),
                      child: Icon(
                        Symbols.check,
                        size: 26,
                        color: p.dark ? const Color(0xFF0B2E1B) : Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 14),
              Text(
                context.tr('cart.order_placed'),
                textAlign: TextAlign.center,
                style: AppText.headlineSm.copyWith(
                  color: p.onSurface,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                context.tr('app.order_success_sub', {
                  'number': order.orderNumber,
                  'min': '$est',
                }),
                textAlign: TextAlign.center,
                style: AppText.bodyMd.copyWith(color: p.onSurfaceVariant),
              ),
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: p.cardLow,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        for (var i = 0; i < stages.length; i++) ...[
                          if (i > 0)
                            Icon(
                              Symbols.arrow_forward,
                              size: 14,
                              color: p.outlineVariant,
                            ),
                          Expanded(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 9,
                                  height: 9,
                                  decoration: BoxDecoration(
                                    color: order.reached(stages[i])
                                        ? p.successText
                                        : (i == 0 ? p.primary : p.outlineVariant),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 5),
                                Flexible(
                                  child: Text(
                                    context.tr('status.${stages[i]}'),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: AppText.labelSm.copyWith(
                                      color: order.reached(stages[i])
                                          ? p.onSurface
                                          : p.onSurfaceVariant,
                                      fontWeight: i == 0
                                          ? FontWeight.w700
                                          : FontWeight.w500,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(999),
                      child: LinearProgressIndicator(
                        value: 0.15,
                        minHeight: 6,
                        backgroundColor: p.cardHigh,
                        valueColor: AlwaysStoppedAnimation<Color>(p.primary),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                height: 46,
                child: FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: p.primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () => Navigator.pop(ctx, false),
                  child: Text(
                    context.tr('cart.track_order'),
                    style: AppText.labelLg.copyWith(color: Colors.white),
                  ),
                ),
              ),
              TextButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: Text(
                  context.tr('cart.go_home'),
                  style: AppText.labelMd.copyWith(color: p.onSurfaceVariant),
                ),
              ),
            ],
          ),
        ),
      ),
    );

    if (!mounted) return;
    if (goHome == true) {
      widget.onOpenHome?.call();
    } else {
      Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => OrderDetailPage(orderId: order.id),
        ),
      );
    }
  }

  // ---- UI ----

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final cart = context.watch<CartController>();

    return Scaffold(
      backgroundColor: p.bg,
      body: SafeArea(
        bottom: false,
        child: cart.isEmpty
            ? _empty(context)
            : ListView(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
                children: [
                  _headerRow(context, cart),
                  const SizedBox(height: 14),
                  for (final line in cart.lines) ...[
                    _itemTile(context, cart, line),
                    const SizedBox(height: 10),
                  ],
                  const SizedBox(height: 2),
                  _addMore(context),
                  const SizedBox(height: 16),
                  _deliverySelector(context, cart),
                  const SizedBox(height: 10),
                  if (cart.deliveryType == 'delivery') ...[
                    _freeDeliveryHint(context, cart),
                    const SizedBox(height: 10),
                    _addressCard(context, cart),
                    const SizedBox(height: 16),
                  ] else
                    const SizedBox(height: 6),
                  _promoSection(context, cart),
                  const SizedBox(height: 16),
                  _paymentSection(context),
                  const SizedBox(height: 16),
                  _notesField(context, cart),
                  const SizedBox(height: 16),
                  _summary(context, cart),
                  const SizedBox(height: 16),
                  _checkoutCta(context, cart),
                ],
              ),
      ),
    );
  }

  Widget _empty(BuildContext context) {
    final p = context.palette;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Symbols.shopping_bag, size: 56, color: p.outline),
            const SizedBox(height: 16),
            Text(
              context.tr('cart.empty'),
              style: AppText.headlineSm.copyWith(color: p.onSurface),
            ),
            const SizedBox(height: 6),
            Text(
              context.tr('cart.empty_desc'),
              textAlign: TextAlign.center,
              style: AppText.bodyMd.copyWith(color: p.onSurfaceVariant),
            ),
            const SizedBox(height: 20),
            FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: p.primary,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onPressed: widget.onOpenMenu,
              child: Text(
                context.tr('cart.go_menu'),
                style: AppText.labelLg.copyWith(color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _headerRow(BuildContext context, CartController cart) {
    final p = context.palette;
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                context.tr('cart.title'),
                style: AppText.headlineMd.copyWith(color: p.onSurface),
              ),
              const SizedBox(height: 2),
              Text(
                '${context.tr('home.items_count', {'count': '${cart.itemCount}'})}'
                ' · ${Fmt.money(cart.total)}',
                style: AppText.labelSm.copyWith(color: p.onSurfaceVariant),
              ),
            ],
          ),
        ),
        TextButton.icon(
          onPressed: _confirmClear,
          icon: Icon(Symbols.delete_sweep, size: 16, color: p.accent),
          label: Text(
            context.tr('app.clear_cart'),
            style: AppText.labelMd.copyWith(color: p.accent),
          ),
        ),
      ],
    );
  }

  Widget _itemTile(BuildContext context, CartController cart, CartLine line) {
    final p = context.palette;
    final dish = line.dish;
    final img = dish.image;
    final locale = AppI18n.I.locale.value;

    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(color: p.shadow, blurRadius: 8, offset: const Offset(0, 3)),
        ],
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: SizedBox(
              width: 80,
              height: 80,
              child: (img != null && img.isNotEmpty)
                  ? CachedNetworkImage(
                      imageUrl: img,
                      fit: BoxFit.cover,
                      placeholder: (_, _) => Container(color: p.cardLow),
                      errorWidget: (_, _, _) => _thumbPlaceholder(context, dish),
                    )
                  : _thumbPlaceholder(context, dish),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: SizedBox(
              height: 80,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    dish.nameFor(locale),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppText.labelLg.copyWith(
                      color: p.onSurface,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    line.quantity > 1
                        ? '${line.quantity} × ${Fmt.money(dish.price)}'
                        : dish.descriptionFor(locale),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppText.bodySm.copyWith(color: p.onSurfaceVariant),
                  ),
                  const Spacer(),
                  Row(
                    children: [
                      Text(
                        Fmt.money(line.total),
                        style: AppText.headlineSm.copyWith(
                          fontSize: 15,
                          color: p.accent,
                        ),
                      ),
                      const Spacer(),
                      _stepper(context, cart, line),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _thumbPlaceholder(BuildContext context, dynamic dish) {
    final p = context.palette;
    return Container(
      color: p.cardLow,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            iconForCategory(dish.categorySlug),
            size: 26,
            color: p.outline.withValues(alpha: 0.35),
          ),
          const SizedBox(height: 2),
          Text(
            context.tr('dish.no_image'),
            style: AppText.bodySm.copyWith(
              fontSize: 10,
              color: p.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _stepper(BuildContext context, CartController cart, CartLine line) {
    final p = context.palette;
    return Container(
      padding: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        color: p.cardHigh,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _stepBtn(context, Symbols.remove, () => cart.decrease(line.dish.id)),
          SizedBox(
            width: 28,
            child: Text(
              '${line.quantity}',
              textAlign: TextAlign.center,
              style: AppText.labelMd.copyWith(color: p.onSurface),
            ),
          ),
          _stepBtn(context, Symbols.add, () => cart.increase(line.dish.id)),
        ],
      ),
    );
  }

  Widget _stepBtn(BuildContext context, IconData icon, VoidCallback onTap) {
    final p = context.palette;
    return Material(
      color: p.card,
      borderRadius: BorderRadius.circular(6),
      child: InkWell(
        borderRadius: BorderRadius.circular(6),
        onTap: onTap,
        child: SizedBox(
          width: 28,
          height: 28,
          child: Icon(icon, size: 16, color: p.onSurface),
        ),
      ),
    );
  }

  Widget _addMore(BuildContext context) {
    final p = context.palette;
    return Container(
      height: 44,
      decoration: BoxDecoration(
        color: p.cardLow,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: widget.onOpenMenu,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Symbols.add_circle, size: 20, color: p.primary),
              const SizedBox(width: 8),
              Text(
                context.tr('app.add_more'),
                style: AppText.labelLg.copyWith(color: p.primary),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _deliverySelector(BuildContext context, CartController cart) {
    final p = context.palette;

    Widget tab(String type, IconData icon, String label) {
      final active = cart.deliveryType == type;
      return Expanded(
        child: GestureDetector(
          onTap: () => cart.setDeliveryType(type),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 160),
            height: 42,
            decoration: BoxDecoration(
              color: active ? p.primary : Colors.transparent,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  icon,
                  size: 18,
                  color: active ? Colors.white : p.onSurfaceVariant,
                ),
                const SizedBox(width: 6),
                Text(
                  label,
                  style: AppText.labelMd.copyWith(
                    color: active ? Colors.white : p.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(5),
      decoration: BoxDecoration(
        color: p.cardLow,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          tab('delivery', Symbols.two_wheeler, context.tr('cart.delivery')),
          const SizedBox(width: 6),
          tab('pickup', Symbols.directions_walk, context.tr('cart.pickup')),
        ],
      ),
    );
  }

  Widget _freeDeliveryHint(BuildContext context, CartController cart) {
    final p = context.palette;
    final free = cart.freeDeliveryRemaining == 0;
    final text = free
        ? context.tr('cart.free_delivery_done', {
            'fee': Fmt.money(AppConfig.deliveryFee),
          })
        : context.tr('cart.free_delivery_hint', {
            'amount': Fmt.money(cart.freeDeliveryRemaining),
            'fee': Fmt.money(AppConfig.deliveryFee),
          });
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: free ? p.successBg : p.warningBg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(
            Symbols.local_shipping,
            size: 18,
            color: free ? p.successText : p.warningText,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: AppText.bodySm.copyWith(
                color: free ? p.successText : p.warningText,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _addressCard(BuildContext context, CartController cart) {
    final p = context.palette;
    final addr = cart.address;
    return Material(
      color: p.card,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: _pickAddress,
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: p.hairline),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: p.primaryFixed,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Symbols.location_on,
                  size: 22,
                  color: p.dark ? p.onPrimaryFixed : const Color(0xFFA23F00),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      context.tr('cart.address'),
                      style: AppText.labelSm.copyWith(
                        color: p.onSurfaceVariant,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 1),
                    Text(
                      addr == null
                          ? context.tr('settings.address_add')
                          : '${addr.label} · ${addr.address}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppText.labelMd.copyWith(color: p.onSurface),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Text(
                addr == null
                    ? context.tr('settings.address_add')
                    : context.tr('app.change'),
                style: AppText.labelMd.copyWith(color: p.accent),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _promoSection(BuildContext context, CartController cart) {
    final p = context.palette;

    if (cart.promoCode != null) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: p.successBg,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(Symbols.celebration, size: 20, color: p.successText),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                context.tr('cart.promo_applied', {'code': cart.promoCode!}),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppText.labelMd.copyWith(color: p.successText),
              ),
            ),
            Text(
              '-${Fmt.money(cart.discount)}',
              style: AppText.labelMd.copyWith(
                color: p.successText,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: cart.clearPromo,
              child: Icon(Symbols.close, size: 16, color: p.successText),
            ),
          ],
        ),
      );
    }

    return Row(
      children: [
        Expanded(
          child: Container(
            height: 46,
            decoration: BoxDecoration(
              color: p.card,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: p.hairline),
            ),
            child: Row(
              children: [
                const SizedBox(width: 12),
                Icon(Symbols.local_offer, size: 18, color: p.onSurfaceVariant),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _promoCtrl,
                    textCapitalization: TextCapitalization.characters,
                    onSubmitted: (_) => _applyPromo(),
                    style: AppText.bodyMd.copyWith(color: p.onSurface),
                    cursorColor: p.primary,
                    decoration: InputDecoration(
                      isDense: true,
                      filled: false,
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      contentPadding: EdgeInsets.zero,
                      hintText: context.tr('cart.promo_placeholder'),
                      hintStyle: AppText.bodyMd.copyWith(color: p.outline),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
              ],
            ),
          ),
        ),
        const SizedBox(width: 10),
        SizedBox(
          height: 46,
          child: FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: p.primary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 18),
            ),
            onPressed: cart.promoLoading ? null : _applyPromo,
            child: cart.promoLoading
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : Text(
                    context.tr('cart.promo_apply'),
                    style: AppText.labelMd.copyWith(color: Colors.white),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _paymentSection(BuildContext context) {
    final p = context.palette;
    final methods = <(String, String, Widget)>[
      ('payme', 'Payme', _letterTile(context, 'P')),
      ('click', 'Click', _letterTile(context, 'C')),
      ('uzum', 'Uzum Bank', _letterTile(context, 'U')),
      (
        'cash',
        context.tr('app.cash'),
        Icon(Symbols.payments, size: 16, color: p.onSurface),
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          context.tr('cart.payment_method'),
          style: AppText.labelLg.copyWith(color: p.onSurface),
        ),
        const SizedBox(height: 10),
        for (var i = 0; i < methods.length; i += 2)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                Expanded(child: _payTile(context, methods[i])),
                const SizedBox(width: 8),
                Expanded(child: _payTile(context, methods[i + 1])),
              ],
            ),
          ),
      ],
    );
  }

  Widget _letterTile(BuildContext context, String letter) {
    final p = context.palette;
    return Container(
      width: 28,
      height: 28,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: p.cardHigh,
        borderRadius: BorderRadius.circular(8),
        border: letter == 'P' ? null : null,
      ),
      child: Text(
        letter,
        style: AppText.labelMd.copyWith(color: p.onSurface, fontSize: 11),
      ),
    );
  }

  Widget _payTile(BuildContext context, (String, String, Widget) method) {
    final p = context.palette;
    final (key, label, icon) = method;
    final active = _payment == key;
    return Material(
      color: active ? p.card : p.cardLow,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => setState(() => _payment = key),
        child: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: active ? p.primary : Colors.transparent,
            ),
          ),
          child: Row(
            children: [
              icon,
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppText.labelMd.copyWith(
                    color: p.onSurface,
                    fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                  ),
                ),
              ),
              Icon(
                active ? Symbols.check_circle : Symbols.radio_button_unchecked,
                size: 20,
                color: active
                    ? p.primary
                    : p.onSurfaceVariant.withValues(alpha: 0.4),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _notesField(BuildContext context, CartController cart) {
    final p = context.palette;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: p.hairline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            context.tr('cart.notes'),
            style: AppText.labelLg.copyWith(color: p.onSurface),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _notesCtrl,
            minLines: 2,
            maxLines: 3,
            onChanged: cart.setNotes,
            style: AppText.bodyMd.copyWith(color: p.onSurface),
            cursorColor: p.primary,
            decoration: InputDecoration(
              isDense: true,
              filled: false,
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              contentPadding: EdgeInsets.zero,
              hintText: context.tr('cart.notes_placeholder'),
              hintStyle: AppText.bodyMd.copyWith(color: p.outline),
            ),
          ),
        ],
      ),
    );
  }

  Widget _summary(BuildContext context, CartController cart) {
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
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: p.hairline),
      ),
      child: Column(
        children: [
          row(context.tr('cart.subtotal'), Fmt.money(cart.subtotal)),
          if (cart.deliveryType == 'delivery')
            row(
              context.tr('cart.delivery_fee'),
              cart.deliveryFee == 0
                  ? context.tr('cart.free')
                  : Fmt.money(cart.deliveryFee),
              color: cart.deliveryFee == 0 ? p.successText : null,
            ),
          if (cart.discount > 0)
            row(
              '${context.tr('cart.discount')} (${cart.promoCode ?? ''})',
              '-${Fmt.money(cart.discount)}',
              color: p.successText,
            ),
          Container(
            height: 1,
            color: p.cardHigh,
            margin: const EdgeInsets.symmetric(vertical: 8),
          ),
          row(
            context.tr('cart.total'),
            Fmt.money(cart.total),
            color: p.accent,
            bold: true,
          ),
        ],
      ),
    );
  }

  Widget _checkoutCta(BuildContext context, CartController cart) {
    final p = context.palette;
    return Material(
      borderRadius: BorderRadius.circular(12),
      child: Ink(
        height: 52,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [p.gradientStart, p.gradientMid],
          ),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(color: p.shadow, blurRadius: 16, offset: const Offset(0, 6)),
          ],
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: _busy ? null : _placeOrder,
          child: Center(
            child: _busy
                ? Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        context.tr('cart.processing'),
                        style: AppText.labelLg.copyWith(color: Colors.white),
                      ),
                    ],
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        context.tr('cart.checkout'),
                        style: AppText.labelLg.copyWith(
                          color: Colors.white,
                          fontSize: 15,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '·',
                        style: AppText.labelLg.copyWith(color: Colors.white),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        Fmt.money(cart.total),
                        style: AppText.labelLg.copyWith(
                          color: Colors.white,
                          fontSize: 15,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
