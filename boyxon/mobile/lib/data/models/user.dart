import 'parse.dart';

/// Foydalanuvchi manzili (User.addresses[]).
class Address {
  const Address({
    this.id,
    required this.label,
    required this.address,
    this.lat,
    this.lng,
    this.isDefault = false,
  });

  final String? id;
  final String label;
  final String address;

  /// Xaritadan tanlangan koordinatalar (eski manzillarda bo'lmasligi mumkin).
  final double? lat;
  final double? lng;

  final bool isDefault;

  factory Address.fromJson(Map<String, dynamic> j) => Address(
        id: asStr(j['_id'] ?? j['id']),
        label: asStr(j['label']) ?? '',
        address: asStr(j['address']) ?? '',
        lat: j['lat'] == null ? null : asDouble(j['lat']),
        lng: j['lng'] == null ? null : asDouble(j['lng']),
        isDefault: asBool(j['isDefault']),
      );

  Map<String, dynamic> toJson() => {
        'label': label,
        'address': address,
        if (lat != null) 'lat': lat,
        if (lng != null) 'lng': lng,
        'isDefault': isDefault,
      };
}

/// Foydalanuvchi (GET /api/auth/me — to'liq hujjat, parolsiz).
class User {
  const User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.avatar,
    this.role = 'user',
    this.addresses = const [],
    this.favorites = const [],
    this.bonusBalance = 0,
    this.pushEnabled = true,
    this.language = 'uz',
    this.theme = 'light',
    this.emailVerified = false,
  });

  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? avatar;
  final String role;
  final List<Address> addresses;
  final List<String> favorites;
  final int bonusBalance;

  /// notificationPrefs.pushEnabled
  final bool pushEnabled;

  /// preferences.language ('uz' | 'ru' | 'en')
  final String language;

  /// preferences.theme ('light' | 'dark')
  final String theme;
  final bool emailVerified;

  bool get isAdmin => role == 'admin';

  /// "AK" — avatar o'rnidagi bosh harflar.
  String get initials {
    final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
    return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
  }

  factory User.fromJson(Map<String, dynamic> j) {
    final prefs = asMap(j['preferences']);
    final notif = asMap(j['notificationPrefs']);
    return User(
      id: asStr(j['_id'] ?? j['id']) ?? '',
      name: asStr(j['name']) ?? '',
      email: asStr(j['email']) ?? '',
      phone: asStr(j['phone']),
      avatar: asStr(j['avatar']),
      role: asStr(j['role']) ?? 'user',
      addresses: asMapList(j['addresses']).map(Address.fromJson).toList(),
      favorites: asStrList(j['favorites']),
      bonusBalance: asInt(j['bonusBalance']),
      pushEnabled: notif['pushEnabled'] == null ? true : asBool(notif['pushEnabled'], true),
      language: asStr(prefs['language']) ?? 'uz',
      theme: asStr(prefs['theme']) ?? 'light',
      emailVerified: asBool(j['emailVerified']),
    );
  }
}
