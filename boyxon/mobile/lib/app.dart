import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';

import 'core/app_theme.dart';
import 'core/order_status.dart';
import 'l10n/app_localizations.dart';
import 'models/models.dart';
import 'screens/shell.dart';
import 'screens/splash_screen.dart';
import 'services/auth_service.dart';
import 'services/cart_service.dart';
import 'services/settings_service.dart';
import 'services/socket_service.dart';

class BoyxonApp extends StatefulWidget {
  const BoyxonApp({super.key});

  @override
  State<BoyxonApp> createState() => _BoyxonAppState();
}

class _BoyxonAppState extends State<BoyxonApp> {
  final _messengerKey = GlobalKey<ScaffoldMessengerState>();
  final _settings = SettingsService();
  final _auth = AuthService();
  final _cart = CartService();
  final _socket = SocketService();

  StreamSubscription<Map<String, dynamic>>? _orderSub;
  StreamSubscription<Map<String, dynamic>>? _notifSub;
  bool _wasLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _settings.load();
    _cart.load();
    _auth.addListener(_onAuthChanged);
    _orderSub = _socket.orderStatus.listen(_onOrderStatus);
    _notifSub = _socket.notification.listen(_onNotification);
    _auth.bootstrap();
  }

  @override
  void dispose() {
    _auth.removeListener(_onAuthChanged);
    _orderSub?.cancel();
    _notifSub?.cancel();
    super.dispose();
  }

  /// Login holati o'zgarganda: socket ulanish + server preferences'ni qo'llash.
  void _onAuthChanged() {
    final loggedIn = _auth.isLoggedIn;
    if (loggedIn && !_wasLoggedIn) {
      _socket.connect();
      final prefs = _auth.user?.preferences;
      _settings.applyServerPrefs(prefs?.language, prefs?.theme);
    } else if (!loggedIn && _wasLoggedIn) {
      _socket.disconnect();
    }
    _wasLoggedIn = loggedIn;
  }

  void _onOrderStatus(Map<String, dynamic> event) {
    final context = _messengerKey.currentContext;
    if (context == null) return;
    final l = AppLocalizations.of(context);
    final status = OrderStatus.parse(event['status'] as String?);
    _messengerKey.currentState?.showSnackBar(
      SnackBar(content: Text(l.orders_status_changed(statusLabel(l, status)))),
    );
  }

  void _onNotification(Map<String, dynamic> event) {
    final title = event['title'];
    if (title is! String || title.isEmpty) return;
    _messengerKey.currentState?.showSnackBar(SnackBar(content: Text(title)));
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: _settings),
        ChangeNotifierProvider.value(value: _auth),
        ChangeNotifierProvider.value(value: _cart),
        Provider.value(value: _socket),
      ],
      child: Consumer<SettingsService>(
        builder: (context, settings, _) => MaterialApp(
          title: 'Boyxon Oshxonasi',
          debugShowCheckedModeBanner: false,
          scaffoldMessengerKey: _messengerKey,
          theme: lightTheme(),
          darkTheme: darkTheme(),
          themeMode: settings.themeMode,
          locale: settings.locale,
          supportedLocales: AppLocalizations.supportedLocales,
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          home: const _Root(),
        ),
      ),
    );
  }
}

class _Root extends StatelessWidget {
  const _Root();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    return auth.initialized ? const Shell() : const SplashScreen();
  }
}
