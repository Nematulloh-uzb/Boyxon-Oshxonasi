import 'package:flutter/material.dart';

import '../core/app_theme.dart';

/// Web UI primitiv'larining Flutter ekvivalenti (DESIGN.md / client/src/components/ui).

// ---------------------------------------------------------------------------
// Tugmalar
// ---------------------------------------------------------------------------

enum GradientButtonSize { sm, md, lg }

/// Primary CTA — web `Button variant="primary"`:
/// gradient from-[#E67E22] to-[#F39C12], rounded-full, oq matn.
class GradientButton extends StatelessWidget {
  const GradientButton({
    super.key,
    required this.label,
    this.onPressed,
    this.size = GradientButtonSize.md,
    this.loading = false,
    this.expand = true,
    this.icon,
  });

  final String label;
  final VoidCallback? onPressed;
  final GradientButtonSize size;
  final bool loading;
  final bool expand;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null && !loading;
    final (height, padding, fontSize) = switch (size) {
      GradientButtonSize.sm => (36.0, 16.0, 14.0),
      GradientButtonSize.md => (48.0, 24.0, 15.0),
      GradientButtonSize.lg => (52.0, 32.0, 16.0),
    };

    final child = Container(
      height: height,
      padding: EdgeInsets.symmetric(horizontal: padding),
      alignment: Alignment.center,
      child: Row(
        mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (icon != null) ...[
            Icon(icon, size: fontSize + 4, color: Colors.white),
            const SizedBox(width: 8),
          ],
          Text(
            loading ? '...' : label,
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: fontSize,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );

    return Opacity(
      opacity: enabled ? 1 : 0.5,
      child: Material(
        color: Colors.transparent,
        shape: const StadiumBorder(),
        clipBehavior: Clip.antiAlias,
        child: Ink(
          decoration: const BoxDecoration(
            gradient: BoyxonPalette.gradient,
            borderRadius: BorderRadius.all(Radius.circular(999)),
          ),
          child: InkWell(
            onTap: enabled ? onPressed : null,
            child: child,
          ),
        ),
      ),
    );
  }
}

/// Outline tugma — web `Button variant="outline"`: border line-strong, text-fg.
class OutlinePill extends StatelessWidget {
  const OutlinePill({
    super.key,
    required this.label,
    this.onPressed,
    this.size = GradientButtonSize.md,
    this.expand = true,
    this.icon,
    this.foreground,
    this.borderColor,
  });

  final String label;
  final VoidCallback? onPressed;
  final GradientButtonSize size;
  final bool expand;
  final IconData? icon;
  final Color? foreground;
  final Color? borderColor;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final enabled = onPressed != null;
    final (height, padding, fontSize) = switch (size) {
      GradientButtonSize.sm => (36.0, 16.0, 14.0),
      GradientButtonSize.md => (48.0, 24.0, 15.0),
      GradientButtonSize.lg => (52.0, 32.0, 16.0),
    };
    final fg = foreground ?? c.fg;

    return Opacity(
      opacity: enabled ? 1 : 0.5,
      child: Material(
        color: Colors.transparent,
        shape: StadiumBorder(side: BorderSide(color: borderColor ?? c.lineStrong)),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: enabled ? onPressed : null,
          child: Container(
            height: height,
            padding: EdgeInsets.symmetric(horizontal: padding),
            alignment: Alignment.center,
            child: Row(
              mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null) ...[
                  Icon(icon, size: fontSize + 4, color: fg),
                  const SizedBox(width: 8),
                ],
                Text(
                  label,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: fontSize,
                    fontWeight: FontWeight.w600,
                    color: fg,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Badge / yorliqlar
// ---------------------------------------------------------------------------

enum BadgeTone { normal, success, danger, promo }

/// Web `Badge`: rounded-full px-2.5 py-0.5 text-xs font-semibold.
class BadgePill extends StatelessWidget {
  const BadgePill({super.key, required this.label, this.tone = BadgeTone.normal});

  final String label;
  final BadgeTone tone;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final (bg, fg) = switch (tone) {
      BadgeTone.normal => (c.surfaceRaised, c.fg),
      BadgeTone.success => (c.success.withValues(alpha: 0.10), c.success),
      BadgeTone.danger => (c.danger.withValues(alpha: 0.10), c.danger),
      BadgeTone.promo => (BoyxonPalette.primary100, BoyxonPalette.primary700),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
      child: Text(
        label,
        style: TextStyle(
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: FontWeight.w600,
          height: 1.35,
          color: fg,
        ),
      ),
    );
  }
}

/// Guruh sarlavhasi — web `SettingsGroup` sarlavhasi:
/// text-sm font-semibold uppercase tracking-wide text-ink-300.
class SectionLabel extends StatelessWidget {
  const SectionLabel(this.label, {super.key, this.padding = const EdgeInsets.fromLTRB(4, 0, 4, 8)});

  final String label;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Padding(
      padding: padding,
      child: Text(
        label.toUpperCase(),
        style: TextStyle(
          fontFamily: 'Inter',
          fontSize: 13,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.6,
          color: c.subtle,
        ),
      ),
    );
  }
}

/// 36x36 yumaloq icon plitka (settings qatorlari uchun):
/// bg-primary-50 text-primary-600, danger variantda bg-danger/10 text-danger.
class IconTile extends StatelessWidget {
  const IconTile(this.icon, {super.key, this.danger = false});

  final IconData icon;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final bg = danger ? c.danger.withValues(alpha: 0.10) : BoyxonPalette.primary50;
    final fg = danger ? c.danger : BoyxonPalette.primaryDark;
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
      child: Icon(icon, size: 19, color: fg),
    );
  }
}

// ---------------------------------------------------------------------------
// Karta / holatlar
// ---------------------------------------------------------------------------

/// Web `Card`: rounded-card(20) + border-ink-line/60 + bg-surface.
class CardBox extends StatelessWidget {
  const CardBox({super.key, required this.child, this.padding, this.radius = 20, this.onTap});

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final double radius;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final content = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: c.line.withValues(alpha: 0.6)),
      ),
      child: child,
    );
    if (onTap == null) return content;
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(radius),
      clipBehavior: Clip.antiAlias,
      child: InkWell(onTap: onTap, child: content),
    );
  }
}

