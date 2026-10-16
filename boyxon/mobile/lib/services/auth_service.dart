import 'package:flutter/foundation.dart';

import '../core/api_client.dart';
import '../models/models.dart';

/// Sessiya holati: login/register/logout + bootstrap (app qayta ochilganda
/// refresh cookie orqali sessiyani tiklash).
class AuthService extends ChangeNotifier {
  final _api = ApiClient.instance;

  User? _user;
  bool _initialized = false;

  User? get user => _user;
  bool get initialized => _initialized;
  bool get isLoggedIn => _user != null;

  /// App ishga tushganda — refresh cookie bilan sessiyani tiklashga urinish.
  Future<void> bootstrap() async {
    _api.onTokenRefreshed = (token, userJson) {
      if (userJson != null) {
        _user = User.fromJson(userJson);
        notifyListeners();
      }
    };
    _api.onSessionExpired = () {
      if (_user != null) {
        _user = null;
        notifyListeners();
      }
    };

    try {
      final res = await _api.dio.post('/auth/refresh');
      final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      _api.accessToken = data['accessToken'] as String;
      _user = User.fromJson(data['user'] as Map<String, dynamic>);
    } catch (_) {
      _user = null;
    }
    _initialized = true;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final res = await _api.dio.post(
      '/auth/login',
      data: {'email': email.trim(), 'password': password},
    );
    _applyAuth(res.data as Map<String, dynamic>);
  }

  /// Ro'yxatdan o'tish.
  /// `true` — darhol kirdi; `false` — email tasdiqlash talab qilinadi (token yo'q).
  Future<bool> register({
    required String name,
    required String email,
    String? phone,
    required String password,
  }) async {
    final res = await _api.dio.post('/auth/register', data: {
      'name': name.trim(),
      'email': email.trim(),
      if (phone != null && phone.trim().isNotEmpty) 'phone': phone.trim(),
      'password': password,
    });
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    final token = data['accessToken'] as String?;
    if (token == null) return false;
    _api.accessToken = token;
    _user = User.fromJson(data['user'] as Map<String, dynamic>);
    notifyListeners();
    return true;
  }

  void _applyAuth(Map<String, dynamic> body) {
    final data = body['data'] as Map<String, dynamic>;
    _api.accessToken = data['accessToken'] as String;
    _user = User.fromJson(data['user'] as Map<String, dynamic>);
    notifyListeners();
  }

  Future<void> logout() async {
    try {
      await _api.dio.post('/auth/logout');
    } catch (_) {/* server ko'tarmasa ham chiqishni yakunlaymiz */}
    await _api.clearCookies();
    _user = null;
    notifyListeners();
  }

  /// Barcha qurilmalardan chiqish.
  Future<void> logoutAll() async {
    try {
      await _api.dio.post('/auth/logout-all');
    } catch (_) {/* ignore */}
    await _api.clearCookies();
    _user = null;
    notifyListeners();
  }

  Future<void> forgotPassword(String email) async {
    await _api.dio.post('/auth/forgot-password', data: {'email': email.trim()});
  }

  Future<void> changePassword(String oldPassword, String newPassword) async {
    final res = await _api.dio.patch(
      '/auth/change-password',
      data: {'oldPassword': oldPassword, 'newPassword': newPassword},
    );
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    _api.accessToken = data['accessToken'] as String;
  }

  Future<void> resendVerification() async {
    final email = _user?.email;
    if (email == null) return;
    await _api.dio.post('/auth/resend-verification', data: {'email': email});
  }

  /// Profil/manzillar yangilangach userni almashtirish.
  void setUser(User user) {
    _user = user;
    notifyListeners();
  }

  /// Eng so'nggi userni serverdan olish (masalan, email tasdiqlangandan keyin).
  Future<void> reloadMe() async {
    try {
      final res = await _api.dio.get('/auth/me');
      final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      _user = User.fromJson(data);
      notifyListeners();
    } catch (_) {/* ignore */}
  }
}
