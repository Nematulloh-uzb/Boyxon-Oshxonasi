import 'parse.dart';

/// Taom (GET /api/dishes).
class Dish {
  const Dish({
    required this.id,
    required this.name,
    this.nameRu,
    this.nameEn,
    this.slug = '',
    this.description = '',
    this.descriptionRu,
    this.descriptionEn,
    required this.price,
    this.oldPrice,
    this.categoryId,
    this.categorySlug,
    this.categoryName,
    this.image,
    this.deliveryTime = 30,
    this.calories,
    this.tags = const [],
    this.rating = 0,
    this.reviewCount = 0,
    this.orderCount = 0,
    this.isFeatured = false,
  });

  final String id;
  final String name;
  final String? nameRu;
  final String? nameEn;
  final String slug;
  final String description;
  final String? descriptionRu;
  final String? descriptionEn;
  final int price;
  final int? oldPrice;
  final String? categoryId;
  final String? categorySlug;
  final String? categoryName;
  final String? image;
  final int deliveryTime;
  final int? calories;
  final List<String> tags;
  final double rating;
  final int reviewCount;
  final int orderCount;
  final bool isFeatured;

  bool get hasDiscount => oldPrice != null && oldPrice! > price;

  /// Chegirma foizi (masalan, 20).
  int get discountPercent =>
      hasDiscount ? (((oldPrice! - price) / oldPrice!) * 100).round() : 0;

  String nameFor(String locale) {
    if (locale == 'en' && nameEn != null && nameEn!.isNotEmpty) return nameEn!;
    if (locale == 'ru' && nameRu != null && nameRu!.isNotEmpty) return nameRu!;
    return name;
  }

  String descriptionFor(String locale) {
    if (locale == 'en' && descriptionEn != null && descriptionEn!.isNotEmpty) {
      return descriptionEn!;
    }
    if (locale == 'ru' && descriptionRu != null && descriptionRu!.isNotEmpty) {
      return descriptionRu!;
    }
    return description;
  }

  /// Savatda (SharedPreferences) saqlash uchun JSON — `Dish.fromJson` qayta o'qiy oladi.
  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'nameRu': nameRu,
        'nameEn': nameEn,
        'slug': slug,
        'description': description,
        'descriptionRu': descriptionRu,
        'descriptionEn': descriptionEn,
        'price': price,
        'oldPrice': oldPrice,
        'category': categoryId,
        'image': image,
        'deliveryTime': deliveryTime,
        'calories': calories,
        'tags': tags,
        'rating': rating,
        'reviewCount': reviewCount,
        'orderCount': orderCount,
        'isFeatured': isFeatured,
      };

  factory Dish.fromJson(Map<String, dynamic> j) {
    final cat = j['category'];
    final catMap = asMap(cat);
    return Dish(
      id: asStr(j['_id'] ?? j['id']) ?? '',
      name: asStr(j['name']) ?? '',
      nameRu: asStr(j['nameRu']),
      nameEn: asStr(j['nameEn']),
      slug: asStr(j['slug']) ?? '',
      description: asStr(j['description']) ?? '',
      descriptionRu: asStr(j['descriptionRu']),
      descriptionEn: asStr(j['descriptionEn']),
      price: asInt(j['price']),
      oldPrice: j['oldPrice'] == null ? null : asInt(j['oldPrice']),
      categoryId: catMap.isNotEmpty ? asStr(catMap['_id'] ?? catMap['id']) : asStr(cat),
      categorySlug: asStr(catMap['slug']),
      categoryName: asStr(catMap['name']),
      image: asStr(j['image']),
      deliveryTime: asInt(j['deliveryTime'], 30),
      calories: j['calories'] == null ? null : asInt(j['calories']),
      tags: (j['tags'] is List) ? (j['tags'] as List).map((e) => e.toString()).toList() : const [],
      rating: asDouble(j['rating']),
      reviewCount: asInt(j['reviewCount']),
      orderCount: asInt(j['orderCount']),
      isFeatured: asBool(j['isFeatured']),
    );
  }
}
