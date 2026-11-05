import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../models/admin_models.dart';

class AdminProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  bool _isLoading = false;
  String? _errorMessage;

  List<AdminHostModel> _hosts = [];
  List<AdminInspectionReportModel> _reports = [];
  List<AdminWithdrawalModel> _withdrawals = [];
  List<AdminTransactionModel> _transactions = [];

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  List<AdminHostModel> get hosts => _hosts;
  List<AdminInspectionReportModel> get reports => _reports;
  List<AdminWithdrawalModel> get withdrawals => _withdrawals;
  List<AdminTransactionModel> get transactions => _transactions;

  // Counts & Summaries
  int get pendingHostsCount => _hosts.where((h) => h.hostStatus == 'pending').count();
  int get pendingReportsCount => _reports.where((r) => r.isPendingReview).count();
  int get pendingWithdrawalsCount => _withdrawals.where((w) => w.isPending).count();

  int get totalGmvKobo {
    return _transactions
        .where((t) => t.isSuccessful)
        .fold<int>(0, (sum, t) => sum + t.amountPaidKobo);
  }

  String get totalGmvFormatted {
    return '₦${NumberFormat('#,##0.00').format(totalGmvKobo / 100)}';
  }

  int get totalCommissionKobo {
    return _transactions
        .where((t) => t.isSuccessful)
        .fold<int>(0, (sum, t) => sum + t.platformCommissionKobo);
  }

  String get totalCommissionFormatted {
    return '₦${NumberFormat('#,##0.00').format(totalCommissionKobo / 100)}';
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  /// Fetch all data required for the Admin Control Center
  Future<void> fetchAllAdminData() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await Future.wait([
        fetchHosts(),
        fetchReports(),
        fetchWithdrawals(),
        fetchTransactions(),
      ]);
    } catch (e) {
      _errorMessage = 'Failed to load some admin data: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// 1. Host Approvals & CAC Queue
  Future<void> fetchHosts() async {
    try {
      final response = await _apiClient.get(ApiConstants.adminHosts);
      if (response.data['status'] == 'success') {
        final list = (response.data['data'] as List)
            .map((item) => AdminHostModel.fromJson(item))
            .toList();
        _hosts = list;
      }
    } catch (e) {
      debugPrint('Error fetching admin hosts: $e');
    }
    notifyListeners();
  }

  Future<bool> updateHostApproval(int hostId, String action) async {
    try {
      final response = await _apiClient.patch(
        '${ApiConstants.adminHosts}/$hostId/approval',
        data: {'action': action},
      );
      if (response.data['status'] == 'success') {
        await fetchHosts();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error updating host approval: $e');
      _errorMessage = 'Failed to update host approval: $e';
      notifyListeners();
      return false;
    }
  }

  Future<Map<String, dynamic>?> verifyHostCac(int hostId, {String? cacNumber}) async {
    try {
      final response = await _apiClient.post(
        '${ApiConstants.adminHosts}/$hostId/verify-cac',
        data: cacNumber != null ? {'cac_number': cacNumber} : {},
      );
      if (response.data['status'] == 'success') {
        await fetchHosts();
        return response.data['data'] is Map<String, dynamic> ? response.data['data'] : {'status': 'verified'};
      }
      return null;
    } catch (e) {
      debugPrint('Error verifying host CAC: $e');
      _errorMessage = 'Failed to verify CAC via QoreID: $e';
      notifyListeners();
      return null;
    }
  }

  /// 2. Field Inspection Audit Reports
  Future<void> fetchReports({String status = 'all'}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (status != 'all') queryParams['status'] = status;

      final response = await _apiClient.get(
        ApiConstants.adminInspectionReports,
        queryParameters: queryParams,
      );
      if (response.data['status'] == 'success') {
        final list = (response.data['data'] as List)
            .map((item) => AdminInspectionReportModel.fromJson(item))
            .toList();
        _reports = list;
      }
    } catch (e) {
      debugPrint('Error fetching inspection reports: $e');
    }
    notifyListeners();
  }

  Future<bool> verifyInspectionReport(
    int inspectionId, {
    required String action, // 'approved', 'revision_requested'
    String? adminNotes,
  }) async {
    try {
      final response = await _apiClient.post(
        '/admin/inspections/$inspectionId/verify',
        data: {
          'action': action,
          if (adminNotes != null && adminNotes.isNotEmpty) 'admin_review_notes': adminNotes,
        },
      );
      if (response.data['status'] == 'success') {
        await fetchReports();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error verifying inspection report: $e');
      _errorMessage = 'Failed to submit audit decision: $e';
      notifyListeners();
      return false;
    }
  }

  /// 3. Agent & Host Withdrawal Requests
  Future<void> fetchWithdrawals({String status = 'all'}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (status != 'all') queryParams['status'] = status;

      final response = await _apiClient.get(
        ApiConstants.adminWithdrawals,
        queryParameters: queryParams,
      );
      if (response.data['status'] == 'success') {
        final list = (response.data['data'] as List)
            .map((item) => AdminWithdrawalModel.fromJson(item))
            .toList();
        _withdrawals = list;
      }
    } catch (e) {
      debugPrint('Error fetching admin withdrawals: $e');
    }
    notifyListeners();
  }

  Future<bool> processWithdrawal(
    int withdrawalId, {
    required String action, // 'approved', 'rejected'
    String? adminNote,
  }) async {
    try {
      final response = await _apiClient.post(
        '${ApiConstants.adminWithdrawals}/$withdrawalId/process',
        data: {
          'action': action,
          if (adminNote != null && adminNote.isNotEmpty) 'admin_note': adminNote,
        },
      );
      if (response.data['status'] == 'success') {
        await fetchWithdrawals();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error processing withdrawal: $e');
      _errorMessage = 'Failed to process withdrawal: $e';
      notifyListeners();
      return false;
    }
  }

  /// 4. Platform Transactions & Financial Ledger
  Future<void> fetchTransactions({String? gateway, String? search}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (gateway != null && gateway != 'all') queryParams['gateway'] = gateway;
      if (search != null && search.isNotEmpty) queryParams['search'] = search;

      final response = await _apiClient.get(
        ApiConstants.adminTransactions,
        queryParameters: queryParams,
      );
      if (response.data['status'] == 'success') {
        final list = (response.data['data'] as List)
            .map((item) => AdminTransactionModel.fromJson(item))
            .toList();
        _transactions = list;
      }
    } catch (e) {
      debugPrint('Error fetching admin transactions: $e');
    }
    notifyListeners();
  }
}

extension IterableExt<T> on Iterable<T> {
  int count([bool Function(T element)? predicate]) {
    if (predicate == null) return length;
    var count = 0;
    for (final element in this) {
      if (predicate(element)) count++;
    }
    return count;
  }
}
