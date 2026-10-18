import 'package:flutter/material.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/api/api_client.dart';
import '../../core/config/app_config.dart';
import '../../core/i18n/app_i18n.dart';
import '../../core/session/session_controller.dart';
import '../../core/session/settings_controller.dart';
import '../../core/utils/formatters.dart';
import '../../data/models/user.dart';
import '../../data/services/order_service.dart';
import '../../data/services/user_service.dart';
import '../../theme/app_text.dart';
import '../../theme/app_theme.dart';
import '../orders/orders_page.dart';

/// Sozlamalar ekrani (dizayn 04-settings).
class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  static const _kBiometric = 'boyxon-biometric';

  int _ordersTotal = 0;
  bool _biometric = false;
  bool _push = true;
  bool _pushInit = false;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadExtras());
  }

  Future<void> _loadExtras() async {
    final sp = await SharedPreferences.getInstance();
    final bio = sp.getBool(_kBiometric) ?? false;
    if (mounted) setState(() => _biometric = bio);

    if (!mounted) return;
    final session = context.read<SessionController>();
    if (!_pushInit && session.user != null) {
      _pushInit = true;
      setState(() => _push = session.user!.pushEnabled);
    }
    if (!session.isAuthed) return;
    try {
      final (_, pag) = await OrderService.I.myOrders(page: 1, limit: 1);
      if (mounted && pag != null) setState(() => _ordersTotal = pag.total);
    } catch (_) {}
  }

  void _snack(String msg) {
    if (!mounted || msg.isEmpty) return;
    ScaffoldMessenger.maybeOf(context)
      ?..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(msg)));
  }

  // ---- Amallar ----

  /// Yuqoridagi "Saqlash": afzalliklarni serverga yozadi (til/tema/push).
  Future<void> _save() async {
    final session = context.read<SessionController>();
    final settings = context.read<SettingsController>();
    setState(() => _saving = true);
    try {
      if (session.isAuthed) {
        await UserService.I.updatePreferences(
          language: settings.locale,
          theme: settings.darkMode ? 'dark' : 'light',
          fontSize: settings.fontSize,
        );
        await UserService.I.updatePushEnabled(_push);
        await session.refreshUser();
      }
      if (mounted) _snack(context.tr('settings.saved'));
    } on ApiException catch (e) {
      if (mounted) _snack(e.message);
    } catch (_) {
      if (mounted) _snack(context.tr('settings.save_error'));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _setBiometric(bool v) async {
    setState(() => _biometric = v);
    final sp = await SharedPreferences.getInstance();
    await sp.setBool(_kBiometric, v);
  }

  Future<void> _editProfile() async {
    final session = context.read<SessionController>();
    if (!session.isAuthed) return;
    final nameCtrl = TextEditingController(text: session.user?.name ?? '');
    final phoneCtrl = TextEditingController(text: session.user?.phone ?? '');
    final saved = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          context.tr('settings.edit_profile'),
          style: AppText.headlineSm,
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              decoration: InputDecoration(hintText: context.tr('common.name')),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: phoneCtrl,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(hintText: context.tr('common.phone')),
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
    final name = nameCtrl.text.trim();
    final phone = phoneCtrl.text.trim();
    nameCtrl.dispose();
    phoneCtrl.dispose();
    if (saved != true || !mounted) return;
    if (name.isEmpty) {
      _snack(context.tr('common.required'));
      return;
    }
    try {
      await UserService.I.updateMe(name: name, phone: phone);
      await session.refreshUser();
      if (mounted) _snack(context.tr('settings.saved'));
    } on ApiException catch (e) {
      if (mounted) _snack(e.message);
    } catch (_) {
      if (mounted) _snack(context.tr('settings.save_error'));
    }
  }

  Future<void> _addAddress() async {
    final labelCtrl = TextEditingController();
    final addrCtrl = TextEditingController();
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
        Address(label: label, address: text, isDefault: isFirst),
      );
      await session.refreshUser();
      if (mounted) _snack(context.tr('settings.address_added'));
    } on ApiException catch (e) {
      if (mounted) _snack(e.message);
    } catch (_) {
      if (mounted) _snack(context.tr('settings.save_error'));
    }
  }

  Future<void> _openAddresses() async {
    final p = context.palette;
    final session = context.read<SessionController>();
    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: p.card,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheet) {
          final addresses = session.user?.addresses ?? const <Address>[];
          return SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          context.tr('settings.addresses'),
                          style: AppText.headlineSm.copyWith(color: p.onSurface),
                        ),
                      ),
                      GestureDetector(
                        onTap: () => Navigator.pop(ctx),
                        child: Icon(Symbols.close, size: 20, color: p.outline),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  if (addresses.isEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Text(
                        context.tr('cart.no_address'),
                        style: AppText.bodySm.copyWith(color: p.onSurfaceVariant),
                      ),
                    ),
                  for (final a in addresses)
                    Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: p.cardLow,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Symbols.location_on,
                            size: 20,
                            color: p.onSurfaceVariant,
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
                                        a.label,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: AppText.labelLg.copyWith(
                                          color: p.onSurface,
                                        ),
                                      ),
                                    ),
                                    if (a.isDefault) ...[
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 2,
                                        ),
                                        decoration: BoxDecoration(
                                          color: p.primaryFixed,
                                          borderRadius:
                                              BorderRadius.circular(999),
                                        ),
                                        child: Text(
                                          context.tr('settings.address_default'),
                                          style: AppText.labelSm.copyWith(
                                            color: p.dark
                                                ? p.onPrimaryFixed
                                                : const Color(0xFFA23F00),
                                            fontSize: 10,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  a.address,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: AppText.bodySm.copyWith(
                                    color: p.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (a.id != null)
                            PopupMenuButton<String>(
                              icon: Icon(
                                Symbols.more_vert,
                                size: 20,
                                color: p.outline,
                              ),
                              color: p.card,
                              onSelected: (v) async {
                                try {
                                  if (v == 'default') {
                                    await UserService.I.updateAddress(
                                      a.id!,
                                      isDefault: true,
                                    );
                                  } else if (v == 'delete') {
                                    final ok = await showDialog<bool>(
                                      context: context,
                                      builder: (dctx) => AlertDialog(
                                        title: Text(
                                          context.tr(
                                            'settings.address_delete_confirm',
                                          ),
                                          style: AppText.headlineSm,
                                        ),
                                        actions: [
                                          TextButton(
                                            onPressed: () =>
                                                Navigator.pop(dctx, false),
                                            child: Text(
                                              context.tr('common.no'),
                                            ),
                                          ),
                                          FilledButton(
                                            style: FilledButton.styleFrom(
                                              backgroundColor: p.error,
                                            ),
                                            onPressed: () =>
                                                Navigator.pop(dctx, true),
                                            child: Text(
                                              context.tr('common.yes'),
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                    if (ok != true) return;
                                    await UserService.I.deleteAddress(a.id!);
                                    if (mounted) {
                                      _snack(
                                        context.tr('settings.address_deleted'),
                                      );
                                    }
                                  }
                                  await session.refreshUser();
                                  setSheet(() {});
                                } on ApiException catch (e) {
                                  _snack(e.message);
                                }
                              },
                              itemBuilder: (mctx) => [
                                if (!a.isDefault)
                                  PopupMenuItem(
                                    value: 'default',
                                    child: Text(
                                      context.tr('settings.address_set_default'),
                                      style: AppText.bodyMd.copyWith(
                                        color: p.onSurface,
                                      ),
                                    ),
                                  ),
                                PopupMenuItem(
                                  value: 'delete',
                                  child: Text(
                                    context.tr('settings.address_delete'),
                                    style: AppText.bodyMd.copyWith(
                                      color: p.error,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 4),
                  FilledButton.icon(
                    style: FilledButton.styleFrom(
                      backgroundColor: p.primary,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: () {
                      Navigator.pop(ctx);
                      _addAddress();
                    },
                    icon: const Icon(
                      Symbols.add_location_alt,
                      size: 18,
                      color: Colors.white,
                    ),
                    label: Text(
                      context.tr('settings.address_add'),
                      style: AppText.labelLg.copyWith(color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Future<void> _openLanguage(SettingsController settings) async {
    final p = context.palette;
    const names = {'uz': "O'zbekcha", 'ru': 'Русский', 'en': 'English'};
    final picked = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: p.card,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 6),
              child: Text(
                context.tr('settings.language'),
                style: AppText.headlineSm.copyWith(color: p.onSurface),
              ),
            ),
            for (final e in names.entries)
              ListTile(
                title: Text(
                  e.value,
                  style: AppText.bodyMd.copyWith(color: p.onSurface),
                ),
                trailing: settings.locale == e.key
                    ? Icon(Symbols.check_circle, size: 20, color: p.primary)
                    : null,
                onTap: () => Navigator.pop(ctx, e.key),
              ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
    if (picked == null || !mounted) return;
    await settings.setLocale(picked);
    if (mounted) _snack(context.tr('settings.language_updated'));
  }

  Future<void> _paymentInfo() async {
    final p = context.palette;
    final methods = <(String, String)>[
      ('P', 'Payme'),
      ('C', 'Click'),
      ('U', 'Uzum Bank'),
      ('', context.tr('app.cash')),
    ];
    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: p.card,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 6),
              child: Text(
                context.tr('settings.payment_methods'),
                style: AppText.headlineSm.copyWith(color: p.onSurface),
              ),
            ),
            for (final m in methods)
              ListTile(
                leading: m.$1.isEmpty
                    ? Icon(Symbols.payments, size: 22, color: p.onSurfaceVariant)
                    : _letterTile(context, m.$1),
                title: Text(
                  m.$2,
                  style: AppText.bodyMd.copyWith(color: p.onSurface),
                ),
              ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  Future<void> _logout() async {
    final session = context.read<SessionController>();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(context.tr('app.logout_q'), style: AppText.headlineSm),
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
    if (ok != true || !mounted) return;
    await session.logout();
  }

  // ---- UI ----

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final session = context.watch<SessionController>();
    final settings = context.watch<SettingsController>();
    final user = session.user;

    return Scaffold(
      backgroundColor: p.bg,
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 28),
          children: [
            _subHeader(context, settings),
            const SizedBox(height: 12),
            _profileCard(context, session),
            const SizedBox(height: 18),
            _sectionLabel(context, context.tr('settings.account')),
            const SizedBox(height: 8),
            _card(context, [
              _row(
                context,
                icon: Symbols.person,
                label: context.tr('settings.personal_info'),
                subtitle: user?.email,
                onTap: _editProfile,
              ),
              _divider(context),
              _row(
                context,
                icon: Symbols.receipt_long,
                label: context.tr('settings.orders'),
                subtitle: _ordersTotal > 0
                    ? context.tr('home.items_count', {
                        'count': '$_ordersTotal',
                      })
                    : null,
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute<void>(builder: (_) => const OrdersPage()),
                ),
              ),
              _divider(context),
              _row(
                context,
                icon: Symbols.location_on,
                label: context.tr('settings.addresses'),
                subtitle: (user?.addresses.isNotEmpty ?? false)
                    ? context.tr('home.items_count', {
                        'count': '${user!.addresses.length}',
                      })
                    : null,
                onTap: _openAddresses,
              ),
              _divider(context),
              _row(
                context,
                icon: Symbols.credit_card,
                label: context.tr('settings.payment_methods'),
                subtitle: 'Payme · Click · Uzum Bank · ${context.tr('app.cash')}',
                onTap: _paymentInfo,
              ),
            ]),
            const SizedBox(height: 18),
            _sectionLabel(context, context.tr('settings.preferences')),
            const SizedBox(height: 8),
            _card(context, [
              _switchRow(
                context,
                icon: Symbols.notifications_active,
                label: context.tr('app.push_notifications'),
                value: _push,
                onChanged: (v) => setState(() => _push = v),
              ),
              _divider(context),
              _row(
                context,
                icon: Symbols.language,
                label: context.tr('settings.language'),
                trailingText: _langName(settings.locale),
                onTap: () => _openLanguage(settings),
              ),
              _divider(context),
              _switchRow(
                context,
                icon: Symbols.dark_mode,
                label: context.tr('settings.dark_mode'),
                value: settings.darkMode,
                onChanged: settings.setDarkMode,
              ),
            ]),
            const SizedBox(height: 18),
            _sectionLabel(context, context.tr('settings.security')),
            const SizedBox(height: 8),
            _card(context, [
              _switchRow(
                context,
                icon: Symbols.fingerprint,
                label: context.tr('settings.biometric'),
                subtitle: 'Face ID / Touch ID',
                value: _biometric,
                onChanged: _setBiometric,
              ),
              _divider(context),
              _row(
                context,
                icon: Symbols.logout,
                label: context.tr('settings.logout'),
                danger: true,
                onTap: _logout,
              ),
            ]),
            const SizedBox(height: 26),
            _footer(context),
          ],
        ),
      ),
    );
  }

  Widget _subHeader(BuildContext context, SettingsController settings) {
    final p = context.palette;
    return Row(
      children: [
        Expanded(
          child: Text(
            context.tr('settings.title'),
            style: AppText.headlineMd.copyWith(color: p.onSurface),
          ),
        ),
        FilledButton.icon(
          style: FilledButton.styleFrom(
            backgroundColor: settings.darkMode
                ? p.primaryFixed
                : p.primary,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            shape: const StadiumBorder(),
          ),
          onPressed: _saving ? null : _save,
          icon: _saving
              ? const SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : Icon(
                  Symbols.check,
                  size: 16,
                  color: settings.darkMode ? p.onPrimaryFixed : Colors.white,
                ),
          label: Text(
            context.tr('settings.save'),
            style: AppText.labelMd.copyWith(
              color: settings.darkMode ? p.onPrimaryFixed : Colors.white,
            ),
          ),
        ),
      ],
    );
  }

  Widget _profileCard(BuildContext context, SessionController session) {
    final p = context.palette;
    final user = session.user;
    final stats = [
      ('$_ordersTotal', context.tr('app.stat_orders'), false),
      ('${user?.favorites.length ?? 0}', context.tr('app.stat_favorites'), false),
      (Fmt.money(user?.bonusBalance ?? 0), context.tr('app.stat_bonus'), true),
    ];

    return Container(
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: p.shadow, blurRadius: 12, offset: const Offset(0, 5)),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          Positioned(
            right: -28,
            bottom: -28,
            child: Container(
              width: 112,
              height: 112,
              decoration: BoxDecoration(
                color: p.primaryFixed.withValues(alpha: 0.35),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    GestureDetector(
                      onTap: _editProfile,
                      child: Stack(
                        clipBehavior: Clip.none,
                        children: [
                          Container(
                            width: 62,
                            height: 62,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: p.primaryFixed,
                              shape: BoxShape.circle,
                            ),
                            child: Text(
                              user?.initials ?? '?',
                              style: AppText.headlineSm.copyWith(
                                color: p.onPrimaryFixed,
                              ),
                            ),
                          ),
                          Positioned(
                            right: -2,
                            bottom: -2,
                            child: Container(
                              width: 22,
                              height: 22,
                              decoration: BoxDecoration(
                                color: p.primary,
                                shape: BoxShape.circle,
                                border: Border.all(color: p.card, width: 2),
                              ),
                              child: const Icon(
                                Symbols.edit,
                                size: 11,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  user?.name ?? context.tr('nav.login'),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: AppText.headlineSm.copyWith(
                                    color: p.onSurface,
                                  ),
                                ),
                              ),
                              if (user?.emailVerified ?? false) ...[
                                const SizedBox(width: 4),
                                Icon(
                                  Symbols.verified,
                                  size: 17,
                                  color: p.primary,
                                ),
                              ],
                            ],
                          ),
                          if ((user?.phone ?? '').isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(top: 2),
                              child: Text(
                                user!.phone!,
                                style: AppText.bodySm.copyWith(
                                  color: p.onSurfaceVariant,
                                ),
                              ),
                            ),
                          if ((user?.email ?? '').isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(top: 1),
                              child: Text(
                                user!.email,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppText.bodySm.copyWith(color: p.outline),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    for (var i = 0; i < stats.length; i++) ...[
                      if (i > 0) const SizedBox(width: 8),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: stats[i].$3
                                ? p.primaryFixed.withValues(alpha: 0.45)
                                : p.cardLow,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Column(
                            children: [
                              Text(
                                stats[i].$1,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppText.labelLg.copyWith(
                                  color: stats[i].$3
                                      ? (p.dark
                                          ? p.onPrimaryFixed
                                          : const Color(0xFFA23F00))
                                      : p.onSurface,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(height: 1),
                              Text(
                                stats[i].$2,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppText.labelSm.copyWith(
                                  color: p.onSurfaceVariant,
                                ),
                              ),
                            ],
                          ),
                        ),
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

  Widget _sectionLabel(BuildContext context, String text) {
    final p = context.palette;
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        text,
        style: AppText.labelSm.copyWith(
          color: p.onSurfaceVariant,
          letterSpacing: 1.1,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _card(BuildContext context, List<Widget> children) {
    final p = context.palette;
    return Container(
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(color: p.shadow, blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(children: children),
    );
  }

  Widget _divider(BuildContext context) => Container(
        height: 1,
        margin: const EdgeInsets.symmetric(horizontal: 14),
        color: context.palette.cardLow,
      );

  Widget _iconTile(BuildContext context, IconData icon, {bool danger = false}) {
    final p = context.palette;
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        color: danger ? p.errorBg : p.cardLow,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(
        icon,
        size: 20,
        color: danger ? p.error : p.primary,
      ),
    );
  }

  Widget _row(
    BuildContext context, {
    required IconData icon,
    required String label,
    String? subtitle,
    String? trailingText,
    bool danger = false,
    VoidCallback? onTap,
  }) {
    final p = context.palette;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Row(
            children: [
              _iconTile(context, icon, danger: danger),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: AppText.labelLg.copyWith(
                        color: danger ? p.error : p.onSurface,
                      ),
                    ),
                    if (subtitle != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text(
                          subtitle,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppText.bodySm.copyWith(
                            color: p.onSurfaceVariant,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              if (trailingText != null) ...[
                Text(
                  trailingText,
                  style: AppText.bodySm.copyWith(color: p.onSurfaceVariant),
                ),
                const SizedBox(width: 4),
              ],
              if (onTap != null)
                Icon(
                  Symbols.chevron_right,
                  size: 20,
                  color: danger ? p.error.withValues(alpha: 0.6) : p.outline,
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _switchRow(
    BuildContext context, {
    required IconData icon,
    required String label,
    String? subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    final p = context.palette;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      child: Row(
        children: [
          _iconTile(context, icon),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: AppText.labelLg.copyWith(color: p.onSurface),
                ),
                if (subtitle != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 1),
                    child: Text(
                      subtitle,
                      style: AppText.bodySm.copyWith(
                        color: p.onSurfaceVariant,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeTrackColor: p.primary,
            inactiveTrackColor: p.cardHigh,
            thumbColor: const WidgetStatePropertyAll<Color>(Colors.white),
          ),
        ],
      ),
    );
  }

  Widget _footer(BuildContext context) {
    final p = context.palette;
    return Column(
      children: [
        Text(
          AppConfig.appName,
          style: AppText.labelLg.copyWith(
            color: p.onSurface,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 3),
        Text(
          '${context.tr('settings.version')} ${AppConfig.versionName}',
          style: AppText.bodySm.copyWith(color: p.outline),
        ),
        const SizedBox(height: 6),
        Text(
          context.tr('settings.help_contact'),
          style: AppText.bodySm.copyWith(color: p.outline),
        ),
      ],
    );
  }

  Widget _letterTile(BuildContext context, String letter) {
    final p = context.palette;
    return Container(
      width: 26,
      height: 26,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: p.cardLow,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        letter,
        style: AppText.labelMd.copyWith(color: p.onSurface, fontSize: 11),
      ),
    );
  }

  String _langName(String code) {
    switch (code) {
      case 'ru':
        return 'Русский';
      case 'en':
        return 'English';
      default:
        return "O'zbekcha";
    }
  }
}
