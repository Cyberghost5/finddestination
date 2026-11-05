import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../common/widgets/custom_button.dart';
import '../../common/widgets/custom_text_field.dart';
import '../providers/auth_provider.dart';
import 'verify_email_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  bool _agreedToTerms = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _submitRegister() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_agreedToTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please accept the Terms of Service to continue.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    final auth = context.read<AuthProvider>();
    final email = _emailController.text.trim();

    final success = await auth.registerGuest(
      name: _nameController.text.trim(),
      email: email,
      phone: _phoneController.text.trim(),
      password: _passwordController.text,
      passwordConfirmation: _confirmPasswordController.text,
    );

    if (!mounted) return;

    if (success) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => VerifyEmailScreen(email: email),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.errorMessage ?? 'Registration failed. Please check form details.'),
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
        title: const Text('Create Account'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Join FindDestination',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: AppColors.dark,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Book verified, high-quality stays across Nigeria with secure escrow protection.',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),

                const SizedBox(height: 24),

                // Full Name
                CustomTextField(
                  controller: _nameController,
                  label: 'Full Name',
                  hintText: 'e.g. Amina Danjuma',
                  prefixIcon: const Icon(LucideIcons.user, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter your full name' : null,
                ),

                const SizedBox(height: 14),

                // Email Address
                CustomTextField(
                  controller: _emailController,
                  label: 'Email Address',
                  hintText: 'e.g. amina@example.com',
                  keyboardType: TextInputType.emailAddress,
                  prefixIcon: const Icon(LucideIcons.mail, size: 18, color: AppColors.textMuted),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Please enter email';
                    if (!v.contains('@')) return 'Please enter a valid email';
                    return null;
                  },
                ),

                const SizedBox(height: 14),

                // Phone Number
                CustomTextField(
                  controller: _phoneController,
                  label: 'Phone Number',
                  hintText: '+234 802 000 0000',
                  keyboardType: TextInputType.phone,
                  prefixIcon: const Icon(LucideIcons.phone, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter phone number' : null,
                ),

                const SizedBox(height: 14),

                // Password
                CustomTextField(
                  controller: _passwordController,
                  label: 'Password',
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
                  validator: (v) {
                    if (v == null || v.length < 8) return 'Password must be at least 8 characters';
                    return null;
                  },
                ),

                const SizedBox(height: 14),

                // Confirm Password
                CustomTextField(
                  controller: _confirmPasswordController,
                  label: 'Confirm Password',
                  hintText: 'Repeat password',
                  obscureText: _obscureConfirm,
                  prefixIcon: const Icon(LucideIcons.lock, size: 18, color: AppColors.textMuted),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscureConfirm ? LucideIcons.eyeOff : LucideIcons.eye,
                      size: 18,
                      color: AppColors.textMuted,
                    ),
                    onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
                  ),
                  validator: (v) {
                    if (v != _passwordController.text) return 'Passwords do not match';
                    return null;
                  },
                ),

                const SizedBox(height: 16),

                // Terms agreement checkbox
                Row(
                  children: [
                    Checkbox(
                      value: _agreedToTerms,
                      activeColor: AppColors.primary,
                      onChanged: (val) => setState(() => _agreedToTerms = val ?? false),
                    ),
                    const Expanded(
                      child: Text(
                        'I agree to the Terms of Service and Privacy Policy',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // Sign Up Button
                CustomButton(
                  text: 'Create Account',
                  isLoading: auth.isLoading,
                  onPressed: _submitRegister,
                ),

                const SizedBox(height: 20),

                // Already have account
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'Already registered? ',
                      style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                    ),
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: const Text(
                        'Sign In',
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
      ),
    );
  }
}
