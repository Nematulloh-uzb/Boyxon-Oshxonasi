import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:provider/provider.dart';

import '../../core/api/api_client.dart';
import '../../core/i18n/app_i18n.dart';
import '../../core/session/session_controller.dart';
import '../../data/services/auth_service.dart';
import '../../theme/app_text.dart';
import '../../theme/app_theme.dart';

/// Kirish / Ro'yxatdan o'tish ekrani (dizayn: 01-auth-light/dark).
class AuthPage extends StatefulWidget {
  const AuthPage({super.key});

  @override
  State<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> {
  bool _register = false;
  bool _obscure = true;
  bool _remember = true;
  bool _terms = true;
  bool _busy = false;
  String? _error;
  String? _verifyEmail;

  final _email = TextEditingController();
  final _password = TextEditingController();
  final _name = TextEditingController();
  final _phone = TextEditingController();

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _name.dispose();
    _phone.dispose();
    super.dispose();
  }

  void _snack(String msg) {
    if (msg.isEmpty || !mounted) return;
    final m = ScaffoldMessenger.maybeOf(context);
    m
      ?..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(msg)));
  }

  Future<void> _submit() async {
    if (_busy) return;
    setState(() => _error = null);

    final email = _email.text.trim();
    final password = _password.text;
    if (email.isEmpty || password.isEmpty || (_register && _name.text.trim().isEmpty)) {
      setState(() => _error = context.tr('common.required'));
      return;
    }
    if (!email.contains('@')) {
      setState(() => _error = context.tr('auth.email'));
      return;
    }
    if (_register && !_terms) {
      setState(() => _error = context.tr('auth.terms_agree'));
      return;
    }

    setState(() => _busy = true);
    final session = context.read<SessionController>();
    try {
      if (_register) {
        final outcome = await session.register(
          name: _name.text.trim(),
          email: email,
          phone: _phone.text.trim().isEmpty ? null : _phone.text.trim(),
          password: password,
        );
        if (outcome.verificationRequired && mounted) {
          setState(() => _verifyEmail = outcome.email ?? email);
        }
        // Tasdiqlash talab qilinmasa — root gate avtomatik AppShell'ga o'tadi.
      } else {
        await session.login(email: email, password: password);
      }
    } on ApiException catch (e) {
      if (!mounted) return;
      if (e.code == 'EMAIL_NOT_VERIFIED') {
        final d = e.data;
        setState(() {
          _verifyEmail = (d is Map && d['email'] is String) ? d['email'] as String : email;
        });
      } else {
        setState(() => _error = e.message);
      }
    } catch (e) {
      if (mounted) setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _forgot() async {
    final ctrl = TextEditingController(text: _email.text.trim());
    final email = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(context.tr('auth.reset_title'), style: AppText.headlineSm),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(context.tr('auth.reset_subtitle'), style: AppText.bodyMd),
            const SizedBox(height: 14),
            TextField(
              controller: ctrl,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(hintText: context.tr('auth.email_placeholder')),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(context.tr('common.cancel')),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, ctrl.text.trim()),
            child: Text(context.tr('auth.reset_send')),
          ),
        ],
      ),
    );
    ctrl.dispose();
    if (email == null || email.isEmpty) return;
    try {
      await AuthService.I.forgotPassword(email);
      if (!mounted) return;
      _snack(context.tr('auth.reset_sent'));
    } on ApiException catch (e) {
      _snack(e.message);
    }
  }

  Future<void> _resend() async {
    final email = _verifyEmail;
    if (email == null) return;
    try {
      await AuthService.I.resendVerification(email);
      if (!mounted) return;
      _snack(context.tr('auth.verify_resent'));
    } on ApiException catch (e) {
      _snack(e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    return Scaffold(
      backgroundColor: p.card,
      body: SingleChildScrollView(
        child: Column(
          children: [
            const _AuthHeader(),
            Transform.translate(
              offset: const Offset(0, -32),
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: p.card,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
                  boxShadow: [
                    BoxShadow(
                      color: p.shadow,
                      blurRadius: 40,
                      offset: const Offset(0, -10),
                    ),
                  ],
                ),
                padding: const EdgeInsets.fromLTRB(24, 28, 24, 36),
                child: _verifyEmail != null ? _buildVerify(context) : _buildForm(context),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---- Email tasdiqlash paneli ----

  Widget _buildVerify(BuildContext context) {
    final p = context.palette;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 8),
        Center(
          child: Container(
            width: 88,
            height: 88,
            decoration: BoxDecoration(color: p.primaryFixed, shape: BoxShape.circle),
            child: Icon(Symbols.mark_email_unread, size: 40, color: p.dark ? p.onPrimaryFixed : p.primaryDeep),
          ),
        ),
        const SizedBox(height: 20),
        Text(
          context.tr('auth.verify_title'),
          textAlign: TextAlign.center,
          style: AppText.headlineSm.copyWith(color: p.onSurface),
        ),
        const SizedBox(height: 10),
        Text(
          context.tr('auth.verify_sent_to', {'email': _verifyEmail ?? ''}),
          textAlign: TextAlign.center,
          style: AppText.bodyMd.copyWith(color: p.onSurfaceVariant),
        ),
        const SizedBox(height: 8),
        Text(
          context.tr('auth.verify_spam_hint'),
          textAlign: TextAlign.center,
          style: AppText.bodySm.copyWith(color: p.outline),
        ),
        const SizedBox(height: 24),
        _PrimaryCta(
          label: context.tr('auth.verify_resend'),
          icon: Symbols.refresh,
          busy: _busy,
          onTap: _resend,
        ),
        const SizedBox(height: 12),
        TextButton(
          onPressed: () => setState(() {
            _verifyEmail = null;
            _register = false;
            _error = null;
          }),
          child: Text(
            context.tr('auth.verify_logout'),
            style: AppText.labelLg.copyWith(color: p.accent),
          ),
        ),
      ],
    );
  }

  // ---- Kirish / Ro'yxatdan o'tish formasi ----

  Widget _buildForm(BuildContext context) {
    final p = context.palette;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Segmented tabs
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: p.cardHigh,
            borderRadius: BorderRadius.circular(999),
          ),
          child: Row(
            children: [
              _tab(context.tr('auth.signin'), active: !_register, onTap: () => setState(() {
                _register = false;
                _error = null;
              })),
              _tab(context.tr('auth.signup'), active: _register, onTap: () => setState(() {
                _register = true;
                _error = null;
              })),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Salomlashish
        Row(
          children: [
            Text(
              _register ? context.tr('auth.signup_title') : context.tr('auth.welcome_back'),
              style: AppText.headlineSm.copyWith(color: p.onSurface),
            ),
            if (!_register) const Text(' 👋', style: TextStyle(fontSize: 18)),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          _register ? context.tr('auth.signup_subtitle') : context.tr('auth.signin_subtitle'),
          style: AppText.bodySm.copyWith(color: p.onSurfaceVariant),
        ),
        const SizedBox(height: 20),

        if (_error != null) _ErrorBanner(message: _error!),
        if (_error != null) const SizedBox(height: 14),

        // Maydonlar
        if (_register) ...[
          _AuthField(
            label: context.tr('auth.name'),
            icon: Symbols.person,
            controller: _name,
            hint: context.tr('auth.name_placeholder'),
            textInputAction: TextInputAction.next,
          ),
          const SizedBox(height: 14),
          _AuthField(
            label: '${context.tr('auth.phone')} (${context.tr('common.optional')})',
            icon: Symbols.call,
            controller: _phone,
            hint: '+998 90 123 45 67',
            keyboardType: TextInputType.phone,
            textInputAction: TextInputAction.next,
          ),
          const SizedBox(height: 14),
        ],
        _AuthField(
          label: context.tr('auth.email'),
          icon: Symbols.mail,
          controller: _email,
          hint: context.tr('auth.email_placeholder'),
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: 14),
        _AuthField(
          label: context.tr('auth.password'),
          icon: Symbols.lock,
          controller: _password,
          hint: _register ? context.tr('auth.password_hint') : context.tr('auth.password_placeholder'),
          obscure: _obscure,
          textInputAction: TextInputAction.done,
          onSubmitted: (_) => _submit(),
          trailing: IconButton(
            onPressed: () => setState(() => _obscure = !_obscure),
            icon: Icon(
              _obscure ? Symbols.visibility : Symbols.visibility_off,
              size: 20,
              color: p.onSurfaceVariant,
            ),
          ),
        ),
        const SizedBox(height: 14),

        // Eslab qolish / parolni tiklash
        Row(
          children: [
            SizedBox(
              width: 24,
              height: 24,
              child: Checkbox(
                value: _remember,
                onChanged: (v) => setState(() => _remember = v ?? false),
                activeColor: p.primary,
                side: BorderSide(color: p.outline),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              context.tr('auth.signin') == 'Kirish' ? 'Eslab qolish' : context.tr('common.save'),
              style: AppText.labelSm.copyWith(color: p.onSurfaceVariant),
            ),
            const Spacer(),
            TextButton(
              onPressed: _forgot,
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                minimumSize: const Size(0, 36),
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Text(
                context.tr('auth.forgot'),
                style: AppText.labelSm.copyWith(color: p.accent),
              ),
            ),
          ],
        ),

        if (_register) ...[
          Row(
            children: [
              SizedBox(
                width: 24,
                height: 24,
                child: Checkbox(
                  value: _terms,
                  onChanged: (v) => setState(() => _terms = v ?? false),
                  activeColor: p.primary,
                  side: BorderSide(color: p.outline),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  context.tr('auth.terms_agree'),
                  style: AppText.labelSm.copyWith(color: p.onSurfaceVariant),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
        ],

        const SizedBox(height: 8),
        _PrimaryCta(
          label: _register ? context.tr('auth.signup') : context.tr('auth.signin'),
          icon: Symbols.arrow_forward,
          busy: _busy,
          onTap: _submit,
        ),

        // YOKI
        const SizedBox(height: 26),
        Row(
          children: [
            Expanded(child: Divider(color: p.outlineVariant.withValues(alpha: 0.6))),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Text(
                context.tr('auth.or').toUpperCase(),
                style: AppText.labelSm.copyWith(color: p.outline, letterSpacing: 1.2),
              ),
            ),
            Expanded(child: Divider(color: p.outlineVariant.withValues(alpha: 0.6))),
          ],
        ),
        const SizedBox(height: 20),

        // Google
        Material(
          color: p.cardLow,
          borderRadius: BorderRadius.circular(12),
          child: InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () => _snack(context.tr('auth.google_not_configured')),
            child: SizedBox(
              height: 48,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const _GoogleLogo(size: 20),
                  const SizedBox(width: 10),
                  Text(
                    context.tr('auth.google'),
                    style: AppText.labelLg.copyWith(color: p.onSurface),
                  ),
                ],
              ),
            ),
          ),
        ),

        // Pastki havola
        const SizedBox(height: 28),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              _register ? context.tr('auth.have_account') : context.tr('auth.no_account'),
              style: AppText.bodyMd.copyWith(color: p.onSurfaceVariant),
            ),
            const SizedBox(width: 6),
            GestureDetector(
              onTap: () => setState(() {
                _register = !_register;
                _error = null;
              }),
              child: Text(
                _register ? context.tr('auth.signin') : context.tr('auth.signup'),
                style: AppText.labelLg.copyWith(
                  color: p.accent,
                  decoration: TextDecoration.underline,
                  decorationColor: p.accent,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _tab(String label, {required bool active, required VoidCallback onTap}) {
    final p = context.palette;
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: active ? p.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(999),
            boxShadow: active
                ? [BoxShadow(color: p.shadow, blurRadius: 10, offset: const Offset(0, 3))]
                : null,
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: AppText.labelLg.copyWith(
              color: active ? p.onPrimary : p.onSurfaceVariant,
            ),
          ),
        ),
      ),
    );
  }
}

// ---- Umumiy kichik widgetlar ----

class _AuthHeader extends StatelessWidget {
  const _AuthHeader();

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final topPad = MediaQuery.paddingOf(context).top;
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [p.gradientStart, p.primaryDeep],
        ),
      ),
      padding: EdgeInsets.fromLTRB(24, topPad + 40, 24, 72),
      child: Stack(
        children: [
          const Positioned.fill(
            child: IgnorePointer(
              child: ClipRect(
                child: CustomPaint(painter: _UzbekPatternPainter()),
              ),
            ),
          ),
          Column(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.18),
                      blurRadius: 24,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Center(
                  child: Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: p.primaryFixed,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Symbols.soup_kitchen,
                      size: 34,
                      color: p.dark ? const Color(0xFFFFB783) : const Color(0xFFA23F00),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Boyxon Oshxonasi',
                style: AppText.headlineLgMobile.copyWith(color: Colors.white),
              ),
              const SizedBox(height: 4),
              Text(
                context.tr('app.tagline'),
                style: AppText.bodyMd.copyWith(color: Colors.white.withValues(alpha: 0.85)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// O'zbek naqshi — dizayndagi SVG pattern (8% oq chiziqlar).
class _UzbekPatternPainter extends CustomPainter {
  const _UzbekPatternPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..color = Colors.white.withValues(alpha: 0.08);
    final tile = size.width / 5;
    final s = tile / 20;
    paint.strokeWidth = 0.75 * s;
    for (double y = 0; y < size.height; y += tile) {
      for (double x = -tile; x < size.width + tile; x += tile) {
        _tile(canvas, paint, Offset(x, y), s);
      }
    }
  }

  void _tile(Canvas c, Paint p, Offset o, double s) {
    final path = Path()
      ..moveTo(o.dx + 10 * s, o.dy)
      ..lineTo(o.dx + 20 * s, o.dy + 10 * s)
      ..lineTo(o.dx + 10 * s, o.dy + 20 * s)
      ..lineTo(o.dx, o.dy + 10 * s)
      ..close()
      ..moveTo(o.dx + 10 * s, o.dy + 3 * s)
      ..lineTo(o.dx + 17 * s, o.dy + 10 * s)
      ..lineTo(o.dx + 10 * s, o.dy + 17 * s)
      ..lineTo(o.dx + 3 * s, o.dy + 10 * s)
      ..close()
      ..moveTo(o.dx, o.dy)
      ..lineTo(o.dx + 5 * s, o.dy + 5 * s)
      ..moveTo(o.dx + 20 * s, o.dy)
      ..lineTo(o.dx + 15 * s, o.dy + 5 * s)
      ..moveTo(o.dx + 20 * s, o.dy + 20 * s)
      ..lineTo(o.dx + 15 * s, o.dy + 15 * s)
      ..moveTo(o.dx, o.dy + 20 * s)
      ..lineTo(o.dx + 5 * s, o.dy + 15 * s);
    c.drawPath(path, p);
    c.drawCircle(Offset(o.dx + 10 * s, o.dy + 10 * s), 2 * s, p);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Gradient CTA tugma (dizayndagi asosiy tugma).
class _PrimaryCta extends StatelessWidget {
  const _PrimaryCta({
    required this.label,
    required this.icon,
    required this.busy,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool busy;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    return Opacity(
      opacity: busy ? 0.7 : 1,
      child: Material(
        borderRadius: BorderRadius.circular(12),
        child: Ink(
          height: 48,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [p.gradientStart, p.gradientMid],
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
            ),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(color: p.shadow, blurRadius: 16, offset: const Offset(0, 6)),
            ],
          ),
          child: InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: busy ? null : onTap,
            child: Center(
              child: busy
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                    )
                  : Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(label, style: AppText.labelLg.copyWith(color: Colors.white)),
                        const SizedBox(width: 8),
                        Icon(icon, size: 18, color: Colors.white),
                      ],
                    ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Dizayndagi input: ikonka bilan, chegarasiz, fokusda halqa.
class _AuthField extends StatefulWidget {
  const _AuthField({
    required this.label,
    required this.icon,
    required this.controller,
    this.hint,
    this.obscure = false,
    this.keyboardType,
    this.textInputAction,
    this.onSubmitted,
    this.trailing,
  });

  final String label;
  final IconData icon;
  final TextEditingController controller;
  final String? hint;
  final bool obscure;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onSubmitted;
  final Widget? trailing;

  @override
  State<_AuthField> createState() => _AuthFieldState();
}

class _AuthFieldState extends State<_AuthField> {
  final _focus = FocusNode();

  @override
  void initState() {
    super.initState();
    _focus.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _focus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final focused = _focus.hasFocus;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.label, style: AppText.labelSm.copyWith(color: p.onSurfaceVariant)),
        const SizedBox(height: 6),
        AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          height: 48,
          decoration: BoxDecoration(
            color: focused ? p.card : p.cardLow,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: focused ? p.primary.withValues(alpha: 0.45) : Colors.transparent,
              width: 2,
            ),
          ),
          child: Row(
            children: [
              const SizedBox(width: 12),
              Icon(widget.icon, size: 20, color: p.onSurfaceVariant),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: widget.controller,
                  focusNode: _focus,
                  obscureText: widget.obscure,
                  keyboardType: widget.keyboardType,
                  textInputAction: widget.textInputAction,
                  onSubmitted: widget.onSubmitted,
                  style: AppText.bodyMd.copyWith(color: p.onSurface),
                  cursorColor: p.primary,
                  decoration: InputDecoration(
                    isDense: true,
                    filled: false,
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    contentPadding: EdgeInsets.zero,
                    hintText: widget.hint,
                    hintStyle: AppText.bodyMd.copyWith(color: p.outline),
                  ),
                ),
              ),
              if (widget.trailing != null) widget.trailing!,
              const SizedBox(width: 4),
            ],
          ),
        ),
      ],
    );
  }
}

/// Xato banneri.
class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: p.errorBg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(Symbols.error, size: 20, color: p.errorText),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: AppText.bodySm.copyWith(color: p.errorText),
            ),
          ),
        ],
      ),
    );
  }
}

