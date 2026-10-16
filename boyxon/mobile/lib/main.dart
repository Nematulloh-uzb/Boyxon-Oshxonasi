import 'package:flutter/material.dart';

import 'app.dart';
import 'core/api_client.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiClient.instance.init();
  runApp(const BoyxonApp());
}
