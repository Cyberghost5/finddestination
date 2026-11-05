import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../common/widgets/custom_button.dart';
import '../models/booking_model.dart';

class MonnifyPaymentModal extends StatefulWidget {
  final BookingModel booking;
  final VoidCallback onPaid;

  const MonnifyPaymentModal({
    super.key,
    required this.booking,
    required this.onPaid,
  });

  @override
  State<MonnifyPaymentModal> createState() => _MonnifyPaymentModalState();
}

class _MonnifyPaymentModalState extends State<MonnifyPaymentModal> {
  int _secondsRemaining = 900; // 15 minutes hold
  Timer? _timer;
  bool _isCopied = false;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() => _secondsRemaining--);
      } else {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String get _formattedTimer {
    final minutes = (_secondsRemaining ~/ 60).toString().padLeft(2, '0');
    final seconds = (_secondsRemaining % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  void _copyAccountNumber(String accountNum) {
    Clipboard.setData(ClipboardData(text: accountNum));
    setState(() => _isCopied = true);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Virtual account number copied to clipboard!'),
        backgroundColor: AppColors.primary,
        duration: Duration(seconds: 2),
      ),
    );
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) setState(() => _isCopied = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final booking = widget.booking;
    final accountNumber = booking.virtualAccountNumber ?? '8930219401';
    final bankName = booking.virtualBankName ?? 'Wema Bank / Moniepoint';
    final accountName = booking.virtualAccountName ?? 'FindDestination Escrow / ${booking.guestName}';

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      child: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Modal Grab Handle
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 14),

              // Monnify Header
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  shape: BoxShape.circle,
                ),
                child: const Icon(LucideIcons.building2, color: AppColors.primary, size: 28),
              ),
              const SizedBox(height: 12),

              const Text(
                'Monnify Escrow Bank Transfer',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.dark),
              ),
              const SizedBox(height: 4),
              const Text(
                'Transfer exact amount to the dedicated virtual account below:',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),

              const SizedBox(height: 16),

              // Countdown Hold Pill
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.goldLight,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(LucideIcons.clock, size: 14, color: AppColors.goldDark),
                    const SizedBox(width: 6),
                    Text(
                      'Reservation Hold Expires In: $_formattedTimer',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.goldDark),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Virtual Account Box
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    // Amount
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Amount to Pay', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                        Text(
                          booking.totalAmountFormatted,
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primary),
                        ),
                      ],
                    ),
                    const Divider(color: AppColors.border, height: 20),

                    // Account Number with copy button
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Account Number', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                            const SizedBox(height: 2),
                            Text(
                              accountNumber,
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.5,
                                color: AppColors.dark,
                              ),
                            ),
                          ],
                        ),
                        ElevatedButton.icon(
                          onPressed: () => _copyAccountNumber(accountNumber),
                          icon: Icon(
                            _isCopied ? LucideIcons.check : LucideIcons.copy,
                            size: 14,
                          ),
                          label: Text(_isCopied ? 'Copied' : 'Copy'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _isCopied ? AppColors.success : AppColors.dark,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 12),

                    // Bank Name
                    _buildAccountRow('Bank Name', bankName),
                    const SizedBox(height: 8),

                    // Beneficiary Account Name
                    _buildAccountRow('Beneficiary', accountName),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Confirmation Action
              CustomButton(
                text: 'I Have Completed The Bank Transfer',
                onPressed: widget.onPaid,
              ),

              const SizedBox(height: 10),

              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel / Change Payment Rail', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAccountRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.dark),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}
