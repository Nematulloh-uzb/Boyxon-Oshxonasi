import '../core/env.dart';

/// Backend modellari (client/src/types/index.ts bilan bir xil maydonlar).

class Address {
  final String? id;
  final String label;
  final String address;
  final bool isDefault;

  const Address({
    this.id,
    required this.label,
    required this.address,
    this.isDefault = false,
  });

  factory Address.fromJson(Map<String, dynamic> json) => Address(
        id: json['_id'] as String?,
        label: (json['label'] ?? '') as String,
        address: (json['address'] ?? '') as String,
        isDefault: (json['isDefault'] ?? false) as bool,
      );

  Map<String, dynamic> toJson() => {
        'label': label,
        'address': address,
        'isDefault': isDefault,
      };
}

class UserPrefs {
  final String language;
  final String theme;

  const UserPrefs({this.language = 'uz', this.theme = 'dark'});

  factory UserPrefs.fromJson(Map<String, dynamic> json) => UserPrefs(
        language: (json['language'] ?? 'uz') as String,
        theme: (json['theme'] ?? 'dark') as String,
      );
}

class User {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? avatar;
  final String role;
  final List<Address> addresses;
  final int bonusBalance;
  final bool emailVerified;
  final UserPrefs preferences;
  final bool pushEnabled;

  const User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.avatar,
    this.role = 'user',
    this.addresses = const [],
    this.bonusBalance = 0,
    this.emailVerified = false,
    this.preferences = const UserPrefs(),
    this.pushEnabled = true,
  });

  bool get isAdmin => role == 'admin';

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: (json['_id'] ?? '') as String,
        name: (json['name'] ?? '') as String,
        email: (json['email'] ?? '') as String,
        phone: json['phone'] as String?,
        avatar: json['avatar'] as String?,
        role: (json['role'] ?? 'user') as String,
        addresses: ((json['addresses'] ?? []) as List)
            .map((e) => Address.fromJson(e as Map<String, dynamic>))
            .toList(),
        bonusBalance: ((json['bonusBalance'] ?? 0) as num).toInt(),
        emailVerified: (json['emailVerified'] ?? false) as bool,
        preferences: json['preferences'] is Map<String, dynamic>
            ? UserPrefs.fromJson(json['preferences'] as Map<String, dynamic>)
            : const UserPrefs(),
        pushEnabled: json['notificationPrefs'] is Map<String, dynamic>
            ? ((json['notificationPrefs'] as Map<String, dynamic>)['pushEnabled'] ?? true) as bool
            : true,
      );
}

class Category {
  final String id;
  final String name;
  final String? nameRu;
  final String? nameEn;
  final String slug;
  final String? icon;

  const Category({
    required this.id,
    required this.name,
    this.nameRu,
    this.nameEn,
    required this.slug,
    this.icon,
  });

  factory Category.fromJson(Map<String, dynamic> json) => Category(
        id: (json['_id'] ?? '') as String,
        name: (json['name'] ?? '') as String,
        nameRu: json['nameRu'] as String?,
        nameEn: json['nameEn'] as String?,
        slug: (json['slug'] ?? '') as String,
        icon: json['icon'] as String?,
      );

  String localizedName(String lang) => switch (lang) {
        'ru' => (nameRu?.isNotEmpty ?? false) ? nameRu! : name,
        'en' => (nameEn?.isNotEmpty ?? false) ? nameEn! : name,
        _ => name,
      };
}

class Dish {
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
  final Category? category;
  final String? image;
  final int deliveryTime;
  final int? calories;
  final List<String> tags;
  final double rating;
  final int reviewCount;
  final bool isFeatured;

  const Dish({
    required this.id,
    required this.name,
    this.nameRu,
    this.nameEn,
    required this.slug,
    this.description = '',
    this.descriptionRu,
    this.descriptionEn,
    required this.price,
    this.oldPrice,
    this.category,
    this.image,
    this.deliveryTime = 30,
    this.calories,
    this.tags = const [],
    this.rating = 0,
    this.reviewCount = 0,
    this.isFeatured = false,
  });

