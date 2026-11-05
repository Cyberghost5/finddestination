import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../common/widgets/custom_button.dart';
import '../providers/agent_provider.dart';
import 'agent_bank_modal.dart';

class AgentWithdrawModal extends StatefulWidget {
  final int? agentId;

  const AgentWithdrawModal({super.key, this.agentId});

  static Future<void> show(BuildContext context, {int? agentId}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AgentWithdrawModal(agentId: agentId),
    );
  }

  @override
  State<AgentWithdrawModal> createState() => _AgentWithdrawModalState();
}

class _AgentWithdrawModalState extends State<AgentWithdrawModal> {
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

  Future<void> _handleWithdraw(AgentProvider agentProvider) async {
    setState(() => _localError = null);

    final rawAmount = double.tryParse(_amountController.text.trim());
    if (rawAmount == null || rawAmount <= 0) {
      setState(() => _localError = 'Please enter a valid withdrawal amount.');
      return;
    }

    if (rawAmount < 1000) {
      setState(() => _localError = 'Minimum bounty withdrawal is ₦1,000.');
      return;
    }

    final balance = agentProvider.availableBalance;
    if (rawAmount > balance) {
      setState(() => _localError =
          'Amount exceeds available balance of ${agentProvider.wallet?.balanceFormatted ?? '₦0.00'}.');
      return;
    }

    final bankDetails = agentProvider.wallet?.bankDetails;
    if (bankDetails == null || !bankDetails.isConfigured) {
      setState(() => _localError = 'Please configure your payout bank account first.');
      return;
    }

    final success = await agentProvider.requestWithdrawal(
      amount: rawAmount,
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
                  agentProvider.successMessage ?? 'Withdrawal request submitted!',
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
        _localError = agentProvider.errorMessage ?? 'Could not submit withdrawal.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final agentProvider = context.watch<AgentProvider>();
    final wallet = agentProvider.wallet;
    final balance = wallet?.balance ?? 0.0;
    final bank = wallet?.bankDetails;

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
                    Icon(LucideIcons.wallet, color: AppColors.info, size: 22),
                    SizedBox(width: 10),
                    Text(
                      'Withdraw Bounty',
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
              'Disburse earned field inspection bounties to your verified Nigerian bank account.',
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
            ),
            const SizedBox(height: 20),

            // Available Bounty Balance Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.info.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.info.withValues(alpha: 0.2)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Available Bounty Balance',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        wallet?.balanceFormatted ?? '₦0.00',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: AppColors.info,
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
                          'Verified',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.success),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Quick Select Pills
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
                  _buildQuickPill('₦20,000', 20000, balance),
                  _buildQuickPill('₦50,000', 50000, balance),
                  if (balance > 0)
                    _buildQuickPill('All Funds', balance, balance, isHighlight: true),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Amount Input Field
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
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.info),
                  ),
                ),
                hintText: 'e.g. 20,000',
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
                  borderSide: const BorderSide(color: AppColors.info, width: 2),
                ),
              ),
            ),
            const SizedBox(height: 18),

            // Destination Bank Card
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
                      color: AppColors.infoBg,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(LucideIcons.landmark, color: AppColors.info, size: 20),
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
                              : 'Tap to configure settlement bank',
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      AgentBankModal.show(context, agentId: widget.agentId);
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
              text: 'Confirm Bounty Withdrawal',
              backgroundColor: AppColors.info,
              isLoading: agentProvider.isSubmitting,
              icon: const Icon(LucideIcons.arrowUpRight, color: Colors.white, size: 18),
              onPressed: () => _handleWithdraw(agentProvider),
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
                ? AppColors.info
                : (isDisabled ? AppColors.background : AppColors.cardBg),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isHighlight
                  ? AppColors.info
                  : (isDisabled ? AppColors.border : AppColors.info.withValues(alpha: 0.3)),
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: isHighlight
                  ? Colors.white
                  : (isDisabled ? AppColors.textMuted : AppColors.info),
            ),
          ),
        ),
      ),
    );
  }
}
