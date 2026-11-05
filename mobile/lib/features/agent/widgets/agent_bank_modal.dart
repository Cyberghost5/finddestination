import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../common/widgets/custom_button.dart';
import '../../common/widgets/custom_text_field.dart';
import '../providers/agent_provider.dart';

class AgentBankModal extends StatefulWidget {
  final int? agentId;

  const AgentBankModal({super.key, this.agentId});

  static Future<void> show(BuildContext context, {int? agentId}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AgentBankModal(agentId: agentId),
    );
  }

  @override
  State<AgentBankModal> createState() => _AgentBankModalState();
}

class _AgentBankModalState extends State<AgentBankModal> {
  final _formKey = GlobalKey<FormState>();
  final _bankNameController = TextEditingController();
  final _accountNumberController = TextEditingController();
  final _accountNameController = TextEditingController();

  static const List<String> _popularBanks = [
    'Access Bank Plc',
    'Zenith Bank',
    'Guaranty Trust Bank (GTB)',
    'First Bank of Nigeria',
    'United Bank for Africa (UBA)',
    'Moniepoint MFB',
    'OPay',
    'Kuda Bank',
    'Fidelity Bank',
    'Stanbic IBTC Bank',
  ];

  @override
  void initState() {
    super.initState();
    final provider = context.read<AgentProvider>();
    final bank = provider.wallet?.bankDetails;
    if (bank != null) {
      _bankNameController.text = bank.bankName;
      _accountNumberController.text = bank.accountNumber;
      _accountNameController.text = bank.accountName;
    }
  }

  @override
  void dispose() {
    _bankNameController.dispose();
    _accountNumberController.dispose();
    _accountNameController.dispose();
    super.dispose();
  }

  Future<void> _handleSave(AgentProvider agentProvider) async {
    if (!_formKey.currentState!.validate()) return;

    final success = await agentProvider.updateBankDetails(
      bankName: _bankNameController.text.trim(),
      accountNumber: _accountNumberController.text.trim(),
      accountName: _accountNameController.text.trim(),
      agentId: widget.agentId,
    );

    if (!mounted) return;

    if (success) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(LucideIcons.checkCircle, color: Colors.white, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  agentProvider.successMessage ?? 'Payout bank account saved!',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final agentProvider = context.watch<AgentProvider>();

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle pill
              Center(
                child: Container(
                  width: 44,
                  height: 5,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Title
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(LucideIcons.landmark, color: AppColors.info, size: 22),
                      SizedBox(width: 10),
                      Text(
                        'Payout Bank Account',
                        style: TextStyle(
                          fontSize: 19,
                          fontWeight: FontWeight.w800,
                          color: AppColors.dark,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(LucideIcons.x, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              const Text(
                'Enter the personal or corporate Nigerian bank account where your inspection bounties will be credited.',
                style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
              ),
              const SizedBox(height: 18),

              // Quick Bank Selector
              const Text(
                'Popular Nigerian Banks',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.dark),
              ),
              const SizedBox(height: 8),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _popularBanks.map((bank) {
                    final isSelected = _bankNameController.text == bank;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: InkWell(
                        onTap: () {
                          setState(() {
                            _bankNameController.text = bank;
                          });
                        },
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.info.withValues(alpha: 0.12)
                                : AppColors.cardBg,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSelected ? AppColors.info : AppColors.border,
                            ),
                          ),
                          child: Text(
                            bank,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                              color: isSelected ? AppColors.info : AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 16),

              // Bank Name Field
              CustomTextField(
                label: 'Bank Institution Name',
                hintText: 'e.g. Access Bank Plc or Moniepoint MFB',
                prefixIcon: const Icon(LucideIcons.building, size: 18, color: AppColors.textSecondary),
                controller: _bankNameController,
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Please enter bank name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 14),

              // NUBAN Account Number
              CustomTextField(
                label: '10-Digit Account Number (NUBAN)',
                hintText: '0182947192',
                prefixIcon: const Icon(LucideIcons.hash, size: 18, color: AppColors.textSecondary),
                controller: _accountNumberController,
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(10),
                ],
                validator: (val) {
                  if (val == null || val.trim().length < 10) {
                    return 'Account number must be 10 digits';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 14),

              // Account Name
              CustomTextField(
                label: 'Account Holder Name',
                hintText: 'e.g. Mustapha Usman',
                prefixIcon: const Icon(LucideIcons.userCheck, size: 18, color: AppColors.textSecondary),
                controller: _accountNameController,
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Please enter account holder name';
                  }
                  return null;
                },
              ),

              if (agentProvider.errorMessage != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.errorBg,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      const Icon(LucideIcons.alertCircle, color: AppColors.error, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          agentProvider.errorMessage!,
                          style: const TextStyle(fontSize: 12, color: AppColors.error),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 24),

              // Submit Button
              CustomButton(
                text: 'Save Payout Bank',
                backgroundColor: AppColors.info,
                isLoading: agentProvider.isSubmitting,
                icon: const Icon(LucideIcons.check, color: Colors.white, size: 18),
                onPressed: () => _handleSave(agentProvider),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
