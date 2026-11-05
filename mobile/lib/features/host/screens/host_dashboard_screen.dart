import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../auth/providers/auth_provider.dart';
import '../../common/widgets/custom_button.dart';
import '../../properties/models/property_model.dart';
import '../../properties/screens/property_detail_screen.dart';
import '../models/host_payout_model.dart';
import '../providers/host_provider.dart';
import '../widgets/bank_setup_modal.dart';
import '../widgets/withdraw_funds_modal.dart';
import 'listing_wizard_screen.dart';

class HostDashboardScreen extends StatefulWidget {
  final VoidCallback? onSwitchToGuest;

  const HostDashboardScreen({super.key, this.onSwitchToGuest});

  @override
  State<HostDashboardScreen> createState() => _HostDashboardScreenState();
}

class _HostDashboardScreenState extends State<HostDashboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    final auth = context.read<AuthProvider>();
    final hostProvider = context.read<HostProvider>();
    await hostProvider.fetchDashboardData(hostId: auth.user?.id);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final hostProvider = context.watch<HostProvider>();
    final user = auth.user;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'FindDestination',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.goldDark),
            ),
            Text(
              user?.businessName ?? user?.name ?? 'Host Partner Portal',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.gold.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              children: [
                Icon(LucideIcons.building, size: 12, color: AppColors.goldDark),
                SizedBox(width: 4),
                Text(
                  'HOST',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.goldDark),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 18),
            onPressed: hostProvider.isLoading ? null : _loadData,
          ),
          const SizedBox(width: 6),
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
          tabs: [
            const Tab(
              icon: Icon(LucideIcons.layoutDashboard, size: 18),
              text: 'Overview',
            ),
            Tab(
              icon: const Icon(LucideIcons.building2, size: 18),
              text: 'Listings (${hostProvider.properties.length})',
            ),
            Tab(
              icon: const Icon(LucideIcons.calendarCheck, size: 18),
              text: 'Bookings (${hostProvider.bookings.length})',
            ),
            const Tab(
              icon: Icon(LucideIcons.wallet, size: 18),
              text: 'Payouts',
            ),
          ],
        ),
      ),
      body: hostProvider.isLoading && hostProvider.payoutData == null
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildOverviewTab(hostProvider, auth),
                _buildListingsTab(hostProvider),
                _buildBookingsTab(hostProvider),
                _buildPayoutsTab(hostProvider, auth),
              ],
            ),
      floatingActionButton: _tabController.index == 1
          ? FloatingActionButton.extended(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ListingWizardScreen()),
                );
              },
              backgroundColor: AppColors.primary,
              icon: const Icon(LucideIcons.plus, color: Colors.white, size: 18),
              label: const Text('Add Property', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
            )
          : null,
    );
  }

  // TAB 1: OVERVIEW
  Widget _buildOverviewTab(HostProvider host, AuthProvider auth) {
    final payout = host.payoutData;

    return RefreshIndicator(
      onRefresh: _loadData,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Escrow Balance Hero Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F2B24), Color(0xFF1B4332)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0F2B24).withValues(alpha: 0.3),
                    offset: const Offset(0, 10),
                    blurRadius: 20,
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(LucideIcons.shieldCheck, color: Color(0xFF52B788), size: 18),
                          SizedBox(width: 8),
                          Text(
                            'Cleared Escrow Balance',
                            style: TextStyle(
                              fontSize: 13,
                              color: Color(0xFFD8F3DC),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          'Instant Bank Payout',
                          style: TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    payout?.balanceFormatted ?? '₦0.00',
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            WithdrawFundsModal.show(context, hostId: auth.user?.id);
                          },
                          icon: const Icon(LucideIcons.arrowUpRight, size: 16, color: AppColors.primary),
                          label: const Text(
                            'Withdraw Funds',
                            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.primary),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      OutlinedButton.icon(
                        onPressed: () async {
                          final success = await host.seedDemoEscrow(hostId: auth.user?.id);
                          if (mounted && success) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Demo Escrow seeded with ₦150,000 for payout testing!'),
                                backgroundColor: AppColors.success,
                              ),
                            );
                          }
                        },
                        icon: const Icon(LucideIcons.sparkles, size: 14, color: Color(0xFFD8F3DC)),
                        label: const Text(
                          '+₦150k Demo',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFF52B788)),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 4 Key Stats Metrics
            const Text(
              'Performance & Volume',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
            ),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    title: 'Total Revenue',
                    value: payout?.totalEarnedFormatted ?? '₦0.00',
                    icon: LucideIcons.trendingUp,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    title: 'Active Listings',
                    value: '${host.activeListingsCount}',
                    icon: LucideIcons.building,
                    color: AppColors.goldDark,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    title: 'Guest Bookings',
                    value: '${host.confirmedBookingsCount}',
                    icon: LucideIcons.calendarCheck,
                    color: AppColors.info,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    title: 'Pending Payout',
                    value: payout?.pendingPayoutFormatted ?? '₦0.00',
                    icon: LucideIcons.clock,
                    color: const Color(0xFF7E22CE),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 28),

            // Quick Actions Rail
            const Text(
              'Quick Management',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
            ),
            const SizedBox(height: 12),

            _buildActionTile(
              title: 'Add New Property Listing',
              subtitle: 'Publish rooms, nightly rates, amenities & CAC registration',
              icon: LucideIcons.plusCircle,
              color: AppColors.primary,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ListingWizardScreen()),
                );
              },
            ),
            const SizedBox(height: 10),
            _buildActionTile(
              title: 'Corporate Bank Setup',
              subtitle: payout?.bankDetails.isConfigured == true
                  ? '${payout!.bankDetails.bankName} (${payout.bankDetails.accountNumber})'
                  : 'Configure corporate settlement account',
              icon: LucideIcons.landmark,
              color: AppColors.goldDark,
              onTap: () => BankSetupModal.show(context, hostId: auth.user?.id),
            ),
            if (widget.onSwitchToGuest != null) ...[
              const SizedBox(height: 10),
              _buildActionTile(
                title: 'Switch to Guest / Traveler View',
                subtitle: 'Explore stays and search properties across Nigeria',
                icon: LucideIcons.compass,
                color: AppColors.info,
                onTap: widget.onSwitchToGuest!,
              ),
            ],
            const SizedBox(height: 28),

            // Recent Bookings Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Recent Reservations',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
                ),
                TextButton(
                  onPressed: () => _tabController.animateTo(2),
                  child: const Text('View All', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                ),
              ],
            ),
            const SizedBox(height: 8),

            if (host.bookings.isEmpty)
              _buildEmptyPlaceholder(
                icon: LucideIcons.calendarX2,
                title: 'No Incoming Reservations Yet',
                description: 'Guest bookings made to your verified properties will appear here with instant escrow hold.',
              )
            else
              ...host.bookings.take(3).map((b) => _buildBookingItem(b)),
          ],
        ),
      ),
    );
  }

  // TAB 2: MY LISTINGS
  Widget _buildListingsTab(HostProvider host) {
    if (host.properties.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 70,
                height: 70,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(LucideIcons.building, size: 36, color: AppColors.primary),
              ),
              const SizedBox(height: 20),
              const Text(
                'No Properties Listed Yet',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.dark),
              ),
              const SizedBox(height: 8),
              const Text(
                'Start earning by publishing your hotel, apartment or guesthouse to travelers across Nigeria.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
              ),
              const SizedBox(height: 24),
              CustomButton(
                text: 'Create First Listing',
                icon: const Icon(LucideIcons.plus, color: Colors.white, size: 18),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ListingWizardScreen()),
                  );
                },
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView.separated(
        padding: const EdgeInsets.all(20),
        itemCount: host.properties.length,
        separatorBuilder: (_, __) => const SizedBox(height: 16),
        itemBuilder: (ctx, index) {
          final prop = host.properties[index];
          return _buildListingCard(prop, host);
        },
      ),
    );
  }

  Widget _buildListingCard(PropertyModel prop, HostProvider host) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            offset: const Offset(0, 4),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image with Badges
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                child: CachedNetworkImage(
                  imageUrl: prop.images.isNotEmpty ? prop.images[0] : '',
                  height: 160,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Container(color: AppColors.border),
                  errorWidget: (_, __, ___) => Container(
                    color: AppColors.cardBg,
                    child: const Icon(LucideIcons.image, size: 40, color: AppColors.textMuted),
                  ),
                ),
              ),
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.75),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    prop.propertyType.replaceAll('_', ' ').toUpperCase(),
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white),
                  ),
                ),
              ),
              Positioned(
                top: 12,
                right: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: prop.isPublished ? AppColors.success : AppColors.textMuted,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        prop.isPublished ? LucideIcons.eye : LucideIcons.eyeOff,
                        size: 12,
                        color: Colors.white,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        prop.isPublished ? 'PUBLISHED' : 'DRAFT',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        prop.name,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.gold.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Row(
                        children: [
                          Icon(LucideIcons.shieldCheck, size: 12, color: AppColors.goldDark),
                          SizedBox(width: 4),
                          Text(
                            'Tier 1 Docs',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.goldDark),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(LucideIcons.mapPin, size: 14, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(
                      '${prop.city}, ${prop.state}',
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Price and Toggle Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Tariff / Night', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                        Text(
                          prop.startingPriceFormatted,
                          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: AppColors.primary),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        const Text('Active', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.dark)),
                        const SizedBox(width: 4),
                        Switch(
                          value: prop.isPublished,
                          activeThumbColor: AppColors.primary,
                          onChanged: (_) => host.togglePublish(prop.id),
                        ),
                        IconButton(
                          icon: const Icon(LucideIcons.externalLink, size: 18, color: AppColors.primary),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => PropertyDetailScreen(property: prop)),
                            );
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // TAB 3: BOOKINGS
  Widget _buildBookingsTab(HostProvider host) {
    if (host.bookings.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 70,
                height: 70,
                decoration: BoxDecoration(
                  color: AppColors.infoBg,
                  shape: BoxShape.circle,
                ),
                child: const Icon(LucideIcons.calendar, size: 36, color: AppColors.info),
              ),
              const SizedBox(height: 20),
              const Text(
                'No Guest Reservations Yet',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.dark),
              ),
              const SizedBox(height: 8),
              const Text(
                'When guests book your rooms on FindDestination, their stay details and escrow payout records will appear here.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView.separated(
        padding: const EdgeInsets.all(20),
        itemCount: host.bookings.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (ctx, index) {
          final b = host.bookings[index];
          return _buildBookingItem(b);
        },
      ),
    );
  }

  Widget _buildBookingItem(HostBookingModel b) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                b.id,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                  fontFamily: 'monospace',
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.successBg,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  b.payoutStatus,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.success),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            b.guestName,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.dark),
          ),
          const SizedBox(height: 4),
          Text(
            '${b.property} • ${b.room}',
            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(LucideIcons.calendar, size: 13, color: AppColors.textMuted),
              const SizedBox(width: 4),
              Text(b.dates, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              const Spacer(),
              Text(
                b.amount,
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppColors.dark),
              ),
            ],
          ),
          const Divider(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(LucideIcons.creditCard, size: 12, color: AppColors.textMuted),
                  const SizedBox(width: 4),
                  Text(b.rail, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                ],
              ),
              if (b.guestPhone.isNotEmpty)
                Text(
                  b.guestPhone,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primary),
                ),
            ],
          ),
        ],
      ),
    );
  }

  // TAB 4: PAYOUTS & SETTLEMENT
  Widget _buildPayoutsTab(HostProvider host, AuthProvider auth) {
    final payout = host.payoutData;
    final bank = payout?.bankDetails;

    return RefreshIndicator(
      onRefresh: _loadData,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Big Balance Card
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: AppColors.border),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    offset: const Offset(0, 4),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(LucideIcons.wallet, color: AppColors.primary, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Escrow Settlement Balance',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.dark),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    payout?.balanceFormatted ?? '₦0.00',
                    style: const TextStyle(fontSize: 34, fontWeight: FontWeight.w900, color: AppColors.primary),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Total Earned', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                            Text(
                              payout?.totalEarnedFormatted ?? '₦0.00',
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.dark),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Pending Clearance', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                            Text(
                              payout?.pendingPayoutFormatted ?? '₦0.00',
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.goldDark),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  CustomButton(
                    text: 'Request Payout to Bank',
                    icon: const Icon(LucideIcons.arrowUpRight, color: Colors.white, size: 18),
                    onPressed: () {
                      WithdrawFundsModal.show(context, hostId: auth.user?.id);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Bank Account Card
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Corporate Settlement Bank',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
                ),
                TextButton(
                  onPressed: () => BankSetupModal.show(context, hostId: auth.user?.id),
                  child: Text(bank?.isConfigured == true ? 'Update' : 'Configure',
                      style: const TextStyle(fontWeight: FontWeight.w700)),
                ),
              ],
            ),
            const SizedBox(height: 8),

            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(LucideIcons.landmark, color: AppColors.goldDark, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          bank?.bankName ?? 'No Bank Configured',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.dark),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          bank != null && bank.accountNumber.isNotEmpty
                              ? '${bank.accountNumber} • ${bank.accountName}'
                              : 'Tap Configure to set your NUBAN account',
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Payout Transaction History
            const Text(
              'Payout History',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
            ),
            const SizedBox(height: 12),

            if (payout == null || payout.payouts.isEmpty)
              _buildEmptyPlaceholder(
                icon: LucideIcons.receipt,
                title: 'No Payout History',
                description: 'Withdrawals you request will be recorded here with status timestamps and transaction references.',
              )
            else
              ...payout.payouts.map((tx) => _buildPayoutTxTile(tx)),
          ],
        ),
      ),
    );
  }

  Widget _buildPayoutTxTile(PayoutTransactionModel tx) {
    Color statusColor;
    Color statusBg;
    switch (tx.status.toLowerCase()) {
      case 'completed':
      case 'processed':
        statusColor = AppColors.success;
        statusBg = AppColors.successBg;
        break;
      case 'failed':
        statusColor = AppColors.error;
        statusBg = AppColors.errorBg;
        break;
      case 'pending':
      default:
        statusColor = AppColors.goldDark;
        statusBg = AppColors.gold.withValues(alpha: 0.15);
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                tx.reference,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.dark, fontFamily: 'monospace'),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  tx.status.toUpperCase(),
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: statusColor),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                tx.requestedAt,
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              Text(
                tx.amountFormatted,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.primary),
              ),
            ],
          ),
          if (tx.bankName.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              '${tx.bankName} (${tx.accountNumber})',
              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.dark),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(title, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildActionTile({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.dark)),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const Icon(LucideIcons.chevronRight, size: 18, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyPlaceholder({
    required IconData icon,
    required String title,
    required String description,
  }) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Icon(icon, size: 36, color: AppColors.textMuted),
          const SizedBox(height: 12),
          Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.dark)),
          const SizedBox(height: 4),
          Text(
            description,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
          ),
        ],
      ),
    );
  }
}
