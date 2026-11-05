import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../common/widgets/custom_button.dart';
import '../providers/host_provider.dart';
import 'bank_setup_modal.dart';

class WithdrawFundsModal extends StatefulWidget {
  final int? hostId;

  const WithdrawFundsModal({super.key, this.hostId});

  static Future<void> show(BuildContext context, {int? hostId}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => WithdrawFundsModal(hostId: hostId),
    );
  }

  @override
  State<WithdrawFundsModal> createState() => _WithdrawFundsModalState();
}

class _WithdrawFundsModalState extends State<WithdrawFundsModal> {
  final _amountController = TextEditingController();
  String? _localError;

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  void _selectQuickAmount(double amount) {
    setState(() {
      _amountController.text = amount.toStringAsFixed(0);
      _localError = null;
    });
  }

  Future<void> _handleWithdraw(HostProvider hostProvider) async {
    setState(() => _localError = null);

    final rawAmount = double.tryParse(_amountController.text.trim());
    if (rawAmount == null || rawAmount <= 0) {
      setState(() => _localError = 'Please enter a valid withdrawal amount.');
      return;
    }

    if (rawAmount < 1000) {
      setState(() => _localError = 'Minimum payout settlement is ₦1,000.');
      return;
    }

    final balance = hostProvider.escrowBalance;
    if (rawAmount > balance) {
      setState(() => _localError =
          'Amount exceeds cleared escrow balance of ${hostProvider.payoutData?.balanceFormatted ?? '₦0.00'}.');
      return;
    }

    final bankDetails = hostProvider.payoutData?.bankDetails;
    if (bankDetails == null || !bankDetails.isConfigured) {
      setState(() => _localError = 'Please configure your bank details first.');
      return;
    }

    final success = await hostProvider.requestWithdrawal(
      amount: rawAmount,
      hostId: widget.hostId,
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
                  hostProvider.successMessage ?? 'Withdrawal request submitted!',
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
    } else {
      setState(() {
        _localError = hostProvider.errorMessage ?? 'Could not submit withdrawal.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final hostProvider = context.watch<HostProvider>();
    final payout = hostProvider.payoutData;
    final balance = payout?.balance ?? 0.0;
    final bank = payout?.bankDetails;

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

            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(LucideIcons.landmark, color: AppColors.primary, size: 22),
                    SizedBox(width: 10),
                    Text(
                      'Request Payout',
                      style: TextStyle(
                        fontSize: 20,
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
              'Disburse cleared guest booking funds directly to your verified corporate bank account.',
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
            ),
            const SizedBox(height: 20),

            // Available Escrow Balance Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Available Escrow Balance',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        payout?.balanceFormatted ?? '₦0.00',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.successBg,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      children: [
                        Icon(LucideIcons.shieldCheck, size: 14, color: AppColors.success),
                        SizedBox(width: 4),
                        Text(
                          'Cleared',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.success),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Preset Amount Pills
            const Text(
              'Quick Select Amount',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
            ),
            const SizedBox(height: 8),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildQuickPill('₦10,000', 10000, balance),
                  _buildQuickPill('₦25,000', 25000, balance),
                  _buildQuickPill('₦50,000', 50000, balance),
                  _buildQuickPill('₦100,000', 100000, balance),
                  if (balance > 0)
                    _buildQuickPill('All Cleared', balance, balance, isHighlight: true),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Amount Field
            const Text(
              'Withdrawal Amount (₦)',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _amountController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.dark),
              decoration: InputDecoration(
                prefixIcon: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  child: Text(
                    '₦',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.primary),
                  ),
                ),
                hintText: 'e.g. 50,000',
                hintStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: AppColors.textMuted),
                filled: true,
                fillColor: AppColors.background,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: AppColors.primary, width: 2),
                ),
              ),
            ),
            const SizedBox(height: 18),

            // Settlement Destination Bank Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(LucideIcons.building, color: AppColors.goldDark, size: 20),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          bank?.bankName ?? 'Bank Account Not Set',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: AppColors.dark,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          bank != null && bank.accountNumber.isNotEmpty
                              ? '${bank.accountNumber} • ${bank.accountName}'
                              : 'Tap to configure corporate account',
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      BankSetupModal.show(context, hostId: widget.hostId);
                    },
                    child: const Text('Change', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            ),

            if (_localError != null) ...[
              const SizedBox(height: 14),
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
                        _localError!,
                        style: const TextStyle(fontSize: 12, color: AppColors.error, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 24),

            // Submit Button
            CustomButton(
              text: 'Confirm Payout Request',
              isLoading: hostProvider.isSubmitting,
              icon: const Icon(LucideIcons.arrowUpRight, color: Colors.white, size: 18),
              onPressed: () => _handleWithdraw(hostProvider),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickPill(String label, double amount, double balance, {bool isHighlight = false}) {
    final isDisabled = amount > balance && balance > 0;

    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: InkWell(
        onTap: isDisabled ? null : () => _selectQuickAmount(amount),
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(
            color: isHighlight
                ? AppColors.primary
                : (isDisabled ? AppColors.background : AppColors.cardBg),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isHighlight
                  ? AppColors.primary
                  : (isDisabled ? AppColors.border : AppColors.primary.withValues(alpha: 0.3)),
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: isHighlight
                  ? Colors.white
                  : (isDisabled ? AppColors.textMuted : AppColors.primary),
            ),
          ),
        ),
      ),
    );
  }
}
