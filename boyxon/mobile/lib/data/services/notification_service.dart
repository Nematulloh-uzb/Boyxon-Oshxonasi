import '../../core/api/api_client.dart';
import '../models/parse.dart';

/// Bildirishnoma (Notification.model.ts).
class AppNotification {
  AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    this.isRead = false,
    this.createdAt,
  });

  final String id;

  /// order | promo | system | new_dish | bonus
  final String type;
  final String title;
  final String message;
  bool isRead;
  final DateTime? createdAt;

  factory AppNotification.fromJson(Map<String, dynamic> j) => AppNotification(
        id: asStr(j['_id'] ?? j['id']) ?? '',
        type: asStr(j['type']) ?? 'system',
        title: asStr(j['title']) ?? '',
        message: asStr(j['message']) ?? '',
        isRead: asBool(j['isRead']),
        createdAt: asDate(j['createdAt']),
      );
}

/// Bildirishnomalar API (/api/notifications).
class NotificationService {
  NotificationService._internal();
  static final NotificationService I = NotificationService._internal();

  final ApiClient _api = ApiClient.I;

  /// GET /api/notifications/unread-count.
  Future<int> unreadCount() async {
    final res = await _api.get('/api/notifications/unread-count');
    final d = res.data;
    if (d is num) return d.toInt();
    if (d is Map) return asInt(d['count']);
    return 0;
  }

  /// GET /api/notifications — sahifalangan ro'yxat.
  Future<List<AppNotification>> list({int page = 1, int limit = 30}) async {
    final res = await _api.get('/api/notifications', query: {
      'page': page,
      'limit': limit,
    });
    return res.dataList
        .whereType<Map<String, dynamic>>()
        .map(AppNotification.fromJson)
        .toList();
  }

  /// PATCH /api/notifications/:id/read.
  Future<void> markRead(String id) async {
    await _api.patch('/api/notifications/$id/read');
  }

  /// PATCH /api/notifications/read-all.
  Future<void> markAllRead() async {
    await _api.patch('/api/notifications/read-all');
  }
}
