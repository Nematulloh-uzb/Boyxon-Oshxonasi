import 'package:flutter/material.dart';

import '../core/app_theme.dart';

/// Sessiya tiklanayotganda ko'rinadigan boshlang'ich ekran.
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                gradient: BoyxonPalette.gradient,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.restaurant_menu_rounded, size: 44, color: Colors.white),
            ),
            const SizedBox(height: 20),
            Text(
              'Boyxon Oshxonasi',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: 26,
              height: 26,
              child: CircularProgressIndicator(strokeWidth: 2.6, color: c.primary),
            ),
          ],
        ),
      ),
    );
  }
}
