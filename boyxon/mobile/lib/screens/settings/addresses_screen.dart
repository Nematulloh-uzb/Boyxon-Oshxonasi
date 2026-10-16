import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api_client.dart';
import '../../core/app_theme.dart';
import '../../l10n/app_localizations.dart';
import '../../models/models.dart';
import '../../services/auth_service.dart';
import '../../widgets/address_form_sheet.dart';
import '../../widgets/state_views.dart';

class AddressesScreen extends StatefulWidget {
  const AddressesScreen({super.key});

  @override
  State<AddressesScreen> createState() => _AddressesScreenState();
}

class _AddressesScreenState extends State<AddressesScreen> {
  final _api = ApiClient.instance;
  bool _busy = false;

  List<Address> get _addresses =>
      context.watch<AuthService>().user?.addresses ?? const [];

  Future<void> _add() async {
    final l = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final auth = context.read<AuthService>();

    final address = await showAddressFormSheet(context);
    if (address == null || !mounted) return;

    setState(() => _busy = true);
    try {
      await _api.dio.post('/users/me/addresses', data: address.toJson());
      await auth.reloadMe();
      messenger.showSnackBar(SnackBar(content: Text(l.addr_saved)));
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(errorText(e, l))));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _edit(Address address) async {
    final l = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final auth = context.read<AuthService>();

    final updated = await showAddressFormSheet(context, initial: address);
    if (updated == null || !mounted || updated.id == null) return;

    setState(() => _busy = true);
    try {
      await _api.dio.patch('/users/me/addresses/${updated.id}', data: updated.toJson());
      await auth.reloadMe();
      messenger.showSnackBar(SnackBar(content: Text(l.addr_saved)));
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(errorText(e, l))));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _delete(Address address) async {
    final l = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final auth = context.read<AuthService>();
    if (address.id == null) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        content: Text(l.addr_delete_confirm),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l.common_cancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: context.c.danger),
            child: Text(l.common_delete),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    setState(() => _busy = true);
    try {
      await _api.dio.delete('/users/me/addresses/${address.id}');
      await auth.reloadMe();
      messenger.showSnackBar(SnackBar(content: Text(l.addr_deleted)));
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(errorText(e, l))));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _setDefault(Address address) async {
    final l = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final auth = context.read<AuthService>();
    if (address.id == null || address.isDefault) return;

    try {
      await _api.dio.patch('/users/me/addresses/${address.id}', data: {'isDefault': true});
      await auth.reloadMe();
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(errorText(e, l))));
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;
    final addresses = _addresses;

    return Scaffold(
      appBar: AppBar(
        title: Text(l.addr_title),
        actions: [
          IconButton(
            tooltip: l.addr_add,
            icon: const Icon(Icons.add_rounded),
            onPressed: _busy ? null : _add,
          ),
        ],
      ),
      body: SafeArea(
        child: addresses.isEmpty
            ? EmptyView(
                icon: Icons.location_off_outlined,
                title: l.addr_empty,
                action: FilledButton(
                  onPressed: _busy ? null : _add,
                  style: FilledButton.styleFrom(
                    minimumSize: const Size(200, 48),
                    padding: const EdgeInsets.symmetric(horizontal: 28),
                  ),
                  child: Text(l.addr_add),
                ),
              )
            : ListView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                children: [
                  for (final address in addresses)
                    Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      decoration: BoxDecoration(
                        color: c.surface,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(
                          color: address.isDefault
                              ? c.primary.withValues(alpha: 0.5)
                              : c.line.withValues(alpha: 0.6),
                        ),
                      ),
                      child: ListTile(
                        leading: Icon(
                          address.isDefault
                              ? Icons.radio_button_checked_rounded
                              : Icons.radio_button_off_rounded,
                          color: c.primary,
                        ),
                        title: Text(
                          address.label,
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: c.fg,
                          ),
                        ),
                        subtitle: Text(
                          address.address,
                          style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: c.subtle),
                        ),
                        onTap: () => _setDefault(address),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: Icon(Icons.edit_outlined, size: 20, color: c.subtle),
                              onPressed: _busy ? null : () => _edit(address),
                            ),
                            IconButton(
                              icon: Icon(Icons.delete_outline_rounded, size: 20, color: c.danger),
                              onPressed: _busy ? null : () => _delete(address),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
      ),
    );
  }
}
