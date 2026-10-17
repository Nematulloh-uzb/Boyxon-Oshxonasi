import 'package:flutter/material.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:provider/provider.dart';

import '../../core/api_client.dart';
import '../../core/app_theme.dart';
import '../../core/formatters.dart';
import '../../l10n/app_localizations.dart';
import '../../models/models.dart';
import '../../services/auth_service.dart';
import '../../services/settings_service.dart';
import '../../widgets/order_card.dart';
import '../../widgets/state_views.dart';
import '../../widgets/ui_kit.dart';
import '../orders/order_detail_screen.dart';
import 'notifications_screen.dart';

/// Sozlamalar — web `SettingsPage` bilan 1:1:
/// h1 → profil kartasi → HISOB (manzillar/buyurtmalar/bildirishnomalar —
/// ochiladigan bo'limlar) → AFZALLIKLAR (til/mavzu) → XAVFSIZLIK (chiqish)
/// → Yordam tugmasi.
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _api = ApiClient.instance;

  String? _version;
  bool _busy = false;

  // Manzillar bo'limi.
  bool _addressesOpen = false;
  bool _addingAddress = false;
  final _labelCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  bool _addrDefault = false;
  bool _addrBusy = false;

  // Buyurtmalar bo'limi.
  bool _ordersOpen = false;
  List<Order>? _orders;
  int _ordersTotal = 0;

  // Bildirishnomalar bo'limi.
  bool _notifOpen = false;
  bool _notifBusy = false;

  @override
  void initState() {
    super.initState();
    _loadVersion();
    if (context.read<AuthService>().user != null) {
      _loadOrders();
    }
  }

  @override
  void dispose() {
    _labelCtrl.dispose();
    _addressCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadVersion() async {
    try {
      final info = await PackageInfo.fromPlatform();
      if (mounted) setState(() => _version = '${info.version}+${info.buildNumber}');
    } catch (_) {/* ignore */}
  }

  Future<void> _loadOrders() async {
    try {
      final res = await _api.dio.get('/users/me/orders', queryParameters: {'page': 1, 'limit': 5});
      final body = res.data as Map;
      final list = (body['data'] as List)
          .map((e) => Order.fromJson(e as Map<String, dynamic>))
          .toList();
      final pagination = body['pagination'] as Map?;
      if (!mounted) return;
      setState(() {
        _orders = list;
        _ordersTotal = ((pagination?['total'] ?? list.length) as num).toInt();
      });
    } catch (_) {/* best effort — qiymat "..." bo'lib turadi */}
  }

  Future<void> _editProfile() async {
    final l = AppLocalizations.of(context);
    final auth = context.read<AuthService>();
    final user = auth.user;
    if (user == null) return;

    final nameCtrl = TextEditingController(text: user.name);
    final phoneCtrl = TextEditingController(text: user.phone ?? '');

    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(sheetContext).viewInsets.bottom),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  l.profile_edit,
                  style: TextStyle(
                    fontFamily: 'Epilogue',
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: sheetContext.c.fg,
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: nameCtrl,
                  decoration: InputDecoration(labelText: l.auth_name),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(labelText: l.profile_phone),
                ),
                const SizedBox(height: 16),
                GradientButton(
                  label: l.common_save,
                  onPressed: () {
                    if (nameCtrl.text.trim().isEmpty) return;
                    Navigator.of(sheetContext).pop(true);
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );

    if (saved != true || !mounted) return;
    final messenger = ScaffoldMessenger.of(context);
    try {
      final res = await _api.dio.patch('/users/me', data: {
        'name': nameCtrl.text.trim(),
        'phone': phoneCtrl.text.trim(),
      });
      final updated = User.fromJson((res.data as Map)['data'] as Map<String, dynamic>);
      auth.setUser(updated);
      messenger.showSnackBar(SnackBar(content: Text(l.profile_saved)));
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(errorText(e, l))));
    }
  }

  Future<void> _resendVerification() async {
    final l = AppLocalizations.of(context);
    final auth = context.read<AuthService>();
    final messenger = ScaffoldMessenger.of(context);
    try {
      await auth.resendVerification();
      messenger.showSnackBar(SnackBar(content: Text(l.auth_verify_sent)));
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(errorText(e, l))));
    }
  }

  Future<void> _logout({required bool all}) async {
    final l = AppLocalizations.of(context);
    final auth = context.read<AuthService>();
    final messenger = ScaffoldMessenger.of(context);

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        content: Text(l.auth_logout_confirm),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l.common_cancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: context.c.danger),
            child: Text(l.auth_logout),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    setState(() => _busy = true);
    if (all) {
      await auth.logoutAll();
    } else {
      await auth.logout();
    }
    if (!mounted) return;
    setState(() => _busy = false);
    messenger.showSnackBar(SnackBar(content: Text(l.auth_logged_out)));
  }

  // -------------------------------------------------------------------------
  // Manzillar (web AddressManager bilan bir xil oqim)
  // -------------------------------------------------------------------------

  Future<void> _submitAddress() async {
    final l = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final auth = context.read<AuthService>();

    final label = _labelCtrl.text.trim();
    final address = _addressCtrl.text.trim();
    if (label.isEmpty || address.isEmpty) {
      messenger.showSnackBar(SnackBar(content: Text(l.settings_address_required)));
      return;
    }

    setState(() => _addrBusy = true);
    try {
      await _api.dio.post(
        '/users/me/addresses',
        data: Address(label: label, address: address, isDefault: _addrDefault).toJson(),
      );
      await auth.reloadMe();
      if (!mounted) return;
      setState(() {
        _addingAddress = false;
        _labelCtrl.clear();
        _addressCtrl.clear();
        _addrDefault = false;
      });
      messenger.showSnackBar(SnackBar(content: Text(l.addr_saved)));
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(errorText(e, l))));
    } finally {
      if (mounted) setState(() => _addrBusy = false);
    }
  }

  Future<void> _setDefaultAddress(Address address) async {
    final l = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final auth = context.read<AuthService>();
    if (address.id == null || address.isDefault) return;

    try {
      await _api.dio.patch('/users/me/addresses/${address.id}', data: {'isDefault': true});
      await auth.reloadMe();
      messenger.showSnackBar(SnackBar(content: Text(l.settings_saved)));
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(errorText(e, l))));
    }
  }

  Future<void> _deleteAddress(Address address) async {
    final l = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final auth = context.read<AuthService>();
    if (address.id == null) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        content: Text(l.addr_delete_confirm),
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
    if (confirmed != true || !mounted) return;

    try {
      await _api.dio.delete('/users/me/addresses/${address.id}');
      await auth.reloadMe();
      messenger.showSnackBar(SnackBar(content: Text(l.addr_deleted)));
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(errorText(e, l))));
    }
  }

  // -------------------------------------------------------------------------
  // Bildirishnoma sozlamasi (web NotificationPrefs)
  // -------------------------------------------------------------------------

  Future<void> _togglePush(bool value) async {
    final l = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final auth = context.read<AuthService>();

    setState(() => _notifBusy = true);
    try {
      await _api.dio.patch('/users/me/notification-prefs', data: {'pushEnabled': value});
      await auth.reloadMe();
      messenger.showSnackBar(SnackBar(content: Text(l.settings_saved)));
    } catch (_) {
      messenger.showSnackBar(SnackBar(content: Text(l.settings_save_error)));
    } finally {
      if (mounted) setState(() => _notifBusy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;
    final auth = context.watch<AuthService>();
    final settings = context.watch<SettingsService>();
    final user = auth.user;

    if (user == null) return const SizedBox.shrink();

    final addresses = user.addresses;

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
          children: [
            Text(
              l.settings_title,
              style: TextStyle(
                fontFamily: 'Epilogue',
                fontSize: 24,
                fontWeight: FontWeight.w800,
                height: 1.2,
                color: c.fg,
              ),
            ),
            const SizedBox(height: 16),

            // Profil kartasi (web ProfileCard).
            CardBox(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  AvatarImage(url: user.avatar, size: 64),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontFamily: 'Epilogue',
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: c.fg,
                          ),
                        ),
                        Text(
                          user.email,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.subtle),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          l.profile_bonus(formatPrice(user.bonusBalance)),
                          style: const TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: BoyxonPalette.primaryDark,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: Icon(Icons.edit_outlined, size: 20, color: c.subtle),
                    onPressed: _editProfile,
                  ),
                ],
              ),
            ),

            // Email tasdiqlash (app funksiyasi — dizayn web banner uslubida).
            if (!user.emailVerified)
              Container(
                margin: const EdgeInsets.only(top: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: c.danger.withValues(alpha: 0.10),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.mark_email_unread_outlined, size: 18, color: c.danger),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            l.auth_verify_required,
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 13,
                              height: 1.4,
                              color: c.danger,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    GestureDetector(
                      onTap: _resendVerification,
                      behavior: HitTestBehavior.opaque,
                      child: Text(
                        l.auth_verify_resend,
                        style: const TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: BoyxonPalette.primaryDark,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 24),

            // HISOB guruhi.
            _group(
              l.settings_account_group,
              [
                _settingsRow(
                  icon: Icons.location_on_outlined,
                  label: l.settings_addresses,
                  value: l.home_items_count(addresses.length),
                  right: _expandChevron(_addressesOpen),
                  onTap: () => setState(() => _addressesOpen = !_addressesOpen),
                ),
                if (_addressesOpen)
                  _expansion(
                    _addressSection(l, c, addresses),
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                  ),
                _divider(c),
                _settingsRow(
                  icon: Icons.inventory_2_outlined,
                  label: l.settings_orders,
                  value: _orders == null ? '...' : l.home_items_count(_ordersTotal),
                  right: _expandChevron(_ordersOpen),
                  onTap: () => setState(() {
                    _ordersOpen = !_ordersOpen;
                    if (_ordersOpen) _loadOrders();
                  }),
                ),
                if (_ordersOpen)
                  _expansion(
                    _ordersSection(l, c),
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                  ),
                _divider(c),
                _settingsRow(
                  icon: Icons.notifications_none_rounded,
                  label: l.settings_notifications,
                  right: _expandChevron(_notifOpen),
                  onTap: () => setState(() => _notifOpen = !_notifOpen),
                ),
                if (_notifOpen) _expansion(_notifSection(l, c, user)),
              ],
            ),
            const SizedBox(height: 24),

            // AFZALLIKLAR guruhi.
            _group(
              l.settings_preferences_group,
              [
                _settingsRow(
                  icon: Icons.language_rounded,
                  label: l.settings_language,
                  right: _languagePills(l, settings),
                ),
                _divider(c),
                _settingsRow(
                  icon: settings.themeMode == ThemeMode.dark
                      ? Icons.dark_mode_rounded
                      : Icons.wb_sunny_outlined,
                  label: l.settings_theme,
                  value: settings.themeMode == ThemeMode.dark ? l.theme_dark : l.theme_light,
                  right: GestureDetector(
                    onTap: () => settings.setThemeMode(
                      settings.themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark,
                    ),
                    child: Text(
                      l.settings_toggle,
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: BoyxonPalette.primaryDark,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // XAVFSIZLIK guruhi.
            _group(
              l.settings_security_group,
              [
                _settingsRow(
                  icon: Icons.logout_rounded,
                  label: l.auth_logout,
                  danger: true,
                  onTap: _busy ? null : () => _logout(all: false),
                ),
                _divider(c),
                _settingsRow(
                  icon: Icons.devices_other_rounded,
                  label: l.auth_logout_all,
                  danger: true,
                  onTap: _busy ? null : () => _logout(all: true),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Yordam.
            OutlinePill(
              label: l.settings_help,
              onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(l.settings_help_contact)),
              ),
            ),
            const SizedBox(height: 12),
            Center(
              child: Text(
                'Boyxon Oshxonasi${_version == null ? '' : ' v$_version'}',
                style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: c.subtle),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Bo'limlar
  // -------------------------------------------------------------------------

  Widget _addressSection(AppLocalizations l, BoyxonColors c, List<Address> addresses) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (addresses.isEmpty && !_addingAddress)
          CardBox(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Icon(Icons.location_off_outlined, size: 32, color: c.subtle),
                const SizedBox(height: 8),
                Text(
                  l.addr_empty,
                  textAlign: TextAlign.center,
                  style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.subtle),
                ),
              ],
            ),
          ),
        for (final a in addresses) ...[
          CardBox(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                const IconTile(Icons.home_rounded),
                const SizedBox(width: 12),
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
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: c.fg,
                              ),
                            ),
                          ),
                          if (a.isDefault) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: c.success.withValues(alpha: 0.10),
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: Text(
                                l.settings_address_default_label.toUpperCase(),
                                style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.4,
                                  color: c.success,
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
                        style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: c.subtle),
                      ),
                    ],
                  ),
                ),
                if (!a.isDefault)
                  _iconButton(
                    Icons.star_rounded,
                    c.subtle,
                    () => _setDefaultAddress(a),
                  ),
                _iconButton(
                  Icons.delete_outline_rounded,
                  c.subtle,
                  () => _deleteAddress(a),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
        ],
        if (_addingAddress)
          CardBox(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _inlineInput(_labelCtrl, l.addr_label_hint, maxLength: 50),
                const SizedBox(height: 10),
                _inlineInput(_addressCtrl, l.addr_text_hint, maxLines: 2, maxLength: 300),
                const SizedBox(height: 10),
                GestureDetector(
                  onTap: () => setState(() => _addrDefault = !_addrDefault),
                  behavior: HitTestBehavior.opaque,
                  child: Row(
                    children: [
                      Container(
                        width: 18,
                        height: 18,
                        decoration: BoxDecoration(
                          color: _addrDefault ? c.primary : Colors.transparent,
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(
                            color: _addrDefault ? c.primary : c.lineStrong,
                          ),
                        ),
                        child: _addrDefault
                            ? const Icon(Icons.check_rounded, size: 14, color: Colors.white)
                            : null,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        l.addr_default,
                        style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.fgMuted),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinePill(
                        label: l.common_cancel,
                        size: GradientButtonSize.sm,
                        onPressed: () => setState(() => _addingAddress = false),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: GradientButton(
                        label: l.common_save,
                        size: GradientButtonSize.sm,
                        loading: _addrBusy,
                        onPressed: _submitAddress,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          )
        else
          OutlinePill(
            label: l.addr_add,
            icon: Icons.add_rounded,
            size: GradientButtonSize.sm,
            onPressed: () => setState(() => _addingAddress = true),
          ),
      ],
    );
  }

  Widget _ordersSection(AppLocalizations l, BoyxonColors c) {
    final orders = _orders;
    if (orders == null) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 16),
        child: Center(
          child: SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2.2),
          ),
        ),
      );
    }
    if (orders.isEmpty) {
      return CardBox(
        padding: const EdgeInsets.all(16),
        child: Text(
          l.settings_no_orders,
          style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.subtle),
        ),
      );
    }
    return Column(
      children: [
        for (final o in orders) ...[
          OrderCard(
            order: o,
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: o.id)),
            ),
          ),
          const SizedBox(height: 8),
        ],
      ],
    );
  }

  Widget _notifSection(AppLocalizations l, BoyxonColors c, User user) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Opacity(
          opacity: _notifBusy ? 0.6 : 1,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    l.notif_site,
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: c.fg,
                    ),
                  ),
                ),
                Switch(
                  value: user.pushEnabled,
                  onChanged: _notifBusy ? null : _togglePush,
                ),
              ],
            ),
          ),
        ),
        _divider(c),
        TapRow(
          onTap: () => Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const NotificationsScreen()),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 12),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  l.notif_view_all,
                  style: const TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: BoyxonPalette.primaryDark,
                  ),
                ),
              ),
              Icon(Icons.chevron_right_rounded, size: 16, color: c.subtle),
            ],
          ),
        ),
      ],
    );
  }

  // -------------------------------------------------------------------------
  // Yordamchi qurilmalar
  // -------------------------------------------------------------------------

  Widget _group(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionLabel(title),
        ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: CardBox(
            child: Column(children: children),
          ),
        ),
      ],
    );
  }

  Widget _divider(BoyxonColors c) =>
      Divider(height: 1, thickness: 1, color: c.line.withValues(alpha: 0.6));

  Widget _expansion(Widget child, {EdgeInsetsGeometry? padding}) {
    final c = context.c;
    return Container(
      width: double.infinity,
      padding: padding ?? const EdgeInsets.fromLTRB(16, 12, 16, 12),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: c.line.withValues(alpha: 0.6))),
      ),
      child: child,
    );
  }

  Widget _settingsRow({
    required IconData icon,
    required String label,
    String? value,
    Widget? right,
    VoidCallback? onTap,
    bool danger = false,
  }) {
    final c = context.c;
    final row = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          IconTile(icon, danger: danger),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: danger ? c.danger : c.fg,
              ),
            ),
          ),
          if (value != null) ...[
            const SizedBox(width: 8),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 140),
              child: Text(
                value,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.right,
                style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.subtle),
              ),
            ),
          ],
          if (right != null) ...[
            const SizedBox(width: 8),
            right,
          ] else if (onTap != null) ...[
            const SizedBox(width: 8),
            Icon(Icons.chevron_right_rounded, size: 16, color: c.subtle),
          ],
        ],
      ),
    );

    return TapRow(onTap: onTap, radius: 0, child: row);
  }

  Widget _expandChevron(bool open) {
    final c = context.c;
    return AnimatedRotation(
      turns: open ? 0.5 : 0,
      duration: const Duration(milliseconds: 200),
      child: Icon(Icons.keyboard_arrow_down_rounded, size: 20, color: c.subtle),
    );
  }

  Widget _languagePills(AppLocalizations l, SettingsService settings) {
    final c = context.c;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (final code in const ['uz', 'ru', 'en']) ...[
          GestureDetector(
            onTap: () {
              settings.setLanguage(code);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(l.settings_language_updated)),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: settings.languageCode == code
                    ? BoyxonPalette.primary
                    : c.surfaceRaised,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                code.toUpperCase(),
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: settings.languageCode == code ? Colors.white : c.fgMuted,
                ),
              ),
            ),
          ),
          if (code != 'en') const SizedBox(width: 4),
        ],
      ],
    );
  }

  Widget _iconButton(IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: SizedBox(
        width: 32,
        height: 32,
        child: Icon(icon, size: 17, color: color),
      ),
    );
  }

  Widget _inlineInput(
    TextEditingController controller,
    String hint, {
    int maxLines = 1,
    int? maxLength,
  }) {
    final c = context.c;
    OutlineInputBorder border(Color color) => OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: color),
        );
    return TextField(
      controller: controller,
      maxLines: maxLines,
      maxLength: maxLength,
      style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.fg),
      decoration: InputDecoration(
        hintText: hint,
        counterText: '',
        isDense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
        border: border(c.line),
        enabledBorder: border(c.line),
        focusedBorder: border(c.primary),
      ),
    );
  }
}
