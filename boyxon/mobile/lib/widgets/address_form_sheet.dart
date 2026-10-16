import 'package:flutter/material.dart';

import '../core/app_theme.dart';
import '../l10n/app_localizations.dart';
import '../models/models.dart';
import 'ui_kit.dart';

/// Manzil qo'shish/tahrirlash uchun bottom sheet (web inline forma uslubida).
/// Saqlansa — yangi `Address` qaytaradi, aks holda `null`.
Future<Address?> showAddressFormSheet(BuildContext context, {Address? initial}) {
  return showModalBottomSheet<Address>(
    context: context,
    isScrollControlled: true,
    builder: (context) => Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: _AddressForm(initial: initial),
    ),
  );
}

class _AddressForm extends StatefulWidget {
  const _AddressForm({this.initial});

  final Address? initial;

  @override
  State<_AddressForm> createState() => _AddressFormState();
}

class _AddressFormState extends State<_AddressForm> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _labelCtrl;
  late final TextEditingController _addressCtrl;
  late bool _isDefault;

  @override
  void initState() {
    super.initState();
    _labelCtrl = TextEditingController(text: widget.initial?.label ?? '');
    _addressCtrl = TextEditingController(text: widget.initial?.address ?? '');
    _isDefault = widget.initial?.isDefault ?? false;
  }

  @override
  void dispose() {
    _labelCtrl.dispose();
    _addressCtrl.dispose();
    super.dispose();
  }

  void _save() {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    Navigator.of(context).pop(
      Address(
        id: widget.initial?.id,
        label: _labelCtrl.text.trim(),
        address: _addressCtrl.text.trim(),
        isDefault: _isDefault,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;

    OutlineInputBorder border(Color color) => OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: color),
        );

    InputDecoration decoration(String label, String hint) => InputDecoration(
          labelText: label,
          hintText: hint,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          border: border(c.line),
          enabledBorder: border(c.line),
          focusedBorder: border(c.primary),
        );

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                widget.initial == null ? l.addr_add : l.addr_title,
                style: TextStyle(
                  fontFamily: 'Epilogue',
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: c.fg,
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _labelCtrl,
                textInputAction: TextInputAction.next,
                maxLength: 50,
                style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.fg),
                decoration: decoration(l.addr_label, l.addr_label_hint)
                    .copyWith(counterText: ''),
                validator: (v) => (v == null || v.trim().isEmpty) ? l.common_error : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _addressCtrl,
                textInputAction: TextInputAction.next,
                maxLines: 2,
                maxLength: 300,
                style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.fg),
                decoration: decoration(l.addr_text, l.addr_text_hint)
                    .copyWith(counterText: ''),
                validator: (v) => (v == null || v.trim().isEmpty) ? l.common_error : null,
              ),
              const SizedBox(height: 12),
              GestureDetector(
                onTap: () => setState(() => _isDefault = !_isDefault),
                behavior: HitTestBehavior.opaque,
                child: Row(
                  children: [
                    Container(
                      width: 18,
                      height: 18,
                      decoration: BoxDecoration(
                        color: _isDefault ? c.primary : Colors.transparent,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: _isDefault ? c.primary : c.lineStrong),
                      ),
                      child: _isDefault
                          ? const Icon(Icons.check_rounded, size: 14, color: Colors.white)
                          : null,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      l.addr_default,
                      style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.fgMuted),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinePill(
                      label: l.common_cancel,
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: GradientButton(
                      label: l.common_save,
                      onPressed: _save,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
