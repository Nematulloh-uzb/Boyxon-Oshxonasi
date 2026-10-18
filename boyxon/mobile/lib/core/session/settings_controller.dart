import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../i18n/app_i18n.dart';

/// Ilova sozlamalari: til, tungi rejim, shrift o'lchami.
///
/// Qiymatlar mahalliy saqlanadi (`SharedPreferences`) va `AppI18n` bilan
/// sinxronlanadi. Serverga yozish (foydalanuvchi afzalliklari) — Sozlamalar
/// ekranida, foydalanuvchi tizimga kirgan bo'lsa amalga oshiriladi.
class SettingsController extends ChangeNotifier {
  static const _kLocale = 'boyxon-lang';
  static const _kTheme = 'boyxon-theme';
  static const _kFontSize = 'boyxon-font-size';

  bool ready = false;
  String locale = 'uz';
  bool darkMode = false;

  /// 'small' | 'medium' | 'large'
  String fontSize = 'medium';

  double get textScale =>
      fontSize == 'small' ? 0.9 : (fontSize == 'large' ? 1.15 : 1.0);

  Future<void> load() async {
    final sp = await SharedPreferences.getInstance();
    locale = sp.getString(_kLocale) ?? 'uz';
    darkMode = (sp.getString(_kTheme) ?? 'light') == 'dark';
    fontSize = sp.getString(_kFontSize) ?? 'medium';
    if (!AppI18n.supported.contains(locale)) locale = 'uz';
    AppI18n.I.setLocale(locale);
    ready = true;
    notifyListeners();
  }

  Future<void> setLocale(String l) async {
    if (!AppI18n.supported.contains(l) || l == locale) return;
    locale = l;
    AppI18n.I.setLocale(l);
    notifyListeners();
    final sp = await SharedPreferences.getInstance();
    await sp.setString(_kLocale, l);
  }

  Future<void> setDarkMode(bool v) async {
    if (v == darkMode) return;
    darkMode = v;
    notifyListeners();
    final sp = await SharedPreferences.getInstance();
    await sp.setString(_kTheme, v ? 'dark' : 'light');
  }

  Future<void> setFontSize(String v) async {
    if (v == fontSize) return;
    fontSize = v;
    notifyListeners();
    final sp = await SharedPreferences.getInstance();
    await sp.setString(_kFontSize, v);
  }
}
