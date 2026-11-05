import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/constants/app_colors.dart';
import '../../admin/screens/admin_portal_screen.dart';
import '../../agent/screens/agent_portal_screen.dart';
import '../../auth/providers/auth_provider.dart';
import '../../auth/screens/login_screen.dart';
import '../../auth/screens/register_host_screen.dart';
import '../../auth/screens/register_screen.dart';
import '../../bookings/screens/trips_screen.dart';
import '../../chat/screens/inbox_screen.dart';
import '../../host/screens/host_dashboard_screen.dart';
import '../../host/screens/listing_wizard_screen.dart';
import '../../onboarding/screens/animated_onboarding_screen.dart';
import '../../properties/screens/explore_screen.dart';
import '../../properties/screens/wishlist_screen.dart';
import '../widgets/custom_button.dart';
import '../widgets/role_badge.dart';

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  void _showRoleSwitchDialog(BuildContext context) {
    final auth = context.read<AuthProvider>();

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Active Persona & Role',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.dark),
                  ),
                  IconButton(
                    icon: const Icon(LucideIcons.x, size: 20),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              const Text(
                'Switch platform perspective to test user workflows across traveler and provider roles.',
                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 20),
              _buildRoleOption(ctx, auth, 'guest', 'Guest / Traveler', 'Discover stays, book rooms, and download vouchers', LucideIcons.compass, AppColors.primary),
              const SizedBox(height: 10),
              _buildRoleOption(ctx, auth, 'host', 'Host / Property Manager', 'Manage properties, track arrivals, and request payouts', LucideIcons.building, AppColors.goldDark),
              const SizedBox(height: 10),
              _buildRoleOption(ctx, auth, 'agent', 'Field Verification Agent', 'Conduct on-site audits, log GPS, and earn bounties', LucideIcons.shieldCheck, AppColors.info),
              const SizedBox(height: 10),
              _buildRoleOption(ctx, auth, 'admin', 'Super Admin Control', 'Approve CAC documents, inspect audits, and release payouts', LucideIcons.sliders, const Color(0xFF7E22CE)),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }

  Widget _buildRoleOption(
    BuildContext ctx,
    AuthProvider auth,
    String role,
    String title,
    String subtitle,
    IconData icon,
    Color color,
  ) {
    final isSelected = auth.activeRole == role;

    return InkWell(
      onTap: () {
        auth.switchRole(role);
        Navigator.pop(ctx);
      },
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? color.withValues(alpha: 0.08) : Colors.transparent,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? color : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: isSelected ? color : AppColors.dark,
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
            if (isSelected)
              Icon(LucideIcons.checkCircle2, color: color, size: 20),
          ],
        ),
      ),
    );
  }

  void _showApiSettingsDialog(BuildContext context) {
    final controller = TextEditingController(text: ApiConstants.baseUrl);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('Backend API Server', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Set the host URL for your local Laravel development backend.',
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                labelText: 'API Base URL',
                hintText: 'http://10.0.2.2:8000/api/v1',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              ApiConstants.setCustomBaseUrl(controller.text.trim());
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('API Base URL updated: ${ApiConstants.baseUrl}')),
              );
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    // Dedicated Host Portal when host role is active
    if (auth.activeRole == 'host') {
      return HostDashboardScreen(
        onSwitchToGuest: () => auth.switchRole('guest'),
      );
    }

    // Dedicated Field Agent Portal when agent role is active
    if (auth.activeRole == 'agent') {
      return AgentPortalScreen(
        onSwitchToGuest: () => auth.switchRole('guest'),
      );
    }

    // Dedicated Super Admin Portal when admin role is active
    if (auth.activeRole == 'admin') {
      return AdminPortalScreen(
        onSwitchToGuest: () => auth.switchRole('guest'),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(LucideIcons.hotel, color: Colors.white, size: 18),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'FindDestination',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.5,
                  ),
                ),
                Text(
                  'Verified Stays Nigeria',
                  style: TextStyle(fontSize: 10, color: AppColors.textSecondary),
                ),
              ],
            ),
          ],
        ),
        actions: [
          // Persona Switcher Button
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: InkWell(
              onTap: () => _showRoleSwitchDialog(context),
              borderRadius: BorderRadius.circular(20),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    RoleBadge(role: auth.activeRole, isSmall: true),
                    const SizedBox(width: 4),
                    const Icon(LucideIcons.chevronDown, size: 14, color: AppColors.textSecondary),
                  ],
                ),
              ),
            ),
          ),
          // Server config icon
          IconButton(
            icon: const Icon(LucideIcons.settings, size: 20),
            onPressed: () => _showApiSettingsDialog(context),
          ),
        ],
      ),
      body: _buildCurrentTab(auth),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.compass),
            activeIcon: Icon(LucideIcons.compass, color: AppColors.primary),
            label: 'Explore',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.heart),
            activeIcon: Icon(LucideIcons.heart, color: AppColors.primary),
            label: 'Wishlist',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.ticket),
            activeIcon: Icon(LucideIcons.ticket, color: AppColors.primary),
            label: 'Trips',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.messageSquare),
            activeIcon: Icon(LucideIcons.messageSquare, color: AppColors.primary),
            label: 'Inbox',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.user),
            activeIcon: Icon(LucideIcons.user, color: AppColors.primary),
            label: 'Account',
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentTab(AuthProvider auth) {
    switch (_currentIndex) {
      case 0:
        return const ExploreScreen();
      case 1:
        return WishlistScreen(onExploreTap: () => setState(() => _currentIndex = 0));
      case 2:
        return TripsScreen(onExploreTap: () => setState(() => _currentIndex = 0));
      case 3:
        return const InboxScreen();
      case 4:
      default:
        return _buildAccountTab(auth);
    }
  }

  Widget _buildAccountTab(AuthProvider auth) {
    if (!auth.isAuthenticated) {
      return SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'My Profile',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: AppColors.dark),
              ),
              const SizedBox(height: 6),
              const Text(
                'Sign in to manage reservations, host listings, and verification bounties.',
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 28),
              CustomButton(
                text: 'Sign In',
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                  );
                },
              ),
              const SizedBox(height: 12),
              CustomButton(
                text: 'Create Guest Account',
                isOutlined: true,
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const RegisterScreen()),
                  );
                },
              ),
              const SizedBox(height: 12),
              CustomButton(
                text: 'Register as Host (List Property)',
                isOutlined: true,
                textColor: AppColors.goldDark,
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const RegisterHostScreen()),
                  );
                },
              ),
            ],
          ),
        ),
      );
    }

    final user = auth.user!;

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 28,
                        backgroundColor: AppColors.primary,
                        child: Text(
                          user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                          style: const TextStyle(fontSize: 22, color: Colors.white, fontWeight: FontWeight.w700),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user.name,
                              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.dark),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              user.email,
                              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                RoleBadge(role: user.role),
                                const SizedBox(width: 8),
                                if (user.isEmailVerified)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppColors.successBg,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Row(
                                      children: [
                                        Icon(LucideIcons.check, size: 10, color: AppColors.success),
                                        SizedBox(width: 3),
                                        Text('Verified', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.success)),
                                      ],
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Host Quick Portals Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.goldDark.withValues(alpha: 0.12),
                    AppColors.gold.withValues(alpha: 0.05),
                  ],
                ),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.goldDark.withValues(alpha: 0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(LucideIcons.building, color: AppColors.goldDark, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Host Partner Portal',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.dark),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Manage your hotel listings, track incoming reservations, and withdraw cleared booking escrow funds.',
                    style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.3),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: CustomButton(
                          text: 'Host Dashboard',
                          textColor: Colors.white,
                          backgroundColor: AppColors.goldDark,
                          onPressed: () {
                            auth.switchRole('host');
                          },
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: CustomButton(
                          text: 'List Property',
                          isOutlined: true,
                          textColor: AppColors.goldDark,
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const ListingWizardScreen()),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // Field Agent Quick Portals Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.info.withValues(alpha: 0.12),
                    AppColors.infoBg.withValues(alpha: 0.2),
                  ],
                ),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.info.withValues(alpha: 0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(LucideIcons.shieldCheck, color: AppColors.info, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Field Verification Agent Portal',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.dark),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Explore property inspection bounties, conduct on-site GPS audits, and earn verification fees.',
                    style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.3),
                  ),
                  const SizedBox(height: 14),
                  CustomButton(
                    text: 'Open Field Agent Portal & Wallet',
                    textColor: Colors.white,
                    backgroundColor: AppColors.info,
                    icon: const Icon(LucideIcons.arrowRight, size: 16, color: Colors.white),
                    onPressed: () {
                      auth.switchRole('agent');
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // Super Admin Quick Portal Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF7E22CE).withValues(alpha: 0.1),
                    const Color(0xFF7E22CE).withValues(alpha: 0.03),
                  ],
                ),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFF7E22CE).withValues(alpha: 0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(LucideIcons.sliders, color: Color(0xFF7E22CE), size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Super Admin Governance Center',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.dark),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Review host CAC registrations, verify field inspection audit reports, and authorize payout disbursements.',
                    style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.3),
                  ),
                  const SizedBox(height: 14),
                  CustomButton(
                    text: 'Open Super Admin Control',
                    textColor: Colors.white,
                    backgroundColor: const Color(0xFF7E22CE),
                    icon: const Icon(LucideIcons.shieldAlert, size: 16, color: Colors.white),
                    onPressed: () {
                      auth.switchRole('admin');
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Profile Info List
            const Text(
              'Account Information',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.dark),
            ),
            const SizedBox(height: 10),

            _buildInfoRow('Phone', user.phone ?? 'Not provided', LucideIcons.phone),
            if (user.businessName != null)
              _buildInfoRow('Business Name', user.businessName!, LucideIcons.building),
            if (user.cacNumber != null)
              _buildInfoRow('CAC Registration', user.cacNumber!, LucideIcons.fileText),
            _buildInfoRow('Active Persona', auth.activeRole.toUpperCase(), LucideIcons.sliders),
            _buildInfoRow('API Endpoint', ApiConstants.baseUrl, LucideIcons.server),

            const SizedBox(height: 24),

            CustomButton(
              text: 'View App Intro & Tour',
              isOutlined: true,
              icon: const Icon(LucideIcons.sparkles, size: 16, color: AppColors.primary),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const AnimatedOnboardingScreen()),
                );
              },
            ),

            const SizedBox(height: 12),

            // Logout Button
            CustomButton(
              text: 'Log Out',
              backgroundColor: AppColors.error,
              icon: const Icon(LucideIcons.logOut, size: 18, color: Colors.white),
              onPressed: () => auth.logout(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.textSecondary),
          const SizedBox(width: 12),
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.dark)),
        ],
      ),
    );
  }
}
