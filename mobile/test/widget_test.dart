import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:finddestination/features/admin/providers/admin_provider.dart';
import 'package:finddestination/features/agent/providers/agent_provider.dart';
import 'package:finddestination/features/auth/providers/auth_provider.dart';
import 'package:finddestination/features/bookings/providers/booking_provider.dart';
import 'package:finddestination/features/chat/providers/chat_provider.dart';
import 'package:finddestination/features/host/providers/host_provider.dart';
import 'package:finddestination/features/properties/providers/property_provider.dart';
import 'package:finddestination/main.dart';

void main() {
  testWidgets('FindDestinationApp boots up and renders navigation shell', (WidgetTester tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AuthProvider()),
          ChangeNotifierProvider(create: (_) => PropertyProvider()),
          ChangeNotifierProvider(create: (_) => BookingProvider()),
          ChangeNotifierProvider(create: (_) => HostProvider()),
          ChangeNotifierProvider(create: (_) => AgentProvider()),
          ChangeNotifierProvider(create: (_) => ChatProvider()),
          ChangeNotifierProvider(create: (_) => AdminProvider()),
        ],
        child: const FindDestinationApp(showOnboardingFirst: false),
      ),
    );

    // Pump frames to render UI without waiting indefinitely for circular progress indicator
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    // Verify Brand title is rendered
    expect(find.text('FindDestination'), findsWidgets);
    expect(find.text('Explore'), findsOneWidget);
    expect(find.text('Wishlist'), findsOneWidget);
    expect(find.text('Trips'), findsOneWidget);
    expect(find.text('Inbox'), findsOneWidget);
    expect(find.text('Account'), findsOneWidget);
  });
}
