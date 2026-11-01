/// Ilova konfiguratsiyasi: API manzili va biznes konstantalar.
///
/// API bazasini `--dart-define` orqali almashtirish mumkin:
///   flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000
/// Standart holatda production server (sayt bilan bir xil backend) ishlatiladi.
class AppConfig {
  AppConfig._();

  static const String apiBase = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://boyxon-server.nmatullohmansurov.workers.dev',
  );

  /// Sayt manzili — tashqi havolalar uchun (masalan, Google bilan kirish oqimi).
  static const String siteUrl = String.fromEnvironment(
    'SITE_URL',
    defaultValue: 'https://boyxon-server.nmatullohmansurov.workers.dev',
  );

  /// Google OAuth Client ID — serverda `GOOGLE_CLIENT_ID` bilan bir xil bo'lishi kerak.
  /// `--dart-define=GOOGLE_CLIENT_ID=your-client-id` orqali o'zgartirilishi mumkin.
  static const String googleClientId = String.fromEnvironment(
    'GOOGLE_CLIENT_ID',
    defaultValue: '',
  );

  static const String appName = 'Boyxon Oshxonasi';
  static const String versionName = '1.0.0';

  /// Serverdagi bilan AYNAN bir xil qiymatlar (order.controller.ts).
  static const int freeDeliveryFrom = 150000;
  static const int deliveryFee = 12000;
}