  factory Dish.fromJson(Map<String, dynamic> json) => Dish(
        id: (json['_id'] ?? '') as String,
        name: (json['name'] ?? '') as String,
        nameRu: json['nameRu'] as String?,
        nameEn: json['nameEn'] as String?,
        slug: (json['slug'] ?? '') as String,
        description: (json['description'] ?? '') as String,
        descriptionRu: json['descriptionRu'] as String?,
        descriptionEn: json['descriptionEn'] as String?,
        price: ((json['price'] ?? 0) as num).toInt(),
        oldPrice: (json['oldPrice'] as num?)?.toInt(),
        category: json['category'] is Map<String, dynamic>
            ? Category.fromJson(json['category'] as Map<String, dynamic>)
            : null,
        image: json['image'] as String?,
        deliveryTime: ((json['deliveryTime'] ?? 30) as num).toInt(),
        calories: (json['calories'] as num?)?.toInt(),
        tags: ((json['tags'] ?? []) as List).map((e) => e.toString()).toList(),
        rating: ((json['rating'] ?? 0) as num).toDouble(),
        reviewCount: ((json['reviewCount'] ?? 0) as num).toInt(),
        isFeatured: (json['isFeatured'] ?? false) as bool,
      );

  String localizedName(String lang) => switch (lang) {
        'ru' => (nameRu?.isNotEmpty ?? false) ? nameRu! : name,
        'en' => (nameEn?.isNotEmpty ?? false) ? nameEn! : name,
        _ => name,
      };

  String localizedDescription(String lang) => switch (lang) {
        'ru' => (descriptionRu?.isNotEmpty ?? false) ? descriptionRu! : description,
        'en' => (descriptionEn?.isNotEmpty ?? false) ? descriptionEn! : description,
        _ => description,
      };

  /// Nisbiy yo'llarni (`/uploads/x.jpg`) API hostiga ulaydi.
  String? get imageUrl {
    final img = image;
    if (img == null || img.isEmpty) return null;
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    if (img.startsWith('/')) return '${Env.socketBase}$img';
    return img;
  }

  Map<String, dynamic> toCartJson() => {
        'id': id,
        'name': name,
        'nameRu': nameRu,
        'nameEn': nameEn,
        'slug': slug,
        'price': price,
        'image': image,
      };
}

class PromoResult {
  final String code;
  final int discount;
  final String? description;

  const PromoResult({required this.code, required this.discount, this.description});

  factory PromoResult.fromJson(Map<String, dynamic> json) => PromoResult(
        code: (json['code'] ?? '') as String,
        discount: ((json['discount'] ?? 0) as num).toInt(),
        description: json['description'] as String?,
      );
}

enum OrderStatus {
  pending,
  confirmed,
  packing,
  handedToTaxi,
  delivered,
  cancelled;

  static OrderStatus parse(String? value) => switch (value) {
        'confirmed' => OrderStatus.confirmed,
        'packing' => OrderStatus.packing,
        'handed_to_taxi' => OrderStatus.handedToTaxi,
        'delivered' => OrderStatus.delivered,
        'cancelled' => OrderStatus.cancelled,
        _ => OrderStatus.pending,
      };
}

enum PaymentMethod {
  payme,
  click,
  uzum,
  cash;

  String get apiValue => switch (this) {
        PaymentMethod.payme => 'payme',
        PaymentMethod.click => 'click',
        PaymentMethod.uzum => 'uzum',
        PaymentMethod.cash => 'cash',
      };

  static PaymentMethod parse(String? value) => switch (value) {
        'payme' => PaymentMethod.payme,
        'click' => PaymentMethod.click,
        'uzum' => PaymentMethod.uzum,
        _ => PaymentMethod.cash,
      };
}

class OrderItem {
  final String dishId;
  final String name;
  final int price;
  final int quantity;

  const OrderItem({
    required this.dishId,
    required this.name,
    required this.price,
    required this.quantity,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    // `dish` ba'zi endpoint'larda string (id), ba'zilarida obyekt
    // ({_id, slug, image}) bo'lib keladi — ikkalasi ham qo'llanadi.
    final dish = json['dish'];
    return OrderItem(
      dishId: dish is Map<String, dynamic>
          ? (dish['_id'] ?? '') as String
          : (dish ?? '') as String,
      name: (json['name'] ?? '') as String,
      price: ((json['price'] ?? 0) as num).toInt(),
      quantity: ((json['quantity'] ?? 1) as num).toInt(),
    );
  }
}

class StatusEvent {
  final String status;
  final DateTime? timestamp;
  final String? note;

