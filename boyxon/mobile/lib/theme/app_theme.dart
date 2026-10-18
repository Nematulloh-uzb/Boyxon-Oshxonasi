import 'package:flutter/material.dart';

import 'app_palette.dart';
import 'app_text.dart';

/// Ilova mavzusi (light/dark) — Material 3 + dizayn tokenlari.
class AppTheme {
  AppTheme._();

  static ThemeData get light => _build(AppPalette.light);
  static ThemeData get dark => _build(AppPalette.dark);

  static ThemeData _build(AppPalette p) {
    final scheme = ColorScheme(
      brightness: p.dark ? Brightness.dark : Brightness.light,
      primary: p.primary,
      onPrimary: p.onPrimary,
      primaryContainer: p.primaryFixed,
      onPrimaryContainer: p.onPrimaryFixed,
      secondary: p.primaryDeep,
      onSecondary: p.onPrimary,
      secondaryContainer: p.warningBg,
      onSecondaryContainer: p.warningText,
      tertiary: p.successText,
      onTertiary: p.onPrimary,
      error: p.error,
      onError: p.onPrimary,
      errorContainer: p.errorBg,
      onErrorContainer: p.errorText,
      surface: p.bg,
      onSurface: p.onSurface,
      onSurfaceVariant: p.onSurfaceVariant,
      surfaceContainerLowest: p.card,
      surfaceContainerLow: p.cardLow,
      surfaceContainerHighest: p.cardHigh,
      outline: p.outline,
      outlineVariant: p.outlineVariant,
      shadow: p.shadow,
      scrim: p.scrim,
      inverseSurface: p.dark ? const Color(0xFFE5E2E1) : const Color(0xFF313030),
      onInverseSurface: p.dark ? const Color(0xFF313030) : const Color(0xFFF3F0EF),
      inversePrimary: p.dark ? const Color(0xFF944A00) : const Color(0xFFFFB783),
    );

    return ThemeData(
      useMaterial3: true,
      brightness: scheme.brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor: p.bg,
      splashFactory: InkRipple.splashFactory,
      extensions: [p],
      textTheme: TextTheme(
        headlineLarge: AppText.headlineLg.copyWith(color: p.onSurface),
        headlineMedium: AppText.headlineMd.copyWith(color: p.onSurface),
        headlineSmall: AppText.headlineSm.copyWith(color: p.onSurface),
        titleMedium: AppText.labelLg.copyWith(color: p.onSurface),
        bodyLarge: AppText.bodyLg.copyWith(color: p.onSurface),
        bodyMedium: AppText.bodyMd.copyWith(color: p.onSurface),
        bodySmall: AppText.bodySm.copyWith(color: p.onSurfaceVariant),
        labelLarge: AppText.labelLg.copyWith(color: p.onSurface),
        labelMedium: AppText.labelMd.copyWith(color: p.onSurface),
        labelSmall: AppText.labelSm.copyWith(color: p.onSurfaceVariant),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: p.cardLow,
        hintStyle: AppText.bodyMd.copyWith(color: p.outline),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        // Dizaynda inputlar chegarasiz (filled) — fokusda to'q sariq halqa.
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: p.primary, width: 1.6),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: p.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: p.error, width: 1.6),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: p.dark ? p.cardHigh : const Color(0xFF313030),
        contentTextStyle: AppText.bodyMd.copyWith(color: const Color(0xFFF3F0EF)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        showDragHandle: true,
      ),
      dialogTheme: DialogThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      dividerTheme: DividerThemeData(color: p.hairline, thickness: 1),
    );
  }
}

/// `context.palette` — joriy mavzu tokenlari.
extension PaletteContextX on BuildContext {
  AppPalette get palette =>
      Theme.of(this).extension<AppPalette>() ?? AppPalette.light;
}
