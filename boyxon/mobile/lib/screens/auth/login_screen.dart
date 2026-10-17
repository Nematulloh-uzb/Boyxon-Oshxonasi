import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api_client.dart';
import '../../core/app_theme.dart';
import '../../l10n/app_localizations.dart';
import '../../services/auth_service.dart';
import '../../widgets/ui_kit.dart';
import 'forgot_password_screen.dart';

/// Kirish / ro'yxatdan o'tish — web `AuthPage` bilan 1:1:
/// yuqorida gradient brend blok, pastda tablar + forma.
/// `embedded: true` — Profil tab ichida (yopish tugmasiz).
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, this.embedded = false});

  final bool embedded;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();

  bool _registerMode = false;
  bool _busy = false;
  bool _obscure = true;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final l = AppLocalizations.of(context);
    if (!(_formKey.currentState?.validate() ?? false)) return;
    final auth = context.read<AuthService>();
    final navigator = Navigator.of(context);
    final messenger = ScaffoldMessenger.of(context);

    setState(() => _busy = true);

    try {
      if (_registerMode) {
        final loggedIn = await auth.register(
          name: _nameCtrl.text,
          email: _emailCtrl.text,
          password: _passCtrl.text,
        );
        if (!mounted) return;
        if (!loggedIn) {
          // Email tasdiqlash talab qilinadi — login rejimiga qaytamiz.
          setState(() => _registerMode = false);
          messenger.showSnackBar(SnackBar(content: Text(l.auth_verify_sent)));
        } else if (!widget.embedded && navigator.canPop()) {
          navigator.pop(true);
        }
      } else {
        await auth.login(_emailCtrl.text, _passCtrl.text);
        if (!mounted) return;
        messenger.showSnackBar(SnackBar(content: Text(l.auth_welcome)));
        if (!widget.embedded && navigator.canPop()) navigator.pop(true);
      }
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(errorText(e, l))));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final c = context.c;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Brend bloki (web chap panel).
              Container(
                padding: const EdgeInsets.all(28),
                decoration: const BoxDecoration(gradient: BoyxonPalette.heroGradient),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Expanded(
                          child: Text(
                            'Boyxon Oshxonasi',
                            style: TextStyle(
                              fontFamily: 'Epilogue',
                              fontSize: 24,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        if (!widget.embedded)
                          InkWell(
                            onTap: () => Navigator.of(context).maybePop(),
                            customBorder: const CircleBorder(),
                            child: const Padding(
                              padding: EdgeInsets.all(4),
                              child: Icon(Icons.close_rounded, size: 22, color: Colors.white),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    Text(
                      '© ${DateTime.now().year} Boyxon',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 14,
                        color: Colors.white.withValues(alpha: 0.7),
                      ),
                    ),
                  ],
                ),
              ),

              // Forma.
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Tab almashtirgich (web: rounded-2xl bg-muted p-1).
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: c.placeholderBg,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          children: [
                            _tab(l.auth_login, !_registerMode, () {
                              setState(() => _registerMode = false);
                            }),
                            const SizedBox(width: 4),
                            _tab(l.auth_register, _registerMode, () {
                              setState(() => _registerMode = true);
                            }),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      if (_registerMode) ...[
                        TextFormField(
                          controller: _nameCtrl,
                          textInputAction: TextInputAction.next,
                          style: TextStyle(fontFamily: 'Inter', fontSize: 15, color: c.fg),
                          decoration: InputDecoration(hintText: l.auth_name),
                          validator: (v) =>
                              (v == null || v.trim().isEmpty) ? l.common_error : null,
                        ),
                        const SizedBox(height: 12),
                      ],

                      TextFormField(
                        controller: _emailCtrl,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        autofillHints: const [AutofillHints.email],
                        style: TextStyle(fontFamily: 'Inter', fontSize: 15, color: c.fg),
                        decoration: InputDecoration(hintText: l.auth_email),
                        validator: (v) {
                          final value = v?.trim() ?? '';
                          final ok = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value);
                          return ok ? null : l.auth_email;
                        },
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _passCtrl,
                        obscureText: _obscure,
                        autofillHints: const [AutofillHints.password],
                        style: TextStyle(fontFamily: 'Inter', fontSize: 15, color: c.fg),
                        decoration: InputDecoration(
                          hintText:
                              _registerMode ? l.auth_password_hint : l.auth_password,
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscure
                                  ? Icons.visibility_off_rounded
                                  : Icons.visibility_rounded,
                              size: 20,
                              color: c.subtle,
                            ),
                            onPressed: () => setState(() => _obscure = !_obscure),
                          ),
                        ),
                        onFieldSubmitted: (_) => _busy ? null : _submit(),
                        validator: (v) {
                          final value = v ?? '';
                          if (value.isEmpty) return l.common_error;
                          if (_registerMode && value.length < 8) return l.auth_password_hint;
                          return null;
                        },
                      ),

                      const SizedBox(height: 20),
                      GradientButton(
                        label: _registerMode ? l.auth_register : l.auth_login,
                        loading: _busy,
                        onPressed: _submit,
                      ),

                      if (!_registerMode) ...[
                        const SizedBox(height: 12),
                        GestureDetector(
                          onTap: _busy
                              ? null
                              : () => Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (_) => const ForgotPasswordScreen(),
                                    ),
                                  ),
                          behavior: HitTestBehavior.opaque,
                          child: Text(
                            l.auth_forgot,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: BoyxonPalette.primaryDark,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _tab(String label, bool active, VoidCallback onTap) {
    final c = context.c;
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: active ? c.surface : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            boxShadow: active
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 2,
                      offset: const Offset(0, 1),
                    ),
                  ]
                : null,
          ),
          child: Text(
            label,
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: active ? BoyxonPalette.primaryDark : c.subtle,
            ),
          ),
        ),
      ),
    );
  }
}
