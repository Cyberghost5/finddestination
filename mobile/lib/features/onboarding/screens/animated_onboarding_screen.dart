import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/app_colors.dart';
import '../../auth/screens/login_screen.dart';
import '../../common/screens/main_navigation_shell.dart';
import '../../common/widgets/custom_button.dart';

class OnboardingItem {
  final String title;
  final String highlight;
  final String description;
  final IconData icon;
  final Color accentColor;
  final Color lightAccentColor;
  final List<String> tags;

  const OnboardingItem({
    required this.title,
    required this.highlight,
    required this.description,
    required this.icon,
    required this.accentColor,
    required this.lightAccentColor,
    required this.tags,
  });
}

class AnimatedOnboardingScreen extends StatefulWidget {
  const AnimatedOnboardingScreen({super.key});

  @override
  State<AnimatedOnboardingScreen> createState() => _AnimatedOnboardingScreenState();
}

class _AnimatedOnboardingScreenState extends State<AnimatedOnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingItem> _slides = const [
    OnboardingItem(
      title: 'Vetted Accommodations',
      highlight: 'Across Nigeria',
      description:
          'Discover premium hotels, guest houses, and serviced apartments verified by certified on-ground field agents.',
      icon: LucideIcons.hotel,
      accentColor: AppColors.primary,
      lightAccentColor: AppColors.primaryLight,
      tags: ['Tier 3 Certified', '24/7 Power', 'GPS Verified'],
    ),
    OnboardingItem(
      title: 'Protected Escrow',
      highlight: 'Guaranteed Settlements',
      description:
          'Pay seamlessly via Paystack or Monnify Dynamic Bank Accounts. Your funds stay safe in escrow until after check-in.',
      icon: LucideIcons.shieldCheck,
      accentColor: AppColors.goldDark,
      lightAccentColor: AppColors.goldLight,
      tags: ['Cards & USSD', 'Dynamic Virtual Account', 'Fraud Protection'],
    ),
    OnboardingItem(
      title: 'Instant Travel Vouchers',
      highlight: '& Mobile Boarding Pass',
      description:
          'Receive beautiful digital stay vouchers with scannable QR codes. Download offline PDFs and share directly via WhatsApp.',
      icon: LucideIcons.ticket,
      accentColor: Color(0xFF2563EB),
      lightAccentColor: Color(0xFFDBEAFE),
      tags: ['Scannable QR', 'Offline PDF', 'Instant Dispatch'],
    ),
    OnboardingItem(
      title: 'List Your Lodgings',
      highlight: 'Corporate Host Network',
      description:
          'Hotels and apartment managers can verify CAC business licenses with QoreID, accept bookings, and withdraw payouts.',
      icon: LucideIcons.building,
      accentColor: Color(0xFF008753),
      lightAccentColor: Color(0xFFE8F5E9),
      tags: ['Automated CAC Check', 'Direct Payouts', 'Verified Host Badge'],
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _completeOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('has_seen_intro_onboarding', true);

    if (!mounted) return;

    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        pageBuilder: (_, animation, __) => const MainNavigationShell(),
        transitionsBuilder: (_, animation, __, child) {
          return FadeTransition(opacity: animation, child: child);
        },
        transitionDuration: const Duration(milliseconds: 400),
      ),
    );
  }

  void _nextPage() {
    if (_currentPage < _slides.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOutCubic,
      );
    } else {
      _completeOnboarding();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar with Logo & Skip Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
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
                      const SizedBox(width: 8),
                      const Text(
                        'FindDestination',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: AppColors.dark,
                          letterSpacing: -0.5,
                        ),
                      ),
                    ],
                  ),
                  if (_currentPage < _slides.length - 1)
                    TextButton(
                      onPressed: _completeOnboarding,
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.textSecondary,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      ),
                      child: const Text(
                        'Skip',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                      ),
                    ),
                ],
              ),
            ),

            // Animated Page Carousel
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                physics: const BouncingScrollPhysics(),
                onPageChanged: (idx) => setState(() => _currentPage = idx),
                itemCount: _slides.length,
                itemBuilder: (context, index) {
                  final item = _slides[index];
                  return _buildSlide(item);
                },
              ),
            ),

            // Bottom Navigation & Controls
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                children: [
                  // Smooth Animated Indicator Dots
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      _slides.length,
                      (dotIndex) => AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: _currentPage == dotIndex ? 26 : 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: _currentPage == dotIndex
                              ? _slides[_currentPage].accentColor
                              : AppColors.border,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 28),

                  // Action Buttons
                  if (_currentPage == _slides.length - 1) ...[
                    CustomButton(
                      text: 'Get Started with FindDestination',
                      backgroundColor: AppColors.primary,
                      onPressed: _completeOnboarding,
                    ),
                    const SizedBox(height: 10),
                    CustomButton(
                      text: 'Sign In to Existing Account',
                      isOutlined: true,
                      onPressed: () {
                        _completeOnboarding();
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const LoginScreen()),
                        );
                      },
                    ),
                  ] else ...[
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _completeOnboarding,
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: AppColors.border),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text(
                              'Explore as Guest',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _nextPage,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: _slides[_currentPage].accentColor,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Next',
                                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                                ),
                                SizedBox(width: 6),
                                Icon(LucideIcons.arrowRight, size: 16),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSlide(OnboardingItem item) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Animated Graphic with layered concentric glowing rings
          Stack(
            alignment: Alignment.center,
            children: [
              // Outer soft ring
              AnimatedContainer(
                duration: const Duration(milliseconds: 500),
                width: 220,
                height: 220,
                decoration: BoxDecoration(
                  color: item.lightAccentColor.withValues(alpha: 0.35),
                  shape: BoxShape.circle,
                ),
              ),
              // Inner ring
              AnimatedContainer(
                duration: const Duration(milliseconds: 400),
                width: 170,
                height: 170,
                decoration: BoxDecoration(
                  color: item.lightAccentColor,
                  shape: BoxShape.circle,
                ),
              ),
              // Center card with icon
              Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: item.accentColor.withValues(alpha: 0.2),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Center(
                  child: Icon(
                    item.icon,
                    size: 52,
                    color: item.accentColor,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 36),

          // Title & Highlight
          Text(
            item.title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: AppColors.dark,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            item.highlight,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: item.accentColor,
            ),
          ),

          const SizedBox(height: 16),

          // Description
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Text(
              item.description,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Feature Badges / Tags
          Wrap(
            alignment: WrapAlignment.center,
            spacing: 8,
            runSpacing: 8,
            children: item.tags.map((tag) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: item.lightAccentColor,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: item.accentColor.withValues(alpha: 0.25)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(LucideIcons.checkCircle2, size: 12, color: item.accentColor),
                    const SizedBox(width: 5),
                    Text(
                      tag,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: item.accentColor,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
