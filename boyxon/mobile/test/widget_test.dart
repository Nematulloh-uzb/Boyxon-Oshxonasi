import 'package:boyxon_mobile/core/config/app_config.dart';
import 'package:boyxon_mobile/core/utils/formatters.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Fmt.money - mingliklar bosh joy bilan ajratiladi', () {
    expect(Fmt.money(132000), "132 000 so'm");
    expect(Fmt.money(12000), "12 000 so'm");
  });

  test('AppConfig - sayt bilan bir xil qiymatlar', () {
    expect(AppConfig.freeDeliveryFrom, 150000);
    expect(AppConfig.deliveryFee, 12000);
  });
}