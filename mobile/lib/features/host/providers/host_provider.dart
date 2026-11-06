import 'package:flutter/material.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../properties/models/property_model.dart';
import '../models/host_payout_model.dart';

class HostProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  HostPayoutModel? _payoutData;
  List<HostBookingModel> _bookings = [];
  List<PropertyModel> _properties = [];

  bool _isLoading = false;
  bool _isLoadingPayouts = false;
  bool _isLoadingBookings = false;
  bool _isLoadingProperties = false;
  bool _isSubmitting = false;
  String? _errorMessage;
  String? _successMessage;

  HostPayoutModel? get payoutData => _payoutData;
  List<HostBookingModel> get bookings => _bookings;
  List<PropertyModel> get properties => _properties;

  bool get isLoading => _isLoading;
  bool get isLoadingPayouts => _isLoadingPayouts;
  bool get isLoadingBookings => _isLoadingBookings;
  bool get isLoadingProperties => _isLoadingProperties;
  bool get isSubmitting => _isSubmitting;
  String? get errorMessage => _errorMessage;
  String? get successMessage => _successMessage;

  // Computed metrics
  double get totalRevenue => _payoutData?.totalEarned ?? 0.0;
  double get escrowBalance => _payoutData?.balance ?? 0.0;
  int get activeListingsCount => _properties.where((p) => p.isPublished).length;
  int get confirmedBookingsCount => _bookings.length;

  void clearMessages() {
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();
  }

  /// Load all host data in parallel
  Future<void> fetchDashboardData({int? hostId}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await Future.wait([
        fetchHostPayouts(hostId: hostId, notify: false),
        fetchHostBookings(hostId: hostId, notify: false),
        fetchHostProperties(hostId: hostId, notify: false),
      ]);
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Retrieve host escrow wallet, bank info & payout transactions
  Future<void> fetchHostPayouts({int? hostId, bool notify = true}) async {
    _isLoadingPayouts = true;
    if (notify) notifyListeners();

    try {
      final query = hostId != null ? '?host_id=$hostId' : '';
      final response = await _apiClient.get('${ApiConstants.hostPayouts}$query');

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        if (data['status'] == 'success' && data['data'] != null) {
          _payoutData = HostPayoutModel.fromJson(data['data']);
        }
      }
    } catch (e) {
      _errorMessage = 'Could not load escrow wallet: $e';
    } finally {
      _isLoadingPayouts = false;
      if (notify) notifyListeners();
    }
  }

  /// Retrieve host incoming reservations
  Future<void> fetchHostBookings({int? hostId, bool notify = true}) async {
    _isLoadingBookings = true;
    if (notify) notifyListeners();

    try {
      final query = hostId != null ? '?host_id=$hostId' : '';
      final response = await _apiClient.get('${ApiConstants.hostBookings}$query');

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        if (data['status'] == 'success' && data['data'] is List) {
          _bookings = (data['data'] as List)
              .map((b) => HostBookingModel.fromJson(b))
              .toList();
        }
      }
    } catch (e) {
      _errorMessage = 'Could not load incoming bookings: $e';
    } finally {
      _isLoadingBookings = false;
      if (notify) notifyListeners();
    }
  }

  /// Retrieve host properties
  Future<void> fetchHostProperties({int? hostId, bool notify = true}) async {
    _isLoadingProperties = true;
    if (notify) notifyListeners();

    try {
      final response = await _apiClient.get(ApiConstants.properties);

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        final list = (data['data'] is List)
            ? data['data'] as List
            : (data is List ? data : []);

        final all = list.map((p) => PropertyModel.fromJson(p)).toList();

        if (hostId != null) {
          // If host id is specified, filter by hostId
          final hostProps = all.where((p) => p.hostId == hostId).toList();
          _properties = hostProps.isNotEmpty ? hostProps : all;
        } else {
          _properties = all;
        }
      }
    } catch (e) {
      _errorMessage = 'Could not load properties: $e';
    } finally {
      _isLoadingProperties = false;
      if (notify) notifyListeners();
    }
  }

  /// Update host settlement bank account details
  Future<bool> updateBankDetails({
    required String bankName,
    required String accountNumber,
    required String accountName,
    String? bankCode,
    int? hostId,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();

    try {
      final payload = {
        'bank_name': bankName.trim(),
        'account_number': accountNumber.trim(),
        'account_name': accountName.trim(),
        if (bankCode != null && bankCode.isNotEmpty) 'bank_code': bankCode.trim(),
        if (hostId != null) 'host_id': hostId,
      };

      final response = await _apiClient.post(
        ApiConstants.hostBankDetails,
        data: payload,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        _successMessage = 'Corporate bank details saved successfully!';
        await fetchHostPayouts(hostId: hostId, notify: false);
        return true;
      } else {
        _errorMessage = response.data?['message'] ?? 'Failed to update bank details';
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  /// Submit payout withdrawal request
  Future<bool> requestWithdrawal({
    required double amount,
    int? hostId,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();

    try {
      final payload = {
        'amount': amount,
        if (hostId != null) 'host_id': hostId,
      };

      final response = await _apiClient.post(
        ApiConstants.hostWithdraw,
        data: payload,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        _successMessage = response.data?['message'] ??
            'Payout request of ₦${amount.toStringAsFixed(2)} submitted successfully!';
        await fetchHostPayouts(hostId: hostId, notify: false);
        return true;
      } else {
        _errorMessage = response.data?['message'] ?? 'Failed to process payout';
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  /// Toggle published / draft status of a property
  Future<bool> togglePublish(int propertyId) async {
    try {
      final response = await _apiClient.patch(
        '${ApiConstants.properties}/$propertyId/publish',
      );

      if (response.statusCode == 200) {
        final bool isPublished = response.data?['is_published'] ?? false;

        // Update local property status
        final index = _properties.indexWhere((p) => p.id == propertyId);
        if (index != -1) {
          _properties[index] = _properties[index].copyWith(isPublished: isPublished);
          notifyListeners();
        }
        return true;
      }
      return false;
    } catch (e) {
      _errorMessage = 'Failed to toggle publish status: $e';
      notifyListeners();
      return false;
    }
  }

  /// Create new property via Listing Wizard
  Future<PropertyModel?> createProperty(Map<String, dynamic> propertyData) async {
    _isSubmitting = true;
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiConstants.properties,
        data: propertyData,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        _successMessage = 'Property listed successfully in FindDestination!';
        final newPropJson = response.data?['data'];
        if (newPropJson != null) {
          final newProp = PropertyModel.fromJson(newPropJson);
          _properties.insert(0, newProp);
          notifyListeners();
          return newProp;
        }
        // Fallback reload properties
        await fetchHostProperties(notify: false);
        return _properties.isNotEmpty ? _properties.first : null;
      } else {
        _errorMessage = response.data?['message'] ?? 'Failed to create property';
        return null;
      }
    } catch (e) {
      _errorMessage = e.toString();
      return null;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }
}
