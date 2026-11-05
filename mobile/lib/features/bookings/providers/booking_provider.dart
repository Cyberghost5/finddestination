import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exceptions.dart';
import '../models/booking_model.dart';

class BookingProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  List<BookingModel> _myTrips = [];
  bool _isLoading = false;
  String? _errorMessage;
  String _activeGateway = 'monnify'; // 'monnify' or 'paystack'

  List<BookingModel> get myTrips => _myTrips;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get activeGateway => _activeGateway;

  BookingProvider() {
    loadCachedTrips();
    fetchPaymentGatewaySetting();
  }

  /// Load cached trips from SharedPreferences
  Future<void> loadCachedTrips() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedStr = prefs.getString('finddestination_recent_bookings') ??
          prefs.getString('tafiya_recent_bookings');
      if (savedStr != null) {
        final list = jsonDecode(savedStr) as List;
        _myTrips = list
            .map((item) => BookingModel.fromJson(Map<String, dynamic>.from(item)))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Failed to load cached trips: $e');
    }
  }

  /// Fetch active gateway setting from backend
  Future<void> fetchPaymentGatewaySetting() async {
    try {
      final response = await _apiClient.get(ApiConstants.paymentGatewaySettings);
      final data = response.data;
      if (data is Map && data['status'] == 'success' && data['data'] is Map) {
        final gw = data['data']['payment_gateway'];
        if (gw != null && (gw == 'monnify' || gw == 'paystack')) {
          _activeGateway = gw;
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('Error fetching payment gateway setting: $e');
    }
  }

  /// Create a new room booking reservation
  Future<BookingModel?> createBooking({
    required int propertyId,
    required String propertyName,
    required String propertyCity,
    required String propertyState,
    required String propertyAddress,
    required int roomTypeId,
    required String roomName,
    required int roomPriceKobo,
    required int roomsCount,
    required String checkInDate,
    required String checkOutDate,
    required String guestName,
    required String guestEmail,
    required String guestPhone,
    required String paymentGateway,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final payload = {
        'property_id': propertyId,
        'property_name': propertyName,
        'property_city': propertyCity,
        'property_state': propertyState,
        'property_address': propertyAddress,
        'room_type_id': roomTypeId,
        'room_name': roomName,
        'room_price_kobo': roomPriceKobo,
        'rooms_count': roomsCount,
        'check_in_date': checkInDate,
        'check_out_date': checkOutDate,
        'guest_name': guestName,
        'guest_email': guestEmail,
        'guest_phone': guestPhone,
        'payment_gateway': paymentGateway,
        'is_paid': false,
        'booking_status': 'confirmed',
      };

      final response = await _apiClient.post(ApiConstants.bookings, data: payload);
      final data = response.data;

      if (data is Map && data['status'] == 'success') {
        final bookingData = data['data'];
        final booking = BookingModel.fromJson(Map<String, dynamic>.from(bookingData));

        // Add to active trips and persist
        _myTrips.insert(0, booking);
        _persistTrips();

        _isLoading = false;
        notifyListeners();
        return booking;
      } else {
        throw ApiException(message: data['message'] ?? 'Failed to complete booking');
      }
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  /// Track booking by reference
  Future<BookingModel?> trackBooking(String reference) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiConstants.trackBooking,
        data: {'booking_reference': reference.trim()},
      );

      final data = response.data;
      if (data is Map && data['status'] == 'success' && data['data'] is Map) {
        final booking = BookingModel.fromJson(Map<String, dynamic>.from(data['data']));
        _isLoading = false;
        notifyListeners();
        return booking;
      } else {
        throw ApiException(message: data['message'] ?? 'Booking reference not found');
      }
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  /// Fetch user trips from API
  Future<void> fetchMyTrips(String email) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.get(
        '${ApiConstants.bookings}?email=${Uri.encodeComponent(email)}',
      );

      final data = response.data;
      if (data is Map && data['status'] == 'success' && data['data'] is List) {
        final list = data['data'] as List;
        final apiTrips = list
            .map((b) => BookingModel.fromJson(Map<String, dynamic>.from(b)))
            .toList();

        // Merge API trips with locally cached trips by reference
        final Map<String, BookingModel> combined = {};
        for (final t in _myTrips) {
          combined[t.bookingReference] = t;
        }
        for (final t in apiTrips) {
          combined[t.bookingReference] = t;
        }

        _myTrips = combined.values.toList();
        _persistTrips();
      }
    } catch (e) {
      debugPrint('Failed to fetch remote trips: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Send booking voucher email
  Future<bool> sendVoucherEmail({
    required String bookingReference,
    required String email,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiConstants.sendVoucherEmail,
        data: {
          'booking_reference': bookingReference,
          'email': email,
        },
      );
      return response.data['status'] == 'success';
    } catch (e) {
      debugPrint('Error sending voucher email: $e');
      return false;
    }
  }

  Future<void> _persistTrips() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final encoded = jsonEncode(_myTrips.map((t) => t.toJson()).toList());
      await prefs.setString('finddestination_recent_bookings', encoded);
    } catch (e) {
      debugPrint('Failed to save trips locally: $e');
    }
  }
}
