import 'package:flutter/foundation.dart';

import '../api/api_client.dart';
import '../../data/models/user.dart';
import '../../data/services/auth_service.dart';

enum SessionStatus { unknown, guest, authed }

/// Sessiya holati: ilova ochilganda cookie orqali tiklanadi (sayt kabi),
/// kirish/chiqish shu yerda boshqariladi.
class SessionController extends ChangeNotifier {
  SessionStatus status = SessionStatus.unknown;
  User? user;

  bool get isAuthed => status == SessionStatus.authed;
  bool get isAdmin => user?.isAdmin ?? false;

  /// Ilova ishga tushganda: refresh cookie → yangi access token → user.
  Future<void> bootstrap() async {
    final refreshed = await ApiClient.I.tryRefreshSession();
    if (refreshed) {
      try {
        final u = await AuthService.I.me();
        if (u.email.isEmpty) {
          // Buzuq/bo'sh javob — sessiyani saqlab qolmaymiz.
          status = SessionStatus.guest;
        } else {
          user = u;
          status = SessionStatus.authed;
        }
      } catch (_) {
        status = SessionStatus.guest;
      }
    } else {
      status = SessionStatus.guest;
    }
    notifyListeners();
  }

  Future<User> login({required String email, required String password}) async {
    final u = await AuthService.I.login(email: email, password: password);
    user = u;
    status = SessionStatus.authed;
    notifyListeners();
    return u;
  }

  /// Ro'yxatdan o'tish. Email tasdiqlash talab qilinsa — status guest bo'lib qoladi.
  Future<RegisterOutcome> register({
    required String name,
    required String email,
    String? phone,
    required String password,
  }) async {
    final outcome = await AuthService.I.register(
      name: name,
      email: email,
      phone: phone,
      password: password,
    );
    if (!outcome.verificationRequired && outcome.user != null) {
      user = outcome.user;
      status = SessionStatus.authed;
    }
    notifyListeners();
    return outcome;
  }

  Future<void> logout() async {
    try {
      await AuthService.I.logout();
    } catch (_) {
      // Serverga yetib bormasa ham mahalliy sessiya tozalanadi.
    }
    user = null;
    status = SessionStatus.guest;
    notifyListeners();
  }

  /// Profil yangilangandan keyin qayta yuklash.
  ///
  /// Muhim: bo'sh javob kelsa mavjud userni O'CHIRMAYMIZ — aks holda
  /// "avtorizatsiya bor, lekin user yo'q" holati paydo bo'ladi.
  Future<void> refreshUser() async {
    if (status != SessionStatus.authed) return;
    try {
      final u = await AuthService.I.me();
      if (u.email.isEmpty) return;
      user = u;
      notifyListeners();
    } catch (_) {}
  }

  void setUser(User u) {
    user = u;
    notifyListeners();
  }
}
