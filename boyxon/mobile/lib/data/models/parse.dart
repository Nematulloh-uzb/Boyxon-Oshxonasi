/// JSON maydonlarini xavfsiz o'qish uchun kichik yordamchilar.
/// Server ba'zi maydonlarni tashlab yuborishi yoki turli ko'rinishda
/// qaytarishi mumkin — bularning barchasiga chidamli bo'lish kerak.
library;

String? asStr(dynamic v) => v == null ? null : v.toString();

int asInt(dynamic v, [int fallback = 0]) {
  if (v is num) return v.toInt();
  return int.tryParse(v?.toString() ?? '') ?? fallback;
}

double asDouble(dynamic v, [double fallback = 0]) {
  if (v is num) return v.toDouble();
  return double.tryParse(v?.toString() ?? '') ?? fallback;
}

bool asBool(dynamic v, [bool fallback = false]) {
  if (v is bool) return v;
  final s = v?.toString();
  if (s == 'true') return true;
  if (s == 'false') return false;
  return fallback;
}

DateTime? asDate(dynamic v) => v == null ? null : DateTime.tryParse(v.toString());

Map<String, dynamic> asMap(dynamic v) =>
    v is Map<String, dynamic> ? v : const <String, dynamic>{};

List<Map<String, dynamic>> asMapList(dynamic v) => v is List
    ? v.whereType<Map<String, dynamic>>().toList()
    : const <Map<String, dynamic>>[];

List<String> asStrList(dynamic v) => v is List
    ? v.map((e) => e is Map ? asStr(e['_id'] ?? e['id']) ?? '' : e.toString()).where((e) => e.isNotEmpty).toList()
    : const <String>[];
