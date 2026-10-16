import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:path_provider/path_provider.dart';

import '../l10n/app_localizations.dart';
import 'env.dart';

/// Bitta global Dio klient:
/// - Authorization header (access token xotirada);
/// - PersistCookieJar — refresh token (httpOnly cookie) diskda saqlanadi;
/// - 401 bo'lsa bitta marta avtomatik refresh + so'rovni qayta yuborish
///   (web'dagi axios.ts bilan bir xil mantiq, single-flight).
class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  late final Dio dio;
  late final PersistCookieJar cookieJar;
  String? accessToken;

  /// Refresh muvaffaqiyatli bo'lganda chaqiriladi (AuthService userni yangilaydi).
  void Function(String token, Map<String, dynamic>? user)? onTokenRefreshed;

  /// Refresh ham ishlamasa — sessiya tugagan.
  void Function()? onSessionExpired;

  Future<bool>? _refreshing;

  static const _authPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/logout',
    '/auth/logout-all',
    '/auth/google',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/change-password',
    '/auth/resend-verification',
    '/auth/verify-email',
  ];

  Future<void> init() async {
    final dir = await getApplicationSupportDirectory();
    cookieJar = PersistCookieJar(
      storage: FileStorage('${dir.path}/boyxon_cookies'),
    );

    dio = Dio(
      BaseOptions(
        baseUrl: Env.apiBase,
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 30),
        headers: {'Accept': 'application/json'},
      ),
    );

    dio.interceptors.add(CookieManager(cookieJar));
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          final token = accessToken;
          if (token != null) options.headers['Authorization'] = 'Bearer $token';
          handler.next(options);
        },
        onError: (e, handler) async {
          final opts = e.requestOptions;
          final isAuthEndpoint = _authPaths.any((p) => opts.path.startsWith(p));
          final retried = opts.extra['_retried'] == true;

          if (e.response?.statusCode == 401 && !isAuthEndpoint && !retried) {
            final ok = await tryRefresh();
            if (ok) {
              opts.extra['_retried'] = true;
              opts.headers['Authorization'] = 'Bearer $accessToken';
              try {
                final res = await dio.fetch(opts);
                return handler.resolve(res);
              } on DioException catch (e2) {
                return handler.next(e2);
              }
            }
            onSessionExpired?.call();
          }
          handler.next(e);
        },
      ),
    );
  }

  /// Refresh cookie orqali yangi access token (bir vaqtda faqat bitta so'rov).
  Future<bool> tryRefresh() {
    _refreshing ??= _doRefresh().whenComplete(() => _refreshing = null);
    return _refreshing!;
  }

  Future<bool> _doRefresh() async {
    try {
      final res = await dio.post('/auth/refresh');
      final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      accessToken = data['accessToken'] as String;
      onTokenRefreshed?.call(
        accessToken!,
        data['user'] as Map<String, dynamic>?,
      );
      return true;
    } catch (_) {
      accessToken = null;
      return false;
    }
  }

  /// Chiqishda cookie'larni ham tozalash.
  Future<void> clearCookies() async {
    accessToken = null;
    await cookieJar.deleteAll();
  }
}

/// DioException'dan foydalanuvchiga ko'rsatiladigan xabar.
/// Server xabari bo'lsa o'sha (o'zbekcha), aks holda tarmoq/umumiy xabar.
String errorText(Object error, AppLocalizations l10n) {
  if (error is DioException) {
    final data = error.response?.data;
    if (data is Map && data['message'] is String && (data['message'] as String).isNotEmpty) {
      return data['message'] as String;
    }
    final t = error.type;
    if (t == DioExceptionType.connectionError ||
        t == DioExceptionType.connectionTimeout ||
        t == DioExceptionType.receiveTimeout ||
        t == DioExceptionType.sendTimeout) {
      return l10n.common_network;
    }
  }
  return l10n.common_error;
}
