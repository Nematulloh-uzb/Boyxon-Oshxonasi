import 'package:flutter/material.dart';
import 'package:material_symbols_icons/symbols.dart';

import '../../core/config/app_config.dart';
import '../../core/i18n/app_i18n.dart';
import '../../theme/app_text.dart';
import '../../theme/app_theme.dart';

/// Boshlang'ich (yuklanish) ekrani — sessiya tiklanayotganda ko'rinadi.
class SplashPage extends StatelessWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    return Scaffold(
      backgroundColor: p.bg,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 88,
              height: 88,
              decoration: BoxDecoration(
                color: p.primary,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(color: p.shadow, blurRadius: 28, offset: const Offset(0, 10)),
                ],
              ),
              child: const Icon(Symbols.restaurant, color: Colors.white, size: 44),
            ),
            const SizedBox(height: 22),
            Text(
              AppConfig.appName,
              style: AppText.headlineLgMobile.copyWith(color: p.onSurface),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: Text(
                context.tr('auth.hero_subtitle'),
                textAlign: TextAlign.center,
                style: AppText.bodyMd.copyWith(color: p.onSurfaceVariant),
              ),
            ),
            const SizedBox(height: 36),
            SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(strokeWidth: 3, color: p.primary),
            ),
          ],
        ),
      ),
    );
  }
}
