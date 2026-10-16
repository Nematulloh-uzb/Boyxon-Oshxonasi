// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get common_retry => 'Retry';

  @override
  String get common_cancel => 'Cancel';

  @override
  String get common_save => 'Save';

  @override
  String get common_delete => 'Delete';

  @override
  String get common_close => 'Close';

  @override
  String get common_error => 'Something went wrong. Please try again.';

  @override
  String get common_network => 'Check your internet connection';

  @override
  String get common_loading => 'Loading...';

  @override
  String get nav_menu => 'Menu';

  @override
  String get nav_cart => 'Cart';

  @override
  String get nav_orders => 'Orders';

  @override
  String get nav_profile => 'Profile';

  @override
  String get auth_welcome => 'Welcome!';

  @override
  String get auth_login_sub => 'Sign in to your account or create a new one';

  @override
  String get auth_login => 'Sign in';

  @override
  String get auth_register => 'Sign up';

  @override
  String get auth_email => 'Email';

  @override
  String get auth_password => 'Password';

  @override
  String get auth_name => 'Your name';

  @override
  String get auth_phone => 'Phone (optional)';

  @override
  String get auth_forgot => 'Forgot password?';

  @override
  String get auth_no_account => 'No account?';

  @override
  String get auth_has_account => 'Already have an account?';

  @override
  String get auth_logged_out => 'You have signed out';

  @override
  String get auth_logout => 'Sign out';

  @override
  String get auth_logout_confirm => 'Sign out of your account?';

  @override
  String get auth_verify_resend => 'Resend verification email';

  @override
  String get auth_verify_sent => 'Verification email sent. Check your inbox.';

  @override
  String get auth_verify_required =>
      'Verify your email before ordering — tap the link we sent to your inbox.';

  @override
  String get auth_password_hint => 'At least 8 characters';

  @override
  String get auth_required_title => 'Sign in required';

  @override
  String get auth_required_sub => 'Sign in to your account to use this section';

  @override
  String get forgot_title => 'Reset password';

  @override
  String get forgot_desc => 'Enter your email — we\'ll send a reset link.';

  @override
  String get forgot_cta => 'Send link';

  @override
  String get forgot_sent =>
      'If this email is registered, the link has been sent. Check your inbox.';

  @override
  String get home_search => 'Search dishes...';

  @override
  String get home_all => 'All';

  @override
  String get home_featured => 'Popular dishes';

  @override
  String get home_no_dishes => 'No dishes found';

  @override
  String get home_no_dishes_sub => 'Try a different name';

  @override
  String get home_free_unlocked => 'Free delivery unlocked';

  @override
  String home_to_free(String amount) {
    return '$amount away from free delivery';
  }

  @override
  String get dish_add => 'Add to cart';

  @override
  String get dish_added => 'Added to cart';

  @override
  String get dish_about => 'About the dish';

  @override
  String dish_min(String n) {
    return '$n min';
  }

  @override
  String dish_kcal(String n) {
    return '$n kcal';
  }

  @override
  String get dish_not_found => 'Dish not found';

  @override
  String get cart_title => 'Cart';

  @override
  String get cart_empty => 'Your cart is empty';

  @override
  String get cart_empty_sub => 'Pick something tasty from the menu';

  @override
  String get cart_to_menu => 'Go to menu';

  @override
  String get cart_subtotal => 'Items';

  @override
  String get cart_delivery => 'Delivery';

  @override
  String get cart_discount => 'Discount';

  @override
  String get cart_total => 'Total';

  @override
  String get cart_free => 'Free';

  @override
  String get cart_promo => 'Promo code';

  @override
  String get cart_promo_apply => 'Apply';

  @override
  String cart_promo_ok(String code, String discount) {
    return 'Promo code “$code” applied: -$discount';
  }

  @override
  String get cart_checkout => 'Checkout';

  @override
  String get cart_clear_confirm =>
      'All items will be removed from the cart. Continue?';

  @override
  String get cart_clear => 'Clear cart';

  @override
  String get checkout_title => 'Checkout';

  @override
  String get checkout_delivery_type => 'Delivery type';

  @override
  String get checkout_delivery => 'Delivery';

  @override
  String get checkout_pickup => 'Pickup';

  @override
  String get checkout_address => 'Address';

  @override
  String get checkout_no_address => 'No address selected';

  @override
  String get checkout_add_address => 'New address';

  @override
  String get checkout_payment => 'Payment method';

  @override
  String get checkout_cash => 'Cash';

  @override
  String get checkout_notes => 'Note (optional)';

  @override
  String get checkout_notes_hint =>
      'For example: door code, note for the courier';

  @override
  String get checkout_place => 'Confirm order';

  @override
  String get checkout_address_needed => 'Select a delivery address';

  @override
  String get checkout_done_title => 'Order accepted!';

  @override
  String checkout_done_sub(String number) {
    return 'Order number: $number';
  }

  @override
  String get checkout_to_orders => 'My orders';

  @override
  String get orders_title => 'My orders';

  @override
  String get orders_empty => 'No orders yet';

  @override
  String get orders_empty_sub => 'Place your first order!';

  @override
  String get orders_cancel_confirm => 'Cancel this order?';

  @override
  String get orders_cancelled => 'Order cancelled';

  @override
  String orders_number(String number) {
    return 'Order number: $number';
  }

  @override
  String get orders_items => 'Items';

  @override
  String get orders_address => 'Address';

  @override
  String get orders_payment => 'Payment';

  @override
  String get orders_notes => 'Note';

  @override
  String get orders_history => 'Status history';

  @override
  String orders_status_changed(String status) {
    return 'Order status: $status';
  }

  @override
  String get status_pending => 'New';

  @override
  String get status_confirmed => 'Confirmed';

  @override
  String get status_packing => 'Preparing';

  @override
  String get status_handed_to_taxi => 'On the way';

  @override
  String get status_delivered => 'Delivered';

  @override
  String get status_cancelled => 'Cancelled';

  @override
  String get profile_name => 'Name';

  @override
  String get profile_phone => 'Phone';

  @override
  String get profile_email => 'Email';

  @override
  String get profile_saved => 'Saved';

  @override
  String get profile_bonuses => 'Bonuses';

  @override
  String get profile_unverified => 'Not verified';

  @override
  String get settings_title => 'Settings';

  @override
  String get settings_language => 'Language';

  @override
  String get settings_theme => 'Theme';

  @override
  String get theme_light => 'Light';

  @override
  String get theme_dark => 'Dark';

  @override
  String get settings_addresses => 'My addresses';

  @override
  String get settings_notifications => 'Notifications';

  @override
  String get settings_about => 'About the app';

  @override
  String settings_version(String v) {
    return 'Version $v';
  }

  @override
  String get addr_title => 'My addresses';

  @override
  String get addr_add => 'Add address';

  @override
  String get addr_label => 'Label';

  @override
  String get addr_label_hint => 'Home, Work...';

  @override
  String get addr_text => 'Address';

  @override
  String get addr_text_hint => 'District, street, house number';

  @override
  String get addr_default => 'Make default';

  @override
  String get addr_empty => 'No addresses yet';

  @override
  String get addr_delete_confirm => 'Delete this address?';

  @override
  String get addr_saved => 'Address saved';

  @override
  String get addr_deleted => 'Address deleted';

  @override
  String get notif_title => 'Notifications';

  @override
  String get notif_empty => 'No notifications';
}
