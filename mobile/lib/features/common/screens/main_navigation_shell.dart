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
                hintText: 'https://finddestination.com.ng/api/v1/',
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

    // Strict Role-Based Portal Redirection
    if (auth.isAuthenticated) {
      if (auth.user?.role == 'host' || auth.activeRole == 'host') {
        return const HostDashboardScreen();
      }
      if (auth.user?.role == 'agent' || auth.activeRole == 'agent') {
        return const AgentPortalScreen();
      }
      if (auth.user?.role == 'admin' || auth.activeRole == 'admin') {
        return const AdminPortalScreen();
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.border),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(7),
                child: Image.asset(
                  'assets/images/logo.jpeg',
                  fit: BoxFit.cover,
                ),
              ),
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
          IconButton(
            icon: const Icon(LucideIcons.settings, size: 20),
            tooltip: 'API Settings',
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

            // Become a Host Partner Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.goldDark.withValues(alpha: 0.12),
                    AppColors.gold.withValues(alpha: 0.05),
                  ],
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.goldDark.withValues(alpha: 0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(LucideIcons.building, color: AppColors.goldDark, size: 22),
                      SizedBox(width: 10),
                      Text(
                        'List Your Property',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Partner with FindDestination to list your hotels, apartments, or short-lets across Nigeria and accept secure booking escrows.',
                    style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
                  ),
                  const SizedBox(height: 16),
                  CustomButton(
                    text: 'Register as Host Partner',
                    textColor: Colors.white,
                    backgroundColor: AppColors.goldDark,
                    icon: const Icon(LucideIcons.sparkles, size: 16, color: Colors.white),
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

            const SizedBox(height: 24),

            // Profile Info List
            const Text(
              'Account Information',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.dark),
            ),
            const SizedBox(height: 10),

            _buildInfoRow('Full Name', user.name, LucideIcons.user),
            _buildInfoRow('Email Address', user.email, LucideIcons.mail),
            _buildInfoRow('Phone', user.phone ?? 'Not provided', LucideIcons.phone),
            if (user.businessName != null)
              _buildInfoRow('Business Name', user.businessName!, LucideIcons.building),
            if (user.cacNumber != null)
              _buildInfoRow('CAC Registration', user.cacNumber!, LucideIcons.fileText),
            _buildInfoRow('Account Type', 'Verified Traveler (Guest)', LucideIcons.userCheck),
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
