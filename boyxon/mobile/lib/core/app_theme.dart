import 'package:flutter/material.dart';

/// Web palitrasi (tailwind.config.ts dagi statik primary shkala + DESIGN.md).
/// Bu ranglar ikkala mavzuda ham bir xil (web'da CSS o'zgaruvchi emas).
class BoyxonPalette {
  const BoyxonPalette._();

  static const primary = Color(0xFFE67E22); // primary-500
  static const primaryDark = Color(0xFFD35400); // primary-600
  static const accent = Color(0xFFF39C12); // gradient oxiri / hover
  static const primary50 = Color(0xFFFFF3E0);
  static const primary100 = Color(0xFFFDEBD0);
  static const primary700 = Color(0xFFB85C00);
  static const star = Color(0xFFFDAB12); // reyting yulduzi

  /// CTA gradient: from #E67E22 to #F39C12 (chapdan o'ngga).
  static const gradient = LinearGradient(colors: [primary, accent]);

  /// Hero/promo banner gradient: from-primary-500 to-primary-700.
  static const heroGradient = LinearGradient(
    colors: [primary, primary700],
  );
}

/// DESIGN.md tokenlari (web globals.css bilan bir xil).
class BoyxonColors extends ThemeExtension<BoyxonColors> {
  final Color bg;
  final Color surface;
  final Color surfaceRaised;
  final Color surfaceOverlay;
  final Color inputBg;
  final Color line;
  final Color lineStrong;
  final Color fg;
  final Color fgMuted;
  final Color subtle;
  final Color placeholderBg;
  final Color primary;
  final Color primaryDark;
  final Color accent;
  final Color success;
  final Color danger;

  Color get primary50 => BoyxonPalette.primary50;
  Color get primary100 => BoyxonPalette.primary100;
  Color get primary700 => BoyxonPalette.primary700;
  Color get star => BoyxonPalette.star;

  const BoyxonColors({
    required this.bg,
    required this.surface,
    required this.surfaceRaised,
    required this.surfaceOverlay,
    required this.inputBg,
    required this.line,
    required this.lineStrong,
    required this.fg,
    required this.fgMuted,
    required this.subtle,
    required this.placeholderBg,
    required this.primary,
    required this.primaryDark,
    required this.accent,
    required this.success,
    required this.danger,
  });

  static const light = BoyxonColors(
    bg: Color(0xFFFFF8F0),
    surface: Color(0xFFFFFFFF),
    surfaceRaised: Color(0xFFFDF1E4),
    surfaceOverlay: Color(0xFFFFFFFF),
    inputBg: Color(0xFFFFFFFF),
    line: Color(0xFFECE5DC),
    lineStrong: Color(0xFFD9CFC2),
    fg: Color(0xFF2C2C2C),
    fgMuted: Color(0xFF5D4037),
    subtle: Color(0xFF7F8C8D),
    placeholderBg: Color(0xFFF5EFE7),
    primary: Color(0xFFE67E22),
    primaryDark: Color(0xFFD35400),
    accent: Color(0xFFF39C12),
    success: Color(0xFF27AE60),
    danger: Color(0xFFE74C3C),
  );

  static const dark = BoyxonColors(
    bg: Color(0xFF121212),
    surface: Color(0xFF1E1E1E),
    surfaceRaised: Color(0xFF252525),
    surfaceOverlay: Color(0xFF2C2C2C),
    inputBg: Color(0xFF181818),
    line: Color(0xFF333333),
    lineStrong: Color(0xFF3E3E3E),
    fg: Color(0xFFF5F5F5),
    fgMuted: Color(0xFFE0E0E0),
    subtle: Color(0xFFA0A0A0),
    placeholderBg: Color(0xFF252525),
    primary: Color(0xFFE67E22),
    primaryDark: Color(0xFFD35400),
    accent: Color(0xFFF39C12),
    success: Color(0xFF2ECC71),
    danger: Color(0xFFFF6B5E),
  );

