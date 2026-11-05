
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../models/property_model.dart';

class PropertyProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  List<PropertyModel> _allProperties = [];
  List<PropertyModel> _filteredProperties = [];
  bool _isLoading = false;
  String? _errorMessage;

  // Active Filter States
  String _selectedCategory = 'All Stays';
  String _selectedCity = 'All Cities';
  String _searchQuery = '';
  bool _verifiedOnly = false;
  String? _selectedPropertyType;
  int? _minPriceKobo;
  int? _maxPriceKobo;

  // Wishlist Storage
  final Set<int> _wishlistIds = {};

  List<PropertyModel> get properties => _filteredProperties;
  List<PropertyModel> get allProperties => _allProperties;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  String get selectedCategory => _selectedCategory;
  String get selectedCity => _selectedCity;
  String get searchQuery => _searchQuery;
  bool get verifiedOnly => _verifiedOnly;
  String? get selectedPropertyType => _selectedPropertyType;
  int? get minPriceKobo => _minPriceKobo;
  int? get maxPriceKobo => _maxPriceKobo;

  Set<int> get wishlistIds => _wishlistIds;
  List<PropertyModel> get wishlistProperties =>
      _allProperties.where((p) => _wishlistIds.contains(p.id)).toList();

  bool isWishlisted(int propertyId) => _wishlistIds.contains(propertyId);

  // Available Categories
  static const List<String> categories = [
    'All Stays',
    'Hotels',
    'Serviced Apartments',
    'Guest Houses',
    'Lodges',
    'Resorts',
  ];

  // Quick Filter Cities in Nigeria
  static const List<String> cities = [
    'All Cities',
    'Bauchi',
    'Kaduna',
    'Kano',
    'Jos',
    'Abuja',
    'Lagos',
  ];

  PropertyProvider() {
    loadWishlist();
  }

  /// Load Wishlist from local storage
  Future<void> loadWishlist() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedWishlist = prefs.getStringList('finddestination_wishlist') ??
          prefs.getStringList('tafiya_wishlist') ??
          [];
      _wishlistIds.clear();
      for (final idStr in savedWishlist) {
        final id = int.tryParse(idStr);
        if (id != null) _wishlistIds.add(id);
      }
      notifyListeners();
    } catch (e) {
      debugPrint('Failed to load wishlist: $e');
    }
  }

  /// Toggle property bookmark
  Future<void> toggleWishlist(int propertyId) async {
    if (_wishlistIds.contains(propertyId)) {
      _wishlistIds.remove(propertyId);
    } else {
      _wishlistIds.add(propertyId);
    }
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList(
        'finddestination_wishlist',
        _wishlistIds.map((id) => id.toString()).toList(),
      );
    } catch (e) {
      debugPrint('Failed to persist wishlist: $e');
    }
  }

  /// Fetch all properties from Laravel API
  Future<void> fetchProperties({bool refresh = false}) async {
    if (_allProperties.isNotEmpty && !refresh && !_isLoading) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.get(ApiConstants.properties);
      final data = response.data;

      if (data is Map && data['status'] == 'success' && data['data'] is List) {
        final list = data['data'] as List;
        _allProperties = list
            .map((item) => PropertyModel.fromJson(Map<String, dynamic>.from(item)))
            .toList();
        _applyFilters();
      } else {
        _errorMessage = 'Invalid response format from server';
      }
    } catch (e) {
      _errorMessage = e.toString();
      debugPrint('Error fetching properties: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Set Category Tab
  void setCategory(String category) {
    if (_selectedCategory == category) return;
    _selectedCategory = category;
    _applyFilters();
  }

  /// Set Quick City Filter
  void setCity(String city) {
    if (_selectedCity == city) return;
    _selectedCity = city;
    _applyFilters();
  }

  /// Update Search Text
  void setSearchQuery(String query) {
    _searchQuery = query.trim().toLowerCase();
    _applyFilters();
  }

  /// Apply Advanced Filters from Filter Modal
  void setAdvancedFilters({
    String? city,
    String? propertyType,
    bool? verifiedOnly,
    int? minPriceKobo,
    int? maxPriceKobo,
  }) {
    if (city != null) _selectedCity = city;
    _selectedPropertyType = propertyType;
    if (verifiedOnly != null) _verifiedOnly = verifiedOnly;
    _minPriceKobo = minPriceKobo;
    _maxPriceKobo = maxPriceKobo;

    _applyFilters();
  }

  /// Reset all filters
  void resetFilters() {
    _selectedCategory = 'All Stays';
    _selectedCity = 'All Cities';
    _searchQuery = '';
    _verifiedOnly = false;
    _selectedPropertyType = null;
    _minPriceKobo = null;
    _maxPriceKobo = null;

    _applyFilters();
  }

  /// Internal Filter Applicator
  void _applyFilters() {
    _filteredProperties = _allProperties.where((property) {
      // 1. Published check
      if (!property.isPublished) return false;

      // 2. City Filter
      if (_selectedCity != 'All Cities') {
        final matchCity = property.city.toLowerCase() == _selectedCity.toLowerCase() ||
            property.state.toLowerCase() == _selectedCity.toLowerCase();
        if (!matchCity) return false;
      }

      // 3. Category Filter
      if (_selectedCategory != 'All Stays') {
        final catLower = _selectedCategory.toLowerCase();
        final propTypeLower = property.propertyType.toLowerCase();
        final propCatLower = property.category.toLowerCase();

        bool match = false;
        if (catLower == 'hotels' && (propTypeLower.contains('hotel') || propCatLower.contains('hotel'))) {
          match = true;
        } else if (catLower == 'serviced apartments' &&
            (propTypeLower.contains('apartment') || propCatLower.contains('apartment'))) {
          match = true;
        } else if (catLower == 'guest houses' &&
            (propTypeLower.contains('guest') || propCatLower.contains('guest'))) {
          match = true;
        } else if (catLower == 'lodges' &&
            (propTypeLower.contains('lodge') || propCatLower.contains('lodge'))) {
          match = true;
        } else if (catLower == 'resorts' &&
            (propTypeLower.contains('resort') || propCatLower.contains('resort'))) {
          match = true;
        }
        if (!match) return false;
      }

      // 4. Property Type (Modal filter)
      if (_selectedPropertyType != null && _selectedPropertyType!.isNotEmpty) {
        if (property.propertyType.toLowerCase() != _selectedPropertyType!.toLowerCase()) {
          return false;
        }
      }

      // 5. Verified Only
      if (_verifiedOnly) {
        final isVerified = property.verificationStatus == 'verified' ||
            property.verificationTier == 'tier_3_certified';
        if (!isVerified) return false;
      }

      // 6. Price Range
      if (_minPriceKobo != null && property.startingPriceKobo < _minPriceKobo!) {
        return false;
      }
      if (_maxPriceKobo != null && property.startingPriceKobo > _maxPriceKobo!) {
        return false;
      }

      // 7. Text Search Query
      if (_searchQuery.isNotEmpty) {
        final nameMatch = property.name.toLowerCase().contains(_searchQuery);
        final cityMatch = property.city.toLowerCase().contains(_searchQuery);
        final stateMatch = property.state.toLowerCase().contains(_searchQuery);
        final addressMatch = property.address.toLowerCase().contains(_searchQuery);
        final neighborhoodMatch = property.neighborhood.toLowerCase().contains(_searchQuery);

        if (!nameMatch && !cityMatch && !stateMatch && !addressMatch && !neighborhoodMatch) {
          return false;
        }
      }

      return true;
    }).toList();

    notifyListeners();
  }
}

