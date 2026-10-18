import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:path_provider/path_provider.dart';

import '../config/app_config.dart';

/// Serverdan kelgan xato: foydalanuvchiga ko'rsatish uchun tayyor `message` bilan.
class ApiException implements Exception {
  ApiException(this.message, {this.statusCode, this.code, this.data});

  final String message;
  final int? statusCode;

  /// Serverdagi maxsus kod (masalan, 'EMAIL_NOT_VERIFIED').
  final String? code;

  /// Xato bilan birga kelgan qo'shimcha ma'lumot (masalan, {email}).
  final dynamic data;

  bool get isUnauthorized => statusCode == 401;

  @override
  String toString() => message;
}

/// Sahifalash ma'lumoti: { page, limit, total, pages }.
class PaginationInfo {
  const PaginationInfo({
    required this.page,
    required this.limit,
    required this.total,
    required this.pages,
  });

  final int page;
  final int limit;
  final int total;
  final int pages;

  factory PaginationInfo.fromJson(Map<String, dynamic> json) => PaginationInfo(
        page: (json['page'] as num?)?.toInt() ?? 1,
        limit: (json['limit'] as num?)?.toInt() ?? 20,
        total: (json['total'] as num?)?.toInt() ?? 0,
        pages: (json['pages'] as num?)?.toInt() ?? 1,
      );
}

/// Server konverti: { success, message, data, pagination? }.
class ApiResponse {
  const ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.pagination,
  });

  final bool success;
  final String message;
  final dynamic data;
  final PaginationInfo? pagination;

  Map<String, dynamic> get dataMap =>
      data is Map<String, dynamic> ? data as Map<String, dynamic> : const {};

  List<dynamic> get dataList => data is List<dynamic> ? data as List<dynamic> : const [];
}

/// Singleton API klient — saytdagi bilan bir xil sessiya oqimi.
///
/// - Refresh token cookie'da: `PersistCookieJar` orqali diskda saqlanadi.
/// - Access token xotirada: har so'rovga `Authorization: Bearer` qo'shiladi.
/// - 401 javobda avtomatik BIR MARTA `POST /api/auth/refresh` urinib ko'riladi.
class ApiClient {
  ApiClient._internal();
  static final ApiClient I = ApiClient._internal();

  late final Dio _dio;
  bool _ready = false;

  String? _accessToken;
  Future<bool>? _refreshFuture;

  /// Ilova ishga tushganda bir marta chaqiriladi.
  Future<void> init() async {
    if (_ready) return;
    final dir = await getApplicationDocumentsDirectory();
    final jar = PersistCookieJar(storage: FileStorage('${dir.path}/.cookies'));

    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBase,
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 20),
        headers: const {'Accept': 'application/json'},
        // 4xx javoblarni o'zimiz ko'rib chiqamiz (DioException o'rniga ApiException).
        validateStatus: (s) => s != null && s < 500,
      ),
    );
    _dio.interceptors.add(CookieManager(jar));
    _ready = true;
  }

  bool get isReady => _ready;

  String? get accessToken => _accessToken;

  void setAccessToken(String? token) => _accessToken = token;

  void clearSession() => _accessToken = null;

  // ---- So'rovlar ----

  Future<ApiResponse> get(String path, {Map<String, dynamic>? query}) =>
      _send('GET', path, query: query);

  Future<ApiResponse> post(String path, {Object? body, Map<String, dynamic>? query}) =>
      _send('POST', path, body: body, query: query);

  Future<ApiResponse> patch(String path, {Object? body}) => _send('PATCH', path, body: body);

  Future<ApiResponse> put(String path, {Object? body}) => _send('PUT', path, body: body);

  Future<ApiResponse> delete(String path, {Object? body}) => _send('DELETE', path, body: body);

  /// Ilova ochilganda sessiyani tiklash: refresh cookie bilan yangi access token.
  Future<bool> tryRefreshSession() => _refresh();

  // ---- Ichki qism ----

  Future<ApiResponse> _send(
    String method,
    String path, {
    Object? body,
    Map<String, dynamic>? query,
    bool allowRefreshRetry = true,
  }) async {
    if (!_ready) await init();
    try {
      final res = await _dio.request<dynamic>(
        path,
        data: body,
        queryParameters: query,
        options: Options(method: method, headers: _authHeader()),
      );
      final status = res.statusCode ?? 0;
      final json = res.data is Map<String, dynamic>
          ? res.data as Map<String, dynamic>
          : <String, dynamic>{};

      // 401 — access token eskirgan bo'lishi mumkin: bir marta refresh qilib qayta urinamiz.
      if (status == 401 && allowRefreshRetry && !_isAuthPath(path)) {
        if (await _refresh()) {
          return await _send(
            method,
            path,
            body: body,
            query: query,
            allowRefreshRetry: false,
          );
        }
      }

      if (status >= 400) {
        throw ApiException(
          (json['message'] as String?) ?? 'Xatolik yuz berdi',
          statusCode: status,
          code: json['code'] as String?,
          data: json['data'],
        );
      }

      return ApiResponse(
        success: json['success'] != false,
        message: (json['message'] as String?) ?? 'OK',
        data: json['data'],
        pagination: json['pagination'] is Map<String, dynamic>
            ? PaginationInfo.fromJson(json['pagination'] as Map<String, dynamic>)
            : null,
      );
    } on ApiException {
      rethrow;
    } on DioException catch (e) {
      final res = e.response;
      final body = res?.data;
      final serverMsg = body is Map && body['message'] is String ? body['message'] as String : null;
      throw ApiException(serverMsg ?? _networkMessage(e), statusCode: res?.statusCode);
    } catch (e) {
      throw ApiException('Kutilmagan xatolik: $e');
    }
  }

  Map<String, String>? _authHeader() {
    final t = _accessToken;
    if (t == null || t.isEmpty) return null;
    return {'Authorization': 'Bearer $t'};
  }

  bool _isAuthPath(String path) =>
      path.contains('/api/auth/refresh') ||
      path.contains('/api/auth/login') ||
      path.contains('/api/auth/register');

  Future<bool> _refresh() =>
      _refreshFuture ??= _doRefresh().whenComplete(() => _refreshFuture = null);

  Future<bool> _doRefresh() async {
    try {
      final res = await _dio.post<dynamic>('/api/auth/refresh');
      final status = res.statusCode ?? 0;
      final data = res.data is Map<String, dynamic>
          ? (res.data as Map<String, dynamic>)['data']
          : null;
      final token = data is Map<String, dynamic> ? data['accessToken'] as String? : null;
      if (status < 400 && token != null && token.isNotEmpty) {
        _accessToken = token;
        return true;
      }
      _accessToken = null;
      return false;
    } catch (_) {
      _accessToken = null;
      return false;
    }
  }

  String _networkMessage(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return "Server bilan aloqa sekin — qayta urinib ko'ring";
      case DioExceptionType.connectionError:
        return "Internet aloqasi yo'q — ulanishni tekshiring";
      default:
        return "Serverga ulanib bo'lmadi";
    }
  }
}
