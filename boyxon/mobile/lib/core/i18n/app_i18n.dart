import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;

/// Sayt bilan bir xil tarjima tizimi.
///
/// `assets/locales/{uz,ru,en}.json` fayllari saytdan olingan (flat nuqtali
/// kalitlar: "cart.title") va ilovaga xos kalitlar bilan to'ldiriladi.
/// O'rinbosarlar `{{param}}` ko'rinishida (saytdagi kabi).
class AppI18n {
  AppI18n._internal();
  static final AppI18n I = AppI18n._internal();

  final Map<String, Map<String, String>> _dicts = {};

  /// Joriy til ('uz' | 'ru' | 'en') — tinglovchilar qayta quriladi.
  final ValueNotifier<String> locale = ValueNotifier<String>('uz');

  static const List<String> supported = ['uz', 'ru', 'en'];

  Future<void> load() async {
    if (_dicts.isNotEmpty) return;
    for (final l in supported) {
      final raw = await rootBundle.loadString('assets/locales/$l.json');
      final decoded = jsonDecode(raw) as Map<String, dynamic>;
      _dicts[l] = decoded.map(
        (k, v) => MapEntry(k, _normalizeBraces(v.toString())),
      );
    }
  }

  /// Saytdagi kabi eski `{count}` (bitta qavs) yozuvlarni `{{count}}` ga keltiramiz.
  static String _normalizeBraces(String v) => v.replaceAllMapped(
        RegExp(r'(?<!\{)\{([A-Za-z_][A-Za-z0-9_]*)\}(?!\})'),
        (m) => '{{${m[1]}}}',
      );

  /// Tarjima: kalit topilmasa — o'zbekchadan, u ham bo'lmasa — kalitning o'zi.
  String t(String key, [Map<String, String>? params]) {
    var text = _dicts[locale.value]?[key] ?? _dicts['uz']?[key] ?? key;
    if (params != null) {
      for (final e in params.entries) {
        text = text.replaceAll('{{${e.key}}}', e.value);
      }
    }
    return text;
  }

  void setLocale(String l) {
    if (supported.contains(l) && l != locale.value) locale.value = l;
  }
}

/// Qulaylik: `context.tr('cart.title')`.
extension I18nContextX on BuildContext {
  String tr(String key, [Map<String, String>? params]) => AppI18n.I.t(key, params);
}
