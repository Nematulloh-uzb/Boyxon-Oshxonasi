import 'package:flutter/material.dart';

import '../core/app_theme.dart';
import '../l10n/app_localizations.dart';
import '../models/models.dart';

/// Manzil qo'shish/tahrirlash uchun bottom sheet.
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

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: c.line,
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                widget.initial == null ? l.addr_add : l.addr_title,
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _labelCtrl,
                textInputAction: TextInputAction.next,
                decoration: InputDecoration(
                  labelText: l.addr_label,
                  hintText: l.addr_label_hint,
                ),
                validator: (v) => (v == null || v.trim().isEmpty) ? l.common_error : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _addressCtrl,
                textInputAction: TextInputAction.next,
                maxLines: 2,
                decoration: InputDecoration(
                  labelText: l.addr_text,
                  hintText: l.addr_text_hint,
                ),
                validator: (v) => (v == null || v.trim().isEmpty) ? l.common_error : null,
              ),
              const SizedBox(height: 8),
              SwitchListTile(
                value: _isDefault,
                onChanged: (v) => setState(() => _isDefault = v),
                title: Text(l.addr_default),
                contentPadding: EdgeInsets.zero,
                activeThumbColor: c.primary,
              ),
              const SizedBox(height: 8),
              FilledButton(onPressed: _save, child: Text(l.common_save)),
            ],
          ),
        ),
      ),
    );
  }
}
