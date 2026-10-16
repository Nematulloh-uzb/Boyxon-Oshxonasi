// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Russian (`ru`).
class AppLocalizationsRu extends AppLocalizations {
  AppLocalizationsRu([String locale = 'ru']) : super(locale);

  @override
  String get common_retry => 'Повторить';

  @override
  String get common_cancel => 'Отмена';

  @override
  String get common_save => 'Сохранить';

  @override
  String get common_delete => 'Удалить';

  @override
  String get common_close => 'Закрыть';

  @override
  String get common_error => 'Произошла ошибка. Попробуйте ещё раз.';

  @override
  String get common_network => 'Проверьте подключение к интернету';

  @override
  String get common_loading => 'Загрузка...';

  @override
  String get nav_menu => 'Меню';

  @override
  String get nav_cart => 'Корзина';

  @override
  String get nav_orders => 'Заказы';

  @override
  String get nav_profile => 'Профиль';

  @override
  String get auth_welcome => 'Добро пожаловать!';

  @override
  String get auth_login_sub => 'Войдите в аккаунт или зарегистрируйтесь';

  @override
  String get auth_login => 'Войти';

  @override
  String get auth_register => 'Регистрация';

  @override
  String get auth_email => 'Email';

  @override
  String get auth_password => 'Пароль';

  @override
  String get auth_name => 'Ваше имя';

  @override
  String get auth_phone => 'Телефон (необязательно)';

  @override
  String get auth_forgot => 'Забыли пароль?';

  @override
  String get auth_no_account => 'Нет аккаунта?';

  @override
  String get auth_has_account => 'Уже есть аккаунт?';

  @override
  String get auth_logged_out => 'Вы вышли из аккаунта';

  @override
  String get auth_logout => 'Выйти';

  @override
  String get auth_logout_confirm => 'Выйти из аккаунта?';

  @override
  String get auth_verify_resend => 'Отправить письмо повторно';

  @override
  String get auth_verify_sent => 'Письмо отправлено. Проверьте почту.';

  @override
  String get auth_verify_required =>
      'Подтвердите email, чтобы оформить заказ — перейдите по ссылке в письме.';

  @override
  String get auth_password_hint => 'Минимум 8 символов';

  @override
  String get auth_required_title => 'Требуется вход';

  @override
  String get auth_required_sub =>
      'Войдите в аккаунт, чтобы пользоваться этим разделом';

  @override
  String get forgot_title => 'Восстановление пароля';

  @override
  String get forgot_desc =>
      'Укажите email — отправим ссылку для сброса пароля.';

  @override
  String get forgot_cta => 'Отправить ссылку';

  @override
  String get forgot_sent =>
      'Если этот email зарегистрирован, письмо отправлено. Проверьте почту.';

  @override
  String get home_search => 'Поиск блюд...';

  @override
  String get home_all => 'Все';

  @override
  String get home_featured => 'Популярные блюда';

  @override
  String get home_no_dishes => 'Блюда не найдены';

  @override
  String get home_no_dishes_sub => 'Попробуйте другое название';

  @override
  String get home_free_unlocked => 'Бесплатная доставка активирована';

  @override
  String home_to_free(String amount) {
    return 'До бесплатной доставки осталось $amount';
  }

  @override
  String get dish_add => 'Добавить в корзину';

  @override
  String get dish_added => 'Добавлено в корзину';

  @override
  String get dish_about => 'О блюде';

  @override
  String dish_min(String n) {
    return '$n мин';
  }

  @override
  String dish_kcal(String n) {
    return '$n ккал';
  }

  @override
  String get dish_not_found => 'Блюдо не найдено';

  @override
  String get cart_title => 'Корзина';

  @override
  String get cart_empty => 'Корзина пуста';

  @override
  String get cart_empty_sub => 'Выберите вкусное блюдо из меню';

  @override
  String get cart_to_menu => 'Перейти в меню';

  @override
  String get cart_subtotal => 'Товары';

  @override
  String get cart_delivery => 'Доставка';

  @override
  String get cart_discount => 'Скидка';

  @override
  String get cart_total => 'Итого';

  @override
  String get cart_free => 'Бесплатно';

  @override
  String get cart_promo => 'Промокод';

