import 'dart:async';

import 'package:socket_io_client/socket_io_client.dart' as io;

import '../core/api_client.dart';
import '../core/env.dart';

/// Real-time: buyurtma holati va yangi bildirishnomalar.
/// Token muddati o'tgan bo'lsa — bir marta refresh qilib qayta ulanadi.
class SocketService {
  io.Socket? _socket;
  int _retryCount = 0;

  final _orderStatus = StreamController<Map<String, dynamic>>.broadcast();
  final _notification = StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get orderStatus => _orderStatus.stream;
  Stream<Map<String, dynamic>> get notification => _notification.stream;

  void connect() {
    final token = ApiClient.instance.accessToken;
    if (token == null) return;

    _socket?.dispose();
    final socket = io.io(
      Env.socketBase,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .disableAutoConnect()
          .build(),
    );
    _socket = socket;

    socket.onConnect((_) => _retryCount = 0);

    socket.on('order:status', (data) {
      if (data is Map) {
        _orderStatus.add(Map<String, dynamic>.from(data));
      }
    });

    socket.on('notification:new', (data) {
      if (data is Map) {
        _notification.add(Map<String, dynamic>.from(data));
      }
    });

    socket.onConnectError((_) async {
      // Token eskirgan bo'lishi mumkin — bir marta yangilab, qayta ulanish.
      if (_retryCount >= 1) return;
      _retryCount++;
      final ok = await ApiClient.instance.tryRefresh();
      if (ok) {
        socket.dispose();
        connect();
      }
    });

    socket.connect();
  }

  void disconnect() {
    _socket?.dispose();
    _socket = null;
    _retryCount = 0;
  }
}
