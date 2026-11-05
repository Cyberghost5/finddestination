import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../common/widgets/custom_button.dart';
import '../models/admin_models.dart';
import '../providers/admin_provider.dart';

class AdminProcessWithdrawalModal extends StatefulWidget {
  final AdminWithdrawalModel withdrawal;

  const AdminProcessWithdrawalModal({super.key, required this.withdrawal});

  @override
  State<AdminProcessWithdrawalModal> createState() => _AdminProcessWithdrawalModalState();
}

class _AdminProcessWithdrawalModalState extends State<AdminProcessWithdrawalModal> {
  final _noteController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  void _submit(String action) async {
    setState(() => _isSubmitting = true);
    final admin = context.read<AdminProvider>();
    final success = await admin.processWithdrawal(
      widget.withdrawal.id,
      action: action,
      adminNote: _noteController.text.trim(),
    );
    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (success) {
      Navigator.pop(context, true);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            action == 'approved'
                ? 'Withdrawal approved & marked as disbursed.'
                : 'Withdrawal rejected. Funds refunded to agent wallet.',
          ),
          backgroundColor: action == 'approved' ? AppColors.success : AppColors.error,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(admin.errorMessage ?? 'Operation failed. Please retry.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final w = widget.withdrawal;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(LucideIcons.banknote, color: AppColors.primary, size: 22),
                  SizedBox(width: 8),
                  Text(
                    'Process Payout Request',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.dark),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(LucideIcons.x, size: 20),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Amount Banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                const Text(
                  'PAYOUT AMOUNT REQUESTED',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textSecondary, letterSpacing: 0.5),
                ),
                const SizedBox(height: 4),
                Text(
                  w.amountFormatted,
                  style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.primary),
                ),
                const SizedBox(height: 4),
                Text(
                  'Beneficiary: ${w.agentName} (${w.agentEmail})',
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Settlement Bank Details Box
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(LucideIcons.landmark, size: 16, color: AppColors.primary),
                    SizedBox(width: 6),
                    Text(
                      'Destination Bank Account (NUBAN)',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                _buildBankRow('Bank', w.bankName),
                _buildBankRow('Account Number', w.accountNumber),
                _buildBankRow('Account Name', w.accountName),
                _buildBankRow('Ref', w.transactionReference),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Disbursement Reference / Admin Note
          const Text(
            'Transfer / Audit Note (Optional)',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _noteController,
            decoration: InputDecoration(
              hintText: 'e.g. Disbursed via GTB NIP session #9918231',
              hintStyle: const TextStyle(fontSize: 12, color: AppColors.textMuted),
              fillColor: AppColors.background,
              filled: true,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.border),
              ),
            ),
          ),

          const SizedBox(height: 20),

          // Action Buttons
          if (_isSubmitting)
            const Center(child: CircularProgressIndicator())
          else
            Row(
              children: [
                Expanded(
                  child: CustomButton(
                    text: 'Decline & Refund',
                    isOutlined: true,
                    textColor: AppColors.error,
                    icon: const Icon(LucideIcons.ban, size: 16, color: AppColors.error),
                    onPressed: () => _submit('rejected'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: CustomButton(
                    text: 'Mark as Paid',
                    backgroundColor: AppColors.success,
                    icon: const Icon(LucideIcons.checkCheck, size: 16, color: Colors.white),
                    onPressed: () => _submit('approved'),
                  ),
                ),
              ],
            ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _buildBankRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.dark)),
        ],
      ),
    );
  }
}
