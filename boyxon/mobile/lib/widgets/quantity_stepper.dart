import 'package:flutter/material.dart';

import '../core/app_theme.dart';

/// [- 2 +] ko'rinishidagi miqdor tanlagich.
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
    final buttonSize = compact ? 30.0 : 34.0;

    Widget button(IconData icon, VoidCallback onTap) {
      return InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: SizedBox(
          width: buttonSize,
          height: buttonSize,
          child: Icon(icon, size: compact ? 16 : 18, color: c.fg),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: c.surfaceRaised,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: c.line),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 2),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          button(value <= 1 ? Icons.delete_outline_rounded : Icons.remove_rounded, () {
            onChanged(value - 1);
          }),
          SizedBox(
            width: compact ? 22 : 28,
            child: Text(
              '$value',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: compact ? 13 : 15,
                fontWeight: FontWeight.w700,
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
