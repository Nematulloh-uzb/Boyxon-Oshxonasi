import '../../core/api/api_client.dart';
import '../models/parse.dart';

/// Promo kod natijasi (POST /api/promos/validate).
class PromoResult {
  const PromoResult({required this.code, required this.discount, this.description});

  final String code;
  final int discount;
  final String? description;
}

/// Promo API.
class PromoService {
  PromoService._internal();
  static final PromoService I = PromoService._internal();

  final ApiClient _api = ApiClient.I;

  /// POST /api/promos/validate { code, subtotal } → chegirma summasi.
  Future<PromoResult> validate(String code, int subtotal) async {
    final res = await _api.post('/api/promos/validate', body: {
      'code': code.trim().toUpperCase(),
      'subtotal': subtotal,
    });
    final d = res.dataMap;
    return PromoResult(
      code: asStr(d['code']) ?? code.trim().toUpperCase(),
      discount: asInt(d['discount']),
      description: asStr(d['description']),
    );
  }
}
