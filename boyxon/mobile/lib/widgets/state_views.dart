import 'dart:convert';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../core/app_theme.dart';
import '../l10n/app_localizations.dart';

/// Yuklanmoqda — markazda spinner.
class LoadingView extends StatelessWidget {
  const LoadingView({super.key});

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: SizedBox(
          width: 28,
          height: 28,
          child: CircularProgressIndicator(color: c.primary, strokeWidth: 3),
        ),
      ),
    );
  }
}

/// Xatolik — web'dagi `bg-danger/10` banner uslubida: xabar + "Qayta urinish".
class ErrorView extends StatelessWidget {
  const ErrorView({super.key, required this.message, required this.onRetry, required this.retryLabel});

  final String message;
  final VoidCallback onRetry;
  final String retryLabel;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: c.danger.withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                message,
                textAlign: TextAlign.center,
                style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.danger),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: onRetry,
                style: TextButton.styleFrom(foregroundColor: c.primaryDark),
                child: Text(retryLabel),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Bo'sh holat — web DishGrid/CartPage uslubi:
/// doira ichida ikonka + sarlavha (Epilogue) + tavsif + ixtiyoriy CTA.
class EmptyView extends StatelessWidget {
  const EmptyView({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.action,
    this.muted = false,
    this.titleSize = 18,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? action;

  /// `true` — doira foni placeholder-bg (savat bo'sh holati), aks holda surface-raised.
  final bool muted;
  final double titleSize;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final size = muted ? 80.0 : 96.0;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                color: muted ? c.placeholderBg : c.surfaceRaised,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: size * 0.45, color: c.subtle),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Epilogue',
                fontSize: titleSize,
                fontWeight: FontWeight.w700,
                color: c.fg,
              ),
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 4),
              Text(
                subtitle!,
                textAlign: TextAlign.center,
                style: TextStyle(fontFamily: 'Inter', fontSize: 13, height: 1.4, color: c.subtle),
              ),
            ],
            if (action != null) ...[
              const SizedBox(height: 24),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}

/// Taom rasmi — xato/bo'sh holatda placeholder (bg-placeholder + pichoq-sanchqiq).
class DishImage extends StatelessWidget {
  const DishImage({
    super.key,
    required this.url,
    this.fit = BoxFit.cover,
    this.radius,
    this.width,
    this.height,
  });

  final String? url;
  final BoxFit fit;
  final BorderRadius? radius;
  final double? width;
  final double? height;

  Widget _placeholder(BuildContext context) {
    final c = context.c;
    return Container(
      width: width,
      height: height,
      color: c.placeholderBg,
      alignment: Alignment.center,
      child: Icon(Icons.restaurant_rounded, size: 30, color: c.subtle.withValues(alpha: 0.7)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final image = url == null || url!.isEmpty
        ? _placeholder(context)
        : CachedNetworkImage(
            imageUrl: url!,
            fit: fit,
            width: width,
            height: height,
            placeholder: (context, _) => _placeholder(context),
            errorWidget: (context, _, _) => _placeholder(context),
          );

    if (radius == null) return image;
    return ClipRRect(borderRadius: radius!, child: image);
  }
}

/// Web `DishPlaceholder`: aspect-[4/3] + bg-muted + ikonka + "Rasm yo'q".
class DishPlaceholder extends StatelessWidget {
  const DishPlaceholder({super.key});

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final l = AppLocalizations.of(context);
    return AspectRatio(
      aspectRatio: 4 / 3,
      child: Container(
        color: c.placeholderBg,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.restaurant_rounded, size: 40, color: c.subtle),
            const SizedBox(height: 6),
            Text(
              l.dish_no_image,
              style: TextStyle(fontFamily: 'Inter', fontSize: 11, color: c.subtle),
            ),
          ],
        ),
      ),
    );
  }
}

/// Avatar — data URL (base64) yoki http(s) manzil.
class AvatarImage extends StatelessWidget {
  const AvatarImage({super.key, required this.url, this.size = 48});

  final String? url;
  final double size;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final value = url;
    Widget child;
    if (value != null && value.startsWith('data:image')) {
      try {
        final bytes = base64Decode(value.substring(value.indexOf(',') + 1));
        child = Image.memory(bytes, fit: BoxFit.cover, width: size, height: size);
      } catch (_) {
        child = Icon(Icons.person_rounded, size: size * 0.6, color: c.subtle);
      }
    } else if (value != null && value.startsWith('http')) {
      child = CachedNetworkImage(
        imageUrl: value,
        fit: BoxFit.cover,
        width: size,
        height: size,
        placeholder: (_, _) => Icon(Icons.person_rounded, size: size * 0.6, color: c.subtle),
        errorWidget: (_, _, _) => Icon(Icons.person_rounded, size: size * 0.6, color: c.subtle),
      );
    } else {
      child = Icon(Icons.person_rounded, size: size * 0.6, color: c.subtle);
    }

    return Container(
      width: size,
      height: size,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: c.surfaceRaised,
        shape: BoxShape.circle,
        border: Border.all(color: c.line),
      ),
      child: child,
    );
  }
}

/// Kichik status badge (rangli fon + matn) — web status chip uslubi.
class StatusBadge extends StatelessWidget {
  const StatusBadge({
    super.key,
    required this.label,
    required this.background,
    required this.foreground,
    this.fontSize = 12,
  });

  final String label;
  final Color background;
  final Color foreground;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontFamily: 'Inter',
          fontSize: fontSize,
          fontWeight: FontWeight.w600,
          color: foreground,
        ),
      ),
    );
  }
}
