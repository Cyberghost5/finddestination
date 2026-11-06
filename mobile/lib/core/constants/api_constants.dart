class ApiConstants {
  // Default live production backend API URL
  static const String defaultLiveUrl = 'https://finddestination.com.ng/api/v1';

  // Allow overriding base URL for local testing or custom staging
  static String? _customBaseUrl;

  static void setCustomBaseUrl(String url) {
    _customBaseUrl = url;
  }

  static String get baseUrl {
    if (_customBaseUrl != null && _customBaseUrl!.isNotEmpty) {
      return _customBaseUrl!;
    }
    return defaultLiveUrl;
  }

  // Endpoints
  // Settings
  static const String paymentGatewaySettings = '/settings/payment-gateway';

  // Auth
  static const String register = '/auth/register';
  static const String registerHost = '/auth/register-host';
  static const String login = '/auth/login';
  static const String googleAuth = '/auth/google';
  static const String verifyEmail = '/auth/verify-email';
  static const String resendVerification = '/auth/resend-verification';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String me = '/auth/me';
  static const String logout = '/auth/logout';
  static const String onboarding = '/auth/onboarding';

  // Properties
  static const String properties = '/properties';
  static const String propertiesSearch = '/properties/search';

  // Bookings
  static const String bookings = '/bookings';
  static const String hostBookings = '/host/bookings';
  static const String myTrips = '/bookings/my-trips';
  static const String myTripsPublic = '/bookings/my-trips-public';
  static const String trackBooking = '/bookings/track';
  static const String sendVoucherEmail = '/bookings/send-voucher-email';

  // Host Payouts
  static const String hostPayouts = '/host/payouts';
  static const String hostWithdraw = '/host/payouts/withdraw';
  static const String hostBankDetails = '/host/payouts/bank-details';

  // Chats
  static const String chats = '/chats';
  static const String startBookingChat = '/chats/start-booking-chat';
  static const String supportChat = '/chats/support';

  // Field Agent
  static const String agentExplore = '/agent/explore-properties';
  static const String agentApply = '/agent/inspections/apply';
  static const String agentAssignments = '/agent/inspections/my-assignments';
  static const String agentWallet = '/agent/wallet';
  static const String agentBankDetails = '/agent/wallet/bank-details';
  static const String agentWithdraw = '/agent/wallet/withdraw';

  // Admin
  static const String adminHosts = '/admin/hosts';
  static const String adminUsers = '/admin/users';
  static const String adminTransactions = '/admin/transactions';
  static const String adminInspectionProperties = '/admin/inspections/properties';
  static const String adminInspectionApplications = '/admin/inspections/applications';
  static const String adminInspectionReports = '/admin/inspections/reports';
  static const String adminWithdrawals = '/admin/withdrawals';
}
