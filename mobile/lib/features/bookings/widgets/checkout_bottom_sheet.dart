import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../auth/providers/auth_provider.dart';
import '../../common/widgets/custom_button.dart';
import '../../common/widgets/custom_text_field.dart';
import '../../properties/models/property_model.dart';
import '../../properties/models/room_type_model.dart';
import '../providers/booking_provider.dart';
import '../screens/voucher_screen.dart';
import 'monnify_payment_modal.dart';

class CheckoutBottomSheet extends StatefulWidget {
  final PropertyModel property;
  final RoomTypeModel selectedRoom;

  const CheckoutBottomSheet({
    super.key,
    required this.property,
    required this.selectedRoom,
  });

  @override
  State<CheckoutBottomSheet> createState() => _CheckoutBottomSheetState();
}

class _CheckoutBottomSheetState extends State<CheckoutBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();

  late DateTime _checkInDate;
  late DateTime _checkOutDate;
  int _roomsCount = 1;
  String _selectedGateway = 'monnify'; // 'monnify' or 'paystack'

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _checkInDate = now.add(const Duration(days: 1));
    _checkOutDate = now.add(const Duration(days: 3));

    final auth = context.read<AuthProvider>();
    if (auth.user != null) {
      _nameController.text = auth.user!.name;
      _emailController.text = auth.user!.email;
      _phoneController.text = auth.user!.phone ?? '';
    } else {
      _nameController.text = 'Guest Traveler';
      _emailController.text = 'traveler@finddestination.com.ng';
      _phoneController.text = '+2348021112233';
    }

    final bookingProvider = context.read<BookingProvider>();
    _selectedGateway = bookingProvider.activeGateway;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  int get _nights {
    final diff = _checkOutDate.difference(_checkInDate).inDays;
    return diff > 0 ? diff : 1;
  }

  int get _totalAmountKobo {
    return widget.selectedRoom.priceKobo * _nights * _roomsCount;
  }

  Future<void> _pickDateRange() async {
    final now = DateTime.now();
    final picked = await showDateRangePicker(
      context: context,
      firstDate: now,
      lastDate: now.add(const Duration(days: 180)),
      initialDateRange: DateTimeRange(start: _checkInDate, end: _checkOutDate),
      builder: (context, child) {
        return Theme(
          data: ThemeData.light().copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primary,
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: AppColors.dark,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _checkInDate = picked.start;
        _checkOutDate = picked.end;
      });
    }
  }

  void _handleCheckout() async {
    if (!_formKey.currentState!.validate()) return;

    final bookingProvider = context.read<BookingProvider>();
    final dateFormat = DateFormat('yyyy-MM-dd');

    final booking = await bookingProvider.createBooking(
      propertyId: widget.property.id,
      propertyName: widget.property.name,
      propertyCity: widget.property.city,
      propertyState: widget.property.state,
      propertyAddress: widget.property.address,
      roomTypeId: widget.selectedRoom.id,
      roomName: widget.selectedRoom.name,
      roomPriceKobo: widget.selectedRoom.priceKobo,
      roomsCount: _roomsCount,
      checkInDate: dateFormat.format(_checkInDate),
      checkOutDate: dateFormat.format(_checkOutDate),
      guestName: _nameController.text.trim(),
      guestEmail: _emailController.text.trim(),
      guestPhone: _phoneController.text.trim(),
      paymentGateway: _selectedGateway,
    );

    if (!mounted) return;

    if (booking != null) {
      Navigator.pop(context); // Close checkout bottom sheet

      if (_selectedGateway == 'monnify') {
        // Open Monnify Virtual Account dialog
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (ctx) => MonnifyPaymentModal(
            booking: booking,
            onPaid: () {
              Navigator.pop(ctx);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => VoucherScreen(booking: booking)),
              );
            },
          ),
        );
      } else {
        // Paystack Card / Direct Voucher
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => VoucherScreen(booking: booking)),
        );
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(bookingProvider.errorMessage ?? 'Failed to initiate booking.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = context.watch<BookingProvider>();
    final dateFormat = DateFormat('EEE, MMM d');

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Modal Handle & Header
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Confirm Reservation',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.dark),
                    ),
                    IconButton(
                      icon: const Icon(LucideIcons.x, size: 20),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),

                const Divider(color: AppColors.border),
                const SizedBox(height: 12),

                // Selected Room Summary Card
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(LucideIcons.hotel, color: AppColors.primary, size: 22),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.selectedRoom.name,
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primaryDark),
                            ),
                            Text(
                              '${widget.property.name} • ${widget.property.city}',
                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      Text(
                        widget.selectedRoom.priceFormatted,
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primary),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 18),

                // Date Range Picker Row
                const Text(
                  'Trip Dates',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
                ),
                const SizedBox(height: 8),

                InkWell(
                  onTap: _pickDateRange,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.calendar, size: 18, color: AppColors.primary),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${dateFormat.format(_checkInDate)} — ${dateFormat.format(_checkOutDate)}',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
                              ),
                              Text(
                                '$_nights ${_nights == 1 ? 'Night' : 'Nights'} duration',
                                style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ),
                        const Icon(LucideIcons.chevronRight, size: 16, color: AppColors.textSecondary),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Rooms Count Stepper
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Number of Rooms',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
                        ),
                        Text(
                          'Units requested for stay',
                          style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          IconButton(
                            icon: const Icon(LucideIcons.minus, size: 16),
                            onPressed: _roomsCount > 1
                                ? () => setState(() => _roomsCount--)
                                : null,
                          ),
                          Text(
                            '$_roomsCount',
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.dark),
                          ),
                          IconButton(
                            icon: const Icon(LucideIcons.plus, size: 16),
                            onPressed: _roomsCount < 10
                                ? () => setState(() => _roomsCount++)
                                : null,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // Guest Contact Form
                const Text(
                  'Lead Guest Contact Information',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
                ),
                const SizedBox(height: 8),

                CustomTextField(
                  controller: _nameController,
                  label: 'Full Legal Name',
                  hintText: 'e.g. Musa Danjuma',
                  prefixIcon: const Icon(LucideIcons.user, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter guest name' : null,
                ),

                const SizedBox(height: 12),

                CustomTextField(
                  controller: _emailController,
                  label: 'Email (Voucher will be sent here)',
                  hintText: 'e.g. musa@example.com',
                  keyboardType: TextInputType.emailAddress,
                  prefixIcon: const Icon(LucideIcons.mail, size: 18, color: AppColors.textMuted),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Please enter guest email';
                    if (!v.contains('@')) return 'Enter valid email';
                    return null;
                  },
                ),

                const SizedBox(height: 12),

                CustomTextField(
                  controller: _phoneController,
                  label: 'Phone Number (Hotel check-in SMS)',
                  hintText: '+234 802 000 0000',
                  keyboardType: TextInputType.phone,
                  prefixIcon: const Icon(LucideIcons.phone, size: 18, color: AppColors.textMuted),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter contact phone' : null,
                ),

                const SizedBox(height: 20),

                // Payment Gateway Selector (Strategy Pattern)
                const Text(
                  'Select Payment Rail',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
                ),
                const SizedBox(height: 8),

                Row(
                  children: [
                    // Monnify Bank Transfer
                    Expanded(
                      child: _buildGatewayOption(
                        railKey: 'monnify',
                        title: 'Bank Transfer',
                        subtitle: 'Monnify Dynamic Virtual Acct',
                        icon: LucideIcons.building2,
                      ),
                    ),
                    const SizedBox(width: 10),
                    // Paystack Card
                    Expanded(
                      child: _buildGatewayOption(
                        railKey: 'paystack',
                        title: 'Debit Card / USSD',
                        subtitle: 'Paystack Instant Rail',
                        icon: LucideIcons.creditCard,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // Pricing Summary Box
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    children: [
                      _buildPriceRow(
                        '${widget.selectedRoom.priceFormatted} × $_nights ${_nights == 1 ? 'night' : 'nights'} × $_roomsCount ${_roomsCount == 1 ? 'room' : 'rooms'}',
                        CurrencyFormatter.formatKobo(_totalAmountKobo),
                      ),
                      const SizedBox(height: 6),
                      _buildPriceRow('Escrow Settlement & Platform Fee', 'Included'),
                      const SizedBox(height: 6),
                      _buildPriceRow('Taxes & Local Tourism Levies', '₦0.00'),
                      const Divider(color: AppColors.border, height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Total Amount Due',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.dark),
                          ),
                          Text(
                            CurrencyFormatter.formatKobo(_totalAmountKobo),
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primary),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 22),

                // Confirm CTA Button
                CustomButton(
                  text: 'Confirm & Pay ${CurrencyFormatter.formatKobo(_totalAmountKobo)}',
                  isLoading: bookingProvider.isLoading,
                  onPressed: _handleCheckout,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGatewayOption({
    required String railKey,
    required String title,
    required String subtitle,
    required IconData icon,
  }) {
    final isSelected = _selectedGateway == railKey;

    return InkWell(
      onTap: () => setState(() => _selectedGateway = railKey),
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryLight : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 16, color: isSelected ? AppColors.primary : AppColors.textSecondary),
                const Spacer(),
                if (isSelected)
                  const Icon(LucideIcons.checkCircle2, size: 16, color: AppColors.primary),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              title,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: isSelected ? AppColors.primaryDark : AppColors.dark,
              ),
            ),
            Text(
              subtitle,
              style: const TextStyle(fontSize: 10, color: AppColors.textSecondary),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriceRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.dark)),
      ],
    );
  }
}
