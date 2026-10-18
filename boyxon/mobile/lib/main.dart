import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:provider/provider.dart';

import 'app.dart';
import 'core/api/api_client.dart';
import 'core/i18n/app_i18n.dart';
import 'core/session/session_controller.dart';
import 'core/session/settings_controller.dart';
import 'features/cart/cart_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Sana formatlash (uz/ru/en oy nomlari) va tarjimalar.
  await initializeDateFormatting();
  await AppI18n.I.load();

  // API klient: cookie'larni diskdan yuklaydi.
  await ApiClient.I.init();

  final settings = SettingsController();
  await settings.load();

  final session = SessionController();
  final cart = CartController();
  await cart.load();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider<SettingsController>.value(value: settings),
        ChangeNotifierProvider<SessionController>.value(value: session),
        ChangeNotifierProvider<CartController>.value(value: cart),
      ],
      child: const BoyxonApp(),
    ),
  );

  // Sessiyani fonda tiklaymiz — splash ko'rinib turadi.
  unawaited(session.bootstrap());
}