  const StatusEvent({required this.status, this.timestamp, this.note});

  factory StatusEvent.fromJson(Map<String, dynamic> json) => StatusEvent(
        status: (json['status'] ?? '') as String,
        timestamp: DateTime.tryParse((json['timestamp'] ?? '') as String),
        note: json['note'] as String?,
      );
}

class Order {
  final String id;
  final String orderNumber;
  final List<OrderItem> items;
  final int subtotal;
  final int deliveryFee;
  final int discount;
  final int total;
  final String? promoCode;
  final String deliveryType;
  final String? addressLabel;
  final String? addressLine;
  final PaymentMethod paymentMethod;
  final String paymentStatus;
  final OrderStatus status;
  final String? notes;
  final List<StatusEvent> statusHistory;
  final DateTime? createdAt;
  final String? userName;
  final String? userPhone;

  const Order({
    required this.id,
    required this.orderNumber,
    required this.items,
    required this.subtotal,
    required this.deliveryFee,
    required this.discount,
    required this.total,
    this.promoCode,
    this.deliveryType = 'delivery',
    this.addressLabel,
    this.addressLine,
    this.paymentMethod = PaymentMethod.cash,
    this.paymentStatus = 'pending',
    this.status = OrderStatus.pending,
    this.notes,
    this.statusHistory = const [],
    this.createdAt,
    this.userName,
    this.userPhone,
  });

  bool get isDelivery => deliveryType == 'delivery';
  bool get canCancel =>
      status == OrderStatus.pending || status == OrderStatus.confirmed;

  factory Order.fromJson(Map<String, dynamic> json) {
    final addr = json['address'] as Map<String, dynamic>?;
    final user = json['user'];
    final userMap = user is Map<String, dynamic> ? user : null;
    return Order(
      id: (json['_id'] ?? '') as String,
      orderNumber: (json['orderNumber'] ?? '') as String,
      items: ((json['items'] ?? []) as List)
          .map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      subtotal: ((json['subtotal'] ?? 0) as num).toInt(),
      deliveryFee: ((json['deliveryFee'] ?? 0) as num).toInt(),
      discount: ((json['discount'] ?? 0) as num).toInt(),
      total: ((json['total'] ?? 0) as num).toInt(),
      promoCode: json['promoCode'] as String?,
      deliveryType: (json['deliveryType'] ?? 'delivery') as String,
      addressLabel: addr?['label'] as String?,
      addressLine: addr?['address'] as String?,
      paymentMethod: PaymentMethod.parse(json['paymentMethod'] as String?),
      paymentStatus: (json['paymentStatus'] ?? 'pending') as String,
      status: OrderStatus.parse(json['status'] as String?),
      notes: json['notes'] as String?,
      statusHistory: ((json['statusHistory'] ?? []) as List)
          .map((e) => StatusEvent.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdAt: DateTime.tryParse((json['createdAt'] ?? '') as String),
      userName: userMap?['name'] as String?,
      userPhone: userMap?['phone'] as String?,
    );
  }
}

class AppNotification {
  final String id;
  final String type;
  final String title;
  final String message;
  final bool isRead;
  final DateTime? createdAt;

  const AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    this.isRead = false,
    this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) => AppNotification(
        id: (json['_id'] ?? '') as String,
        type: (json['type'] ?? 'system') as String,
        title: (json['title'] ?? '') as String,
        message: (json['message'] ?? '') as String,
        isRead: (json['isRead'] ?? false) as bool,
        createdAt: DateTime.tryParse((json['createdAt'] ?? '') as String),
      );
}

/// Paginated API javobi.
class Paged<T> {
  final List<T> items;
  final int page;
  final int totalPages;

  const Paged({required this.items, required this.page, required this.totalPages});

  bool get hasMore => page < totalPages;
}
