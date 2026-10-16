import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_ru.dart';
import 'app_localizations_uz.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('ru'),
    Locale('uz'),
  ];

  /// No description provided for @common_retry.
  ///
  /// In uz, this message translates to:
  /// **'Qayta urinish'**
  String get common_retry;

  /// No description provided for @common_cancel.
  ///
  /// In uz, this message translates to:
  /// **'Bekor qilish'**
  String get common_cancel;

  /// No description provided for @common_save.
  ///
  /// In uz, this message translates to:
  /// **'Saqlash'**
  String get common_save;

  /// No description provided for @common_delete.
  ///
  /// In uz, this message translates to:
  /// **'O\'chirish'**
  String get common_delete;

  /// No description provided for @common_close.
  ///
  /// In uz, this message translates to:
  /// **'Yopish'**
  String get common_close;

  /// No description provided for @common_error.
  ///
  /// In uz, this message translates to:
  /// **'Xatolik yuz berdi. Qayta urinib ko\'ring.'**
  String get common_error;

  /// No description provided for @common_network.
  ///
  /// In uz, this message translates to:
  /// **'Internet aloqasini tekshiring'**
  String get common_network;

  /// No description provided for @common_loading.
  ///
  /// In uz, this message translates to:
  /// **'Yuklanmoqda...'**
  String get common_loading;

  /// No description provided for @nav_menu.
  ///
  /// In uz, this message translates to:
  /// **'Menyu'**
  String get nav_menu;

  /// No description provided for @nav_cart.
  ///
  /// In uz, this message translates to:
  /// **'Savat'**
  String get nav_cart;

  /// No description provided for @nav_orders.
  ///
  /// In uz, this message translates to:
  /// **'Buyurtmalar'**
  String get nav_orders;

  /// No description provided for @nav_profile.
  ///
  /// In uz, this message translates to:
  /// **'Profil'**
  String get nav_profile;

  /// No description provided for @auth_welcome.
  ///
  /// In uz, this message translates to:
  /// **'Xush kelibsiz!'**
  String get auth_welcome;

  /// No description provided for @auth_login_sub.
  ///
  /// In uz, this message translates to:
  /// **'Hisobingizga kiring yoki ro\'yxatdan o\'ting'**
  String get auth_login_sub;

  /// No description provided for @auth_login.
  ///
  /// In uz, this message translates to:
  /// **'Kirish'**
  String get auth_login;

  /// No description provided for @auth_register.
  ///
  /// In uz, this message translates to:
  /// **'Ro\'yxatdan o\'tish'**
  String get auth_register;

  /// No description provided for @auth_email.
  ///
  /// In uz, this message translates to:
  /// **'Email'**
  String get auth_email;

  /// No description provided for @auth_password.
  ///
  /// In uz, this message translates to:
  /// **'Parol'**
  String get auth_password;

  /// No description provided for @auth_name.
  ///
  /// In uz, this message translates to:
  /// **'Ismingiz'**
  String get auth_name;

  /// No description provided for @auth_phone.
  ///
  /// In uz, this message translates to:
  /// **'Telefon raqam (ixtiyoriy)'**
  String get auth_phone;

  /// No description provided for @auth_forgot.
  ///
  /// In uz, this message translates to:
  /// **'Parolni unutdingizmi?'**
  String get auth_forgot;

  /// No description provided for @auth_no_account.
  ///
  /// In uz, this message translates to:
  /// **'Hisobingiz yo\'qmi?'**
  String get auth_no_account;

  /// No description provided for @auth_has_account.
  ///
  /// In uz, this message translates to:
  /// **'Hisobingiz bormi?'**
  String get auth_has_account;

  /// No description provided for @auth_logged_out.
  ///
  /// In uz, this message translates to:
  /// **'Hisobdan chiqdingiz'**
  String get auth_logged_out;

  /// No description provided for @auth_logout.
  ///
  /// In uz, this message translates to:
  /// **'Chiqish'**
  String get auth_logout;

  /// No description provided for @auth_logout_all.
  ///
  /// In uz, this message translates to:
  /// **'Barcha qurilmalardan chiqish'**
  String get auth_logout_all;

  /// No description provided for @auth_logout_confirm.
  ///
  /// In uz, this message translates to:
  /// **'Hisobdan chiqishni tasdiqlaysizmi?'**
  String get auth_logout_confirm;

  /// No description provided for @auth_verify_resend.
  ///
  /// In uz, this message translates to:
  /// **'Tasdiqlash xatini qayta yuborish'**
  String get auth_verify_resend;

  /// No description provided for @auth_verify_sent.
  ///
  /// In uz, this message translates to:
  /// **'Tasdiqlash xati yuborildi. Pochtangizni tekshiring.'**
  String get auth_verify_sent;

  /// No description provided for @auth_verify_required.
  ///
  /// In uz, this message translates to:
  /// **'Buyurtma berishdan oldin emailingizni tasdiqlang — pochtangizga yuborilgan havolani bosing.'**
  String get auth_verify_required;

  /// No description provided for @auth_password_hint.
  ///
  /// In uz, this message translates to:
  /// **'Kamida 8 belgi'**
  String get auth_password_hint;

  /// No description provided for @auth_required_title.
  ///
  /// In uz, this message translates to:
  /// **'Tizimga kirish kerak'**
  String get auth_required_title;

  /// No description provided for @auth_required_sub.
  ///
  /// In uz, this message translates to:
  /// **'Bu bo\'limdan foydalanish uchun hisobingizga kiring'**
  String get auth_required_sub;

  /// No description provided for @forgot_title.
  ///
  /// In uz, this message translates to:
  /// **'Parolni tiklash'**
  String get forgot_title;

  /// No description provided for @forgot_desc.
  ///
  /// In uz, this message translates to:
  /// **'Emailingizni kiriting — tiklash havolasini yuboramiz.'**
  String get forgot_desc;

  /// No description provided for @forgot_cta.
  ///
  /// In uz, this message translates to:
  /// **'Havolani yuborish'**
  String get forgot_cta;

  /// No description provided for @forgot_sent.
  ///
  /// In uz, this message translates to:
  /// **'Agar bu email ro\'yxatdan o\'tgan bo\'lsa, xat yuborilgan. Pochtangizni tekshiring.'**
  String get forgot_sent;

  /// No description provided for @home_search.
  ///
  /// In uz, this message translates to:
  /// **'Taom qidirish...'**
  String get home_search;

  /// No description provided for @home_all.
  ///
  /// In uz, this message translates to:
  /// **'Barchasi'**
  String get home_all;

  /// No description provided for @home_featured.
  ///
  /// In uz, this message translates to:
  /// **'Mashhur taomlar'**
  String get home_featured;

  /// No description provided for @home_no_dishes.
  ///
  /// In uz, this message translates to:
  /// **'Taom topilmadi'**
  String get home_no_dishes;

  /// No description provided for @home_no_dishes_sub.
  ///
  /// In uz, this message translates to:
  /// **'Boshqa nom bilan qidirib ko\'ring'**
  String get home_no_dishes_sub;

  /// No description provided for @home_free_unlocked.
  ///
  /// In uz, this message translates to:
  /// **'Bepul yetkazish faollashtirildi'**
  String get home_free_unlocked;

  /// No description provided for @home_to_free.
  ///
  /// In uz, this message translates to:
  /// **'Bepul yetkazishgacha {amount} qoldi'**
  String home_to_free(String amount);

  /// No description provided for @dish_add.
  ///
  /// In uz, this message translates to:
  /// **'Savatga qo\'shish'**
  String get dish_add;

  /// No description provided for @dish_added.
  ///
  /// In uz, this message translates to:
  /// **'Savatga qo\'shildi'**
  String get dish_added;

  /// No description provided for @dish_about.
  ///
  /// In uz, this message translates to:
  /// **'Taom haqida'**
  String get dish_about;

  /// No description provided for @dish_min.
  ///
  /// In uz, this message translates to:
  /// **'{n} daqiqa'**
  String dish_min(String n);

  /// No description provided for @dish_kcal.
  ///
  /// In uz, this message translates to:
  /// **'{n} kkal'**
  String dish_kcal(String n);

  /// No description provided for @dish_not_found.
  ///
  /// In uz, this message translates to:
  /// **'Taom topilmadi'**
  String get dish_not_found;

  /// No description provided for @cart_title.
  ///
  /// In uz, this message translates to:
  /// **'Savat'**
  String get cart_title;

  /// No description provided for @cart_empty.
  ///
  /// In uz, this message translates to:
  /// **'Savat bo\'sh'**
  String get cart_empty;

  /// No description provided for @cart_empty_sub.
  ///
  /// In uz, this message translates to:
  /// **'Menyudan mazali taom tanlang'**
  String get cart_empty_sub;

  /// No description provided for @cart_to_menu.
  ///
  /// In uz, this message translates to:
  /// **'Menyuga o\'tish'**
  String get cart_to_menu;

  /// No description provided for @cart_subtotal.
  ///
  /// In uz, this message translates to:
  /// **'Mahsulotlar'**
  String get cart_subtotal;

  /// No description provided for @cart_delivery.
  ///
  /// In uz, this message translates to:
  /// **'Yetkazish'**
  String get cart_delivery;

  /// No description provided for @cart_discount.
  ///
  /// In uz, this message translates to:
  /// **'Chegirma'**
  String get cart_discount;

  /// No description provided for @cart_total.
  ///
  /// In uz, this message translates to:
  /// **'Jami'**
  String get cart_total;

  /// No description provided for @cart_free.
  ///
  /// In uz, this message translates to:
  /// **'Bepul'**
  String get cart_free;

  /// No description provided for @cart_promo.
  ///
  /// In uz, this message translates to:
  /// **'Promokod'**
  String get cart_promo;

  /// No description provided for @cart_promo_apply.
  ///
  /// In uz, this message translates to:
  /// **'Qo\'llash'**
  String get cart_promo_apply;

  /// No description provided for @cart_promo_ok.
  ///
  /// In uz, this message translates to:
  /// **'«{code}» promokodi qabul qilindi: -{discount}'**
  String cart_promo_ok(String code, String discount);

  /// No description provided for @cart_checkout.
  ///
  /// In uz, this message translates to:
  /// **'Buyurtma berish'**
  String get cart_checkout;

  /// No description provided for @cart_clear_confirm.
  ///
  /// In uz, this message translates to:
  /// **'Savatdagi hamma taom o\'chiriladi. Davom etilsinmi?'**
  String get cart_clear_confirm;

  /// No description provided for @cart_clear.
  ///
  /// In uz, this message translates to:
  /// **'Savatni tozalash'**
  String get cart_clear;

  /// No description provided for @checkout_title.
  ///
  /// In uz, this message translates to:
  /// **'Buyurtma berish'**
  String get checkout_title;

  /// No description provided for @checkout_delivery_type.
  ///
  /// In uz, this message translates to:
  /// **'Yetkazish turi'**
  String get checkout_delivery_type;

  /// No description provided for @checkout_delivery.
  ///
  /// In uz, this message translates to:
  /// **'Yetkazib berish'**
  String get checkout_delivery;

  /// No description provided for @checkout_pickup.
  ///
  /// In uz, this message translates to:
  /// **'Olib ketish'**
  String get checkout_pickup;

  /// No description provided for @checkout_address.
  ///
  /// In uz, this message translates to:
  /// **'Manzil'**
  String get checkout_address;

  /// No description provided for @checkout_no_address.
  ///
  /// In uz, this message translates to:
  /// **'Manzil tanlanmagan'**
  String get checkout_no_address;

  /// No description provided for @checkout_add_address.
  ///
  /// In uz, this message translates to:
  /// **'Yangi manzil'**
  String get checkout_add_address;

  /// No description provided for @checkout_payment.
  ///
  /// In uz, this message translates to:
  /// **'To\'lov usuli'**
  String get checkout_payment;

  /// No description provided for @checkout_cash.
  ///
  /// In uz, this message translates to:
  /// **'Naqd pul'**
  String get checkout_cash;

  /// No description provided for @checkout_notes.
  ///
  /// In uz, this message translates to:
  /// **'Izoh (ixtiyoriy)'**
  String get checkout_notes;

  /// No description provided for @checkout_notes_hint.
  ///
  /// In uz, this message translates to:
  /// **'Masalan: domofon kodi, kuryer uchun eslatma'**
  String get checkout_notes_hint;

  /// No description provided for @checkout_place.
  ///
  /// In uz, this message translates to:
  /// **'Buyurtmani tasdiqlash'**
  String get checkout_place;

  /// No description provided for @checkout_address_needed.
  ///
  /// In uz, this message translates to:
  /// **'Yetkazib berish uchun manzilni tanlang'**
  String get checkout_address_needed;

  /// No description provided for @checkout_done_title.
  ///
  /// In uz, this message translates to:
  /// **'Buyurtma qabul qilindi!'**
  String get checkout_done_title;

  /// No description provided for @checkout_done_sub.
  ///
  /// In uz, this message translates to:
  /// **'Buyurtma raqami: {number}'**
  String checkout_done_sub(String number);

  /// No description provided for @checkout_to_orders.
  ///
  /// In uz, this message translates to:
  /// **'Buyurtmalarim'**
  String get checkout_to_orders;

  /// No description provided for @orders_title.
  ///
  /// In uz, this message translates to:
  /// **'Buyurtmalarim'**
  String get orders_title;

  /// No description provided for @orders_empty.
  ///
  /// In uz, this message translates to:
  /// **'Buyurtmalar yo\'q'**
  String get orders_empty;

  /// No description provided for @orders_empty_sub.
  ///
  /// In uz, this message translates to:
  /// **'Birinchi buyurtmangizni bering!'**
  String get orders_empty_sub;

  /// No description provided for @orders_cancel_confirm.
  ///
  /// In uz, this message translates to:
  /// **'Buyurtma bekor qilinsinmi?'**
  String get orders_cancel_confirm;

  /// No description provided for @orders_cancelled.
  ///
  /// In uz, this message translates to:
  /// **'Buyurtma bekor qilindi'**
  String get orders_cancelled;

  /// No description provided for @orders_number.
  ///
  /// In uz, this message translates to:
  /// **'Buyurtma raqami: {number}'**
  String orders_number(String number);

  /// No description provided for @orders_items.
  ///
  /// In uz, this message translates to:
  /// **'Taomlar'**
  String get orders_items;

  /// No description provided for @orders_address.
  ///
  /// In uz, this message translates to:
  /// **'Manzil'**
  String get orders_address;

  /// No description provided for @orders_payment.
  ///
  /// In uz, this message translates to:
  /// **'To\'lov'**
  String get orders_payment;

  /// No description provided for @orders_notes.
  ///
  /// In uz, this message translates to:
  /// **'Izoh'**
  String get orders_notes;

  /// No description provided for @orders_history.
  ///
  /// In uz, this message translates to:
  /// **'Holat tarixi'**
  String get orders_history;

  /// No description provided for @orders_status_changed.
  ///
  /// In uz, this message translates to:
  /// **'Buyurtma holati: {status}'**
  String orders_status_changed(String status);

  /// No description provided for @status_pending.
  ///
  /// In uz, this message translates to:
  /// **'Yangi'**
  String get status_pending;

  /// No description provided for @status_confirmed.
  ///
  /// In uz, this message translates to:
  /// **'Tasdiqlandi'**
  String get status_confirmed;

  /// No description provided for @status_packing.
  ///
  /// In uz, this message translates to:
  /// **'Tayyorlanmoqda'**
  String get status_packing;

  /// No description provided for @status_handed_to_taxi.
  ///
  /// In uz, this message translates to:
  /// **'Yo\'lda'**
  String get status_handed_to_taxi;

  /// No description provided for @status_delivered.
  ///
  /// In uz, this message translates to:
  /// **'Yetkazildi'**
  String get status_delivered;

  /// No description provided for @status_cancelled.
  ///
  /// In uz, this message translates to:
  /// **'Bekor qilindi'**
  String get status_cancelled;

  /// No description provided for @profile_name.
  ///
  /// In uz, this message translates to:
  /// **'Ism'**
  String get profile_name;

  /// No description provided for @profile_edit.
  ///
  /// In uz, this message translates to:
  /// **'Profilni tahrirlash'**
  String get profile_edit;

  /// No description provided for @profile_phone.
  ///
  /// In uz, this message translates to:
  /// **'Telefon'**
  String get profile_phone;

  /// No description provided for @profile_email.
  ///
  /// In uz, this message translates to:
  /// **'Email'**
  String get profile_email;

  /// No description provided for @profile_saved.
  ///
  /// In uz, this message translates to:
  /// **'Saqlandi'**
  String get profile_saved;

  /// No description provided for @profile_bonuses.
  ///
  /// In uz, this message translates to:
  /// **'Bonuslar'**
  String get profile_bonuses;

  /// No description provided for @profile_unverified.
  ///
  /// In uz, this message translates to:
  /// **'Tasdiqlanmagan'**
  String get profile_unverified;

  /// No description provided for @settings_title.
  ///
  /// In uz, this message translates to:
  /// **'Sozlamalar'**
  String get settings_title;

  /// No description provided for @settings_language.
  ///
  /// In uz, this message translates to:
  /// **'Til'**
  String get settings_language;

  /// No description provided for @settings_theme.
  ///
  /// In uz, this message translates to:
  /// **'Mavzu'**
  String get settings_theme;

  /// No description provided for @theme_light.
  ///
  /// In uz, this message translates to:
  /// **'Kunduzgi'**
  String get theme_light;

  /// No description provided for @theme_dark.
  ///
  /// In uz, this message translates to:
  /// **'Tungi'**
  String get theme_dark;

  /// No description provided for @settings_addresses.
  ///
  /// In uz, this message translates to:
  /// **'Manzillarim'**
  String get settings_addresses;

  /// No description provided for @settings_notifications.
  ///
  /// In uz, this message translates to:
  /// **'Bildirishnomalar'**
  String get settings_notifications;

  /// No description provided for @settings_about.
  ///
  /// In uz, this message translates to:
  /// **'Ilova haqida'**
  String get settings_about;

  /// No description provided for @settings_version.
  ///
  /// In uz, this message translates to:
  /// **'Versiya {v}'**
  String settings_version(String v);

  /// No description provided for @addr_title.
  ///
  /// In uz, this message translates to:
  /// **'Manzillarim'**
  String get addr_title;

  /// No description provided for @addr_add.
  ///
  /// In uz, this message translates to:
  /// **'Manzil qo\'shish'**
  String get addr_add;

  /// No description provided for @addr_label.
  ///
  /// In uz, this message translates to:
  /// **'Nomi'**
  String get addr_label;

  /// No description provided for @addr_label_hint.
  ///
  /// In uz, this message translates to:
  /// **'Uy, Ish...'**
  String get addr_label_hint;

  /// No description provided for @addr_text.
  ///
  /// In uz, this message translates to:
  /// **'Manzil'**
  String get addr_text;

  /// No description provided for @addr_text_hint.
  ///
  /// In uz, this message translates to:
  /// **'Tuman, ko\'cha, uy raqami'**
  String get addr_text_hint;

  /// No description provided for @addr_default.
  ///
  /// In uz, this message translates to:
  /// **'Asosiy manzil qilish'**
  String get addr_default;

  /// No description provided for @addr_empty.
  ///
  /// In uz, this message translates to:
  /// **'Manzillar yo\'q'**
  String get addr_empty;

  /// No description provided for @addr_delete_confirm.
  ///
  /// In uz, this message translates to:
  /// **'Manzil o\'chirilsinmi?'**
  String get addr_delete_confirm;

  /// No description provided for @addr_saved.
  ///
  /// In uz, this message translates to:
  /// **'Manzil saqlandi'**
  String get addr_saved;

  /// No description provided for @addr_deleted.
  ///
  /// In uz, this message translates to:
  /// **'Manzil o\'chirildi'**
  String get addr_deleted;

  /// No description provided for @notif_title.
  ///
  /// In uz, this message translates to:
  /// **'Bildirishnomalar'**
  String get notif_title;

  /// No description provided for @notif_empty.
  ///
  /// In uz, this message translates to:
  /// **'Bildirishnomalar yo\'q'**
  String get notif_empty;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'ru', 'uz'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'ru':
      return AppLocalizationsRu();
    case 'uz':
      return AppLocalizationsUz();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
