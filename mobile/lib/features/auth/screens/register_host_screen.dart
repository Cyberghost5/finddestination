import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../common/widgets/custom_button.dart';
import '../../common/widgets/custom_text_field.dart';
import '../providers/auth_provider.dart';
import 'verify_email_screen.dart';

class RegisterHostScreen extends StatefulWidget {
  const RegisterHostScreen({super.key});

  @override
  State<RegisterHostScreen> createState() => _RegisterHostScreenState();
}

class _RegisterHostScreenState extends State<RegisterHostScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _businessNameController = TextEditingController();
  final _cacController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _nameController.dispose();
    _businessNameController.dispose();
    _cacController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _submitHostRegister() async {
    if (!_formKey.currentState!.validate()) return;

    final auth = context.read<AuthProvider>();
    final email = _emailController.text.trim();

    final success = await auth.registerHost(
      name: _nameController.text.trim(),
      businessName: _businessNameController.text.trim(),
      cacNumber: _cacController.text.trim(),
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
          builder: (_) => VerifyEmailScreen(email: email, isHost: true),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.errorMessage ?? 'Host registration failed. Please check form details.'),
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
        title: const Text('Host Registration'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Host Banner
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.goldLight,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(LucideIcons.shieldCheck, color: AppColors.goldDark, size: 24),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Verified Lodging Partner',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: AppColors.goldDark,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'List your hotel, guest house, or serviced apartment. Corporate hosts receive verified badges upon CAC business validation.',
                              style: TextStyle(
                                fontSize: 12,
                                color: AppColors.textPrimary,
                                height: 1.3,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                const Text(
                  'Host & Property Credentials',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppColors.dark,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Enter your business entity and contact details',
                  style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                ),

                const SizedBox(height: 20),

                // Representative Name
                CustomTextField(
                  controller: _nameController,
                  label: 'Manager / Representative Name',
                  hintText: 'e.g. Alhaji Ibrahim Bello',
                  prefixIcon: const Icon(LucideIcons.user, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter representative name' : null,
                ),

                const SizedBox(height: 14),

                // Business Name
                CustomTextField(
                  controller: _businessNameController,
                  label: 'Registered Hotel / Business Name',
                  hintText: 'e.g. Yankari Suites & Lodges Ltd',
                  prefixIcon: const Icon(LucideIcons.building, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter registered entity name' : null,
                ),

                const SizedBox(height: 14),

                // CAC Number
                CustomTextField(
                  controller: _cacController,
                  label: 'CAC Registration Number (RC / BN)',
                  hintText: 'e.g. RC-1849204 or BN-392019',
                  prefixIcon: const Icon(LucideIcons.fileText, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter CAC registration number' : null,
                ),

                const SizedBox(height: 14),

                // Email
                CustomTextField(
                  controller: _emailController,
                  label: 'Official Email Address',
                  hintText: 'e.g. bookings@yankarihotel.com',
                  keyboardType: TextInputType.emailAddress,
                  prefixIcon: const Icon(LucideIcons.mail, size: 18, color: AppColors.textMuted),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Enter official email';
                    if (!v.contains('@')) return 'Enter a valid email';
                    return null;
                  },
                ),

                const SizedBox(height: 14),

                // Phone
                CustomTextField(
                  controller: _phoneController,
                  label: 'Contact Phone Number',
                  hintText: '+234 803 000 0000',
                  keyboardType: TextInputType.phone,
                  prefixIcon: const Icon(LucideIcons.phone, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter phone number' : null,
                ),

                const SizedBox(height: 14),

                // Password
                CustomTextField(
                  controller: _passwordController,
                  label: 'Create Password',
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
                  validator: (v) => (v != _passwordController.text) ? 'Passwords do not match' : null,
                ),

                const SizedBox(height: 24),

                // Submit Button
                CustomButton(
                  text: 'Register Property Account',
                  backgroundColor: AppColors.goldDark,
                  isLoading: auth.isLoading,
                  onPressed: _submitHostRegister,
                ),

                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
