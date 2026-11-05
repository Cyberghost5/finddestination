import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../auth/providers/auth_provider.dart';
import '../../common/widgets/custom_button.dart';
import '../models/agent_models.dart';
import '../providers/agent_provider.dart';
import '../widgets/agent_bank_modal.dart';
import '../widgets/agent_withdraw_modal.dart';
import 'field_audit_screen.dart';

class AgentPortalScreen extends StatefulWidget {
  final VoidCallback? onSwitchToGuest;

  const AgentPortalScreen({super.key, this.onSwitchToGuest});

  @override
  State<AgentPortalScreen> createState() => _AgentPortalScreenState();
}

class _AgentPortalScreenState extends State<AgentPortalScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _assignmentStatusFilter = 'all';

  static const List<String> _states = [
    'all',
    'Bauchi',
    'Abuja (FCT)',
    'Lagos',
    'Kaduna',
    'Plateau',
    'Kano',
    'Gombe',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
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
    final agentProvider = context.read<AgentProvider>();
    await agentProvider.fetchAgentPortalData(agentId: auth.user?.id);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final agentProvider = context.watch<AgentProvider>();
    final user = auth.user;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'FindDestination',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.info),
            ),
            Text(
              user?.name ?? 'Field Verification Agent',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.info.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              children: [
                Icon(LucideIcons.shieldCheck, size: 12, color: AppColors.info),
                SizedBox(width: 4),
                Text(
                  'AGENT',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.info),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 18),
            onPressed: agentProvider.isLoading ? null : _loadData,
          ),
          const SizedBox(width: 6),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.info,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.info,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
          tabs: [
            Tab(
              icon: const Icon(LucideIcons.compass, size: 18),
              text: 'Bounties (${agentProvider.bounties.length})',
            ),
            Tab(
              icon: const Icon(LucideIcons.clipboardList, size: 18),
              text: 'Assignments (${agentProvider.assignments.length})',
            ),
            const Tab(
              icon: Icon(LucideIcons.wallet, size: 18),
              text: 'Wallet',
            ),
          ],
        ),
      ),
      body: agentProvider.isLoading && agentProvider.wallet == null
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildExploreTab(agentProvider, auth),
                _buildAssignmentsTab(agentProvider, auth),
                _buildWalletTab(agentProvider, auth),
              ],
            ),
    );
  }

  // TAB 1: EXPLORE BOUNTIES
  Widget _buildExploreTab(AgentProvider agent, AuthProvider auth) {
    return RefreshIndicator(
      onRefresh: _loadData,
      child: Column(
        children: [
          // State Filter Bar
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12),
            color: Colors.white,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: _states.map((st) {
                  final isSelected = agent.selectedStateFilter == st;
                  final label = st == 'all' ? 'All Regions' : st;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: InkWell(
                      onTap: () {
                        agent.setStateFilter(st, agentId: auth.user?.id);
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.info : AppColors.background,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? AppColors.info : AppColors.border,
                          ),
                        ),
                        child: Text(
                          label,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected ? Colors.white : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          const Divider(height: 1),

          // Bounties List
          Expanded(
            child: agent.bounties.isEmpty
                ? _buildEmptyState(
                    icon: LucideIcons.checkCheck,
                    title: 'No Pending Bounties in Region',
                    description: 'All properties in this territory have active assignments. Check other states or refresh soon!',
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(20),
                    itemCount: agent.bounties.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 16),
                    itemBuilder: (ctx, index) {
                      final bounty = agent.bounties[index];
                      return _buildBountyCard(bounty, agent, auth);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildBountyCard(BountyPropertyModel bounty, AgentProvider agent, AuthProvider auth) {
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
          // Image with Bounty Badge
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                child: CachedNetworkImage(
                  imageUrl: bounty.coverImage,
                  height: 150,
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
                    bounty.propertyType.replaceAll('_', ' ').toUpperCase(),
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white),
                  ),
                ),
              ),
              Positioned(
                top: 12,
                right: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.info,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.2),
                        blurRadius: 4,
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      const Icon(LucideIcons.shieldCheck, size: 12, color: Colors.white),
                      const SizedBox(width: 4),
                      Text(
                        '${bounty.inspectionFeeFormatted} BOUNTY',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.white),
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
                Text(
                  bounty.name,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(LucideIcons.mapPin, size: 13, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        '${bounty.city}, ${bounty.state}',
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Amenities chips
                if (bounty.amenities.isNotEmpty) ...[
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: bounty.amenities.take(3).map((a) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Text(a, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 14),
                ],

                // Action Row
                if (bounty.myApplication != null)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                    decoration: BoxDecoration(
                      color: AppColors.infoBg,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(LucideIcons.clock, size: 14, color: AppColors.info),
                        const SizedBox(width: 6),
                        Text(
                          'Applied: ${bounty.myApplication!.status.toUpperCase()}',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.info),
                        ),
                      ],
                    ),
                  )
                else if (bounty.isAssignedToOther)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(LucideIcons.lock, size: 14, color: AppColors.textMuted),
                        SizedBox(width: 6),
                        Text(
                          'Assigned to Regional Inspector',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  )
                else
                  CustomButton(
                    text: 'Apply for Inspection (${bounty.inspectionFeeFormatted})',
                    backgroundColor: AppColors.info,
                    isLoading: agent.isSubmitting,
                    icon: const Icon(LucideIcons.fileCheck, color: Colors.white, size: 16),
                    onPressed: () async {
                      final success = await agent.applyForBounty(bounty.id, agentId: auth.user?.id);
                      if (!mounted) return;
                      if (success) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(agent.successMessage ?? 'Application submitted!'),
                            backgroundColor: AppColors.success,
                          ),
                        );
                      }
                    },
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // TAB 2: MY ASSIGNMENTS
  Widget _buildAssignmentsTab(AgentProvider agent, AuthProvider auth) {
    var filtered = agent.assignments;
    if (_assignmentStatusFilter != 'all') {
      filtered = filtered.where((a) => a.status == _assignmentStatusFilter).toList();
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: Column(
        children: [
          // Filter pills
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12),
            color: Colors.white,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  _buildStatusFilterPill('all', 'All (${agent.assignments.length})'),
                  _buildStatusFilterPill('approved', 'Active / Ready (${agent.assignments.where((a) => a.status == 'approved').length})'),
                  _buildStatusFilterPill('submitted', 'Under Review (${agent.assignments.where((a) => a.status == 'submitted').length})'),
                  _buildStatusFilterPill('verified', 'Completed (${agent.assignments.where((a) => a.status == 'verified').length})'),
                  _buildStatusFilterPill('pending', 'Pending (${agent.assignments.where((a) => a.status == 'pending').length})'),
                ],
              ),
            ),
          ),
          const Divider(height: 1),

          Expanded(
            child: filtered.isEmpty
                ? _buildEmptyState(
                    icon: LucideIcons.clipboardCheck,
                    title: 'No Assignments in Filter',
                    description: 'Explore available property bounties to request field inspections and earn verification rewards.',
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(20),
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 16),
                    itemBuilder: (ctx, index) {
                      final assignment = filtered[index];
                      return _buildAssignmentCard(assignment, auth);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusFilterPill(String status, String label) {
    final isSelected = _assignmentStatusFilter == status;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: InkWell(
        onTap: () => setState(() => _assignmentStatusFilter = status),
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.info : AppColors.background,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: isSelected ? AppColors.info : AppColors.border),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              color: isSelected ? Colors.white : AppColors.textSecondary,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAssignmentCard(AgentAssignmentModel a, AuthProvider auth) {
    Color statusColor;
    Color statusBg;
    String statusTitle;

    switch (a.status) {
      case 'approved':
        statusColor = AppColors.success;
        statusBg = AppColors.successBg;
        statusTitle = 'APPROVED — READY FOR AUDIT';
        break;
      case 'submitted':
        statusColor = AppColors.info;
        statusBg = AppColors.infoBg;
        statusTitle = 'EVIDENCE UNDER REVIEW';
        break;
      case 'verified':
        statusColor = const Color(0xFF059669);
        statusBg = const Color(0xFFD1FAE5);
        statusTitle = 'CERTIFIED & BOUNTY RELEASED';
        break;
      case 'declined':
        statusColor = AppColors.error;
        statusBg = AppColors.errorBg;
        statusTitle = 'DECLINED';
        break;
      case 'pending':
      default:
        statusColor = AppColors.goldDark;
        statusBg = AppColors.gold.withValues(alpha: 0.15);
        statusTitle = 'AWAITING ADMIN APPROVAL';
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Status and Bounty Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  statusTitle,
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: statusColor),
                ),
              ),
              Text(
                a.inspectionFeeFormatted,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.info),
              ),
            ],
          ),
          const SizedBox(height: 12),

          Text(
            a.propertyName,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(LucideIcons.mapPin, size: 14, color: AppColors.textSecondary),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  a.isDetailsUnlocked ? a.unlockedAddress : '${a.city}, ${a.state}',
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
              ),
            ],
          ),

          // Unlocked Host Details Card
          if (a.isDetailsUnlocked && a.hostDetails != null) ...[
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.infoBg.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.info.withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.userCheck, color: AppColors.info, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Host Contact: ${a.hostDetails!.name}',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.dark),
                        ),
                        Text(
                          a.hostDetails!.phone,
                          style: const TextStyle(fontSize: 12, color: AppColors.info, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 16),

          // Action Button based on status
          if (a.status == 'approved')
            CustomButton(
              text: 'Launch On-Site Audit Form',
              backgroundColor: AppColors.success,
              icon: const Icon(LucideIcons.camera, color: Colors.white, size: 16),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => FieldAuditScreen(
                      assignment: a,
                      agentId: auth.user?.id,
                    ),
                  ),
                );
              },
            )
          else if (a.status == 'submitted')
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(LucideIcons.shieldCheck, size: 14, color: AppColors.info),
                  SizedBox(width: 6),
                  Text('GPS & Photos Submitted • Under Admin Audit', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.info)),
                ],
              ),
            )
          else if (a.status == 'verified')
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFD1FAE5),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(LucideIcons.checkCircle2, size: 14, color: Color(0xFF059669)),
                  SizedBox(width: 6),
                  Text('Tier 3 Verified • Bounty Settled to Wallet', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF059669))),
                ],
              ),
            ),
        ],
      ),
    );
  }

  // TAB 3: AGENT WALLET
  Widget _buildWalletTab(AgentProvider agent, AuthProvider auth) {
    final wallet = agent.wallet;
    final bank = wallet?.bankDetails;

    return RefreshIndicator(
      onRefresh: _loadData,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Big Bounty Balance Card
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0D253A), Color(0xFF1E3A8A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0D253A).withValues(alpha: 0.3),
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
                          Icon(LucideIcons.wallet, color: Color(0xFF93C5FD), size: 18),
                          SizedBox(width: 8),
                          Text(
                            'Earned Bounty Balance',
                            style: TextStyle(fontSize: 13, color: Color(0xFFDBEAFE), fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text('Instant Disbursal', style: TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    wallet?.balanceFormatted ?? '₦0.00',
                    style: const TextStyle(fontSize: 34, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -0.5),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            AgentWithdrawModal.show(context, agentId: auth.user?.id);
                          },
                          icon: const Icon(LucideIcons.arrowUpRight, size: 16, color: Color(0xFF1E3A8A)),
                          label: const Text('Withdraw Bounty', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: Color(0xFF1E3A8A))),
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
                          final success = await agent.seedDemoBounty(agentId: auth.user?.id);
                          if (mounted && success) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Demo Bounty of ₦50,000 credited to wallet!'),
                                backgroundColor: AppColors.success,
                              ),
                            );
                          }
                        },
                        icon: const Icon(LucideIcons.sparkles, size: 14, color: Color(0xFF93C5FD)),
                        label: const Text('+₦50k Demo', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFF60A5FA)),
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

            // Metrics row
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    title: 'Total Earned',
                    value: wallet?.totalEarnedFormatted ?? '₦0.00',
                    icon: LucideIcons.trendingUp,
                    color: AppColors.success,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    title: 'Pending Audits',
                    value: '${agent.pendingAuditsCount}',
                    icon: LucideIcons.clock,
                    color: AppColors.goldDark,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Payout Bank Account Card
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Payout Settlement Bank',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
                ),
                TextButton(
                  onPressed: () => AgentBankModal.show(context, agentId: auth.user?.id),
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
                      color: AppColors.infoBg,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(LucideIcons.landmark, color: AppColors.info, size: 24),
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

            // Transaction Ledger
            const Text(
              'Bounty Transaction Ledger',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
            ),
            const SizedBox(height: 12),

            if (wallet == null || wallet.transactions.isEmpty)
              _buildEmptyState(
                icon: LucideIcons.receipt,
                title: 'No Transactions Yet',
                description: 'Bounty credits and withdrawal disbursements will appear here.',
              )
            else
              ...wallet.transactions.map((tx) => _buildTransactionTile(tx)),
          ],
        ),
      ),
    );
  }

  Widget _buildTransactionTile(WalletTransactionModel tx) {
    final isCredit = tx.type == 'credit';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: isCredit ? AppColors.successBg : AppColors.errorBg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              isCredit ? LucideIcons.arrowDownLeft : LucideIcons.arrowUpRight,
              size: 18,
              color: isCredit ? AppColors.success : AppColors.error,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tx.description,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(tx.date, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
              ],
            ),
          ),
          Text(
            tx.amountFormatted,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w900,
              color: isCredit ? AppColors.success : AppColors.error,
            ),
          ),
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

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String description,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: AppColors.infoBg,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 30, color: AppColors.info),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
            ),
            const SizedBox(height: 6),
            Text(
              description,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
            ),
          ],
        ),
      ),
    );
  }
}
