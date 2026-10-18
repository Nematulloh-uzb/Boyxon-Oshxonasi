import '../../core/api/api_client.dart';
import '../models/order.dart';

/// Admin panel API'si (faqat role='admin' uchun).
class AdminService {
  AdminService._internal();
  static final AdminService I = AdminService._internal();

  final ApiClient _api = ApiClient.I;

  /// GET /api/admin/stats — KPI kartalar uchun.
  /// Shakl serverga bog'liq, shuning uchun xom Map qaytaramiz.
  Future<Map<String, dynamic>> stats() async {
    final res = await _api.get('/api/admin/stats');
    return res.dataMap;
  }

  /// GET /api/admin/orders?status=&page=&limit=.
  Future<(List<Order>, PaginationInfo?)> orders({
    String? status,
    int page = 1,
    int limit = 20,
  }) async {
    final query = <String, dynamic>{'page': page, 'limit': limit};
    if (status != null && status.isNotEmpty) query['status'] = status;
    final res = await _api.get('/api/admin/orders', query: query);
    final items = res.dataList
        .whereType<Map<String, dynamic>>()
        .map(Order.fromJson)
        .toList();
    return (items, res.pagination);
  }

  /// GET /api/admin/orders/:id.
  Future<Order> orderDetail(String id) async {
    final res = await _api.get('/api/admin/orders/$id');
    final d = res.dataMap;
    final o = d['order'];
    return Order.fromJson(o is Map<String, dynamic> ? o : d);
  }

  /// PATCH /api/admin/orders/:id/status { status, note? }.
  Future<void> updateOrderStatus(String id, String status, {String? note}) async {
    await _api.patch('/api/admin/orders/$id/status', body: {
      'status': status,
      if (note != null && note.trim().isNotEmpty) 'note': note.trim(),
    });
  }
}
