import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/constants.dart';
import '../models/models.dart';

class CartLine {
  final Dish dish;
  int quantity;

  CartLine(this.dish, this.quantity);

  int get total => dish.price * quantity;
}

/// Savat — serverga bog'lanmagan (web'dagi cart store kabi lokal),
/// shared_preferences'da saqlanadi.
class CartService extends ChangeNotifier {
  static const _prefsKey = 'boyxon_cart_v1';

  final Map<String, CartLine> _lines = {};

  List<CartLine> get lines => _lines.values.toList();
  bool get isEmpty => _lines.isEmpty;
  int get itemCount => _lines.values.fold(0, (sum, l) => sum + l.quantity);
  int get subtotal => _lines.values.fold(0, (sum, l) => sum + l.total);
  int get delivery =>
      (isEmpty || subtotal >= freeDeliveryFrom) ? 0 : deliveryFee;
  int get toFree => (freeDeliveryFrom - subtotal).clamp(0, freeDeliveryFrom);

  int total({int discount = 0}) {
    final value = subtotal + delivery - discount;
    return value < 0 ? 0 : value;
  }

  int quantityOf(String dishId) => _lines[dishId]?.quantity ?? 0;

  void add(Dish dish, {int qty = 1}) {
    final line = _lines[dish.id];
    if (line == null) {
      _lines[dish.id] = CartLine(dish, qty);
    } else {
      line.quantity += qty;
    }
    _save();
    notifyListeners();
  }

  void setQuantity(String dishId, int qty) {
    if (qty <= 0) {
      _lines.remove(dishId);
    } else if (_lines[dishId] != null) {
      _lines[dishId]!.quantity = qty;
    }
    _save();
    notifyListeners();
  }

  void remove(String dishId) {
    _lines.remove(dishId);
    _save();
    notifyListeners();
  }

  void clear() {
    _lines.clear();
    _save();
    notifyListeners();
  }

  /// Saqlangan savatni yuklash (app ishga tushganda).
  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_prefsKey);
    if (raw == null || raw.isEmpty) return;
    try {
      final list = jsonDecode(raw) as List;
      _lines.clear();
      for (final item in list) {
        final m = item as Map<String, dynamic>;
        final dish = Dish(
          id: m['id'] as String,
          name: m['name'] as String,
          nameRu: m['nameRu'] as String?,
          nameEn: m['nameEn'] as String?,
          slug: m['slug'] as String,
          price: (m['price'] as num).toInt(),
          image: m['image'] as String?,
        );
        _lines[dish.id] = CartLine(dish, (m['quantity'] as num).toInt());
      }
      notifyListeners();
    } catch (_) {
      // Buzilgan saqlangan ma'lumot — tozalab tashlaymiz.
      _lines.clear();
      await prefs.remove(_prefsKey);
    }
  }

  Future<void> _save() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = _lines.values
          .map((l) => {...l.dish.toCartJson(), 'quantity': l.quantity})
          .toList();
      await prefs.setString(_prefsKey, jsonEncode(list));
    } catch (_) {/* saqlash muvaffaqiyatsiz — muhim emas */}
  }
}
