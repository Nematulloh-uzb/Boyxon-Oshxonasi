/// API manzillari — build vaqtida `--dart-define` bilan o'zgartiriladi:
///
///   flutter build apk --release --dart-define=API_URL=https://api.domen.uz/api
///
/// Default: Android emulyatoridan lokal serverga ulanish (10.0.2.2 = host mashina).
class Env {
  static const String apiBase = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://10.0.2.2:5000/api',
  );

  /// Socket.IO manzili — API manzilidan host qismini oladi (`/api` siz).
  static String get socketBase {
    final uri = Uri.parse(apiBase);
    return '${uri.scheme}://${uri.host}${uri.port == 80 || uri.port == 443 ? '' : ':${uri.port}'}';
  }
}