  @override
  String get cart_promo_apply => 'Применить';

  @override
  String cart_promo_ok(String code, String discount) {
    return 'Промокод «$code» применён: -$discount';
  }

  @override
  String get cart_checkout => 'Оформить заказ';

  @override
  String get cart_clear_confirm =>
      'Все товары будут удалены из корзины. Продолжить?';

  @override
  String get cart_clear => 'Очистить корзину';

  @override
  String get checkout_title => 'Оформление заказа';

  @override
  String get checkout_delivery_type => 'Способ получения';

  @override
  String get checkout_delivery => 'Доставка';

  @override
  String get checkout_pickup => 'Самовывоз';

  @override
  String get checkout_address => 'Адрес';

  @override
  String get checkout_no_address => 'Адрес не выбран';

  @override
  String get checkout_add_address => 'Новый адрес';

  @override
  String get checkout_payment => 'Способ оплаты';

  @override
  String get checkout_cash => 'Наличными';

  @override
  String get checkout_notes => 'Комментарий (необязательно)';

  @override
  String get checkout_notes_hint => 'Например: код домофона, пожелания курьеру';

  @override
  String get checkout_place => 'Подтвердить заказ';

  @override
  String get checkout_address_needed => 'Выберите адрес для доставки';

  @override
  String get checkout_done_title => 'Заказ принят!';

  @override
  String checkout_done_sub(String number) {
    return 'Номер заказа: $number';
  }

  @override
  String get checkout_to_orders => 'Мои заказы';

  @override
  String get orders_title => 'Мои заказы';

  @override
  String get orders_empty => 'Заказов нет';

  @override
  String get orders_empty_sub => 'Оформите первый заказ!';

  @override
  String get orders_cancel_confirm => 'Отменить заказ?';

  @override
  String get orders_cancelled => 'Заказ отменён';

  @override
  String orders_number(String number) {
    return 'Номер заказа: $number';
  }

  @override
  String get orders_items => 'Блюда';

  @override
  String get orders_address => 'Адрес';

  @override
  String get orders_payment => 'Оплата';

  @override
  String get orders_notes => 'Комментарий';

  @override
  String get orders_history => 'История статусов';

  @override
  String orders_status_changed(String status) {
    return 'Статус заказа: $status';
  }

  @override
  String get status_pending => 'Новый';

  @override
  String get status_confirmed => 'Подтверждён';

  @override
  String get status_packing => 'Готовится';

  @override
  String get status_handed_to_taxi => 'В пути';

  @override
  String get status_delivered => 'Доставлен';

  @override
  String get status_cancelled => 'Отменён';

  @override
  String get profile_name => 'Имя';

  @override
  String get profile_phone => 'Телефон';

  @override
  String get profile_email => 'Email';

  @override
  String get profile_saved => 'Сохранено';

  @override
  String get profile_bonuses => 'Бонусы';

  @override
  String get profile_unverified => 'Не подтверждён';

  @override
  String get settings_title => 'Настройки';

  @override
  String get settings_language => 'Язык';

  @override
  String get settings_theme => 'Тема';

  @override
  String get theme_light => 'Светлая';

  @override
  String get theme_dark => 'Тёмная';

  @override
  String get settings_addresses => 'Мои адреса';

  @override
  String get settings_notifications => 'Уведомления';

  @override
  String get settings_about => 'О приложении';

  @override
  String settings_version(String v) {
    return 'Версия $v';
  }

  @override
  String get addr_title => 'Мои адреса';

  @override
  String get addr_add => 'Добавить адрес';

  @override
  String get addr_label => 'Название';

  @override
  String get addr_label_hint => 'Дом, Работа...';

  @override
  String get addr_text => 'Адрес';

  @override
  String get addr_text_hint => 'Район, улица, номер дома';

  @override
  String get addr_default => 'Сделать основным';

  @override
  String get addr_empty => 'Адресов нет';

  @override
  String get addr_delete_confirm => 'Удалить адрес?';

  @override
  String get addr_saved => 'Адрес сохранён';

  @override
  String get addr_deleted => 'Адрес удалён';

  @override
  String get notif_title => 'Уведомления';

  @override
  String get notif_empty => 'Уведомлений нет';
}
