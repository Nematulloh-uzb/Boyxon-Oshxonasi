import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../services/auth_service.dart';
import '../services/cart_service.dart';
import 'auth/login_screen.dart';
import 'cart/cart_screen.dart';
import 'home/home_screen.dart';
import 'orders/orders_screen.dart';
import 'settings/settings_screen.dart';

/// Asosiy qobiq: pastki navigatsiya (Menyu / Savat / Buyurtmalar / Profil).
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
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.restaurant_menu_outlined),
            selectedIcon: const Icon(Icons.restaurant_menu_rounded),
            label: l.nav_menu,
          ),
          NavigationDestination(
            icon: _cartIcon(cart, Icons.shopping_cart_outlined),
            selectedIcon: _cartIcon(cart, Icons.shopping_cart_rounded),
            label: l.nav_cart,
          ),
          NavigationDestination(
            icon: const Icon(Icons.receipt_long_outlined),
            selectedIcon: const Icon(Icons.receipt_long_rounded),
            label: l.nav_orders,
          ),
          NavigationDestination(
            icon: const Icon(Icons.person_outline_rounded),
            selectedIcon: const Icon(Icons.person_rounded),
            label: l.nav_profile,
          ),
        ],
      ),
    );
  }

  Widget _cartIcon(CartService cart, IconData icon) {
    return Badge(
      isLabelVisible: cart.itemCount > 0,
      label: Text('${cart.itemCount}'),
      child: Icon(icon),
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
