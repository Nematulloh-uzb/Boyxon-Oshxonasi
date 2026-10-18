import 'package:intl/intl.dart';

import '../i18n/app_i18n.dart';

/// Narx/sana formatlash yordamchilari (saytdagi ko'rinishga mos).
class Fmt {
  Fmt._();

  static final Map<String, DateFormat> _cache = {};

  /// "45 000 so'm" — bo'sh joy bilan guruhlangan, manfiy qiymat "-" bilan.
  static String money(num value) {
    final s = value.round().abs().toString();
    final b = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) b.write(' ');
      b.write(s[i]);
    }
    final sign = value < 0 ? '-' : '';
    return "$sign$b so'm";
  }

  /// "18 okt, 14:30" (joriy tilga mos oy nomi bilan).
  static String dateTime(DateTime d, {String? locale}) =>
      _df('d MMM, HH:mm', locale).format(d.toLocal());

  /// "18 oktabr, 2026"
  static String fullDate(DateTime d, {String? locale}) =>
      _df('d MMMM, yyyy', locale).format(d.toLocal());

  /// "14:30"
  static String time(DateTime d, {String? locale}) =>
      _df('HH:mm', locale).format(d.toLocal());

  static DateFormat _df(String pattern, String? locale) {
    final l = locale ?? AppI18n.I.locale.value;
    return _cache['$pattern|$l'] ??= DateFormat(pattern, l);
  }
}
