import 'package:flutter/material.dart';

/// Dizayn tokenlari — Stitch "Boyxon Oshxonasi Warm Editorial" tizimidan.
///
/// Qiymatlar ekranlardagi Tailwind konfiguratsiyasidan aniq olingan
/// (light: 02-menu-light.html, dark: 02-menu-dark.html).
@immutable
class AppPalette extends ThemeExtension<AppPalette> {
  const AppPalette({
    required this.dark,
    required this.bg,
    required this.card,
    required this.cardLow,
    required this.cardHigh,
    required this.onSurface,
    required this.onSurfaceVariant,
    required this.outline,
    required this.outlineVariant,
    required this.hairline,
    required this.primary,
    required this.primaryDeep,
    required this.onPrimary,
    required this.primaryFixed,
    required this.onPrimaryFixed,
    required this.accent,
    required this.toastBg,
    required this.toastText,
    required this.successBg,
    required this.successText,
    required this.warningBg,
    required this.warningText,
    required this.error,
    required this.errorBg,
    required this.errorText,
    required this.gradientStart,
    required this.gradientMid,
    required this.gradientEnd,
    required this.navBg,
    required this.shadow,
    required this.scrim,
  });

  final bool dark;

  /// Sahifa foni (surface).
  final Color bg;

  /// Kartalar foni (surface-container-lowest).
  final Color card;

  /// Ichki bloklar / inputlar foni (surface-container-low).
  final Color cardLow;

  /// Neytral to'ldirish: "Keyinroq" tugmasi, nofaol chiplar.
  final Color cardHigh;

  /// Asosiy matn (on-surface).
  final Color onSurface;

  /// Ikkinchi darajali matn (on-surface-variant).
  final Color onSurfaceVariant;

  /// Ikonka/border urg'usi (outline).
  final Color outline;

  /// Mayin border (outline-variant).
  final Color outlineVariant;

  /// Kartalar chegarasi uchun juda mayin chiziq.
  final Color hairline;

  /// Asosiy CTA rangi — brend (#E67E22).
  final Color primary;

  /// Bosilganda / urg'uli matn (#D35400).
  final Color primaryDeep;

  final Color onPrimary;

  /// Och shaftoli fon (ikonka plitkalari) — primary-fixed.
  final Color primaryFixed;
  final Color onPrimaryFixed;

  /// Narx va faol holat matni.
  final Color accent;

  /// Toast (muvaffaqiyat) foni va matni.
  final Color toastBg;
  final Color toastText;

  /// Status chip'lari: "Yetkazildi".
  final Color successBg;
  final Color successText;

  /// Status chip'lari: "Yangi" holatlar.
  final Color warningBg;
  final Color warningText;

  final Color error;
  final Color errorBg;
  final Color errorText;

  /// Promo banner gradienti (#E67E22 → #FC7127 → #A23F00).
  final Color gradientStart;
  final Color gradientMid;
  final Color gradientEnd;

  /// Pastki navigatsiya foni (shaffof + blur uchun alpha bilan).
  final Color navBg;

  final Color shadow;
  final Color scrim;

  // ThemeExtension talablari — temalar almashganda animatsiyasiz almashinadi.
  @override
  AppPalette copyWith() => this;

  @override
  AppPalette lerp(covariant AppPalette? other, double t) =>
      t < 0.5 ? this : (other ?? this);

  static const light = AppPalette(
    dark: false,
    bg: Color(0xFFFCF9F8),
    card: Color(0xFFFFFFFF),
    cardLow: Color(0xFFF6F3F2),
    cardHigh: Color(0xFFE5E2E1),
    onSurface: Color(0xFF1C1B1B),
    onSurfaceVariant: Color(0xFF564337),
    outline: Color(0xFF897365),
    outlineVariant: Color(0xFFDCC1B1),
    hairline: Color(0x145D4037),
    primary: Color(0xFFE67E22),
    primaryDeep: Color(0xFFD35400),
    onPrimary: Color(0xFFFFFFFF),
    primaryFixed: Color(0xFFFFDCC5),
    onPrimaryFixed: Color(0xFF301400),
    accent: Color(0xFFD35400),
    toastBg: Color(0xFF006D37),
    toastText: Color(0xFFFFFFFF),
    successBg: Color(0xFFEAFAF1),
    successText: Color(0xFF27AE60),
    warningBg: Color(0xFFFDEBD0),
    warningText: Color(0xFFD35400),
    error: Color(0xFFBA1A1A),
    errorBg: Color(0xFFFFDAD6),
    errorText: Color(0xFF93000A),
    gradientStart: Color(0xFFE67E22),
    gradientMid: Color(0xFFFC7127),
    gradientEnd: Color(0xFFA23F00),
    navBg: Color(0xE6FCF9F8),
    shadow: Color(0x1AD35400),
    scrim: Color(0x73000000),
  );

  static const dark = AppPalette(
    dark: true,
    bg: Color(0xFF121212),
    card: Color(0xFF1E1E1E),
    cardLow: Color(0xFF181818),
    cardHigh: Color(0xFF2C2C2C),
    onSurface: Color(0xFFF5F5F5),
    onSurfaceVariant: Color(0xFFA0A0A0),
    outline: Color(0xFF4A4A4A),
    outlineVariant: Color(0xFF2E2E2E),
    hairline: Color(0x14FFFFFF),
    primary: Color(0xFFE67E22),
    primaryDeep: Color(0xFFD35400),
    onPrimary: Color(0xFFFFFFFF),
    primaryFixed: Color(0xFF502600),
    onPrimaryFixed: Color(0xFFFFB783),
    accent: Color(0xFFFFB783),
    toastBg: Color(0xFF1E3A2B),
    toastText: Color(0xFF85E0A3),
    successBg: Color(0xFF1E3A2B),
    successText: Color(0xFF85E0A3),
    warningBg: Color(0xFF3A2410),
    warningText: Color(0xFFFFB783),
    error: Color(0xFFFFB4AB),
    errorBg: Color(0xFF93000A),
    errorText: Color(0xFFFFDAD6),
    gradientStart: Color(0xFFE67E22),
    gradientMid: Color(0xFFFC7127),
    gradientEnd: Color(0xFFA23F00),
    navBg: Color(0xE6121212),
    shadow: Color(0x66000000),
    scrim: Color(0xB3000000),
  );
}
