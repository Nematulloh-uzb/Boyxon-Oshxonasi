import '../../core/api/api_client.dart';
import '../models/category.dart';
import '../models/dish.dart';

/// Kategoriyalar va taomlar API'si.
class MenuService {
  MenuService._internal();
  static final MenuService I = MenuService._internal();

  final ApiClient _api = ApiClient.I;

  /// GET /api/categories — faol kategoriyalar (order bo'yicha).
  Future<List<Category>> categories() async {
    final res = await _api.get('/api/categories');
    return res.dataList
        .whereType<Map<String, dynamic>>()
        .map(Category.fromJson)
        .toList();
  }

  /// GET /api/dishes — qidiruv/filtr/sahifalash.
  Future<(List<Dish>, PaginationInfo?)> dishes({
    String? category,
    String? search,
    String? sort,
    int page = 1,
    int limit = 20,
  }) async {
    final query = <String, dynamic>{'page': page, 'limit': limit};
    if (category != null && category.isNotEmpty) query['category'] = category;
    if (search != null && search.trim().isNotEmpty) query['search'] = search.trim();
    if (sort != null && sort.isNotEmpty) query['sort'] = sort;

    final res = await _api.get('/api/dishes', query: query);
    final items = res.dataList
        .whereType<Map<String, dynamic>>()
        .map(Dish.fromJson)
        .toList();
    return (items, res.pagination);
  }

  /// GET /api/dishes/featured — "Ommabop taomlar".
  Future<List<Dish>> featured() async {
    final res = await _api.get('/api/dishes/featured');
    return res.dataList
        .whereType<Map<String, dynamic>>()
        .map(Dish.fromJson)
        .toList();
  }

  /// GET /api/dishes/:slug → taom + sharhlar (data: { dish, reviews }).
  Future<(Dish?, List<Map<String, dynamic>>)> dishDetail(String slugOrId) async {
    final res = await _api.get('/api/dishes/$slugOrId');
    final d = res.dataMap;
    final dishMap = d['dish'] is Map<String, dynamic>
        ? d['dish'] as Map<String, dynamic>
        : (d.containsKey('name') ? d : null);
    final reviews = d['reviews'] is List
        ? (d['reviews'] as List).whereType<Map<String, dynamic>>().toList()
        : <Map<String, dynamic>>[];
    return (dishMap == null ? null : Dish.fromJson(dishMap), reviews);
  }
}
