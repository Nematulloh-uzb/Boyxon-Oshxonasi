import 'package:flutter/material.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:provider/provider.dart';

import '../../core/api_client.dart';
import '../../core/app_theme.dart';
import '../../core/formatters.dart';
import '../../l10n/app_localizations.dart';
import '../../models/models.dart';
import '../../services/auth_service.dart';
import '../../services/settings_service.dart';
import '../../widgets/state_views.dart';
import 'addresses_screen.dart';
import 'notifications_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _api = ApiClient.instance;

  String? _version;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _loadVersion();
  }

  Future<void> _loadVersion() async {
    try {
      final info = await PackageInfo.fromPlatform();
      if (mounted) setState(() => _version = '${info.version}+${info.buildNumber}');
    } catch (_) {/* ignore */}
  }

  Future<void> _editProfile() async {
    final l = AppLocalizations.of(context);
    final auth = context.read<AuthService>();
    final user = auth.user;
    if (user == null) return;

    final nameCtrl = TextEditingController(text: user.name);
    final phoneCtrl = TextEditingController(text: user.phone ?? '');

    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(sheetContext).viewInsets.bottom),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(l.profile_edit, style: Theme.of(sheetContext).textTheme.titleLarge),
                const SizedBox(height: 16),
                TextField(
                  controller: nameCtrl,
                  decoration: InputDecoration(labelText: l.auth_name),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(labelText: l.profile_phone),
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: () {
                    if (nameCtrl.text.trim().isEmpty) return;
                    Navigator.of(sheetContext).pop(true);
                  },
                  child: Text(l.common_save),
                ),
              ],
            ),
          ),
        ),
      ),
    );

    if (saved != true || !mounted) return;
    final messenger = ScaffoldMessenger.of(context);
    try {
      final res = await _api.dio.patch('/users/me', data: {
        'name': nameCtrl.text.trim(),
        'phone': phoneCtrl.text.trim(),
      });
      final updated = User.fromJson((res.data as Map)['data'] as Map<String, dynamic>);
      auth.setUser(updated);
      messenger.showSnackBar(SnackBar(content: Text(l.profile_saved)));
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(errorText(e, l))));
    }
  }

  Future<void> _resendVerification() async {
    final l = AppLocalizations.of(context);
    final auth = context.read<AuthService>();
    final messenger = ScaffoldMessenger.of(context);
    try {
      await auth.resendVerification();
      messenger.showSnackBar(SnackBar(content: Text(l.auth_verify_sent)));
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(errorText(e, l))));
    }
  }

  Future<void> _logout({required bool all}) async {
    final l = AppLocalizations.of(context);
    final auth = context.read<AuthService>();
    final messenger = ScaffoldMessenger.of(context);

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        content: Text(l.auth_logout_confirm),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l.common_cancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: context.c.danger),
            child: Text(l.auth_logout),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    setState(() => _busy = true);
    if (all) {
      await auth.logoutAll();
    } else {
      await auth.logout();
    }
    if (!mounted) return;
    setState(() => _busy = false);
    messenger.showSnackBar(SnackBar(content: Text(l.auth_logged_out)));
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;
    final auth = context.watch<AuthService>();
    final settings = context.watch<SettingsService>();
    final user = auth.user;

    if (user == null) return const SizedBox.shrink();

    return Scaffold(
      appBar: AppBar(title: Text(l.settings_title)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            // Profil kartasi
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: c.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: c.line.withValues(alpha: 0.6)),
              ),
              child: Row(
                children: [
                  AvatarImage(url: user.avatar, size: 58),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 3),
                        Text(
                          user.email,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: c.subtle),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(Icons.stars_rounded, size: 16, color: c.accent),
                            const SizedBox(width: 4),
                            Text(
                              formatNumber(user.bonusBalance),
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: c.accent,
                              ),
                            ),
                            if (!user.emailVerified) ...[
                              const SizedBox(width: 10),
                              StatusBadge(label: l.profile_unverified, color: c.danger),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: Icon(Icons.edit_outlined, size: 20, color: c.subtle),
                    onPressed: _editProfile,
                  ),
                ],
              ),
            ),

            // Email tasdiqlash banneri
            if (!user.emailVerified)
              Container(
                margin: const EdgeInsets.only(top: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: c.danger.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: c.danger.withValues(alpha: 0.25)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.mark_email_unread_outlined, size: 18, color: c.danger),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            l.auth_verify_required,
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 13,
                              height: 1.4,
                              color: c.danger,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: TextButton(
                        onPressed: _resendVerification,
                        child: Text(l.auth_verify_resend),
                      ),
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 16),

            // Til
            _tileCard(
              c,
              icon: Icons.language_rounded,
              title: l.settings_language,
              child: Wrap(
                spacing: 8,
                children: [
                  for (final (code, label) in [
                    ('uz', "O'zbekcha"),
                    ('ru', 'Русский'),
                    ('en', 'English'),
                  ])
                    ChoiceChip(
                      label: Text(label),
                      selected: settings.languageCode == code,
                      showCheckmark: false,
                      selectedColor: c.primary,
                      labelStyle: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: settings.languageCode == code ? Colors.white : c.fg,
                      ),
                      onSelected: (_) => settings.setLanguage(code),
                    ),
                ],
              ),
            ),

            // Mavzu
            _tileCard(
              c,
              icon: Icons.contrast_rounded,
              title: l.settings_theme,
              child: Wrap(
                spacing: 8,
                children: [
                  ChoiceChip(
                    label: Text(l.theme_light),
                    selected: settings.themeMode == ThemeMode.light,
                    showCheckmark: false,
                    selectedColor: c.primary,
                    labelStyle: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: settings.themeMode == ThemeMode.light ? Colors.white : c.fg,
                    ),
                    onSelected: (_) => settings.setThemeMode(ThemeMode.light),
                  ),
                  ChoiceChip(
                    label: Text(l.theme_dark),
                    selected: settings.themeMode == ThemeMode.dark,
                    showCheckmark: false,
                    selectedColor: c.primary,
                    labelStyle: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: settings.themeMode == ThemeMode.dark ? Colors.white : c.fg,
                    ),
                    onSelected: (_) => settings.setThemeMode(ThemeMode.dark),
                  ),
                ],
              ),
            ),

            // Manzillar
            _navTile(
              c,
              icon: Icons.location_on_outlined,
              title: l.settings_addresses,
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const AddressesScreen()),
              ),
            ),

            // Bildirishnomalar
            _navTile(
              c,
              icon: Icons.notifications_none_rounded,
              title: l.settings_notifications,
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const NotificationsScreen()),
              ),
            ),

            // Ilova haqida
            _navTile(
              c,
              icon: Icons.info_outline_rounded,
              title: l.settings_about,
              subtitle: _version == null ? null : l.settings_version(_version!),
              onTap: () => showAboutDialog(
                context: context,
                applicationName: 'Boyxon Oshxonasi',
                applicationVersion: _version,
                children: [
                  Text(
                    '© ${DateTime.now().year} Boyxon Oshxonasi',
                    style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: c.subtle),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 8),

            // Chiqish
            _navTile(
              c,
              icon: Icons.logout_rounded,
              title: l.auth_logout,
              iconColor: c.danger,
              onTap: _busy ? null : () => _logout(all: false),
            ),
            _navTile(
              c,
              icon: Icons.devices_other_rounded,
              title: l.auth_logout_all,
              iconColor: c.danger,
              onTap: _busy ? null : () => _logout(all: true),
            ),
          ],
        ),
      ),
    );
  }

  Widget _tileCard(
    BoyxonColors c, {
    required IconData icon,
    required String title,
    required Widget child,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: c.line.withValues(alpha: 0.6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: c.primary),
              const SizedBox(width: 10),
              Text(title, style: Theme.of(context).textTheme.titleMedium),
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }

  Widget _navTile(
    BoyxonColors c, {
    required IconData icon,
    required String title,
    String? subtitle,
    Color? iconColor,
    VoidCallback? onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: c.line.withValues(alpha: 0.6)),
      ),
      child: ListTile(
        leading: Icon(icon, size: 22, color: iconColor ?? c.primary),
        title: Text(
          title,
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: iconColor ?? c.fg,
          ),
        ),
        subtitle: subtitle == null
            ? null
            : Text(
                subtitle,
                style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: c.subtle),
              ),
        trailing: Icon(Icons.chevron_right_rounded, size: 20, color: c.subtle),
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      ),
    );
  }
}
