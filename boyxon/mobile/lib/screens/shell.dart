import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_theme.dart';
import '../l10n/app_localizations.dart';
import '../services/auth_service.dart';
import '../services/cart_service.dart';
import 'auth/login_screen.dart';
import 'cart/cart_screen.dart';
import 'home/home_screen.dart';
import 'orders/orders_screen.dart';
import 'settings/settings_screen.dart';

/// Asosiy qobiq: pastki navigatsiya — web `BottomNav` bilan bir xil uslub
/// (surface fon, yuqori chiziq, 11px yorliq, faol rang primary-600).
class Shell extends StatefulWidget {
  const Shell({super.key});

  @override
  State<Shell> createState() => _ShellState();
}

class _ShellState extends State<Shell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final cart = context.watch<CartService>();
    final c = context.c;

    return Scaffold(
      body: IndexedStack(
        index: _index,
        children: [
          const HomeScreen(),
          CartScreen(onGoMenu: () => setState(() => _index = 0)),
          const OrdersScreen(),
          const _ProfileGate(),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: c.surface,
          border: Border(top: BorderSide(color: c.line)),
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 60,
            child: Row(
              children: [
                _NavItem(
                  icon: Icons.restaurant_menu_rounded,
                  label: l.nav_menu,
                  active: _index == 0,
                  onTap: () => setState(() => _index = 0),
                ),
                _NavItem(
                  icon: Icons.shopping_bag_rounded,
                  label: l.nav_cart,
                  active: _index == 1,
                  badge: cart.itemCount,
                  onTap: () => setState(() => _index = 1),
                ),
                _NavItem(
                  icon: Icons.receipt_long_rounded,
                  label: l.nav_orders,
                  active: _index == 2,
                  onTap: () => setState(() => _index = 2),
                ),
                _NavItem(
                  icon: Icons.person_rounded,
                  label: l.nav_profile,
                  active: _index == 3,
                  onTap: () => setState(() => _index = 3),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.label,
    required this.active,
    required this.onTap,
    this.badge = 0,
  });

  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;
  final int badge;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final color = active ? BoyxonPalette.primaryDark : c.subtle;

    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(icon, size: 24, color: color),
                if (badge > 0)
                  Positioned(
                    top: -4,
                    right: -8,
                    child: Container(
                      constraints: const BoxConstraints(minWidth: 16),
                      height: 16,
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      decoration: const BoxDecoration(
                        color: BoyxonPalette.primary,
                        borderRadius: BorderRadius.all(Radius.circular(999)),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '$badge',
                        style: const TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Profil tab: kirgan bo'lsa sozlamalar, aks holda kirish ekrani.
class _ProfileGate extends StatelessWidget {
  const _ProfileGate();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    return auth.isLoggedIn ? const SettingsScreen() : const LoginScreen(embedded: true);
  }
}
