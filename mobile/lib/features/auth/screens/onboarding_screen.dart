import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../common/widgets/custom_button.dart';
import '../../common/widgets/custom_text_field.dart';
import '../providers/auth_provider.dart';

class OnboardingScreen extends StatefulWidget {
  final VoidCallback? onCompleted;

  const OnboardingScreen({super.key, this.onCompleted});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _dobController = TextEditingController();
  DateTime? _selectedDate;
  bool _marketingOptOut = false;

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthProvider>();
    if (auth.user != null) {
      final names = auth.user!.name.split(' ');
      if (names.isNotEmpty) _firstNameController.text = names[0];
      if (names.length > 1) _lastNameController.text = names.sublist(1).join(' ');
    }
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _dobController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final initial = DateTime(now.year - 20, now.month, now.day);
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? initial,
      firstDate: DateTime(1930),
      lastDate: DateTime(now.year - 16, now.month, now.day),
    );

    if (picked != null) {
      setState(() {
        _selectedDate = picked;
        _dobController.text = DateFormat('yyyy-MM-dd').format(picked);
      });
    }
  }

  void _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    final auth = context.read<AuthProvider>();
    final success = await auth.completeOnboarding(
      firstName: _firstNameController.text.trim(),
      lastName: _lastNameController.text.trim(),
      dob: _dobController.text.trim(),
      marketingOptOut: _marketingOptOut,
    );

    if (!mounted) return;

    if (success) {
      if (widget.onCompleted != null) {
        widget.onCompleted!();
      } else {
        Navigator.popUntil(context, (route) => route.isFirst);
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.errorMessage ?? 'Onboarding submission failed.'),
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
        title: const Text('Complete Your Profile'),
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
                  'Personal Information',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: AppColors.dark,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'To finalize reservation vouchers and satisfy national compliance, please complete your travel profile.',
                  style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
                ),

                const SizedBox(height: 28),

                CustomTextField(
                  controller: _firstNameController,
                  label: 'Legal First Name',
                  hintText: 'e.g. Amina',
                  prefixIcon: const Icon(LucideIcons.user, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter your legal first name' : null,
                ),

                const SizedBox(height: 14),

                CustomTextField(
                  controller: _lastNameController,
                  label: 'Legal Last Name',
                  hintText: 'e.g. Danjuma',
                  prefixIcon: const Icon(LucideIcons.userCheck, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter your legal last name' : null,
                ),

                const SizedBox(height: 14),

                CustomTextField(
                  controller: _dobController,
                  label: 'Date of Birth',
                  hintText: 'YYYY-MM-DD',
                  readOnly: true,
                  onTap: _pickDate,
                  prefixIcon: const Icon(LucideIcons.calendar, size: 18, color: AppColors.textMuted),
                  suffixIcon: const Icon(LucideIcons.chevronDown, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Select your date of birth' : null,
                ),

                const SizedBox(height: 20),

                // Marketing opt-out
                CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  value: _marketingOptOut,
                  activeColor: AppColors.primary,
                  controlAffinity: ListTileControlAffinity.leading,
                  title: const Text(
                    'I prefer not to receive promotional discount notifications and partner offers via email.',
                    style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                  onChanged: (v) => setState(() => _marketingOptOut = v ?? false),
                ),

                const SizedBox(height: 24),

                CustomButton(
                  text: 'Complete Setup & Continue',
                  isLoading: auth.isLoading,
                  onPressed: _handleSubmit,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
