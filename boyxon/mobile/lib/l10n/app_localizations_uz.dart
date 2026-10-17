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
  String get auth_logout_all => 'Barcha qurilmalardan chiqish';

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
  String get auth_or => 'yoki';

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
  String get dish_min_short => 'daq';

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
  String get cart_go_home => 'Bosh sahifaga';

  @override
  String get cart_processing => 'Yuborilmoqda...';

  @override
  String get checkout_track => 'Statusni real-time kuzatib boring.';

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
  String get profile_edit => 'Profilni tahrirlash';

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

  @override
  String get notif_site => 'Sayt bildirishnomalari';

  @override
  String get notif_view_all => 'Barcha bildirishnomalar';

  @override
  String get common_back => 'Orqaga';

  @override
  String get common_name => 'Ism';

  @override
  String get common_phone => 'Telefon';

  @override
  String get common_label => 'Nom';

  @override
  String get common_address => 'Manzil';

  @override
  String get home_greeting => 'Xush kelibsiz';

  @override
  String get home_title => 'Bugun nima yeysiz?';

  @override
  String get home_new_season => 'Yangi mavsum';

  @override
  String get home_promo_title =>
      '150 000 so\'mdan — yetkazish o\'zimizdan: 12 000 so\'m tejaysiz';

  @override
  String get home_promo_code =>
      'Ustiga WELCOME10 — birinchi buyurtmaga yana 10%';

  @override
  String home_promo_progress(String amount, String fee) {
    return 'Yana $amount — va yetkazish o\'zimizdan ($fee tejaysiz)';
  }

  @override
  String home_promo_unlocked(String fee) {
    return 'Yetkazish o\'zimizdan — $fee cho\'ntagingizda qoldi 🎉';
  }

  @override
  String get home_all_dishes => 'Barcha taomlar';

  @override
  String home_items_count(int count) {
    return '$count ta';
  }

  @override
  String get home_load_error => 'Ma\'lumotni yuklab bo\'lmadi';

  @override
  String get home_no_dishes_hint =>
      'Boshqa kategoriya yoki qidiruv so\'zini sinab ko\'ring';

  @override
  String get dish_no_image => 'Rasm yo\'q';

  @override
  String get dish_diet => 'Parhez';

  @override
  String get dish_top => 'Top';

  @override
  String get dish_vegetarian => 'Vegetarian';

  @override
  String get dish_spicy => 'Achchiq';

  @override
  String get dish_new => 'Yangi';

  @override
  String get dish_description => 'Tavsif';

  @override
  String get dish_reviews => 'Sharhlar';

  @override
  String dish_reviews_count(int count) {
    return '$count sharh';
  }

  @override
  String get dish_no_reviews => 'Hozircha sharh yo\'q';

  @override
  String get dish_back_to_menu => 'Menyuga qaytish';

  @override
  String get dish_add_to_cart => 'Savatga qo\'shish';

  @override
  String dish_added_name(String name) {
    return '$name savatga qo\'shildi';
  }

  @override
  String get filter_title => 'Filtrlar';

  @override
  String get filter_price => 'Narx (so\'m)';

  @override
  String get filter_from => 'dan';

  @override
  String get filter_to => 'gacha';

  @override
  String get filter_rating => 'Minimal reyting';

  @override
  String get filter_all => 'Hammasi';

  @override
  String get filter_tags => 'Teglar';

  @override
  String get filter_apply => 'Qo\'llash';

  @override
  String get filter_reset => 'Tozalash';

  @override
  String get filter_sort => 'Saralash';

  @override
  String get filter_sort_popular => 'Mashhur';

  @override
  String get filter_sort_price_asc => 'Narx: arzondan';

  @override
  String get filter_sort_price_desc => 'Narx: qimmatdan';

  @override
  String get filter_sort_rating => 'Reyting bo\'yicha';

  @override
  String get filter_sort_new => 'Yangi';

  @override
  String cart_free_hint(String amount, String fee) {
    return 'Yana $amount — shu $fee cho\'ntagingizda qoladi';
  }

  @override
  String cart_free_done(String fee) {
    return 'Yetkazish o\'zimizdan — $fee cho\'ntagingizda qoldi 🎉';
  }

  @override
  String get orders_detail_title => 'Buyurtma tafsiloti';

  @override
  String get orders_label_number => 'Buyurtma raqami';

  @override
  String get orders_label_date => 'Sana';

  @override
  String get orders_label_customer => 'Mijoz ma\'lumotlari';

  @override
  String get orders_label_totals => 'Hisob-kitob';

  @override
  String get orders_label_status => 'Holat';

  @override
  String get orders_not_found => 'Buyurtma topilmadi';

  @override
  String orders_dishes_count(int count) {
    return '$count ta taom';
  }

  @override
  String profile_bonus(String amount) {
    return 'Bonus: $amount';
  }

  @override
  String get settings_account_group => 'HISOB';

  @override
  String get settings_preferences_group => 'AFZALLIKLAR';

  @override
  String get settings_security_group => 'XAVFSIZLIK';

  @override
  String get settings_orders => 'Buyurtmalarim';

  @override
  String get settings_no_orders => 'Hozircha buyurtmalar yo\'q';

  @override
  String get settings_toggle => 'O\'zgartirish';

  @override
  String get settings_saved => 'Saqlandi';

  @override
  String get settings_save_error => 'Saqlab bo\'lmadi';

  @override
  String get settings_language_updated => 'Til yangilandi';

  @override
  String get settings_help => 'Yordam';

  @override
  String get settings_help_contact => 'Yordam: +998 71 200 00 00';

  @override
  String get settings_address_default_label => 'Asosiy';

  @override
  String get settings_address_set_default => 'Asosiy qilish';

  @override
  String get settings_address_required => 'Nom va manzilni kiriting';
}
