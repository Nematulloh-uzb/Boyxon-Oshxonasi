import '../../core/api/api_client.dart';
import '../models/user.dart';

/// Foydalanuvchi profili API'si (GET/PATCH /api/users/me ...).
class UserService {
  UserService._internal();
  static final UserService I = UserService._internal();

  final ApiClient _api = ApiClient.I;

  /// GET /api/users/me.
  Future<User> me() async {
    final res = await _api.get('/api/users/me');
    final d = res.dataMap;
    final u = d['user'];
    return User.fromJson(u is Map<String, dynamic> ? u : d);
  }

  /// PATCH /api/users/me { name?, phone? }.
  Future<void> updateMe({String? name, String? phone}) async {
    final body = <String, dynamic>{};
    if (name != null) body['name'] = name.trim();
    if (phone != null) body['phone'] = phone.trim();
    if (body.isEmpty) return;
    await _api.patch('/api/users/me', body: body);
  }

  /// PATCH /api/users/me/preferences { language?, theme?, fontSize? }.
  Future<void> updatePreferences({String? language, String? theme, String? fontSize}) async {
    final body = <String, dynamic>{};
    if (language != null) body['language'] = language;
    if (theme != null) body['theme'] = theme;
    if (fontSize != null) body['fontSize'] = fontSize;
    if (body.isEmpty) return;
    await _api.patch('/api/users/me/preferences', body: body);
  }

  /// PATCH /api/users/me/notification-prefs { pushEnabled }.
  Future<void> updatePushEnabled(bool enabled) async {
    await _api.patch('/api/users/me/notification-prefs', body: {
      'pushEnabled': enabled,
    });
  }

  /// POST /api/users/me/addresses { label, address, isDefault? }.
  Future<void> addAddress(Address a) async {
    await _api.post('/api/users/me/addresses', body: a.toJson());
  }

  /// PATCH /api/users/me/addresses/:id.
  Future<void> updateAddress(
    String id, {
    String? label,
    String? address,
    double? lat,
    double? lng,
    bool? isDefault,
  }) async {
    final body = <String, dynamic>{};
    if (label != null) body['label'] = label;
    if (address != null) body['address'] = address;
    if (lat != null) body['lat'] = lat;
    if (lng != null) body['lng'] = lng;
    if (isDefault != null) body['isDefault'] = isDefault;
    await _api.patch('/api/users/me/addresses/$id', body: body);
  }

  /// DELETE /api/users/me/addresses/:id.
  Future<void> deleteAddress(String id) async {
    await _api.delete('/api/users/me/addresses/$id');
  }

  /// POST /api/users/me/favorites/:dishId — qo'shadi/o'chiradi (toggle).
  Future<bool> toggleFavorite(String dishId) async {
    final res = await _api.post('/api/users/me/favorites/$dishId');
    final d = res.dataMap;
    if (d['favored'] is bool) return d['favored'] as bool;
    if (d['favorited'] is bool) return d['favorited'] as bool;
    if (d['added'] is bool) return d['added'] as bool;
    return true;
  }
}
