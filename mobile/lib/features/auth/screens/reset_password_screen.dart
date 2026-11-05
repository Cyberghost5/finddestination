import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../common/widgets/custom_button.dart';
import '../../common/widgets/custom_text_field.dart';
import '../providers/auth_provider.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String email;

  const ResetPasswordScreen({super.key, required this.email});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _tokenController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _tokenController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _handleReset() async {
    if (!_formKey.currentState!.validate()) return;

    final auth = context.read<AuthProvider>();
    final success = await auth.resetPassword(
      email: widget.email,
      token: _tokenController.text.trim(),
      password: _passwordController.text,
      passwordConfirmation: _confirmPasswordController.text,
    );

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Password updated successfully! Please sign in with your new password.'),
          backgroundColor: AppColors.success,
        ),
      );
      Navigator.popUntil(context, (route) => route.isFirst);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.errorMessage ?? 'Password reset failed. Invalid or expired token.'),
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
        title: const Text('New Password'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Set New Password',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: AppColors.dark,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Enter the reset token sent to ${widget.email} and choose a strong password.',
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                ),

                const SizedBox(height: 24),

                CustomTextField(
                  controller: _tokenController,
                  label: 'Reset Token / Code',
                  hintText: 'Enter code or token',
                  prefixIcon: const Icon(LucideIcons.key, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter reset token' : null,
                ),

                const SizedBox(height: 14),

                CustomTextField(
                  controller: _passwordController,
                  label: 'New Password',
                  hintText: 'At least 8 characters',
                  obscureText: _obscurePassword,
                  prefixIcon: const Icon(LucideIcons.lock, size: 18, color: AppColors.textMuted),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? LucideIcons.eyeOff : LucideIcons.eye,
                      size: 18,
                      color: AppColors.textMuted,
                    ),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                  validator: (v) => (v == null || v.length < 8) ? 'Password must be at least 8 characters' : null,
                ),

                const SizedBox(height: 14),

                CustomTextField(
                  controller: _confirmPasswordController,
                  label: 'Confirm New Password',
                  hintText: 'Repeat password',
                  obscureText: _obscurePassword,
                  prefixIcon: const Icon(LucideIcons.lock, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v != _passwordController.text) ? 'Passwords do not match' : null,
                ),

                const SizedBox(height: 24),

                CustomButton(
                  text: 'Update Password',
                  isLoading: auth.isLoading,
                  onPressed: _handleReset,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
