import 'dart:async';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../common/widgets/custom_button.dart';
import '../providers/auth_provider.dart';
import 'onboarding_screen.dart';

class VerifyEmailScreen extends StatefulWidget {
  final String email;
  final bool isHost;

  const VerifyEmailScreen({
    super.key,
    required this.email,
    this.isHost = false,
  });

  @override
  State<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends State<VerifyEmailScreen> {
  final _codeController = TextEditingController();
  int _secondsRemaining = 60;
  Timer? _timer;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  void _startCountdown() {
    setState(() {
      _secondsRemaining = 60;
      _canResend = false;
    });
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() => _secondsRemaining--);
      } else {
        setState(() => _canResend = true);
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _codeController.dispose();
    super.dispose();
  }

  void _handleVerify() async {
    final code = _codeController.text.trim();
    if (code.isEmpty || code.length < 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a valid verification code'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    final auth = context.read<AuthProvider>();
    final success = await auth.verifyEmail(email: widget.email, code: code);

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Email verified successfully!'),
          backgroundColor: AppColors.success,
        ),
      );
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => const OnboardingScreen(),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.errorMessage ?? 'Verification code invalid or expired.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  void _handleResend() async {
    if (!_canResend) return;

    final auth = context.read<AuthProvider>();
    final success = await auth.resendVerification(widget.email);

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('A new verification code has been dispatched to your email.'),
          backgroundColor: AppColors.primary,
        ),
      );
      _startCountdown();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.errorMessage ?? 'Failed to resend code. Please try again later.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Verify Email'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  shape: BoxShape.circle,
                ),
                child: const Icon(LucideIcons.mailCheck, color: AppColors.primary, size: 36),
              ),
              const SizedBox(height: 20),
              const Text(
                'Verify Your Email',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: AppColors.dark,
                ),
              ),
              const SizedBox(height: 8),
              RichText(
                textAlign: TextAlign.center,
                text: TextSpan(
                  style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
                  children: [
                    const TextSpan(text: 'We sent a verification code to\n'),
                    TextSpan(
                      text: widget.email,
                      style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.dark),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Code Input Box
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: TextField(
                  controller: _codeController,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 10,
                    color: AppColors.dark,
                  ),
                  decoration: const InputDecoration(
                    hintText: '• • • • • •',
                    hintStyle: TextStyle(letterSpacing: 8, color: AppColors.textMuted),
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                  ),
                ),
              ),

              const SizedBox(height: 24),

              CustomButton(
                text: 'Confirm Verification',
                isLoading: auth.isLoading,
                onPressed: _handleVerify,
              ),

              const SizedBox(height: 24),

              // Resend action
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _canResend
                        ? "Didn't receive the email? "
                        : "Resend available in ${_secondsRemaining}s ",
                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                  ),
                  if (_canResend)
                    GestureDetector(
                      onTap: _handleResend,
                      child: const Text(
                        'Resend Code',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                        ),
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
