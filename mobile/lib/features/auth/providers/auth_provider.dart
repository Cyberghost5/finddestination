import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exceptions.dart';
import '../models/user_model.dart';

class AuthProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  UserModel? _user;
  String? _token;
  String _activeRole = 'guest'; // 'guest', 'host', 'agent', 'admin'
  bool _isLoading = false;
  bool _isInitialized = false;
  String? _errorMessage;

  UserModel? get user => _user;
  String? get token => _token;
  String get activeRole => _activeRole;
  bool get isLoading => _isLoading;
  bool get isInitialized => _isInitialized;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _token != null && _user != null;

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  /// Initialize session from SharedPreferences on app startup
  Future<void> initAuth() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString('auth_token');
      final userJsonStr = prefs.getString('auth_user');
      _activeRole = prefs.getString('active_role') ?? 'guest';

      if (_token != null && userJsonStr != null) {
        _apiClient.setAuthToken(_token);
        final userMap = jsonDecode(userJsonStr);
        _user = UserModel.fromJson(userMap);
        _activeRole = _user?.role ?? _activeRole;
      }
    } catch (e) {
      debugPrint('Error initializing auth: $e');
    } finally {
      _isInitialized = true;
      notifyListeners();
    }
  }

  /// Save session to persistent storage
  Future<void> _saveSession(UserModel user, String token) async {
    _user = user;
    _token = token;
    _activeRole = user.role;
    _apiClient.setAuthToken(token);

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    await prefs.setString('auth_user', jsonEncode(user.toJson()));
    await prefs.setString('active_role', user.role);
    notifyListeners();
  }

  /// Switch active role (mirrors web role switcher)
  Future<void> switchRole(String role) async {
    _activeRole = role;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('active_role', role);
    notifyListeners();
  }

  /// Login with email and password
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiConstants.login,
        data: {
          'login': email.trim().toLowerCase(),
          'email': email.trim().toLowerCase(),
          'password': password,
        },
      );

      final data = response.data;
      if (data['status'] == 'success') {
        final userData = data['data']['user'];
        final token = data['data']['token'];
        final user = UserModel.fromJson(userData);
        await _saveSession(user, token);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        throw ApiException(message: data['message'] ?? 'Login failed');
      }
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Register as a Guest Traveler
  Future<bool> registerGuest({
    required String name,
    required String email,
    required String phone,
    required String password,
    required String passwordConfirmation,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiConstants.register,
        data: {
          'name': name.trim(),
          'email': email.trim().toLowerCase(),
          'phone': phone.trim(),
          'password': password,
          'password_confirmation': passwordConfirmation,
          'role': 'guest',
        },
      );

      final data = response.data;
      if (data['status'] == 'success') {
        final userData = data['data']['user'];
        final token = data['data']['token'];
        final user = UserModel.fromJson(userData);
        await _saveSession(user, token);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        throw ApiException(message: data['message'] ?? 'Registration failed');
      }
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Register as a Lodging Host
  Future<bool> registerHost({
    required String name,
    required String businessName,
    required String cacNumber,
    required String email,
    required String phone,
    required String password,
    required String passwordConfirmation,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiConstants.registerHost,
        data: {
          'name': name.trim(),
          'business_name': businessName.trim(),
          'cac_number': cacNumber.trim(),
          'email': email.trim().toLowerCase(),
          'phone': phone.trim(),
          'password': password,
          'password_confirmation': passwordConfirmation,
          'role': 'host',
        },
      );

      final data = response.data;
      if (data['status'] == 'success') {
        final userData = data['data']['user'];
        final token = data['data']['token'];
        final user = UserModel.fromJson(userData);
        await _saveSession(user, token);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        throw ApiException(message: data['message'] ?? 'Host registration failed');
      }
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Verify Email with 6-digit OTP code
  Future<bool> verifyEmail({
    required String email,
    required String code,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiConstants.verifyEmail,
        data: {
          'email': email.trim().toLowerCase(),
          'verification_code': code.trim(),
        },
      );

      final data = response.data;
      if (data['status'] == 'success') {
        if (_user != null) {
          _user = _user!.copyWith(isEmailVerified: true);
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('auth_user', jsonEncode(_user!.toJson()));
        }
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        throw ApiException(message: data['message'] ?? 'Verification failed');
      }
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Resend verification code
  Future<bool> resendVerification(String email) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiConstants.resendVerification,
        data: {
          'email': email.trim().toLowerCase(),
        },
      );

      _isLoading = false;
      notifyListeners();
      return response.data['status'] == 'success';
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Request Password Reset code/link
  Future<bool> forgotPassword(String email) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiConstants.forgotPassword,
        data: {
          'email': email.trim().toLowerCase(),
        },
      );

      _isLoading = false;
      notifyListeners();
      return response.data['status'] == 'success';
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Reset Password with Token
  Future<bool> resetPassword({
    required String email,
    required String token,
    required String password,
    required String passwordConfirmation,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiConstants.resetPassword,
        data: {
          'email': email.trim().toLowerCase(),
          'token': token.trim(),
          'password': password,
          'password_confirmation': passwordConfirmation,
        },
      );

      _isLoading = false;
      notifyListeners();
      return response.data['status'] == 'success';
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Complete Profile Onboarding
  Future<bool> completeOnboarding({
    required String firstName,
    required String lastName,
    required String dob,
    bool marketingOptOut = false,
  }) async {
    if (_user == null) return false;
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiConstants.onboarding,
        data: {
          'email': _user!.email,
          'first_name': firstName.trim(),
          'last_name': lastName.trim(),
          'dob': dob,
          'marketing_opt_out': marketingOptOut,
        },
      );

      final data = response.data;
      if (data['status'] == 'success') {
        _user = _user!.copyWith(
          firstName: firstName,
          lastName: lastName,
          name: '$firstName $lastName',
          dob: dob,
          onboardingCompleted: true,
        );
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_user', jsonEncode(_user!.toJson()));
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        throw ApiException(message: data['message'] ?? 'Onboarding failed');
      }
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    try {
      if (_token != null) {
        await _apiClient.post(ApiConstants.logout);
      }
    } catch (e) {
      debugPrint('Logout API failed, proceeding with local clear: $e');
    } finally {
      _user = null;
      _token = null;
      _activeRole = 'guest';
      _apiClient.setAuthToken(null);

      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      await prefs.remove('auth_user');
      await prefs.remove('active_role');
      notifyListeners();
    }
  }
}
