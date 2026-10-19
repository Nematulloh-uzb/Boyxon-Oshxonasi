import 'package:dio/dio.dart';

/// Teskari geokodlash — Nominatim (OpenStreetMap), API kalitsiz.
///
/// Serverga bog'liq emas: alohida yengil Dio bilan tashqi xizmatga murojaat
/// qiladi. Xatolik bo'lsa `null` qaytaradi — chaqiruvchi qo'lda kiritishga
/// o'tadi (foydalanuvchi oqimi to'xtamaydi).
class GeoService {
  GeoService._internal();
  static final GeoService I = GeoService._internal();

  final Dio _dio = Dio(
    BaseOptions(
      baseUrl: 'https://nominatim.openstreetmap.org',
      connectTimeout: const Duration(seconds: 8),
      receiveTimeout: const Duration(seconds: 8),
      headers: const {
        // Nominatim siyosati: aniq User-Agent ko'rsatilishi shart.
        'User-Agent': 'BoyxonOshxonasi/1.0 (mobile; uz.boyxon.mobile)',
        'Accept': 'application/json',
      },
    ),
  );

  /// (lat, lng) → "Toshkent, Chilonzor, Bunyodkor ko'chasi 12" ko'rinishidagi matn.
  Future<String?> reverse(double lat, double lng, {String lang = 'uz'}) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/reverse',
        queryParameters: {
          'format': 'jsonv2',
          'lat': lat,
          'lon': lng,
          'zoom': 18,
          'accept-language': '$lang,en',
        },
      );
      final data = res.data ?? const <String, dynamic>{};
      final addr = (data['address'] as Map?)?.cast<String, dynamic>() ?? const <String, dynamic>{};

      String? pick(List<String> keys) {
        for (final k in keys) {
          final v = addr[k]?.toString().trim();
          if (v != null && v.isNotEmpty) return v;
        }
        return null;
      }

      final road = [
        pick(const ['road', 'pedestrian', 'footway', 'residential']),
        pick(const ['house_number']),
      ].whereType<String>().join(' ');
      final parts = [
        pick(const ['city', 'town', 'village', 'county']),
        pick(const ['suburb', 'neighbourhood', 'quarter', 'city_district']),
        road.isEmpty ? null : road,
      ].whereType<String>().toList();
      if (parts.isNotEmpty) return parts.join(', ');

      final display = data['display_name']?.toString().trim();
      return (display == null || display.isEmpty) ? null : display;
    } catch (_) {
      return null;
    }
  }
}
