import 'package:flutter/material.dart';

import '../core/app_theme.dart';

/// [- 2 +] miqdor tanlagich — web CartItem stepper bilan 1:1:
/// rounded-full border-ink-line, oq fon, h-8 w-8 tugmalar, w-6 soni.
class QuantityStepper extends StatelessWidget {
  const QuantityStepper({
    super.key,
    required this.value,
    required this.onChanged,
    this.compact = false,
  });

  final int value;
  final ValueChanged<int> onChanged;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final buttonSize = compact ? 28.0 : 32.0;
    final iconSize = compact ? 13.0 : 14.0;

    Widget button(IconData icon, VoidCallback onTap) {
      return InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: SizedBox(
          width: buttonSize,
          height: buttonSize,
          child: Icon(icon, size: iconSize, color: c.fgMuted),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: c.line),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          button(Icons.remove_rounded, () => onChanged(value - 1)),
          SizedBox(
            width: 24,
            child: Text(
              '$value',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: compact ? 13 : 14,
                fontWeight: FontWeight.w600,
                color: c.fg,
              ),
            ),
          ),
          button(Icons.add_rounded, () => onChanged(value + 1)),
        ],
      ),
    );
  }
}
