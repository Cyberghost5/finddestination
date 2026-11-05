import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/admin_models.dart';
import '../providers/admin_provider.dart';
import '../widgets/admin_process_withdrawal_modal.dart';
import '../widgets/admin_transaction_detail_modal.dart';
import '../widgets/admin_verify_report_modal.dart';

class AdminPortalScreen extends StatefulWidget {
  final VoidCallback? onSwitchToGuest;

  const AdminPortalScreen({super.key, this.onSwitchToGuest});

  @override
  State<AdminPortalScreen> createState() => _AdminPortalScreenState();
}

class _AdminPortalScreenState extends State<AdminPortalScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _txSearchController = TextEditingController();
  String _hostFilter = 'all'; // 'all', 'pending', 'approved', 'rejected'
  String _reportFilter = 'all'; // 'all', 'submitted', 'verified'
  String _withdrawalFilter = 'all'; // 'all', 'pending', 'approved', 'rejected'
  String _txGatewayFilter = 'all'; // 'all', 'paystack', 'monnify'

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminProvider>().fetchAllAdminData();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _txSearchController.dispose();
    super.dispose();
  }

  void _triggerQoreIdCheck(AdminHostModel host) async {
    final admin = context.read<AdminProvider>();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Querying QoreID CAC database for ${host.businessName ?? host.name}...'),
        backgroundColor: AppColors.primary,
        duration: const Duration(seconds: 2),
      ),
    );

    final res = await admin.verifyHostCac(host.id, cacNumber: host.cacNumber);
    if (!mounted) return;

    if (res != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('QoreID CAC Verification successful! Business records verified.'),
          backgroundColor: AppColors.success,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(admin.errorMessage ?? 'CAC verification failed or timed out.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  void _updateHostApproval(AdminHostModel host, String action) async {
    final admin = context.read<AdminProvider>();
    final success = await admin.updateHostApproval(host.id, action);
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Host ${action == 'approve' ? 'approved' : 'rejected'} successfully.'),
          backgroundColor: action == 'approve' ? AppColors.success : AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final admin = context.watch<AdminProvider>();
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: const Color(0xFF7E22CE),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(LucideIcons.sliders, color: Colors.white, size: 18),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Super Admin Control',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
                ),
                Text(
                  'FindDestination Governance & Escrow',
                  style: TextStyle(fontSize: 10, color: AppColors.textSecondary),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 18, color: AppColors.dark),
            tooltip: 'Refresh Platform Data',
            onPressed: () => admin.fetchAllAdminData(),
          ),
          IconButton(
            icon: const Icon(LucideIcons.arrowLeftRight, size: 18, color: Color(0xFF7E22CE)),
            tooltip: 'Switch Persona',
            onPressed: () {
              if (widget.onSwitchToGuest != null) {
                widget.onSwitchToGuest!();
              } else {
                auth.switchRole('guest');
              }
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFF7E22CE),
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: const Color(0xFF7E22CE),
          indicatorWeight: 3,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          tabs: [
            Tab(
              child: Row(
                children: [
                  const Text('Hosts & CAC', style: TextStyle(fontWeight: FontWeight.w700)),
                  if (admin.pendingHostsCount > 0) ...[
                    const SizedBox(width: 6),
                    _buildBadge(admin.pendingHostsCount.toString(), AppColors.goldDark),
                  ],
                ],
              ),
            ),
            Tab(
              child: Row(
                children: [
                  const Text('Field Audits', style: TextStyle(fontWeight: FontWeight.w700)),
                  if (admin.pendingReportsCount > 0) ...[
                    const SizedBox(width: 6),
                    _buildBadge(admin.pendingReportsCount.toString(), AppColors.info),
                  ],
                ],
              ),
            ),
            Tab(
              child: Row(
                children: [
                  const Text('Disbursements', style: TextStyle(fontWeight: FontWeight.w700)),
                  if (admin.pendingWithdrawalsCount > 0) ...[
                    const SizedBox(width: 6),
                    _buildBadge(admin.pendingWithdrawalsCount.toString(), AppColors.error),
                  ],
                ],
              ),
            ),
            const Tab(
              child: Text('Financial Ledger', style: TextStyle(fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      ),
      body: admin.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => admin.fetchAllAdminData(),
              child: Column(
                children: [
                  // Platform Executive Summary Strip
                  _buildExecutiveSummary(admin),

                  // Tab Views
                  Expanded(
                    child: TabBarView(
                      controller: _tabController,
                      children: [
                        _buildHostsTab(admin),
                        _buildAuditsTab(admin),
                        _buildWithdrawalsTab(admin),
                        _buildTransactionsTab(admin),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildBadge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        text,
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: color),
      ),
    );
  }

  Widget _buildExecutiveSummary(AdminProvider admin) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      color: Colors.white,
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF7E22CE).withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF7E22CE).withValues(alpha: 0.15)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'PLATFORM GMV',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF7E22CE)),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    admin.totalGmvFormatted,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.dark),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.15)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'NET COMMISSION (12.5%)',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primary),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    admin.totalCommissionFormatted,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.primary),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 1. HOSTS & CAC QUEUE TAB
  Widget _buildHostsTab(AdminProvider admin) {
    final filtered = admin.hosts.where((h) {
      if (_hostFilter == 'pending') return h.hostStatus == 'pending';
      if (_hostFilter == 'approved') return h.hostStatus == 'approved';
      if (_hostFilter == 'rejected') return h.hostStatus == 'rejected';
      return true;
    }).toList();

    return Column(
      children: [
        // Filter Pills
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: Row(
            children: [
              _buildFilterChip('All (${admin.hosts.length})', _hostFilter == 'all', () => setState(() => _hostFilter = 'all')),
              const SizedBox(width: 8),
              _buildFilterChip('Pending (${admin.pendingHostsCount})', _hostFilter == 'pending', () => setState(() => _hostFilter = 'pending')),
              const SizedBox(width: 8),
              _buildFilterChip('Approved', _hostFilter == 'approved', () => setState(() => _hostFilter = 'approved')),
            ],
          ),
        ),

        Expanded(
          child: filtered.isEmpty
              ? _buildEmptyState('No host profiles match this filter.', LucideIcons.building)
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, idx) {
                    final h = filtered[idx];
                    return _buildHostCard(h);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildHostCard(AdminHostModel h) {
    return Container(
      padding: const EdgeInsets.all(14),
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
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      h.businessName ?? h.name,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.dark),
                    ),
                    Text(
                      '${h.name} • ${h.email}',
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: h.isApproved ? AppColors.successBg : AppColors.goldLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  h.hostStatus.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: h.isApproved ? AppColors.success : AppColors.goldDark,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          // CAC Info Row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                Icon(
                  h.isCacVerified ? LucideIcons.shieldCheck : LucideIcons.fileText,
                  size: 16,
                  color: h.isCacVerified ? AppColors.success : AppColors.textSecondary,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    h.cacNumber != null && h.cacNumber!.isNotEmpty
                        ? 'CAC: ${h.cacNumber} ${h.isCacVerified ? '• (QoreID Verified)' : '• (Unverified)'}'
                        : 'No CAC Registration Number Provided',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: h.isCacVerified ? AppColors.success : AppColors.textSecondary,
                    ),
                  ),
                ),
                if (h.cacNumber != null && h.cacNumber!.isNotEmpty && !h.isCacVerified)
                  GestureDetector(
                    onTap: () => _triggerQoreIdCheck(h),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'QoreID Check',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white),
                      ),
                    ),
                  ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Action Buttons
          Row(
            children: [
              if (!h.isApproved) ...[
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _updateHostApproval(h, 'approve'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.success,
                      side: const BorderSide(color: AppColors.success),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                    ),
                    child: const Text('Approve Host', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _updateHostApproval(h, 'reject'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: const BorderSide(color: AppColors.error),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                    ),
                    child: const Text('Reject', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                  ),
                ),
              ] else ...[
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _updateHostApproval(h, 'reject'),
                    icon: const Icon(LucideIcons.ban, size: 14, color: AppColors.textSecondary),
                    label: const Text('Suspend Host Access', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.border),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  // 2. FIELD AUDITS TAB
  Widget _buildAuditsTab(AdminProvider admin) {
    final filtered = admin.reports.where((r) {
      if (_reportFilter == 'submitted') return r.isPendingReview;
      if (_reportFilter == 'verified') return r.isVerified;
      return true;
    }).toList();

    return Column(
      children: [
        // Filter Pills
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: Row(
            children: [
              _buildFilterChip('All (${admin.reports.length})', _reportFilter == 'all', () => setState(() => _reportFilter = 'all')),
              const SizedBox(width: 8),
              _buildFilterChip('Awaiting Review (${admin.pendingReportsCount})', _reportFilter == 'submitted', () => setState(() => _reportFilter = 'submitted')),
              const SizedBox(width: 8),
              _buildFilterChip('Verified', _reportFilter == 'verified', () => setState(() => _reportFilter = 'verified')),
            ],
          ),
        ),

        Expanded(
          child: filtered.isEmpty
              ? _buildEmptyState('No field audit reports found.', LucideIcons.shieldCheck)
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, idx) {
                    final r = filtered[idx];
                    return _buildAuditReportCard(r);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildAuditReportCard(AdminInspectionReportModel r) {
    return Container(
      padding: const EdgeInsets.all(14),
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
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      r.propertyName,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.dark),
                    ),
                    Text(
                      '${r.city}, ${r.state} • Inspector: ${r.agentName}',
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: r.isVerified ? AppColors.successBg : AppColors.infoBg,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  r.status.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: r.isVerified ? AppColors.success : AppColors.info,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Details Row: Bounty Fee, GPS, Photos
          Row(
            children: [
              _buildTag(r.inspectionFeeFormatted, LucideIcons.badgePercent, AppColors.success),
              const SizedBox(width: 8),
              _buildTag(
                r.gpsLatitude != null ? 'GPS Locked' : 'No GPS',
                LucideIcons.navigation,
                r.gpsLatitude != null ? AppColors.info : AppColors.goldDark,
              ),
              const SizedBox(width: 8),
              _buildTag('${r.photos.length} Photos', LucideIcons.image, AppColors.primary),
            ],
          ),

          const SizedBox(height: 12),

          ElevatedButton(
            onPressed: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (_) => AdminVerifyReportModal(report: r),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: r.isPendingReview ? AppColors.primary : AppColors.background,
              foregroundColor: r.isPendingReview ? Colors.white : AppColors.dark,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.symmetric(vertical: 10),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  r.isPendingReview ? LucideIcons.checkCheck : LucideIcons.eye,
                  size: 16,
                  color: r.isPendingReview ? Colors.white : AppColors.dark,
                ),
                const SizedBox(width: 8),
                Text(
                  r.isPendingReview ? 'Review & Verify Field Report' : 'View Audit Details',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 3. WITHDRAWALS & DISBURSEMENTS TAB
  Widget _buildWithdrawalsTab(AdminProvider admin) {
    final filtered = admin.withdrawals.where((w) {
      if (_withdrawalFilter == 'pending') return w.isPending;
      if (_withdrawalFilter == 'approved') return w.status == 'approved';
      if (_withdrawalFilter == 'rejected') return w.status == 'rejected';
      return true;
    }).toList();

    return Column(
      children: [
        // Filter Pills
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: Row(
            children: [
              _buildFilterChip('All (${admin.withdrawals.length})', _withdrawalFilter == 'all', () => setState(() => _withdrawalFilter = 'all')),
              const SizedBox(width: 8),
              _buildFilterChip('Pending (${admin.pendingWithdrawalsCount})', _withdrawalFilter == 'pending', () => setState(() => _withdrawalFilter = 'pending')),
              const SizedBox(width: 8),
              _buildFilterChip('Disbursed', _withdrawalFilter == 'approved', () => setState(() => _withdrawalFilter = 'approved')),
            ],
          ),
        ),

        Expanded(
          child: filtered.isEmpty
              ? _buildEmptyState('No withdrawal payout requests found.', LucideIcons.banknote)
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, idx) {
                    final w = filtered[idx];
                    return _buildWithdrawalCard(w);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildWithdrawalCard(AdminWithdrawalModel w) {
    return Container(
      padding: const EdgeInsets.all(14),
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
                w.amountFormatted,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: w.status == 'approved'
                      ? AppColors.successBg
                      : (w.status == 'rejected' ? AppColors.errorBg : AppColors.goldLight),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  w.status.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: w.status == 'approved'
                        ? AppColors.success
                        : (w.status == 'rejected' ? AppColors.error : AppColors.goldDark),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Beneficiary: ${w.agentName} (${w.bankName} - ${w.accountNumber})',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.dark),
          ),
          Text(
            'Account: ${w.accountName} • Ref: ${w.transactionReference}',
            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
          ),

          if (w.isPending) ...[
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (_) => AdminProcessWithdrawalModal(withdrawal: w),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.success,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(vertical: 10),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(LucideIcons.checkCircle2, size: 16, color: Colors.white),
                  SizedBox(width: 8),
                  Text('Process Disbursement / Payout', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // 4. FINANCIAL TRANSACTIONS LEDGER TAB
  Widget _buildTransactionsTab(AdminProvider admin) {
    final filtered = admin.transactions.where((t) {
      if (_txGatewayFilter != 'all' && t.gateway != _txGatewayFilter) return false;
      final q = _txSearchController.text.trim().toLowerCase();
      if (q.isNotEmpty) {
        final matchesRef = t.transactionReference.toLowerCase().contains(q);
        final matchesBooking = t.bookingReference?.toLowerCase().contains(q) ?? false;
        final matchesGuest = t.guestName?.toLowerCase().contains(q) ?? false;
        if (!matchesRef && !matchesBooking && !matchesGuest) return false;
      }
      return true;
    }).toList();

    return Column(
      children: [
        // Search & Gateway Selector Bar
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: Column(
            children: [
              TextField(
                controller: _txSearchController,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  hintText: 'Search reference, booking, or guest...',
                  hintStyle: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                  prefixIcon: const Icon(LucideIcons.search, size: 18, color: AppColors.textSecondary),
                  suffixIcon: _txSearchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(LucideIcons.x, size: 16),
                          onPressed: () {
                            _txSearchController.clear();
                            setState(() {});
                          },
                        )
                      : null,
                  fillColor: Colors.white,
                  filled: true,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _buildFilterChip('All Gateways', _txGatewayFilter == 'all', () => setState(() => _txGatewayFilter = 'all')),
                  const SizedBox(width: 8),
                  _buildFilterChip('Paystack', _txGatewayFilter == 'paystack', () => setState(() => _txGatewayFilter = 'paystack')),
                  const SizedBox(width: 8),
                  _buildFilterChip('Monnify', _txGatewayFilter == 'monnify', () => setState(() => _txGatewayFilter = 'monnify')),
                ],
              ),
            ],
          ),
        ),

        Expanded(
          child: filtered.isEmpty
              ? _buildEmptyState('No transactions match query.', LucideIcons.receipt)
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, idx) {
                    final tx = filtered[idx];
                    return _buildTransactionCard(tx);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildTransactionCard(AdminTransactionModel tx) {
    return InkWell(
      onTap: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (_) => AdminTransactionDetailModal(transaction: tx),
        );
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
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
                  tx.amountFormatted,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.primary),
                ),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: tx.gateway == 'paystack' ? AppColors.infoBg : AppColors.goldLight,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        tx.gateway.toUpperCase(),
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: tx.gateway == 'paystack' ? AppColors.info : AppColors.goldDark,
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: tx.isSuccessful ? AppColors.successBg : AppColors.goldLight,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        tx.status.toUpperCase(),
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: tx.isSuccessful ? AppColors.success : AppColors.goldDark,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              '${tx.guestName ?? 'Guest'} • Ref: ${tx.bookingReference ?? tx.transactionReference}',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.dark),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Commission: ${tx.platformCommissionFormatted}',
                  style: const TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.w700),
                ),
                const Row(
                  children: [
                    Text('View Audit', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    SizedBox(width: 4),
                    Icon(LucideIcons.chevronRight, size: 14, color: AppColors.textSecondary),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF7E22CE) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? const Color(0xFF7E22CE) : AppColors.border),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: isSelected ? Colors.white : AppColors.dark,
          ),
        ),
      ),
    );
  }

  Widget _buildTag(String text, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(text, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color)),
        ],
      ),
    );
  }

  Widget _buildEmptyState(String message, IconData icon) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: AppColors.textMuted),
            const SizedBox(height: 12),
            Text(
              message,
              style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
