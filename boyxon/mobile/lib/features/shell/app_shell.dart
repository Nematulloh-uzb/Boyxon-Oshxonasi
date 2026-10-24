import 'package:flutter/material.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:provider/provider.dart';

import '../../core/i18n/app_i18n.dart';
import '../../core/session/session_controller.dart';
import '../../theme/app_text.dart';
import '../../theme/app_theme.dart';
import '../admin/admin_page.dart';
import '../cart/cart_controller.dart';
import '../cart/cart_page.dart';
import '../home/home_page.dart';
import '../settings/settings_page.dart';

/// Asosiy karkas: IndexedStack + pastdagi navigatsiya
/// (Asosiy / Savat / Sozlamalar + admin uchun "Admin").
class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 0;

  /// Admin tabiga o'tilganda jonli ro'yxatni yangilash uchun.
  final _adminKey = GlobalKey<AdminPageState>();

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SessionController>();
    final cart = context.watch<CartController>();
    final p = context.palette;

    final pages = <Widget>[
      HomePage(
        onOpenCart: () => setState(() => _index = 1),
        onOpenSettings: () => setState(() => _index = 2),
      ),
      CartPage(
        onOpenHome: () => setState(() => _index = 0),
        onOpenMenu: () => setState(() => _index = 0),
      ),
      const SettingsPage(),
      if (session.isAdmin) AdminPage(key: _adminKey),
    ];

    final items = <_NavData>[
      _NavData(icon: Symbols.roofing, label: context.tr('nav.home')),
      _NavData(
        icon: Symbols.shopping_bag,
        label: context.tr('nav.cart'),
        badge: cart.itemCount,
      ),
      _NavData(icon: Symbols.settings, label: context.tr('nav.settings')),
      if (session.isAdmin)
        _NavData(icon: Symbols.dashboard, label: context.tr('nav.admin')),
    ];

    final idx = _index < pages.length ? _index : 0;

    return Scaffold(
      backgroundColor: p.bg,
      body: IndexedStack(index: idx, children: pages),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: p.navBg,
          border: Border(top: BorderSide(color: p.hairline)),
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 56,
            child: Row(
              children: [
                for (var i = 0; i < items.length; i++)
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: _NavButton(
                        data: items[i],
                        active: i == idx,
                        onTap: () {
                          setState(() => _index = i);
                          // Admin tabiga o'tilganda jonli ro'yxat yangilanadi.
                          if (pages[i] is AdminPage) {
                            _adminKey.currentState?.refresh();
                          }
                        },
                      ),
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

class _NavData {
  const _NavData({required this.icon, required this.label, this.badge = 0});

  final IconData icon;
  final String label;
  final int badge;
}

class _NavButton extends StatelessWidget {
  const _NavButton({
    required this.data,
    required this.active,
    required this.onTap,
  });

  final _NavData data;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final color = active ? p.accent : p.onSurfaceVariant;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(data.icon, size: 28, color: color),
                if (data.badge > 0)
                  Positioned(
                    top: -7,
                    right: -11,
                    child: Container(
                      constraints: const BoxConstraints(minWidth: 16),
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                      decoration: BoxDecoration(
                        color: p.primary,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        '${data.badge}',
                        textAlign: TextAlign.center,
                        style: AppText.labelSm.copyWith(
                          color: Colors.white,
                          fontSize: 10,
                          height: 1.3,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 3),
            Text(
              data.label,
              style: AppText.labelSm.copyWith(
                color: color,
                fontWeight: active ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
