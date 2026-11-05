import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../chat/providers/chat_provider.dart';
import '../../chat/screens/conversation_screen.dart';
import '../../common/widgets/custom_button.dart';
import '../models/booking_model.dart';
import '../providers/booking_provider.dart';
import 'voucher_screen.dart';

class OrderTrackerScreen extends StatefulWidget {
  final String? initialReference;

  const OrderTrackerScreen({super.key, this.initialReference});

  @override
  State<OrderTrackerScreen> createState() => _OrderTrackerScreenState();
}

class _OrderTrackerScreenState extends State<OrderTrackerScreen> {
  final _refController = TextEditingController();
  BookingModel? _trackedBooking;
  bool _hasSearched = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialReference != null && widget.initialReference!.isNotEmpty) {
      _refController.text = widget.initialReference!;
      WidgetsBinding.instance.addPostFrameCallback((_) => _track());
    }
  }

  @override
  void dispose() {
    _refController.dispose();
    super.dispose();
  }

  void _track() async {
    final ref = _refController.text.trim();
    if (ref.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a booking reference (e.g. TAF-XXXX)'), backgroundColor: AppColors.error),
      );
      return;
    }

    final bookingProvider = context.read<BookingProvider>();
    final result = await bookingProvider.trackBooking(ref);

    if (!mounted) return;
    setState(() {
      _trackedBooking = result;
      _hasSearched = true;
    });

    if (result == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(bookingProvider.errorMessage ?? 'Booking reference not found.'), backgroundColor: AppColors.error),
      );
    }
  }

  int _getStatusStep(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return 4;
      case 'checked_in':
        return 3;
      case 'confirmed':
        return 2;
      case 'pending':
      default:
        return 1;
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = context.watch<BookingProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Track Reservation Status'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Search Box
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Enter Booking Reference',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _refController,
                            textCapitalization: TextCapitalization.characters,
                            decoration: const InputDecoration(
                              hintText: 'e.g. TAF-89X2LK0A',
                              prefixIcon: Icon(LucideIcons.search, size: 18, color: AppColors.primary),
                            ),
                            onSubmitted: (_) => _track(),
                          ),
                        ),
                        const SizedBox(width: 10),
                        SizedBox(
                          height: 48,
                          child: ElevatedButton(
                            onPressed: bookingProvider.isLoading ? null : _track,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: bookingProvider.isLoading
                                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                : const Text('Track', style: TextStyle(fontWeight: FontWeight.w700)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Tracking Results
              if (_trackedBooking != null) ...[
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.border),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _trackedBooking!.propertyName,
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
                              ),
                              Text(
                                '${_trackedBooking!.roomName} • ${_trackedBooking!.propertyCity}',
                                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.primaryLight,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Text(
                              _trackedBooking!.bookingStatus.toUpperCase(),
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.primary),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),
                      const Divider(color: AppColors.border),
                      const SizedBox(height: 16),

                      // Stepper
                      const Text(
                        'Escrow & Stay Progress',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.dark),
                      ),
                      const SizedBox(height: 14),

                      _buildStep(
                        stepNumber: 1,
                        currentStep: _getStatusStep(_trackedBooking!.bookingStatus),
                        title: 'Reservation Initiated',
                        subtitle: 'Booking reference assigned to traveler',
                        icon: LucideIcons.calendarCheck,
                      ),
                      _buildStep(
                        stepNumber: 2,
                        currentStep: _getStatusStep(_trackedBooking!.bookingStatus),
                        title: 'Payment Confirmed & Retained in Escrow',
                        subtitle: 'Funds securely held until host check-in',
                        icon: LucideIcons.shieldCheck,
                      ),
                      _buildStep(
                        stepNumber: 3,
                        currentStep: _getStatusStep(_trackedBooking!.bookingStatus),
                        title: 'Guest Check-In Validated',
                        subtitle: 'Arrival verified at property front desk',
                        icon: LucideIcons.hotel,
                      ),
                      _buildStep(
                        stepNumber: 4,
                        currentStep: _getStatusStep(_trackedBooking!.bookingStatus),
                        title: 'Stay Completed & Host Payout Released',
                        subtitle: 'Escrow settled to host settlement account',
                        icon: LucideIcons.checkCircle2,
                        isLast: true,
                      ),

                      const SizedBox(height: 20),

                      // View Voucher Button
                      CustomButton(
                        text: 'View Official Voucher Pass',
                        icon: const Icon(LucideIcons.ticket, size: 18, color: Colors.white),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => VoucherScreen(booking: _trackedBooking!),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 10),
                      CustomButton(
                        text: 'Chat with Host',
                        isOutlined: true,
                        icon: const Icon(LucideIcons.messageSquare, size: 16, color: AppColors.primary),
                        textColor: AppColors.primary,
                        onPressed: () async {
                          final chatProvider = context.read<ChatProvider>();
                          final thread = await chatProvider.startBookingChat(
                            bookingReference: _trackedBooking!.bookingReference,
                            propertyId: _trackedBooking!.propertyId,
                          );
                          if (!mounted) return;
                          if (thread != null) {
                            Navigator.push(
                              this.context,
                              MaterialPageRoute(builder: (_) => ConversationScreen(thread: thread)),
                            );
                          }
                        },
                      ),
                    ],
                  ),
                ),
              ] else if (_hasSearched) ...[
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(40),
                    child: Column(
                      children: [
                        const Icon(LucideIcons.searchX, size: 48, color: AppColors.textMuted),
                        const SizedBox(height: 12),
                        const Text(
                          'No Booking Found',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.dark),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Please verify your reference code format (e.g. TAF-XXXX).',
                          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStep({
    required int stepNumber,
    required int currentStep,
    required String title,
    required String subtitle,
    required IconData icon,
    bool isLast = false,
  }) {
    final isDone = currentStep >= stepNumber;
    final isCurrent = currentStep == stepNumber;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: isDone ? AppColors.primary : AppColors.background,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isDone ? AppColors.primary : AppColors.border,
                  width: 2,
                ),
              ),
              child: Icon(
                icon,
                size: 16,
                color: isDone ? Colors.white : AppColors.textMuted,
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 36,
                color: isDone ? AppColors.primary : AppColors.border,
              ),
          ],
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: 4, bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: isCurrent || isDone ? FontWeight.w700 : FontWeight.w500,
                    color: isCurrent || isDone ? AppColors.dark : AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
