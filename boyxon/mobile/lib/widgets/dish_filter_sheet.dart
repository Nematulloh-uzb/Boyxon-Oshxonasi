import 'package:flutter/material.dart';

import '../core/app_theme.dart';
import '../l10n/app_localizations.dart';
import 'ui_kit.dart';

/// Filtr qiymatlari — web `DishFilterValues` bilan bir xil parametrlar.
class DishFilterValues {
  const DishFilterValues({this.minPrice, this.maxPrice, this.rating, this.tags, this.sort});

  final int? minPrice;
  final int? maxPrice;
  final double? rating;
  final String? tags;
  final String? sort;

  bool get isEmpty =>
      minPrice == null &&
      maxPrice == null &&
      rating == null &&
      (tags == null || tags!.isEmpty) &&
      sort == null;
}

/// Web `DishFilterSheet` bilan 1:1: narx, reyting, teglar, saralash.
Future<DishFilterValues?> showDishFilterSheet(BuildContext context, DishFilterValues current) {
  return showModalBottomSheet<DishFilterValues>(
    context: context,
    isScrollControlled: true,
    builder: (_) => _DishFilterSheet(initial: current),
  );
}

class _DishFilterSheet extends StatefulWidget {
  const _DishFilterSheet({required this.initial});

  final DishFilterValues initial;

  @override
  State<_DishFilterSheet> createState() => _DishFilterSheetState();
}

class _DishFilterSheetState extends State<_DishFilterSheet> {
  late final TextEditingController _minCtrl;
  late final TextEditingController _maxCtrl;
  late double? _rating;
  late Set<String> _tags;
  late String? _sort;

  @override
  void initState() {
    super.initState();
    _minCtrl = TextEditingController(text: widget.initial.minPrice?.toString() ?? '');
    _maxCtrl = TextEditingController(text: widget.initial.maxPrice?.toString() ?? '');
    _rating = widget.initial.rating;
    _tags = (widget.initial.tags ?? '').split(',').where((t) => t.isNotEmpty).toSet();
    _sort = widget.initial.sort;
  }

  @override
  void dispose() {
    _minCtrl.dispose();
    _maxCtrl.dispose();
    super.dispose();
  }

  void _reset() {
    setState(() {
      _minCtrl.clear();
      _maxCtrl.clear();
      _rating = null;
      _tags = {};
      _sort = null;
    });
  }

  void _apply() {
    final min = int.tryParse(_minCtrl.text.trim());
    final max = int.tryParse(_maxCtrl.text.trim());
    Navigator.of(context).pop(
      DishFilterValues(
        minPrice: min,
        maxPrice: max,
        rating: _rating,
        tags: _tags.isEmpty ? null : _tags.join(','),
        sort: _sort,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;

    Widget sectionLabel(String text) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Text(
            text,
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: c.fgMuted,
            ),
          ),
        );

    Widget pickChip(String label, bool active, VoidCallback onTap) {
      return Material(
        color: active ? BoyxonPalette.primary50 : Colors.transparent,
        shape: StadiumBorder(side: BorderSide(color: active ? c.primary : c.line)),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            child: Text(
              label,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                color: active ? BoyxonPalette.primary700 : c.fg,
              ),
            ),
          ),
        ),
      );
    }

    Widget priceInput(TextEditingController ctrl, String hint) {
      return Expanded(
        child: SizedBox(
          height: 44,
          child: TextField(
            controller: ctrl,
            keyboardType: TextInputType.number,
            style: TextStyle(fontFamily: 'Inter', fontSize: 15, color: c.fg),
            decoration: InputDecoration(
              hintText: hint,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: c.line),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: c.line),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: c.primary),
              ),
            ),
          ),
        ),
      );
    }

    const ratings = [0.0, 4.0, 4.5, 4.7];
    final sorts = <(String, String)>[
      ('new', l.filter_sort_new),
      ('rating', l.filter_sort_rating),
      ('price_asc', l.filter_sort_price_asc),
      ('price_desc', l.filter_sort_price_desc),
      ('popular', l.filter_sort_popular),
    ];
    final tags = <(String, String)>[
      ('vegetarian', l.dish_diet),
      ('spicy', l.dish_spicy),
      ('top', l.dish_top),
      ('new', l.dish_new),
    ];

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Sheet sarlavhasi (web Sheet: title + yopish).
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 12, 4),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      l.filter_title,
                      style: TextStyle(
                        fontFamily: 'Epilogue',
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: c.fg,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: Icon(Icons.close_rounded, size: 22, color: c.subtle),
                  ),
                ],
              ),
            ),
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    sectionLabel(l.filter_price),
                    Row(children: [priceInput(_minCtrl, l.filter_from), const SizedBox(width: 8), priceInput(_maxCtrl, l.filter_to)]),
                    const SizedBox(height: 20),
                    sectionLabel(l.filter_rating),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: ratings.map((r) {
                        final active = r == 0 ? _rating == null : _rating == r;
                        return pickChip(
                          r == 0 ? l.filter_all : '${r.toStringAsFixed(r == r.roundToDouble() ? 0 : 1)}+',
                          active,
                          () => setState(() => _rating = r == 0 ? null : r),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),
                    sectionLabel(l.filter_tags),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: tags.map((t) {
                        final active = _tags.contains(t.$1);
                        return pickChip(t.$2, active, () {
                          setState(() {
                            if (active) {
                              _tags.remove(t.$1);
                            } else {
                              _tags.add(t.$1);
                            }
                          });
                        });
                      }).toList(),
                    ),
                    const SizedBox(height: 20),
                    sectionLabel(l.filter_sort),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: sorts.map((s) {
                        final active = _sort == s.$1;
                        return pickChip(s.$2, active, () => setState(() => _sort = s.$1));
                      }).toList(),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
              child: Row(
                children: [
                  Expanded(child: OutlinePill(label: l.filter_reset, onPressed: _reset)),
                  const SizedBox(width: 12),
                  Expanded(child: GradientButton(label: l.filter_apply, onPressed: _apply)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