  @override
  BoyxonColors copyWith({
    Color? bg,
    Color? surface,
    Color? surfaceRaised,
    Color? surfaceOverlay,
    Color? inputBg,
    Color? line,
    Color? lineStrong,
    Color? fg,
    Color? fgMuted,
    Color? subtle,
    Color? placeholderBg,
    Color? primary,
    Color? primaryDark,
    Color? accent,
    Color? success,
    Color? danger,
  }) {
    return BoyxonColors(
      bg: bg ?? this.bg,
      surface: surface ?? this.surface,
      surfaceRaised: surfaceRaised ?? this.surfaceRaised,
      surfaceOverlay: surfaceOverlay ?? this.surfaceOverlay,
      inputBg: inputBg ?? this.inputBg,
      line: line ?? this.line,
      lineStrong: lineStrong ?? this.lineStrong,
      fg: fg ?? this.fg,
      fgMuted: fgMuted ?? this.fgMuted,
      subtle: subtle ?? this.subtle,
      placeholderBg: placeholderBg ?? this.placeholderBg,
      primary: primary ?? this.primary,
      primaryDark: primaryDark ?? this.primaryDark,
      accent: accent ?? this.accent,
      success: success ?? this.success,
      danger: danger ?? this.danger,
    );
  }

  @override
  BoyxonColors lerp(ThemeExtension<BoyxonColors>? other, double t) {
    if (other is! BoyxonColors) return this;
    return BoyxonColors(
      bg: Color.lerp(bg, other.bg, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surfaceRaised: Color.lerp(surfaceRaised, other.surfaceRaised, t)!,
      surfaceOverlay: Color.lerp(surfaceOverlay, other.surfaceOverlay, t)!,
      inputBg: Color.lerp(inputBg, other.inputBg, t)!,
      line: Color.lerp(line, other.line, t)!,
      lineStrong: Color.lerp(lineStrong, other.lineStrong, t)!,
      fg: Color.lerp(fg, other.fg, t)!,
      fgMuted: Color.lerp(fgMuted, other.fgMuted, t)!,
      subtle: Color.lerp(subtle, other.subtle, t)!,
      placeholderBg: Color.lerp(placeholderBg, other.placeholderBg, t)!,
      primary: Color.lerp(primary, other.primary, t)!,
      primaryDark: Color.lerp(primaryDark, other.primaryDark, t)!,
      accent: Color.lerp(accent, other.accent, t)!,
      success: Color.lerp(success, other.success, t)!,
      danger: Color.lerp(danger, other.danger, t)!,
    );
  }
}

/// Qulaylik: `context.c` orqali ranglar.
extension BoyxonColorsX on BuildContext {
  BoyxonColors get c => Theme.of(this).extension<BoyxonColors>()!;
}

ThemeData _theme(BoyxonColors c, Brightness brightness) {
  final scheme = ColorScheme.fromSeed(
    seedColor: c.primary,
    brightness: brightness,
  ).copyWith(
    primary: c.primary,
    onPrimary: Colors.white,
    secondary: c.accent,
    surface: c.surface,
    onSurface: c.fg,
    error: c.danger,
    outline: c.line,
  );

  TextStyle display(double size, FontWeight weight, {double? height}) => TextStyle(
        fontFamily: 'Epilogue',
        fontWeight: weight,
        fontSize: size,
        color: c.fg,
        height: height ?? 1.2,
      );

  TextStyle body(double size, {FontWeight weight = FontWeight.w400, Color? color, double? height}) =>
      TextStyle(
        fontFamily: 'Inter',
        fontWeight: weight,
        fontSize: size,
        color: color ?? c.fg,
        height: height,
      );

  // Web: h1/h2 — Epilogue 700–800; karta sarlavhasi — Epilogue 600 16px;
  // tana — Inter 400–500; ikkinchi darajali matn - fg-subtle.
  final textTheme = TextTheme(
    displaySmall: display(28, FontWeight.w800),
    headlineMedium: display(24, FontWeight.w800, height: 1.15),
    headlineSmall: display(20, FontWeight.w800),
    titleLarge: display(18, FontWeight.w700),
    titleMedium: display(16, FontWeight.w600),
    titleSmall: display(14, FontWeight.w700),
    bodyLarge: body(16),
    bodyMedium: body(14),
    bodySmall: body(12, color: c.subtle, height: 1.4),
    labelLarge: body(15, weight: FontWeight.w600),
    labelMedium: body(13, weight: FontWeight.w600),
    labelSmall: body(11, weight: FontWeight.w500),
  );

  OutlineInputBorder border(Color color, {double width = 1}) => OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: color, width: width),
      );

  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: scheme,
    scaffoldBackgroundColor: c.bg,
    textTheme: textTheme,
    extensions: [c],
    splashColor: c.primary.withValues(alpha: 0.06),
    highlightColor: Colors.transparent,
    appBarTheme: AppBarTheme(
      backgroundColor: c.bg,
      foregroundColor: c.fg,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
      titleTextStyle: display(20, FontWeight.w700),
    ),
    cardTheme: CardThemeData(
      color: c.surface,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: c.line.withValues(alpha: 0.6)),
      ),
    ),
    dividerTheme: DividerThemeData(color: c.line, thickness: 1, space: 1),
    // Web: primary CTA — stadium (rounded-full), 15–16px semibold, gradient.
    // Gradient ButtonStyle bilan berilmaydi — GradientButton widget ishlatiladi,
    // bu yerda faqat o'lcham/forma va fallback rang.
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: c.primary,
        foregroundColor: Colors.white,
        minimumSize: const Size.fromHeight(48),
        shape: const StadiumBorder(),
        textStyle: body(15, weight: FontWeight.w600),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: c.fg,
        minimumSize: const Size.fromHeight(48),
        side: BorderSide(color: c.lineStrong),
        shape: const StadiumBorder(),
        textStyle: body(15, weight: FontWeight.w600),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: c.primaryDark,
        textStyle: body(14, weight: FontWeight.w600),
      ),
    ),
    // Web inputlari: bg-surface + border-ink-line, rounded-2xl (16), h-12.
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: c.surface,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      hintStyle: body(15, color: c.subtle),
      labelStyle: body(14, color: c.subtle),
      floatingLabelStyle: body(13, color: c.primaryDark),
      prefixIconColor: c.subtle,
      suffixIconColor: c.subtle,
      border: border(c.line),
      enabledBorder: border(c.line),
      focusedBorder: border(c.primary, width: 1.5),
      errorBorder: border(c.danger),
      focusedErrorBorder: border(c.danger, width: 1.5),
      errorStyle: body(12, color: c.danger),
    ),
    chipTheme: ChipThemeData(
      backgroundColor: c.surface,
      selectedColor: BoyxonPalette.primary,
      side: BorderSide(color: c.line),
      labelStyle: body(13, weight: FontWeight.w600),
      shape: const StadiumBorder(),
      showCheckmark: false,
    ),
    switchTheme: SwitchThemeData(
      thumbColor: const WidgetStatePropertyAll(Colors.white),
      trackColor: WidgetStateProperty.resolveWith(
        (states) => states.contains(WidgetState.selected) ? BoyxonPalette.primary : c.lineStrong,
      ),
      trackOutlineColor: const WidgetStatePropertyAll(Colors.transparent),
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: c.surfaceOverlay,
      contentTextStyle: body(14, color: c.fg),
      behavior: SnackBarBehavior.floating,
      insetPadding: const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: c.line),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: c.surface,
      indicatorColor: Colors.transparent,
      labelTextStyle: WidgetStatePropertyAll(
        body(11, weight: FontWeight.w500),
      ),
      iconTheme: WidgetStatePropertyAll(IconThemeData(color: c.subtle)),
    ),
    bottomSheetTheme: BottomSheetThemeData(
      backgroundColor: c.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: c.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    ),
    listTileTheme: ListTileThemeData(
      iconColor: c.subtle,
      titleTextStyle: body(14, weight: FontWeight.w600),
      subtitleTextStyle: body(12, color: c.subtle),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
    ),
    progressIndicatorTheme: ProgressIndicatorThemeData(color: c.primary),
  );
}

ThemeData lightTheme() => _theme(BoyxonColors.light, Brightness.light);
ThemeData darkTheme() => _theme(BoyxonColors.dark, Brightness.dark);
