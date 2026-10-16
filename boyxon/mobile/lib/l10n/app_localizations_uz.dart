// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Uzbek (`uz`).
class AppLocalizationsUz extends AppLocalizations {
  AppLocalizationsUz([String locale = 'uz']) : super(locale);

  @override
  String get common_retry => 'Qayta urinish';

  @override
  String get common_cancel => 'Bekor qilish';

  @override
  String get common_save => 'Saqlash';

  @override
  String get common_delete => 'O\'chirish';

  @override
  String get common_close => 'Yopish';

  @override
  String get common_error => 'Xatolik yuz berdi. Qayta urinib ko\'ring.';

  @override
  String get common_network => 'Internet aloqasini tekshiring';

  @override
  String get common_loading => 'Yuklanmoqda...';

  @override
  String get nav_menu => 'Menyu';

  @override
  String get nav_cart => 'Savat';

  @override
  String get nav_orders => 'Buyurtmalar';

  @override
  String get nav_profile => 'Profil';

  @override
  String get auth_welcome => 'Xush kelibsiz!';

  @override
  String get auth_login_sub => 'Hisobingizga kiring yoki ro\'yxatdan o\'ting';

  @override
  String get auth_login => 'Kirish';

  @override
  String get auth_register => 'Ro\'yxatdan o\'tish';

  @override
  String get auth_email => 'Email';

  @override
  String get auth_password => 'Parol';

  @override
  String get auth_name => 'Ismingiz';

  @override
  String get auth_phone => 'Telefon raqam (ixtiyoriy)';

  @override
  String get auth_forgot => 'Parolni unutdingizmi?';

  @override
  String get auth_no_account => 'Hisobingiz yo\'qmi?';

  @override
  String get auth_has_account => 'Hisobingiz bormi?';

  @override
  String get auth_logged_out => 'Hisobdan chiqdingiz';

  @override
  String get auth_logout => 'Chiqish';

  @override
  String get auth_logout_confirm => 'Hisobdan chiqishni tasdiqlaysizmi?';

  @override
  String get auth_verify_resend => 'Tasdiqlash xatini qayta yuborish';

  @override
  String get auth_verify_sent =>
      'Tasdiqlash xati yuborildi. Pochtangizni tekshiring.';

  @override
  String get auth_verify_required =>
      'Buyurtma berishdan oldin emailingizni tasdiqlang — pochtangizga yuborilgan havolani bosing.';

  @override
  String get auth_password_hint => 'Kamida 8 belgi';

  @override
  String get auth_required_title => 'Tizimga kirish kerak';

  @override
  String get auth_required_sub =>
      'Bu bo\'limdan foydalanish uchun hisobingizga kiring';

  @override
  String get forgot_title => 'Parolni tiklash';

  @override
  String get forgot_desc =>
      'Emailingizni kiriting — tiklash havolasini yuboramiz.';

  @override
  String get forgot_cta => 'Havolani yuborish';

  @override
  String get forgot_sent =>
      'Agar bu email ro\'yxatdan o\'tgan bo\'lsa, xat yuborilgan. Pochtangizni tekshiring.';

  @override
  String get home_search => 'Taom qidirish...';

  @override
  String get home_all => 'Barchasi';

  @override
  String get home_featured => 'Mashhur taomlar';

  @override
  String get home_no_dishes => 'Taom topilmadi';

  @override
  String get home_no_dishes_sub => 'Boshqa nom bilan qidirib ko\'ring';

  @override
  String get home_free_unlocked => 'Bepul yetkazish faollashtirildi';

  @override
  String home_to_free(String amount) {
    return 'Bepul yetkazishgacha $amount qoldi';
  }

  @override
  String get dish_add => 'Savatga qo\'shish';

  @override
  String get dish_added => 'Savatga qo\'shildi';

  @override
  String get dish_about => 'Taom haqida';

  @override
  String dish_min(String n) {
    return '$n daqiqa';
  }

  @override
  String dish_kcal(String n) {
    return '$n kkal';
  }

  @override
  String get dish_not_found => 'Taom topilmadi';

  @override
  String get cart_title => 'Savat';

  @override
  String get cart_empty => 'Savat bo\'sh';

  @override
  String get cart_empty_sub => 'Menyudan mazali taom tanlang';

  @override
  String get cart_to_menu => 'Menyuga o\'tish';

  @override
  String get cart_subtotal => 'Mahsulotlar';

  @override
  String get cart_delivery => 'Yetkazish';

  @override
  String get cart_discount => 'Chegirma';

  @override
  String get cart_total => 'Jami';

  @override
  String get cart_free => 'Bepul';

  @override
  String get cart_promo => 'Promokod';

