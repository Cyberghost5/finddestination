import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'core/theme/app_theme.dart';
import 'features/admin/providers/admin_provider.dart';
import 'features/agent/providers/agent_provider.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/bookings/providers/booking_provider.dart';
import 'features/chat/providers/chat_provider.dart';
import 'features/common/screens/main_navigation_shell.dart';
import 'features/host/providers/host_provider.dart';
import 'features/onboarding/screens/animated_onboarding_screen.dart';
import 'features/properties/providers/property_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set transparent system status bar with dark icons
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  final prefs = await SharedPreferences.getInstance();
  final hasSeenOnboarding = prefs.getBool('has_seen_intro_onboarding') ?? false;

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..initAuth()),
        ChangeNotifierProvider(create: (_) => PropertyProvider()),
        ChangeNotifierProvider(create: (_) => BookingProvider()),
        ChangeNotifierProvider(create: (_) => HostProvider()),
        ChangeNotifierProvider(create: (_) => AgentProvider()),
        ChangeNotifierProvider(create: (_) => ChatProvider()),
        ChangeNotifierProvider(create: (_) => AdminProvider()),
      ],
      child: FindDestinationApp(showOnboardingFirst: !hasSeenOnboarding),
    ),
  );
}

class FindDestinationApp extends StatelessWidget {
  final bool showOnboardingFirst;

  const FindDestinationApp({
    super.key,
    this.showOnboardingFirst = false,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FindDestination',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: showOnboardingFirst
          ? const AnimatedOnboardingScreen()
          : const MainNavigationShell(),
    );
  }
}
