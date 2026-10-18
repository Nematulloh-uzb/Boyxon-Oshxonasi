import 'parse.dart';

/// Buyurtma qatori (Order.items[]).
class OrderItem {
  const OrderItem({
    required this.dishId,
    required this.name,
    this.nameRu,
    this.nameEn,
    required this.price,
    required this.quantity,
    this.customizations,
  });

  final String dishId;
  final String name;
  final String? nameRu;
  final String? nameEn;
  final int price;
  final int quantity;
  final String? customizations;

  int get lineTotal => price * quantity;

  String nameFor(String locale) {
    if (locale == 'en' && nameEn != null && nameEn!.isNotEmpty) return nameEn!;
    if (locale == 'ru' && nameRu != null && nameRu!.isNotEmpty) return nameRu!;
    return name;
  }

  factory OrderItem.fromJson(Map<String, dynamic> j) {
    final dish = j['dish'];
    final dishMap = asMap(dish);
    return OrderItem(
      dishId: dishMap.isNotEmpty ? asStr(dishMap['_id']) ?? '' : asStr(dish) ?? '',
      name: asStr(j['name']) ?? '',
      nameRu: asStr(j['nameRu']),
      nameEn: asStr(j['nameEn']),
      price: asInt(j['price']),
      quantity: asInt(j['quantity'], 1),
      customizations: asStr(j['customizations']),
    );
  }
}

/// Status tarixidagi yozuv (Order.statusHistory[]).
class OrderStatusEvent {
  const OrderStatusEvent({required this.status, this.timestamp, this.note});

  final String status;
  final DateTime? timestamp;
  final String? note;

  factory OrderStatusEvent.fromJson(Map<String, dynamic> j) => OrderStatusEvent(
        status: asStr(j['status']) ?? '',
        timestamp: asDate(j['timestamp'] ?? j['createdAt']),
        note: asStr(j['note']),
      );
}

/// Buyurtma (GET /api/orders/:id, GET /api/users/me/orders).
class Order {
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
    this.addressText,
    this.paymentMethod = 'cash',
    this.paymentStatus = 'pending',
    this.status = 'pending',
    this.statusHistory = const [],
    this.createdAt,
    this.estimatedDeliveryAt,
    this.deliveredAt,
    this.courierName,
    this.courierPhone,
    this.userName,
    this.userPhone,
    this.taxiDriver,
    this.taxiCar,
    this.cancelReason,
    this.notes,
  });

  final String id;
  final String orderNumber;
  final List<OrderItem> items;
  final int subtotal;
  final int deliveryFee;
  final int discount;
  final int total;
  final String? promoCode;

  /// 'delivery' | 'pickup'
  final String deliveryType;
  final String? addressLabel;
  final String? addressText;

  /// 'payme' | 'click' | 'uzum' | 'cash'
  final String paymentMethod;

  /// 'pending' | 'paid' | 'failed' | 'refunded'
  final String paymentStatus;

  /// pending | confirmed | packing | handed_to_taxi | delivered | cancelled
  final String status;
  final List<OrderStatusEvent> statusHistory;
  final DateTime? createdAt;
  final DateTime? estimatedDeliveryAt;
  final DateTime? deliveredAt;
  final String? courierName;
  final String? courierPhone;

  /// Admin ro'yxatida `user` populate qilinadi (ism + telefon).
  final String? userName;
  final String? userPhone;
  final String? taxiDriver;
  final String? taxiCar;
  final String? cancelReason;
  final String? notes;

  bool get isPickup => deliveryType == 'pickup';
  bool get isActive => status != 'delivered' && status != 'cancelled';
  bool get isDelivered => status == 'delivered';
  bool get isCancelled => status == 'cancelled';

  /// Tarjima kaliti: 'status.pending' → "Kutilmoqda".
  String get statusKey => 'status.$status';

  /// Berilgan statusga yetib kelganmi (timeline uchun).
  bool reached(String s) {
    const flow = ['pending', 'confirmed', 'packing', 'handed_to_taxi', 'delivered'];
    final i = flow.indexOf(s);
    final j = flow.indexOf(status);
    if (status == 'cancelled') return false;
    return i >= 0 && j >= 0 && j >= i;
  }

  factory Order.fromJson(Map<String, dynamic> j) {
    final addr = asMap(j['address']);
    final courier = asMap(j['courier']);
    final user = asMap(j['user']);
    final taxi = asMap(j['taxi']);
    return Order(
      id: asStr(j['_id'] ?? j['id']) ?? '',
      orderNumber: asStr(j['orderNumber']) ?? '',
      items: asMapList(j['items']).map(OrderItem.fromJson).toList(),
      subtotal: asInt(j['subtotal']),
      deliveryFee: asInt(j['deliveryFee']),
      discount: asInt(j['discount']),
      total: asInt(j['total']),
      promoCode: asStr(j['promoCode']),
      deliveryType: asStr(j['deliveryType']) ?? 'delivery',
      addressLabel: asStr(addr['label']),
      addressText: asStr(addr['address']),
      paymentMethod: asStr(j['paymentMethod']) ?? 'cash',
      paymentStatus: asStr(j['paymentStatus']) ?? 'pending',
      status: asStr(j['status']) ?? 'pending',
      statusHistory: asMapList(j['statusHistory']).map(OrderStatusEvent.fromJson).toList(),
      createdAt: asDate(j['createdAt']),
      estimatedDeliveryAt: asDate(j['estimatedDeliveryAt']),
      deliveredAt: asDate(j['deliveredAt']),
      courierName: asStr(courier['name']),
      courierPhone: asStr(courier['phone']),
      userName: asStr(user['name']),
      userPhone: asStr(user['phone']),
      taxiDriver: asStr(taxi['driver'] ?? taxi['driverName']),
      taxiCar: asStr(taxi['carNumber'] ?? taxi['car']),
      cancelReason: asStr(j['cancelReason']),
      notes: asStr(j['notes']),
    );
  }
}