  @override
  String get cart_promo_apply => 'Qo\'llash';

  @override
  String cart_promo_ok(String code, String discount) {
    return '«$code» promokodi qabul qilindi: -$discount';
  }

  @override
  String get cart_checkout => 'Buyurtma berish';

  @override
  String get cart_clear_confirm =>
      'Savatdagi hamma taom o\'chiriladi. Davom etilsinmi?';

  @override
  String get cart_clear => 'Savatni tozalash';

  @override
  String get checkout_title => 'Buyurtma berish';

  @override
  String get checkout_delivery_type => 'Yetkazish turi';

  @override
  String get checkout_delivery => 'Yetkazib berish';

  @override
  String get checkout_pickup => 'Olib ketish';

  @override
  String get checkout_address => 'Manzil';

  @override
  String get checkout_no_address => 'Manzil tanlanmagan';

  @override
  String get checkout_add_address => 'Yangi manzil';

  @override
  String get checkout_payment => 'To\'lov usuli';

  @override
  String get checkout_cash => 'Naqd pul';

  @override
  String get checkout_notes => 'Izoh (ixtiyoriy)';

  @override
  String get checkout_notes_hint =>
      'Masalan: domofon kodi, kuryer uchun eslatma';

  @override
  String get checkout_place => 'Buyurtmani tasdiqlash';

  @override
  String get checkout_address_needed =>
      'Yetkazib berish uchun manzilni tanlang';

  @override
  String get checkout_done_title => 'Buyurtma qabul qilindi!';

  @override
  String checkout_done_sub(String number) {
    return 'Buyurtma raqami: $number';
  }

  @override
  String get checkout_to_orders => 'Buyurtmalarim';

  @override
  String get orders_title => 'Buyurtmalarim';

  @override
  String get orders_empty => 'Buyurtmalar yo\'q';

  @override
  String get orders_empty_sub => 'Birinchi buyurtmangizni bering!';

  @override
  String get orders_cancel_confirm => 'Buyurtma bekor qilinsinmi?';

  @override
  String get orders_cancelled => 'Buyurtma bekor qilindi';

  @override
  String orders_number(String number) {
    return 'Buyurtma raqami: $number';
  }

  @override
  String get orders_items => 'Taomlar';

  @override
  String get orders_address => 'Manzil';

  @override
  String get orders_payment => 'To\'lov';

  @override
  String get orders_notes => 'Izoh';

  @override
  String get orders_history => 'Holat tarixi';

  @override
  String orders_status_changed(String status) {
    return 'Buyurtma holati: $status';
  }

  @override
  String get status_pending => 'Yangi';

  @override
  String get status_confirmed => 'Tasdiqlandi';

  @override
  String get status_packing => 'Tayyorlanmoqda';

  @override
  String get status_handed_to_taxi => 'Yo\'lda';

  @override
  String get status_delivered => 'Yetkazildi';

  @override
  String get status_cancelled => 'Bekor qilindi';

  @override
  String get profile_name => 'Ism';

  @override
  String get profile_phone => 'Telefon';

  @override
  String get profile_email => 'Email';

  @override
  String get profile_saved => 'Saqlandi';

  @override
  String get profile_bonuses => 'Bonuslar';

  @override
  String get profile_unverified => 'Tasdiqlanmagan';

  @override
  String get settings_title => 'Sozlamalar';

  @override
  String get settings_language => 'Til';

  @override
  String get settings_theme => 'Mavzu';

  @override
  String get theme_light => 'Kunduzgi';

  @override
  String get theme_dark => 'Tungi';

  @override
  String get settings_addresses => 'Manzillarim';

  @override
  String get settings_notifications => 'Bildirishnomalar';

  @override
  String get settings_about => 'Ilova haqida';

  @override
  String settings_version(String v) {
    return 'Versiya $v';
  }

  @override
  String get addr_title => 'Manzillarim';

  @override
  String get addr_add => 'Manzil qo\'shish';

  @override
  String get addr_label => 'Nomi';

  @override
  String get addr_label_hint => 'Uy, Ish...';

  @override
  String get addr_text => 'Manzil';

  @override
  String get addr_text_hint => 'Tuman, ko\'cha, uy raqami';

  @override
  String get addr_default => 'Asosiy manzil qilish';

  @override
  String get addr_empty => 'Manzillar yo\'q';

  @override
  String get addr_delete_confirm => 'Manzil o\'chirilsinmi?';

  @override
  String get addr_saved => 'Manzil saqlandi';

  @override
  String get addr_deleted => 'Manzil o\'chirildi';

  @override
  String get notif_title => 'Bildirishnomalar';

  @override
  String get notif_empty => 'Bildirishnomalar yo\'q';
}
