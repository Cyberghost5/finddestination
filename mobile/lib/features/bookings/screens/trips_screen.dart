import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../auth/providers/auth_provider.dart';
import '../../auth/screens/login_screen.dart';
import '../../chat/providers/chat_provider.dart';
import '../../chat/screens/conversation_screen.dart';
import '../../common/widgets/custom_button.dart';
import '../models/booking_model.dart';
import '../providers/booking_provider.dart';
import 'order_tracker_screen.dart';
import 'voucher_screen.dart';

class TripsScreen extends StatefulWidget {
  final VoidCallback onExploreTap;

  const TripsScreen({super.key, required this.onExploreTap});

  @override
  State<TripsScreen> createState() => _TripsScreenState();
}

class _TripsScreenState extends State<TripsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      if (auth.user != null) {
        context.read<BookingProvider>().fetchMyTrips(auth.user!.email);
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<BookingModel> _filterTrips(List<BookingModel> trips, int tabIndex) {
    if (tabIndex == 1) {
      // Active / Confirmed
      return trips.where((t) => t.bookingStatus == 'confirmed' || t.bookingStatus == 'checked_in' || t.bookingStatus == 'pending').toList();
    } else if (tabIndex == 2) {
      // Completed / Past
      return trips.where((t) => t.bookingStatus == 'completed' || t.bookingStatus == 'cancelled').toList();
    }
    return trips;
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final bookingProvider = context.watch<BookingProvider>();
    final trips = bookingProvider.myTrips;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Trips & Vouchers'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
          tabs: const [
            Tab(text: 'All Trips'),
            Tab(text: 'Active / Upcoming'),
            Tab(text: 'Past Stays'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.search, size: 20),
            tooltip: 'Track Reference',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const OrderTrackerScreen()),
              );
            },
          ),
        ],
      ),
      body: !auth.isAuthenticated && trips.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(LucideIcons.ticket, size: 36, color: AppColors.primary),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Sign In to Access Your Trips',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.dark),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Sign in to synchronize your verified reservations and download official vouchers across all devices.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: 180,
                      child: CustomButton(
                        text: 'Sign In',
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const LoginScreen()),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            )
          : TabBarView(
              controller: _tabController,
              children: [
                _buildTripsList(_filterTrips(trips, 0)),
                _buildTripsList(_filterTrips(trips, 1)),
                _buildTripsList(_filterTrips(trips, 2)),
              ],
            ),
    );
  }

  Widget _buildTripsList(List<BookingModel> list) {
    if (list.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(LucideIcons.calendarX, size: 48, color: AppColors.textMuted),
              const SizedBox(height: 16),
              const Text(
                'No reservations found',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.dark),
              ),
              const SizedBox(height: 6),
              const Text(
                'Explore vetted stays and your reservations will automatically appear here.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: 160,
                child: CustomButton(
                  text: 'Explore Stays',
                  onPressed: widget.onExploreTap,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      separatorBuilder: (_, __) => const SizedBox(height: 14),
      itemBuilder: (context, index) {
        final booking = list[index];
        return _buildTripCard(booking);
      },
    );
  }

  Widget _buildTripCard(BookingModel booking) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Thumbnail
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: 76,
                    height: 76,
                    color: AppColors.background,
                    child: booking.propertyImage != null
                        ? CachedNetworkImage(
                            imageUrl: booking.propertyImage!,
                            fit: BoxFit.cover,
                            errorWidget: (_, __, ___) => const Icon(LucideIcons.hotel, color: AppColors.textMuted),
                          )
                        : const Icon(LucideIcons.hotel, color: AppColors.textMuted),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              booking.propertyName,
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.dark),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: booking.bookingStatus == 'confirmed' ? AppColors.successBg : AppColors.goldLight,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              booking.bookingStatus.toUpperCase(),
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: booking.bookingStatus == 'confirmed' ? AppColors.success : AppColors.goldDark,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '${booking.propertyCity}, ${booking.propertyState}',
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '${booking.checkInDate} — ${booking.checkOutDate} • ${booking.totalNights} ${booking.totalNights == 1 ? 'Night' : 'Nights'}',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.dark),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const Divider(color: AppColors.border, height: 1),

          // Action Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Row(
              children: [
                Text(
                  booking.totalAmountFormatted,
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primary),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(LucideIcons.messageSquare, size: 16, color: AppColors.primary),
                  tooltip: 'Chat with Host',
                  onPressed: () async {
                    final chatProvider = context.read<ChatProvider>();
                    final thread = await chatProvider.startBookingChat(
                      bookingReference: booking.bookingReference,
                      propertyId: booking.propertyId,
                    );
                    if (!mounted) return;
                    if (thread != null) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => ConversationScreen(thread: thread)),
                      );
                    }
                  },
                ),
                TextButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => OrderTrackerScreen(initialReference: booking.bookingReference),
                      ),
                    );
                  },
                  icon: const Icon(LucideIcons.activity, size: 14, color: AppColors.textSecondary),
                  label: const Text('Track', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => VoucherScreen(booking: booking),
                      ),
                    );
                  },
                  icon: const Icon(LucideIcons.ticket, size: 14, color: Colors.white),
                  label: const Text('Voucher', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
