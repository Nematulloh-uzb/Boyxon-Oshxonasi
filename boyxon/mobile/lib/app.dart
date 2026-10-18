import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';

import 'core/config/app_config.dart';
import 'core/i18n/app_i18n.dart';
import 'core/session/session_controller.dart';
import 'core/session/settings_controller.dart';
import 'features/auth/auth_page.dart';
import 'features/shell/app_shell.dart';
import 'features/splash/splash_page.dart';
import 'theme/app_theme.dart';

/// Ilova ildizi: mavzu (light/dark), til (uz/ru/en), shrift o'lchami.
class BoyxonApp extends StatelessWidget {
  const BoyxonApp({super.key});

  @override
  Widget build(BuildContext context) {
    final settings = context.watch<SettingsController>();

    // Til almashganda butun daraxt qayta qurilishi uchun ValueListenableBuilder
    // va `key` ishlatiladi (mahalliy `context.tr` ham yangilanadi).
    return ValueListenableBuilder<String>(
      valueListenable: AppI18n.I.locale,
      builder: (context, locale, _) => MaterialApp(
        key: ValueKey('boyxon-app-$locale'),
        title: AppConfig.appName,
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        darkTheme: AppTheme.dark,
        themeMode: settings.darkMode ? ThemeMode.dark : ThemeMode.light,
        locale: Locale(locale),
        supportedLocales: const [Locale('uz'), Locale('ru'), Locale('en')],
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        builder: (context, child) {
          final mq = MediaQuery.of(context);
          return MediaQuery(
            data: mq.copyWith(textScaler: TextScaler.linear(settings.textScale)),
            child: child ?? const SizedBox.shrink(),
          );
        },
        home: const _RootGate(),
      ),
    );
  }
}

/// Sessiya holatiga qarab: splash → auth yoki asosiy ilova.
class _RootGate extends StatelessWidget {
  const _RootGate();

  @override
  Widget build(BuildContext context) {
    final status = context.watch<SessionController>().status;
    if (status == SessionStatus.unknown) return const SplashPage();
    return status == SessionStatus.authed ? const AppShell() : const AuthPage();
  }
}
