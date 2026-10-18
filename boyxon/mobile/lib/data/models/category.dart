import 'parse.dart';

/// Kategoriya (GET /api/categories).
class Category {
  const Category({
    required this.id,
    required this.name,
    this.nameRu,
    this.nameEn,
    required this.slug,
    this.icon,
    this.order = 0,
  });

  final String id;
  final String name;
  final String? nameRu;
  final String? nameEn;
  final String slug;
  final String? icon;
  final int order;

  /// Til bo'yicha nom: 'en' → nameEn, 'ru' → nameRu, aks holda name.
  String nameFor(String locale) {
    if (locale == 'en' && nameEn != null && nameEn!.isNotEmpty) return nameEn!;
    if (locale == 'ru' && nameRu != null && nameRu!.isNotEmpty) return nameRu!;
    return name;
  }

  factory Category.fromJson(Map<String, dynamic> j) => Category(
        id: asStr(j['_id'] ?? j['id']) ?? '',
        name: asStr(j['name']) ?? '',
        nameRu: asStr(j['nameRu']),
        nameEn: asStr(j['nameEn']),
        slug: asStr(j['slug']) ?? '',
        icon: asStr(j['icon']),
        order: asInt(j['order']),
      );
}
