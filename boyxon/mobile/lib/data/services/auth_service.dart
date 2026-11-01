import '../../core/api/api_client.dart';
import '../../core/config/app_config.dart';
import '../models/user.dart';
import 'package:google_sign_in/google_sign_in.dart';

/// Ro'yxatdan o'tish natijasi.
class RegisterOutcome {
  const RegisterOutcome({
    required this.verificationRequired,
    this.email,
    this.user,
  });

  final bool verificationRequired;
  final String? email;
  final User? user;
}

/// Google Sign-In natijasi.
class GoogleSignInResult {
  const GoogleSignInResult({
    required this.idToken,
    required this.email,
    this.displayName,
    this.photoUrl,
  });

  final String idToken;
  final String email;
  final String? displayName;
  final String? photoUrl;
}

/// Auth API — saytdagi bilan bir xil oqim (Bearer + refresh cookie).
class AuthService {
  AuthService._internal();
  static final AuthService I = AuthService._internal();

  final ApiClient _api = ApiClient.I;

  /// Google Sign-In instansi (web/mobile uchun).
  late final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
    serverClientId: AppConfig.googleClientId,
  );

  /// POST /api/auth/login → { accessToken, user }.
  ///
  /// Xato holatlari ApiException orqali: `code == 'EMAIL_NOT_VERIFIED'` bo'lsa,
  /// foydalanuvchi emailni tasdiqlashi kerak (data.email bilan).
  Future<User> login({required String email, required String password}) async {
    final res = await _api.post('/api/auth/login', body: {
      'email': email.trim().toLowerCase(),
      'password': password,
    });
    final data = res.dataMap;
    final token = data['accessToken'] as String?;
    if (token != null && token.isNotEmpty) _api.setAccessToken(token);
    return User.fromJson(_userMap(data));
  }

  /// Google bilan kirish (mobil uchun).
  /// Google ID tokenini oladi va serverga yuboradi.
  Future<User> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? account = await _googleSignIn.signIn();
      if (account == null) {
        throw Exception('Google sign-in bekor qilindi');
      }

      final GoogleSignInAuthentication auth = await account.authentication;
      final String? idToken = auth.idToken;
      if (idToken == null) {
        throw Exception('Google ID token olinmadi');
      }

      final res = await _api.post('/api/auth/google/mobile', body: {
        'idToken': idToken,
      });
      final data = res.dataMap;
      final token = data['accessToken'] as String?;
      if (token != null && token.isNotEmpty) _api.setAccessToken(token);
      return User.fromJson(_userMap(data));
    } catch (e) {
      await _googleSignIn.signOut();
      rethrow;
    }
  }

  /// POST /api/auth/register.
  Future<RegisterOutcome> register({
    required String name,
    required String email,
    String? phone,
    required String password,
  }) async {
    final body = <String, dynamic>{
      'name': name.trim(),
      'email': email.trim().toLowerCase(),
      'password': password,
    };
    if (phone != null && phone.trim().isNotEmpty) body['phone'] = phone.trim();

    final res = await _api.post('/api/auth/register', body: body);
    final data = res.dataMap;
    final token = data['accessToken'] as String?;
    if (token != null && token.isNotEmpty) _api.setAccessToken(token);

    final userMap = data['user'] is Map<String, dynamic>
        ? data['user'] as Map<String, dynamic>
        : null;
    return RegisterOutcome(
      verificationRequired: data['verificationRequired'] == true,
      email: userMap?['email'] as String? ?? email.trim().toLowerCase(),
      user: userMap == null ? null : User.fromJson(userMap),
    );
  }

  /// GET /api/auth/me.
  Future<User> me() async {
    final res = await _api.get('/api/auth/me');
    return User.fromJson(_userMap(res.dataMap));
  }

  /// POST /api/auth/logout — cookie'ni ham tozalaydi.
  Future<void> logout() async {
    try {
      await _api.post('/api/auth/logout');
    } finally {
      _api.clearSession();
      await _googleSignIn.signOut();
    }
  }

  /// POST /api/auth/resend-verification { email }.
  Future<String> resendVerification(String email) async {
    final res = await _api.post('/api/auth/resend-verification', body: {
      'email': email.trim().toLowerCase(),
    });
    return res.message;
  }

  /// POST /api/auth/forgot-password { email } — tiklash havolasi yuboriladi.
  Future<String> forgotPassword(String email) async {
    final res = await _api.post('/api/auth/forgot-password', body: {
      'email': email.trim().toLowerCase(),
    });
    return res.message;
  }

  /// Ba'zi endpointlar `{ user: {...} }` (login/register), ba'zilari esa
  /// to'g'ridan-to'g'ri userni (`GET /api/auth/me` → `data = user`) qaytaradi.
  Map<String, dynamic> _userMap(Map<String, dynamic> data) {
    final u = data['user'];
    return u is Map<String, dynamic> ? u : data;
  }
}
