import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../models/admin_models.dart';

class AdminTransactionDetailModal extends StatelessWidget {
  final AdminTransactionModel transaction;

  const AdminTransactionDetailModal({super.key, required this.transaction});

  @override
  Widget build(BuildContext context) {
    final tx = transaction;

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
                  Icon(LucideIcons.receipt, color: AppColors.primary, size: 22),
                  SizedBox(width: 8),
                  Text(
                    'Transaction & Audit Breakdown',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.dark),
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

          // Total Volume Banner
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: tx.gateway == 'paystack' ? AppColors.infoBg : AppColors.goldLight,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        tx.gateway.toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: tx.gateway == 'paystack' ? AppColors.info : AppColors.goldDark,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: tx.isSuccessful ? AppColors.successBg : AppColors.goldLight,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        tx.status.toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: tx.isSuccessful ? AppColors.success : AppColors.goldDark,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  tx.amountFormatted,
                  style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.primary),
                ),
                const SizedBox(height: 4),
                Text(
                  tx.transactionReference,
                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontFamily: 'monospace'),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Split Breakdown: Platform Commission vs Host Payout
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'PLATFORM (12.5%)',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primary),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        tx.platformCommissionFormatted,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.primary),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.successBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.success.withValues(alpha: 0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'HOST ESCROW (87.5%)',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.success),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        tx.hostPayoutFormatted,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.success),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Linked Reservation Info
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Linked Reservation Details',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.dark),
                ),
                const SizedBox(height: 8),
                _buildRow('Booking Ref', tx.bookingReference ?? 'N/A'),
                _buildRow('Property', tx.propertyName ?? 'General Reservation'),
                _buildRow('Guest', tx.guestName ?? 'Guest Traveler'),
                _buildRow('Email', tx.guestEmail ?? 'Not specified'),
                if (tx.virtualAccountNumber != null)
                  _buildRow('Virtual Acct', '${tx.virtualBankName ?? 'Bank'} - ${tx.virtualAccountNumber}'),
                _buildRow('Channel', tx.paymentChannel.toUpperCase()),
                _buildRow('Timestamp', tx.createdAt),
              ],
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _buildRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          Flexible(
            child: Text(
              value,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.dark),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
