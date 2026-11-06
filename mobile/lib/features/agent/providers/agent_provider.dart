import 'package:flutter/material.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../models/agent_models.dart';

class AgentProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  List<BountyPropertyModel> _bounties = [];
  List<AgentAssignmentModel> _assignments = [];
  AgentWalletModel? _wallet;

  bool _isLoading = false;
  bool _isLoadingBounties = false;
  bool _isLoadingAssignments = false;
  bool _isLoadingWallet = false;
  bool _isSubmitting = false;

  String? _errorMessage;
  String? _successMessage;

  // Selected State Filter for Explore
  String _selectedStateFilter = 'all';

  List<BountyPropertyModel> get bounties => _bounties;
  List<AgentAssignmentModel> get assignments => _assignments;
  AgentWalletModel? get wallet => _wallet;

  bool get isLoading => _isLoading;
  bool get isLoadingBounties => _isLoadingBounties;
  bool get isLoadingAssignments => _isLoadingAssignments;
  bool get isLoadingWallet => _isLoadingWallet;
  bool get isSubmitting => _isSubmitting;

  String? get errorMessage => _errorMessage;
  String? get successMessage => _successMessage;
  String get selectedStateFilter => _selectedStateFilter;

  // Computed metrics
  double get totalEarned => _wallet?.totalEarned ?? 0.0;
  double get availableBalance => _wallet?.balance ?? 0.0;
  int get pendingAuditsCount => _assignments.where((a) => a.status == 'approved').length;
  int get verifiedAuditsCount => _assignments.where((a) => a.status == 'verified').length;

  void clearMessages() {
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();
  }

  void setStateFilter(String state, {int? agentId}) {
    _selectedStateFilter = state;
    fetchExploreBounties(state: state, agentId: agentId);
  }

  /// Load all agent portal views in parallel
  Future<void> fetchAgentPortalData({int? agentId}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await Future.wait([
        fetchExploreBounties(state: _selectedStateFilter, agentId: agentId, notify: false),
        fetchMyAssignments(agentId: agentId, notify: false),
        fetchWallet(agentId: agentId, notify: false),
      ]);
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Browse properties open for inspection bounty
  Future<void> fetchExploreBounties({
    String? state,
    int? agentId,
    bool notify = true,
  }) async {
    _isLoadingBounties = true;
    if (notify) notifyListeners();

    try {
      final queryParams = <String>[];
      if (state != null && state != 'all') {
        queryParams.add('state=$state');
      }
      if (agentId != null) {
        queryParams.add('agent_id=$agentId');
      }
      final queryString = queryParams.isNotEmpty ? '?${queryParams.join('&')}' : '';

      final response = await _apiClient.get('${ApiConstants.agentExplore}$queryString');

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        if (data['status'] == 'success' && data['data'] is List) {
          _bounties = (data['data'] as List)
              .map((b) => BountyPropertyModel.fromJson(b))
              .toList();
        }
      }
    } catch (e) {
      _errorMessage = 'Could not load bounties: $e';
    } finally {
      _isLoadingBounties = false;
      if (notify) notifyListeners();
    }
  }

  /// Apply for an inspection bounty
  Future<bool> applyForBounty(int propertyId, {int? agentId}) async {
    _isSubmitting = true;
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiConstants.agentApply,
        data: {
          'property_id': propertyId,
          if (agentId != null) 'agent_id': agentId,
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        _successMessage = response.data?['message'] ??
            'Inspection application submitted! Awaiting Super Admin authorization.';
        // Refresh bounties and assignments
        await fetchExploreBounties(agentId: agentId, notify: false);
        await fetchMyAssignments(agentId: agentId, notify: false);
        return true;
      } else {
        _errorMessage = response.data?['message'] ?? 'Failed to apply for bounty';
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

  /// Retrieve agent's assigned inspections (unlocked contact & address if approved)
  Future<void> fetchMyAssignments({int? agentId, bool notify = true}) async {
    _isLoadingAssignments = true;
    if (notify) notifyListeners();

    try {
      final query = agentId != null ? '?agent_id=$agentId' : '';
      final response = await _apiClient.get('${ApiConstants.agentAssignments}$query');

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        if (data['status'] == 'success' && data['data'] is List) {
          _assignments = (data['data'] as List)
              .map((a) => AgentAssignmentModel.fromJson(a))
              .toList();
        }
      }
    } catch (e) {
      _errorMessage = 'Could not load assignments: $e';
    } finally {
      _isLoadingAssignments = false;
      if (notify) notifyListeners();
    }
  }

  /// Submit on-site field verification audit report
  Future<bool> submitAuditReport({
    required int inspectionId,
    required double latitude,
    required double longitude,
    required List<String> photos,
    String? videoUrl,
    required Map<String, bool> amenitiesCheck,
    required String reportNotes,
    int? agentId,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();

    try {
      final payload = {
        'gps_latitude': latitude,
        'gps_longitude': longitude,
        'photos': photos,
        if (videoUrl != null && videoUrl.isNotEmpty) 'video_url': videoUrl,
        'amenities_check': amenitiesCheck,
        'report_notes': reportNotes.trim(),
        if (agentId != null) 'agent_id': agentId,
      };

      final response = await _apiClient.post(
        '/agent/inspections/$inspectionId/submit-report',
        data: payload,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        _successMessage = response.data?['message'] ??
            'Field verification audit uploaded successfully! Super Admin will review your evidence.';
        await fetchMyAssignments(agentId: agentId, notify: false);
        return true;
      } else {
        _errorMessage = response.data?['message'] ?? 'Failed to submit report';
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

  /// Retrieve agent bounty wallet, ledger, and payout history
  Future<void> fetchWallet({int? agentId, bool notify = true}) async {
    _isLoadingWallet = true;
    if (notify) notifyListeners();

    try {
      final query = agentId != null ? '?agent_id=$agentId' : '';
      final response = await _apiClient.get('${ApiConstants.agentWallet}$query');

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        if (data['status'] == 'success' && data['data'] != null) {
          _wallet = AgentWalletModel.fromJson(data['data']);
        }
      }
    } catch (e) {
      _errorMessage = 'Could not load agent wallet: $e';
    } finally {
      _isLoadingWallet = false;
      if (notify) notifyListeners();
    }
  }

  /// Update agent payout bank account
  Future<bool> updateBankDetails({
    required String bankName,
    required String accountNumber,
    required String accountName,
    String? bankCode,
    int? agentId,
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
        if (agentId != null) 'agent_id': agentId,
      };

      final response = await _apiClient.post(
        ApiConstants.agentBankDetails,
        data: payload,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        _successMessage = 'Payout bank details saved successfully!';
        await fetchWallet(agentId: agentId, notify: false);
        return true;
      } else {
        _errorMessage = response.data?['message'] ?? 'Failed to save bank details';
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

  /// Request withdrawal of earned bounty funds
  Future<bool> requestWithdrawal({
    required double amount,
    int? agentId,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();

    try {
      final payload = {
        'amount': amount,
        if (agentId != null) 'agent_id': agentId,
      };

      final response = await _apiClient.post(
        ApiConstants.agentWithdraw,
        data: payload,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        _successMessage = response.data?['message'] ??
            'Withdrawal request of ₦${amount.toStringAsFixed(2)} submitted successfully!';
        await fetchWallet(agentId: agentId, notify: false);
        return true;
      } else {
        _errorMessage = response.data?['message'] ?? 'Withdrawal request failed';
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
}