/// Google "G" logotipi (CSS'dagi SVG o'rniga chiziladi).
class _GoogleLogo extends StatelessWidget {
  const _GoogleLogo({this.size = 20});

  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: const CustomPaint(painter: _GoogleLogoPainter()),
    );
  }
}

class _GoogleLogoPainter extends CustomPainter {
  const _GoogleLogoPainter();

  @override
  void paint(Canvas canvas, Size size) {
    const deg = math.pi / 180;
    final center = Offset(size.width / 2, size.height / 2);
    final r = size.width / 2;
    final stroke = size.width * 0.22;
    final rect = Rect.fromCircle(center: center, radius: r - stroke / 2);
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.butt;

    paint.color = const Color(0xFFEA4335); // qizil — yuqori
    canvas.drawArc(rect, 220 * deg, 80 * deg, false, paint);
    paint.color = const Color(0xFFFBBC05); // sariq — chap past
    canvas.drawArc(rect, 140 * deg, 80 * deg, false, paint);
    paint.color = const Color(0xFF34A853); // yashil — past
    canvas.drawArc(rect, 60 * deg, 80 * deg, false, paint);
    paint.color = const Color(0xFF4285F4); // ko'k — o'ng yuqori
    canvas.drawArc(rect, 310 * deg, 55 * deg, false, paint);

    // Gorizontal ko'k chiziq (G ning "tili")
    canvas.drawRect(
      Rect.fromLTRB(
        center.dx - size.width * 0.02,
        center.dy - stroke / 2,
        size.width * 0.96,
        center.dy + stroke / 2,
      ),
      Paint()..color = const Color(0xFF4285F4),
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