/// Web `animate-pulse` skeleton bloki.
class SkeletonBox extends StatefulWidget {
  const SkeletonBox({
    super.key,
    this.width,
    this.height,
    this.radius = 16,
    this.shape = BoxShape.rectangle,
  });

  final double? width;
  final double? height;
  final double radius;
  final BoxShape shape;

  @override
  State<SkeletonBox> createState() => _SkeletonBoxState();
}

class _SkeletonBoxState extends State<SkeletonBox> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 900),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return FadeTransition(
      opacity: Tween(begin: 0.5, end: 1.0).animate(_ctrl),
      child: Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          color: c.surfaceRaised,
          shape: widget.shape,
          borderRadius: widget.shape == BoxShape.circle ? null : BorderRadius.circular(widget.radius),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Boshqa primitivlar
// ---------------------------------------------------------------------------

/// Reyting: yulduz (#FDAB12) + qiymat (text-xs font-semibold).
class StarRating extends StatelessWidget {
  const StarRating({super.key, required this.rating, this.iconSize = 14, this.fontSize = 12});

  final double rating;
  final double iconSize;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.star_rounded, size: iconSize, color: BoyxonPalette.star),
        const SizedBox(width: 3),
        Text(
          rating.toStringAsFixed(1),
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: fontSize,
            fontWeight: FontWeight.w600,
            color: c.fg,
          ),
        ),
      ],
    );
  }
}

/// Kategoriya ikonkasi — web CategoryChips'dagi lucide ikonkalar mappingi.
IconData categoryIcon(String? icon) {
  final key = (icon ?? '').toLowerCase();
  return switch (key) {
    'soup' || 'shorvalar' => Icons.ramen_dining_rounded,
    'cookingpot' || 'palov' || 'palovlar' => Icons.rice_bowl_rounded,
    'croissant' || 'samsa' => Icons.bakery_dining_rounded,
    'flame' || 'kabob' || 'kebab' || 'kaboblar' => Icons.local_fire_department_rounded,
    'salad' || 'salatlar' => Icons.eco_rounded,
    'cakeslice' || 'desert' || 'dessert' || 'shirinliklar' => Icons.cake_rounded,
    'cupsoda' || 'drink' || 'drinks' || 'ichimliklar' => Icons.local_drink_rounded,
    'wheat' || 'bread' || 'non' => Icons.breakfast_dining_rounded,
    'chicken' || 'drumstick' => Icons.kebab_dining_rounded,
    'fish' => Icons.set_meal_rounded,
    'icecream' || 'icecreamcone' => Icons.icecream_rounded,
    'pizza' => Icons.local_pizza_rounded,
    'chef' || 'chefhat' => Icons.restaurant_rounded,
    _ => Icons.grid_view_rounded,
  };
}

/// Silliq bosiladigan qator (ripple) — list elementlari uchun.
class TapRow extends StatelessWidget {
  const TapRow({
    super.key,
    required this.child,
    this.onTap,
    this.radius = 16,
    this.padding = EdgeInsets.zero,
  });

  final Widget child;
  final VoidCallback? onTap;
  final double radius;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(radius),
        child: Padding(padding: padding, child: child),
      ),
    );
  }
}
