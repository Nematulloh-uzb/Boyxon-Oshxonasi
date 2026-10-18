import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/api/api_client.dart';
import '../../core/config/app_config.dart';
import '../../data/models/dish.dart';
import '../../data/models/parse.dart';
import '../../data/models/user.dart';
import '../../data/services/promo_service.dart';

/// Savat qatori.
class CartLine {
  CartLine({required this.dish, this.quantity = 1});

  final Dish dish;
  int quantity;

  int get total => dish.price * quantity;
}

/// Savat holati — saytdagi bilan bir xil qoidalar:
/// - yetkazish 12 000 so'm, 150 000 so'mdan bepul (yoki "Olib ketish"da 0);
/// - promo kod serverda tekshiriladi (`/api/promos/validate`);
/// - yakuniy narx har doim SERVERDA qayta hisoblanadi.
class CartController extends ChangeNotifier {
  static const _prefsKey = 'boyxon-cart';

  final List<CartLine> lines = [];
  String deliveryType = 'delivery'; // delivery | pickup
  Address? address;
  String? promoCode;
  int promoDiscount = 0;
  String? promoMessage; // xato bo'lsa server xabari
  bool promoLoading = false;
  String notes = '';
  bool ready = false;

  int get itemCount => lines.fold(0, (s, l) => s + l.quantity);
  bool get isEmpty => lines.isEmpty;

  int get subtotal => lines.fold(0, (s, l) => s + l.total);

  int get deliveryFee {
    if (deliveryType == 'pickup') return 0;
    if (subtotal >= AppConfig.freeDeliveryFrom) return 0;
    return AppConfig.deliveryFee;
  }

  int get discount => promoCode != null ? promoDiscount : 0;

  int get total {
    final t = subtotal + deliveryFee - discount;
    return t < 0 ? 0 : t;
  }

  int get freeDeliveryRemaining {
    final r = AppConfig.freeDeliveryFrom - subtotal;
    return r < 0 ? 0 : r;
  }

  bool hasDish(String dishId) => lines.any((l) => l.dish.id == dishId);

  int quantityOf(String dishId) {
    final i = lines.indexWhere((l) => l.dish.id == dishId);
    return i < 0 ? 0 : lines[i].quantity;
  }

  // ---- Amallar ----

  void add(Dish dish, {int quantity = 1}) {
    final i = lines.indexWhere((l) => l.dish.id == dish.id);
    if (i >= 0) {
      lines[i].quantity += quantity;
    } else {
      lines.add(CartLine(dish: dish, quantity: quantity));
    }
    _afterChange();
  }

  void increase(String dishId) {
    final i = lines.indexWhere((l) => l.dish.id == dishId);
    if (i >= 0) {
      lines[i].quantity++;
      _afterChange();
    }
  }

  void decrease(String dishId) {
    final i = lines.indexWhere((l) => l.dish.id == dishId);
    if (i < 0) return;
    if (lines[i].quantity <= 1) {
      lines.removeAt(i);
    } else {
      lines[i].quantity--;
    }
    _afterChange();
  }

  void remove(String dishId) {
    lines.removeWhere((l) => l.dish.id == dishId);
    _afterChange();
  }

  void setDeliveryType(String type) {
    if (type == deliveryType) return;
    deliveryType = type;
    _afterChange();
  }

  void setAddress(Address? a) {
    address = a;
    _afterChange();
  }

  void setNotes(String v) {
    notes = v;
    _persist();
  }

  Future<bool> applyPromo(String code) async {
    if (code.trim().isEmpty) return false;
    promoLoading = true;
    promoMessage = null;
    notifyListeners();
    try {
      final r = await PromoService.I.validate(code, subtotal);
      promoCode = r.code;
      promoDiscount = r.discount;
      promoMessage = null;
      _persist();
      return true;
    } on ApiException catch (e) {
      promoCode = null;
      promoDiscount = 0;
      promoMessage = e.message;
      return false;
    } finally {
      promoLoading = false;
      notifyListeners();
    }
  }

  void clearPromo() {
    promoCode = null;
    promoDiscount = 0;
    promoMessage = null;
    _persist();
    notifyListeners();
  }

  /// Buyurtma muvaffaqiyatli yaratilgach savat tozalanadi.
  void clear() {
    lines.clear();
    promoCode = null;
    promoDiscount = 0;
    promoMessage = null;
    notes = '';
    _persist();
    notifyListeners();
  }

  /// POST /api/orders uchun qatorlar.
  List<Map<String, dynamic>> orderItems() =>
      lines.map((l) => {'dish': l.dish.id, 'quantity': l.quantity}).toList();

  // ---- Saqlash / yuklash ----

  Future<void> load() async {
    final sp = await SharedPreferences.getInstance();
    final raw = sp.getString(_prefsKey);
    if (raw != null) {
      try {
        final j = jsonDecode(raw) as Map<String, dynamic>;
        lines.clear();
        for (final e in asMapList(j['lines'])) {
          final dish = Dish.fromJson(asMap(e['dish']));
          if (dish.id.isNotEmpty) {
            lines.add(CartLine(dish: dish, quantity: asInt(e['quantity'], 1)));
          }
        }
        deliveryType = asStr(j['deliveryType']) ?? 'delivery';
        final a = j['address'];
        if (a is Map<String, dynamic>) address = Address.fromJson(a);
        promoCode = asStr(j['promoCode']);
        promoDiscount = asInt(j['promoDiscount']);
        notes = asStr(j['notes']) ?? '';
      } catch (_) {
        lines.clear();
      }
    }
    ready = true;
    notifyListeners();
  }

  void _persist() {
    SharedPreferences.getInstance().then((sp) {
      sp.setString(
        _prefsKey,
        jsonEncode({
          'lines': lines
              .map((l) => {'dish': l.dish.toJson(), 'quantity': l.quantity})
              .toList(),
          'deliveryType': deliveryType,
          'address': address?.toJson(),
          'promoCode': promoCode,
          'promoDiscount': promoDiscount,
          'notes': notes,
        }),
      );
    });
  }

  void _afterChange() {
    notifyListeners();
    _persist();
    _revalidatePromo();
  }

  /// Savat o'zgarganda promo chegirmani qayta hisoblash (server orqali).
  Future<void> _revalidatePromo() async {
    final code = promoCode;
    if (code == null) return;
    try {
      final r = await PromoService.I.validate(code, subtotal);
      promoDiscount = r.discount;
      notifyListeners();
      _persist();
    } on ApiException {
      promoCode = null;
      promoDiscount = 0;
      notifyListeners();
      _persist();
    }
  }
}
