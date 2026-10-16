import 'dart:convert';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../core/app_theme.dart';

/// Yuklanmoqda — markazda spinner.
class LoadingView extends StatelessWidget {
  const LoadingView({super.key});

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: CircularProgressIndicator(color: c.primary),
      ),
    );
  }
}

/// Xatolik — xabar + "Qayta urinish".
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
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: c.danger.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.wifi_off_rounded, size: 32, color: c.danger),
            ),
            const SizedBox(height: 14),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 14),
            OutlinedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: Text(retryLabel),
            ),
          ],
        ),
      ),
    );
  }
}

/// Bo'sh holat — ikonka + sarlavha + ixtiyoriy tugma.
class EmptyView extends StatelessWidget {
  const EmptyView({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.action,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: c.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 36, color: c.primary),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 6),
              Text(
                subtitle!,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
            if (action != null) ...[
              const SizedBox(height: 18),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}

/// Taom rasmi — xato/bo'sh holatda placeholder (DESIGN.md: DishPlaceholder).
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
      color: c.surfaceRaised,
      alignment: Alignment.center,
      child: Icon(Icons.restaurant_rounded, size: 30, color: c.subtle.withValues(alpha: 0.6)),
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

/// Kichik status badge (rangli fon + matn).
class StatusBadge extends StatelessWidget {
  const StatusBadge({super.key, required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}
