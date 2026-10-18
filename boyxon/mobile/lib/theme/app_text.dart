import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Dizayn tipografiyasi — sarlavhalar: Epilogue, matn: Inter.
///
/// O'lchamlar Stitch dizayn tizimidan (headline-sm … label-sm).
/// Ranglar qo'shilmagan — ishlatishda `copyWith(color: ...)` qilinadi.
class AppText {
  AppText._();

  // Sarlavhalar (Epilogue)
  static final headlineXl = GoogleFonts.epilogue(
    fontSize: 40, fontWeight: FontWeight.w700, height: 1.2, letterSpacing: -0.8,
  );
  static final headlineXlMobile = GoogleFonts.epilogue(
    fontSize: 30, fontWeight: FontWeight.w700, height: 38 / 30, letterSpacing: -0.45,
  );
  static final headlineLg = GoogleFonts.epilogue(
    fontSize: 32, fontWeight: FontWeight.w600, height: 1.25, letterSpacing: -0.48,
  );
  static final headlineLgMobile = GoogleFonts.epilogue(
    fontSize: 24, fontWeight: FontWeight.w600, height: 32 / 24, letterSpacing: -0.24,
  );
  static final headlineMd = GoogleFonts.epilogue(
    fontSize: 22, fontWeight: FontWeight.w600, height: 28 / 22,
  );
  static final headlineSm = GoogleFonts.epilogue(
    fontSize: 18, fontWeight: FontWeight.w600, height: 24 / 18,
  );

  // Matn (Inter)
  static final bodyLg = GoogleFonts.inter(
    fontSize: 16, fontWeight: FontWeight.w400, height: 1.5,
  );
  static final bodyMd = GoogleFonts.inter(
    fontSize: 14, fontWeight: FontWeight.w400, height: 20 / 14,
  );
  static final bodySm = GoogleFonts.inter(
    fontSize: 12, fontWeight: FontWeight.w400, height: 16 / 12,
  );

  // Yorliqlar (Inter)
  static final labelLg = GoogleFonts.inter(
    fontSize: 14, fontWeight: FontWeight.w600, height: 20 / 14, letterSpacing: 0.14,
  );
  static final labelMd = GoogleFonts.inter(
    fontSize: 12, fontWeight: FontWeight.w600, height: 16 / 12, letterSpacing: 0.24,
  );
  static final labelSm = GoogleFonts.inter(
    fontSize: 11, fontWeight: FontWeight.w500, height: 14 / 11, letterSpacing: 0.33,
  );
}
