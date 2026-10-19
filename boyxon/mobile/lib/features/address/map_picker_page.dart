import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:material_symbols_icons/symbols.dart';

import '../../core/i18n/app_i18n.dart';
import '../../data/services/geo_service.dart';
import '../../theme/app_text.dart';
import '../../theme/app_theme.dart';

/// Xaritadan tanlangan manzil natijasi (koordinatalar + matn).
class MapPickResult {
  const MapPickResult({required this.lat, required this.lng, required this.address});

  final double lat;
  final double lng;
  final String address;
}

/// To'liq ekranli xarita: markazdagi pin ostidagi joyni tanlash.
///
/// Manzil matni Nominatim (OSM) orqali avtomatik to'ldiriladi va qo'lda
/// tahrirlanishi mumkin. "Mening joylashuvim" tugmasi GPS orqali markazni
/// foydalanuvchi turgan joyga suradi.
class MapPickerPage extends StatefulWidget {
  const MapPickerPage({super.key});

  @override
  State<MapPickerPage> createState() => _MapPickerPageState();
}

class _MapPickerPageState extends State<MapPickerPage> {
  static const _tashkent = LatLng(41.3111, 69.2797);
  static const _minDistanceM = 8.0;

  final _mapCtrl = MapController();
  final _addrCtrl = TextEditingController();
  final _distance = const Distance();

  Timer? _debounce;
  LatLng? _lastQueried;
  bool _geocoding = false;
  bool _locating = false;

  @override
  void initState() {
    super.initState();
    // Xarita chizilgach birinchi marta markazdagi manzilni aniqlaymiz.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _scheduleGeocode(force: true);
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _addrCtrl.dispose();
    _mapCtrl.dispose();
    super.dispose();
  }

  LatLng get _center => _mapCtrl.camera.center;

  /// Xarita to'xtagach 650 ms kutib manzilni aniqlaydi (Nominatim'ni ortiqcha
  /// so'rovlar bilan yuklamaslik uchun debounce + 8 m dan yaqin nuqtalarni tashlab yuborish).
  void _scheduleGeocode({bool force = false}) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 650), () async {
      if (!mounted) return;
      final c = _center;
      final last = _lastQueried;
      if (!force && last != null && _distance.as(LengthUnit.Meter, last, c) < _minDistanceM) {
        return;
      }
      _lastQueried = c;
      setState(() => _geocoding = true);
      final text = await GeoService.I.reverse(
        c.latitude,
        c.longitude,
        lang: AppI18n.I.locale.value,
      );
      if (!mounted) return;
      setState(() => _geocoding = false);
      if (text != null && text.isNotEmpty) _addrCtrl.text = text;
    });
  }

  Future<void> _locateMe() async {
    if (_locating) return;
    setState(() => _locating = true);
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!mounted) return;
      if (!serviceEnabled) {
        _snack(context.tr('map.geo_off'));
        return;
      }
      var perm = await Geolocator.checkPermission();
      if (!mounted) return;
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
        if (!mounted) return;
      }
      if (perm == LocationPermission.denied || perm == LocationPermission.deniedForever) {
        _snack(context.tr('map.geo_denied'));
        return;
      }
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 15),
        ),
      );
      if (!mounted) return;
      _mapCtrl.move(LatLng(pos.latitude, pos.longitude), 16.5);
      _scheduleGeocode(force: true);
    } catch (_) {
      if (mounted) _snack(context.tr('map.geo_error'));
    } finally {
      if (mounted) setState(() => _locating = false);
    }
  }

  void _snack(String text) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }

  void _confirm() {
    final address = _addrCtrl.text.trim();
    if (address.isEmpty) return;
    final c = _center;
    Navigator.pop(
      context,
      MapPickResult(lat: c.latitude, lng: c.longitude, address: address),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    return Scaffold(
      backgroundColor: p.bg,
      appBar: AppBar(
        backgroundColor: p.bg,
        foregroundColor: p.onSurface,
        elevation: 0,
        title: Text(context.tr('map.title'), style: AppText.headlineSm),
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapCtrl,
            options: MapOptions(
              initialCenter: _tashkent,
              initialZoom: 15,
              minZoom: 4,
              maxZoom: 19,
              onPositionChanged: (_, __) => _scheduleGeocode(),
              interactionOptions: const InteractionOptions(
                flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
              ),
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'uz.boyxon.mobile',
                maxZoom: 19,
              ),
              SimpleAttributionWidget(
                alignment: Alignment.topLeft,
                source: Text(
                  '© OpenStreetMap',
                  style: AppText.labelSm.copyWith(color: p.onSurfaceVariant),
                ),
                backgroundColor: p.card.withValues(alpha: 0.85),
              ),
            ],
          ),
          // Markazdagi pin: xarita harakatlanadi, pin joyida turadi.
          Positioned.fill(
            child: IgnorePointer(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 46),
                  child: Icon(
                    Symbols.location_on,
                    size: 46,
                    color: p.primary,
                    shadows: [
                      Shadow(
                        color: Colors.black.withValues(alpha: 0.35),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          // GPS orqali markazni aniqlash.
          Positioned(
            top: 12,
            right: 12,
            child: Tooltip(
              message: context.tr('map.my_location'),
              child: Material(
                color: p.card,
                elevation: 3,
                shape: const CircleBorder(),
                child: InkWell(
                  customBorder: const CircleBorder(),
                  onTap: _locateMe,
                  child: SizedBox(
                    width: 44,
                    height: 44,
                    child: _locating
                        ? Padding(
                            padding: const EdgeInsets.all(12),
                            child: CircularProgressIndicator(strokeWidth: 2, color: p.primary),
                          )
                        : Icon(Symbols.my_location, size: 21, color: p.primary),
                  ),
                ),
              ),
            ),
          ),
          // Pastki karta: manzil matni + tasdiqlash.
          Positioned(
            left: 12,
            right: 12,
            bottom: 12,
            child: SafeArea(
              top: false,
              child: Container(
                padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
                decoration: BoxDecoration(
                  color: p.card,
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(color: p.shadow, blurRadius: 18, offset: const Offset(0, 6)),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        Icon(Symbols.location_on, size: 18, color: p.primary),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            context.tr('map.pin_hint'),
                            style: AppText.labelMd.copyWith(color: p.onSurfaceVariant),
                          ),
                        ),
                        if (_geocoding)
                          SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2, color: p.primary),
                          ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _addrCtrl,
                      minLines: 1,
                      maxLines: 2,
                      style: AppText.bodyMd.copyWith(color: p.onSurface),
                      decoration: InputDecoration(
                        hintText: context.tr('settings.address_text_ph'),
                      ),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      height: 46,
                      child: ValueListenableBuilder<TextEditingValue>(
                        valueListenable: _addrCtrl,
                        builder: (_, value, __) => FilledButton(
                          onPressed: value.text.trim().isEmpty ? null : _confirm,
                          child: Text(
                            context.tr('map.confirm'),
                            style: AppText.labelLg.copyWith(color: p.onPrimary),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
