import 'package:flutter/material.dart';

/// DESIGN.md tokenlari (web globals.css / tailwind.config.ts bilan bir xil).
class BoyxonColors extends ThemeExtension<BoyxonColors> {
  final Color bg;
  final Color surface;
  final Color surfaceRaised;
  final Color line;
  final Color fg;
  final Color subtle;
  final Color primary;
  final Color primaryDark;
  final Color accent;
  final Color success;
  final Color danger;

  const BoyxonColors({
    required this.bg,
    required this.surface,
    required this.surfaceRaised,
    required this.line,
    required this.fg,
    required this.subtle,
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
    line: Color(0xFFECE5DC),
    fg: Color(0xFF2C2C2C),
    subtle: Color(0xFF7F8C8D),
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
    line: Color(0xFF333333),
    fg: Color(0xFFF5F5F5),
    subtle: Color(0xFFA0A0A0),
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
    Color? line,
    Color? fg,
    Color? subtle,
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
      line: line ?? this.line,
      fg: fg ?? this.fg,
      subtle: subtle ?? this.subtle,
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
      line: Color.lerp(line, other.line, t)!,
      fg: Color.lerp(fg, other.fg, t)!,
      subtle: Color.lerp(subtle, other.subtle, t)!,
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

  TextStyle display(double size, FontWeight weight) => TextStyle(
        fontFamily: 'Epilogue',
        fontWeight: weight,
        fontSize: size,
        color: c.fg,
        height: 1.2,
      );

  final textTheme = TextTheme(
    displaySmall: display(28, FontWeight.w800),
    headlineMedium: display(24, FontWeight.w800),
    headlineSmall: display(20, FontWeight.w700),
    titleLarge: display(18, FontWeight.w700),
    titleMedium: display(16, FontWeight.w700),
    bodyLarge: TextStyle(fontFamily: 'Inter', fontSize: 16, color: c.fg),
    bodyMedium: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.fg),
    bodySmall: TextStyle(fontFamily: 'Inter', fontSize: 12, color: c.subtle),
    labelLarge: const TextStyle(
      fontFamily: 'Inter',
      fontSize: 15,
      fontWeight: FontWeight.w600,
    ),
  );

  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: scheme,
    scaffoldBackgroundColor: c.bg,
    textTheme: textTheme,
    extensions: [c],
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
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: c.primary,
        foregroundColor: Colors.white,
        minimumSize: const Size.fromHeight(52),
        shape: const StadiumBorder(),
        textStyle: const TextStyle(
          fontFamily: 'Inter',
          fontSize: 15,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: c.fg,
        minimumSize: const Size.fromHeight(48),
        side: BorderSide(color: c.line),
        shape: const StadiumBorder(),
        textStyle: const TextStyle(
          fontFamily: 'Inter',
          fontSize: 15,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: c.primaryDark,
        textStyle: const TextStyle(
          fontFamily: 'Inter',
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: c.surfaceRaised,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      hintStyle: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.subtle),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: c.line),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: c.line),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: c.primary, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: c.danger),
      ),
    ),
    chipTheme: ChipThemeData(
      backgroundColor: c.surfaceRaised,
      selectedColor: c.primary,
      side: BorderSide(color: c.line),
      labelStyle: const TextStyle(
        fontFamily: 'Inter',
        fontSize: 13,
        fontWeight: FontWeight.w600,
      ),
      shape: const StadiumBorder(),
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: c.surface,
      contentTextStyle: TextStyle(
        fontFamily: 'Inter',
        fontSize: 14,
        color: c.fg,
      ),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: c.surface,
      indicatorColor: c.primary.withValues(alpha: 0.16),
      labelTextStyle: WidgetStatePropertyAll(
        TextStyle(fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w600, color: c.fg),
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
  );
}

ThemeData lightTheme() => _theme(BoyxonColors.light, Brightness.light);
ThemeData darkTheme() => _theme(BoyxonColors.dark, Brightness.dark);
