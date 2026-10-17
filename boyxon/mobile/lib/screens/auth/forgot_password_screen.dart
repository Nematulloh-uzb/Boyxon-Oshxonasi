import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api_client.dart';
import '../../core/app_theme.dart';
import '../../l10n/app_localizations.dart';
import '../../services/auth_service.dart';
import '../../widgets/ui_kit.dart';

/// Parolni tiklash — web `ForgotPasswordPage` bilan 1:1:
/// markazda karta (border + shadow), ikonka, sarlavha, tavsif,
/// email formasi va pastda "Orqaga" havolasi.
class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();

  bool _busy = false;
  bool _sent = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    final l = AppLocalizations.of(context);
    final auth = context.read<AuthService>();
    final messenger = ScaffoldMessenger.of(context);

    setState(() => _busy = true);
    try {
      await auth.forgotPassword(_emailCtrl.text);
      if (mounted) setState(() => _sent = true);
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
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Container(
              width: double.infinity,
              constraints: const BoxConstraints(maxWidth: 448),
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: c.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: c.line),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 2,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (_sent) ...[
                    Icon(Icons.check_circle_rounded, size: 56, color: c.success),
                    const SizedBox(height: 16),
                    Text(
                      l.forgot_title,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'Epilogue',
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: c.fg,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      l.forgot_sent,
                      textAlign: TextAlign.center,
                      style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.subtle),
                    ),
                  ] else ...[
                    const Icon(
                      Icons.mark_email_read_outlined,
                      size: 56,
                      color: BoyxonPalette.primary,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      l.forgot_title,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'Epilogue',
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: c.fg,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      l.forgot_desc,
                      textAlign: TextAlign.center,
                      style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: c.subtle),
                    ),
                    const SizedBox(height: 24),
                    Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          TextFormField(
                            controller: _emailCtrl,
                            keyboardType: TextInputType.emailAddress,
                            textAlign: TextAlign.left,
                            autofillHints: const [AutofillHints.email],
                            style: TextStyle(fontFamily: 'Inter', fontSize: 15, color: c.fg),
                            decoration: InputDecoration(hintText: l.auth_email),
                            validator: (v) {
                              final value = v?.trim() ?? '';
                              final ok =
                                  RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value);
                              return ok ? null : l.auth_email;
                            },
                          ),
                          const SizedBox(height: 12),
                          GradientButton(
                            label: l.forgot_cta,
                            loading: _busy,
                            onPressed: _submit,
                          ),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),
                  GestureDetector(
                    onTap: () => Navigator.of(context).maybePop(),
                    behavior: HitTestBehavior.opaque,
                    child: Text(
                      l.common_back,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: c.subtle,
                        decoration: TextDecoration.underline,
                        decorationColor: c.subtle,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
