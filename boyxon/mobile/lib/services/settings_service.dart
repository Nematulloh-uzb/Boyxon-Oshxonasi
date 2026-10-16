import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/api_client.dart';

/// Til va mavzu — lokal saqlanadi, tizimga kirgan bo'lsa serverga ham yoziladi
/// (web'dagi preferences bilan bir xil).
class SettingsService extends ChangeNotifier {
  static const _localeKey = 'boyxon_locale';
  static const _themeKey = 'boyxon_theme';

  Locale _locale = const Locale('uz');
  ThemeMode _themeMode = ThemeMode.dark;

  Locale get locale => _locale;
  String get languageCode => _locale.languageCode;
  ThemeMode get themeMode => _themeMode;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final lang = prefs.getString(_localeKey);
    if (lang != null && lang.isNotEmpty) _locale = Locale(lang);
    final theme = prefs.getString(_themeKey);
    if (theme == 'light') _themeMode = ThemeMode.light;
    if (theme == 'dark') _themeMode = ThemeMode.dark;
    notifyListeners();
  }

  Future<void> setLanguage(String code, {bool syncServer = true}) async {
    _locale = Locale(code);
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_localeKey, code);
    if (syncServer) _syncServer();
  }

  Future<void> setThemeMode(ThemeMode mode, {bool syncServer = true}) async {
    _themeMode = mode;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themeKey, mode == ThemeMode.light ? 'light' : 'dark');
    if (syncServer) _syncServer();
  }

  /// Login bo'lganda server preferences'ni qo'llash (sync qilmasdan).
  Future<void> applyServerPrefs(String? language, String? theme) async {
    var changed = false;
    if (language != null && language.isNotEmpty && language != _locale.languageCode) {
      _locale = Locale(language);
      changed = true;
    }
    if (theme == 'light' && _themeMode != ThemeMode.light) {
      _themeMode = ThemeMode.light;
      changed = true;
    } else if (theme == 'dark' && _themeMode != ThemeMode.dark) {
      _themeMode = ThemeMode.dark;
      changed = true;
    }
    if (changed) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_localeKey, _locale.languageCode);
      await prefs.setString(_themeKey, _themeMode == ThemeMode.light ? 'light' : 'dark');
      notifyListeners();
    }
  }

  /// Serverga yozish — faqat login bo'lganda, best effort.
  void _syncServer() {
    if (ApiClient.instance.accessToken == null) return;
    ApiClient.instance.dio
        .patch('/users/me/preferences', data: {
          'language': _locale.languageCode,
          'theme': _themeMode == ThemeMode.light ? 'light' : 'dark',
        })
        .then((_) {}, onError: (Object _) {}); // xatolarni yutamiz — muhim emas
  }
}
