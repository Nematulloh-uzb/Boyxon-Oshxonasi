import '../../core/api/api_client.dart';
import '../models/order.dart';

/// Buyurtmalar API'si (saytdagi bilan bir xil endpointlar).
class OrderService {
  OrderService._internal();
  static final OrderService I = OrderService._internal();

  final ApiClient _api = ApiClient.I;

  /// POST /api/orders — buyurtma yaratish.
  ///
  /// items: [{ dish: '<id>', quantity: 2 }]
  /// Yakuniy narx serverda qayta hisoblanadi (promo, yetkazish).
  Future<Order> create({
    required List<Map<String, dynamic>> items,
    required String deliveryType,
    Map<String, dynamic>? address,
    required String paymentMethod,
    String? promoCode,
    String? notes,
  }) async {
    final body = <String, dynamic>{
      'items': items,
      'deliveryType': deliveryType,
      'paymentMethod': paymentMethod,
    };
    if (address != null) body['address'] = address;
    if (promoCode != null && promoCode.isNotEmpty) body['promoCode'] = promoCode;
    if (notes != null && notes.trim().isNotEmpty) body['notes'] = notes.trim();

    final res = await _api.post('/api/orders', body: body);
    return Order.fromJson(_orderMap(res.dataMap));
  }

  /// GET /api/users/me/orders — o'z buyurtmalarim (+ sahifalash ma'lumoti).
  Future<(List<Order>, PaginationInfo?)> myOrders({
    int page = 1,
    int limit = 20,
  }) async {
    final res = await _api.get('/api/users/me/orders', query: {
      'page': page,
      'limit': limit,
    });
    final list = res.dataList.isNotEmpty
        ? res.dataList
        : (res.dataMap['orders'] is List ? res.dataMap['orders'] as List : const []);
    return (
      list.whereType<Map<String, dynamic>>().map(Order.fromJson).toList(),
      res.pagination,
    );
  }

  /// GET /api/orders/:id — bitta buyurtma.
  Future<Order> byId(String id) async {
    final res = await _api.get('/api/orders/$id');
    return Order.fromJson(_orderMap(res.dataMap));
  }

  /// PATCH /api/orders/:id/cancel.
  Future<void> cancel(String id, {String? reason}) async {
    await _api.patch('/api/orders/$id/cancel', body: {
      if (reason != null && reason.trim().isNotEmpty) 'reason': reason.trim(),
    });
  }

  /// POST /api/orders/:id/review { rating, text? }.
  Future<void> review(String id, {required int rating, String? text}) async {
    await _api.post('/api/orders/$id/review', body: {
      'rating': rating,
      if (text != null && text.trim().isNotEmpty) 'text': text.trim(),
    });
  }

  Map<String, dynamic> _orderMap(Map<String, dynamic> d) {
    final o = d['order'];
    return o is Map<String, dynamic> ? o : d;
  }
}
