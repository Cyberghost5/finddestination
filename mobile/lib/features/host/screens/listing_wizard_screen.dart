import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../auth/providers/auth_provider.dart';
import '../../common/widgets/custom_button.dart';
import '../../common/widgets/custom_text_field.dart';
import '../providers/host_provider.dart';

class ListingWizardScreen extends StatefulWidget {
  const ListingWizardScreen({super.key});

  @override
  State<ListingWizardScreen> createState() => _ListingWizardScreenState();
}

class _ListingWizardScreenState extends State<ListingWizardScreen> {
  int _currentStep = 1;
  final int _totalSteps = 5;

  // Controllers
  // Step 1: Info
  final _nameController = TextEditingController();
  String _selectedPropertyType = 'hotel';
  String _selectedState = 'Bauchi';
  final _cityController = TextEditingController(text: 'Bauchi');
  final _descriptionController = TextEditingController();

  // Step 2: Location
  final _addressController = TextEditingController();
  final _latController = TextEditingController(text: '10.3158');
  final _lngController = TextEditingController(text: '9.8442');
  final _phoneController = TextEditingController();
  bool _isDetectingGps = false;
  String? _gpsStatusMsg;

  // Step 3: Room Setup
  final _roomNameController = TextEditingController(text: 'Executive Suite');
  final _priceController = TextEditingController(text: '45000');
  int _totalUnits = 4;
  int _maxOccupancy = 2;
  String _selectedBedType = 'King Bed';

  // Step 4: Amenities
  final Set<String> _selectedAmenities = {
    '24/7 Power Backup',
    'Constant Water',
    'Air Conditioning',
    'High-Speed WiFi',
    'Armed Security & CCTV',
  };

  // Step 5: Trust & Compliance
  final _cacController = TextEditingController(text: 'RC-1928401');
  final _tinController = TextEditingController(text: 'TIN-9920194');
  final _ninController = TextEditingController(text: '39201948201');

  final List<String> _propertyTypes = [
    'hotel',
    'serviced_apartment',
    'lodge',
    'guest_house',
    'resort',
    'villa',
  ];

  final List<String> _states = [
    'Bauchi',
    'Abuja (FCT)',
    'Lagos',
    'Kaduna',
    'Kano',
    'Plateau',
    'Gombe',
    'Rivers',
    'Oyo',
    'Enugu',
  ];

  final List<String> _bedTypes = [
    'King Bed',
    'Queen Bed',
    '2 Double Beds',
    'Single Bed',
    'Executive Master Bed',
  ];

  final List<Map<String, dynamic>> _amenitiesList = [
    {'name': '24/7 Power Backup', 'icon': LucideIcons.zap},
    {'name': 'Constant Water', 'icon': LucideIcons.droplets},
    {'name': 'Air Conditioning', 'icon': LucideIcons.wind},
    {'name': 'High-Speed WiFi', 'icon': LucideIcons.wifi},
    {'name': 'Armed Security & CCTV', 'icon': LucideIcons.shieldCheck},
    {'name': 'Swimming Pool', 'icon': LucideIcons.waves},
    {'name': 'Complimentary Breakfast', 'icon': LucideIcons.coffee},
    {'name': 'Free On-site Parking', 'icon': LucideIcons.car},
    {'name': 'Airport Shuttle', 'icon': LucideIcons.bus},
    {'name': 'Fitness Gym', 'icon': LucideIcons.dumbbell},
    {'name': 'Restaurant & Bar', 'icon': LucideIcons.utensils},
    {'name': 'Smart TV / DSTV', 'icon': LucideIcons.tv},
  ];

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthProvider>();
    if (auth.user != null) {
      if (auth.user!.phone != null) {
        _phoneController.text = auth.user!.phone!;
      }
      if (auth.user!.cacNumber != null) {
        _cacController.text = auth.user!.cacNumber!;
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _cityController.dispose();
    _descriptionController.dispose();
    _addressController.dispose();
    _latController.dispose();
    _lngController.dispose();
    _phoneController.dispose();
    _roomNameController.dispose();
    _priceController.dispose();
    _cacController.dispose();
    _tinController.dispose();
    _ninController.dispose();
    super.dispose();
  }

  Future<void> _detectCurrentLocation() async {
    setState(() {
      _isDetectingGps = true;
      _gpsStatusMsg = 'Acquiring GPS fix...';
    });

    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _isDetectingGps = false;
          _gpsStatusMsg = 'GPS services are disabled. Please enable location on your device.';
        });
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() {
            _isDetectingGps = false;
            _gpsStatusMsg = 'Location permission was denied.';
          });
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() {
          _isDetectingGps = false;
          _gpsStatusMsg = 'Location permissions permanently denied. Enter coordinates manually.';
        });
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );

      setState(() {
        _latController.text = position.latitude.toStringAsFixed(6);
        _lngController.text = position.longitude.toStringAsFixed(6);
        _isDetectingGps = false;
        _gpsStatusMsg = 'GPS Coordinates locked successfully!';
      });
    } catch (e) {
      setState(() {
        _isDetectingGps = false;
        _gpsStatusMsg = 'Could not acquire GPS: $e. You can use defaults or enter manually.';
      });
    }
  }

  bool _validateStep() {
    if (_currentStep == 1) {
      if (_nameController.text.trim().isEmpty) {
        _showErrorToast('Please enter your property or hotel name.');
        return false;
      }
      if (_cityController.text.trim().isEmpty) {
        _showErrorToast('Please enter the city or locality.');
        return false;
      }
    } else if (_currentStep == 2) {
      if (_addressController.text.trim().isEmpty) {
        _showErrorToast('Please enter the full street address.');
        return false;
      }
    } else if (_currentStep == 3) {
      if (_roomNameController.text.trim().isEmpty) {
        _showErrorToast('Please enter a room suite name.');
        return false;
      }
      final price = double.tryParse(_priceController.text.trim());
      if (price == null || price <= 0) {
        _showErrorToast('Please enter a valid nightly price in Naira.');
        return false;
      }
    }
    return true;
  }

  void _showErrorToast(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Future<void> _submitListing() async {
    final hostProvider = context.read<HostProvider>();
    final auth = context.read<AuthProvider>();

    final nightlyNaira = double.tryParse(_priceController.text.trim()) ?? 45000;
    final priceKobo = (nightlyNaira * 100).round();

    final payload = {
      'name': _nameController.text.trim(),
      'property_type': _selectedPropertyType,
      'description': _descriptionController.text.trim().isNotEmpty
          ? _descriptionController.text.trim()
          : 'Verified $_selectedPropertyType situated in ${_cityController.text.trim()}, $_selectedState. Features 24/7 power backup and verified security.',
      'address': _addressController.text.trim(),
      'city': _cityController.text.trim(),
      'state': _selectedState,
      'contact_phone': _phoneController.text.trim().isNotEmpty
          ? _phoneController.text.trim()
          : '+2348021112233',
      'latitude': double.tryParse(_latController.text.trim()) ?? 10.3158,
      'longitude': double.tryParse(_lngController.text.trim()) ?? 9.8442,
      'starting_price_kobo': priceKobo,
      'base_price_ngn': nightlyNaira,
      'room_name': _roomNameController.text.trim(),
      'total_units': _totalUnits,
      'max_occupancy': _maxOccupancy,
      'bed_type': _selectedBedType,
      'amenities': _selectedAmenities.toList(),
      'cac_number': _cacController.text.trim(),
      'tin_number': _tinController.text.trim(),
      'owner_nin': _ninController.text.trim(),
      if (auth.user != null) 'host_id': auth.user!.id,
    };

    final result = await hostProvider.createProperty(payload);

    if (!mounted) return;

    if (result != null) {
      _showSuccessDialog();
    } else {
      _showErrorToast(hostProvider.errorMessage ?? 'Failed to list property. Check your connection.');
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 70,
              height: 70,
              decoration: const BoxDecoration(
                color: AppColors.successBg,
                shape: BoxShape.circle,
              ),
              child: const Icon(LucideIcons.check, size: 40, color: AppColors.success),
            ),
            const SizedBox(height: 20),
            const Text(
              'Property Listed Successfully!',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.dark),
            ),
            const SizedBox(height: 8),
            Text(
              '${_nameController.text.trim()} is now active in FindDestination Stays with Tier 1 Docs verification status.',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
            ),
            const SizedBox(height: 24),
            CustomButton(
              text: 'Return to Host Dashboard',
              onPressed: () {
                Navigator.pop(ctx); // Close dialog
                Navigator.pop(context); // Close wizard
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final hostProvider = context.watch<HostProvider>();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'List a New Property',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.dark),
        ),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: AppColors.dark),
          onPressed: () => Navigator.pop(context),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Column(
            children: [
              // Step Indicators
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(_totalSteps, (index) {
                    final stepNumber = index + 1;
                    final isCompleted = stepNumber < _currentStep;
                    final isCurrent = stepNumber == _currentStep;

                    return Row(
                      children: [
                        Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                            color: isCompleted
                                ? AppColors.success
                                : (isCurrent ? AppColors.primary : AppColors.background),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isCurrent || isCompleted
                                  ? Colors.transparent
                                  : AppColors.border,
                            ),
                          ),
                          child: Center(
                            child: isCompleted
                                ? const Icon(LucideIcons.check, size: 14, color: Colors.white)
                                : Text(
                                    '$stepNumber',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: isCurrent ? Colors.white : AppColors.textMuted,
                                    ),
                                  ),
                          ),
                        ),
                        if (index < _totalSteps - 1)
                          Container(
                            width: (MediaQuery.of(context).size.width - 40 - (28 * _totalSteps)) /
                                (_totalSteps - 1),
                            height: 2,
                            color: isCompleted ? AppColors.success : AppColors.border,
                          ),
                      ],
                    );
                  }),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: _buildCurrentStepView(),
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              offset: const Offset(0, -4),
              blurRadius: 10,
            ),
          ],
        ),
        child: Row(
          children: [
            if (_currentStep > 1)
              Expanded(
                flex: 1,
                child: Padding(
                  padding: const EdgeInsets.only(right: 12),
                  child: CustomButton(
                    text: 'Back',
                    isOutlined: true,
                    onPressed: () => setState(() => _currentStep--),
                  ),
                ),
              ),
            Expanded(
              flex: 2,
              child: CustomButton(
                text: _currentStep == _totalSteps ? 'Publish Property' : 'Continue',
                isLoading: hostProvider.isSubmitting,
                icon: Icon(
                  _currentStep == _totalSteps ? LucideIcons.checkCircle : LucideIcons.arrowRight,
                  color: Colors.white,
                  size: 18,
                ),
                onPressed: () {
                  if (_validateStep()) {
                    if (_currentStep < _totalSteps) {
                      setState(() => _currentStep++);
                    } else {
                      _submitListing();
                    }
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentStepView() {
    switch (_currentStep) {
      case 1:
        return _buildStep1BasicInfo();
      case 2:
        return _buildStep2Location();
      case 3:
        return _buildStep3Rooms();
      case 4:
        return _buildStep4Amenities();
      case 5:
      default:
        return _buildStep5TrustCompliance();
    }
  }

  // STEP 1: Basic Information
  Widget _buildStep1BasicInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Step 1: Property Identity',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.dark),
        ),
        const SizedBox(height: 4),
        const Text(
          'Introduce your establishment to travelers searching for verified stays in Nigeria.',
          style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
        const SizedBox(height: 24),

        // Property Name
        CustomTextField(
          label: 'Property / Hotel Name *',
          hintText: 'e.g. Yankari Luxury Safari Resort & Suites',
          prefixIcon: const Icon(LucideIcons.building, size: 18, color: AppColors.textSecondary),
          controller: _nameController,
        ),
        const SizedBox(height: 18),

        // Property Type Dropdown
        const Text(
          'Property Category *',
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _selectedPropertyType,
              isExpanded: true,
              icon: const Icon(LucideIcons.chevronDown, size: 18),
              items: _propertyTypes.map((type) {
                final display = type.replaceAll('_', ' ').toUpperCase();
                return DropdownMenuItem(
                  value: type,
                  child: Text(display, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) setState(() => _selectedPropertyType = val);
              },
            ),
          ),
        ),
        const SizedBox(height: 18),

        // State Dropdown
        const Text(
          'State *',
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _selectedState,
              isExpanded: true,
              icon: const Icon(LucideIcons.chevronDown, size: 18),
              items: _states.map((state) {
                return DropdownMenuItem(
                  value: state,
                  child: Text(state, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) setState(() => _selectedState = val);
              },
            ),
          ),
        ),
        const SizedBox(height: 18),

        // City
        CustomTextField(
          label: 'City / Town *',
          hintText: 'e.g. Bauchi, GRA, Maitama, Ikeja',
          prefixIcon: const Icon(LucideIcons.mapPin, size: 18, color: AppColors.textSecondary),
          controller: _cityController,
        ),
        const SizedBox(height: 18),

        // Description
        const Text(
          'Property Description (Optional)',
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _descriptionController,
          maxLines: 3,
          decoration: InputDecoration(
            hintText: 'Describe key highlights, surrounding landmarks, and special hospitality touches...',
            hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
            filled: true,
            fillColor: AppColors.background,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: AppColors.primary, width: 2),
            ),
          ),
        ),
      ],
    );
  }

  // STEP 2: Location & GPS
  Widget _buildStep2Location() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Step 2: Location & Coordinates',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.dark),
        ),
        const SizedBox(height: 4),
        const Text(
          'Precise location coordinates ensure guest dispatch and field verification agent audits are accurate.',
          style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
        const SizedBox(height: 24),

        // Street Address
        CustomTextField(
          label: 'Full Street Address *',
          hintText: 'e.g. 14 Murtala Mohammed Way, GRA, Bauchi',
          prefixIcon: const Icon(LucideIcons.navigation, size: 18, color: AppColors.textSecondary),
          controller: _addressController,
        ),
        const SizedBox(height: 18),

        // Phone Number
        CustomTextField(
          label: 'Host Contact Phone *',
          hintText: '+234 803 100 2000',
          prefixIcon: const Icon(LucideIcons.phone, size: 18, color: AppColors.textSecondary),
          controller: _phoneController,
          keyboardType: TextInputType.phone,
        ),
        const SizedBox(height: 24),

        // GPS Auto-detect Card
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: AppColors.infoBg,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(LucideIcons.crosshair, color: AppColors.info, size: 20),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Hardware GPS Auto-Detect',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.dark),
                        ),
                        Text(
                          'Acquire latitude & longitude using your device sensor',
                          style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              CustomButton(
                text: _isDetectingGps ? 'Locking Satellite Signal...' : 'Detect Current GPS Coordinates',
                isLoading: _isDetectingGps,
                isOutlined: true,
                icon: const Icon(LucideIcons.locateFixed, size: 16, color: AppColors.primary),
                onPressed: _detectCurrentLocation,
              ),
              if (_gpsStatusMsg != null) ...[
                const SizedBox(height: 10),
                Text(
                  _gpsStatusMsg!,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: _gpsStatusMsg!.contains('success') ? AppColors.success : AppColors.textSecondary,
                  ),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 18),

        // Lat & Lng Row
        Row(
          children: [
            Expanded(
              child: CustomTextField(
                label: 'Latitude',
                hintText: '10.3158',
                controller: _latController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: CustomTextField(
                label: 'Longitude',
                hintText: '9.8442',
                controller: _lngController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // STEP 3: Room Setup & Pricing
  Widget _buildStep3Rooms() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Step 3: Room Setup & Pricing',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.dark),
        ),
        const SizedBox(height: 4),
        const Text(
          'Configure your starting room tier and base nightly tariff in Nigerian Naira.',
          style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
        const SizedBox(height: 24),

        // Room Suite Name
        CustomTextField(
          label: 'Room Tier / Suite Name *',
          hintText: 'e.g. Executive Royal Suite',
          prefixIcon: const Icon(LucideIcons.bedDouble, size: 18, color: AppColors.textSecondary),
          controller: _roomNameController,
        ),
        const SizedBox(height: 18),

        // Base Nightly Rate in Naira
        CustomTextField(
          label: 'Base Nightly Tariff (₦) *',
          hintText: '45000',
          prefixIcon: const Icon(LucideIcons.badgePercent, size: 18, color: AppColors.textSecondary),
          controller: _priceController,
          keyboardType: TextInputType.number,
        ),
        const SizedBox(height: 18),

        // Bed Type Dropdown
        const Text(
          'Bed Type',
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _selectedBedType,
              isExpanded: true,
              icon: const Icon(LucideIcons.chevronDown, size: 18),
              items: _bedTypes.map((bed) {
                return DropdownMenuItem(
                  value: bed,
                  child: Text(bed, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) setState(() => _selectedBedType = val);
              },
            ),
          ),
        ),
        const SizedBox(height: 24),

        // Stepper counters for Units & Occupancy
        Row(
          children: [
            Expanded(
              child: _buildCounterCard(
                title: 'Available Units',
                subtitle: 'Total rooms in tier',
                value: _totalUnits,
                onDecrement: () {
                  if (_totalUnits > 1) setState(() => _totalUnits--);
                },
                onIncrement: () => setState(() => _totalUnits++),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildCounterCard(
                title: 'Max Guests',
                subtitle: 'Per room capacity',
                value: _maxOccupancy,
                onDecrement: () {
                  if (_maxOccupancy > 1) setState(() => _maxOccupancy--);
                },
                onIncrement: () => setState(() => _maxOccupancy++),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCounterCard({
    required String title,
    required String subtitle,
    required int value,
    required VoidCallback onDecrement,
    required VoidCallback onIncrement,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.dark)),
          Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(LucideIcons.minusCircle, size: 22, color: AppColors.textSecondary),
                onPressed: onDecrement,
                constraints: const BoxConstraints(),
                padding: EdgeInsets.zero,
              ),
              Text(
                '$value',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.dark),
              ),
              IconButton(
                icon: const Icon(LucideIcons.plusCircle, size: 22, color: AppColors.primary),
                onPressed: onIncrement,
                constraints: const BoxConstraints(),
                padding: EdgeInsets.zero,
              ),
            ],
          ),
        ],
      ),
    );
  }

  // STEP 4: Amenities Checklist
  Widget _buildStep4Amenities() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Step 4: Amenities & Features',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.dark),
        ),
        const SizedBox(height: 4),
        const Text(
          'Select the verified facilities provided on-premise at your property.',
          style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
        const SizedBox(height: 20),

        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: _amenitiesList.map((amenity) {
            final name = amenity['name'] as String;
            final icon = amenity['icon'] as IconData;
            final isSelected = _selectedAmenities.contains(name);

            return InkWell(
              onTap: () {
                setState(() {
                  if (isSelected) {
                    _selectedAmenities.remove(name);
                  } else {
                    _selectedAmenities.add(name);
                  }
                });
              },
              borderRadius: BorderRadius.circular(14),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary.withValues(alpha: 0.08) : Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected ? AppColors.primary : AppColors.border,
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      icon,
                      size: 16,
                      color: isSelected ? AppColors.primary : AppColors.textSecondary,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      name,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        color: isSelected ? AppColors.primary : AppColors.dark,
                      ),
                    ),
                    if (isSelected) ...[
                      const SizedBox(width: 6),
                      const Icon(LucideIcons.check, size: 14, color: AppColors.primary),
                    ],
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  // STEP 5: Trust & Compliance
  Widget _buildStep5TrustCompliance() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Step 5: Trust & CAC Verification',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.dark),
        ),
        const SizedBox(height: 4),
        const Text(
          'Provide corporate registration to qualify for FindDestination Verified Status.',
          style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
        const SizedBox(height: 20),

        // Verification Badge Preview Card
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: AppColors.gold.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.goldDark.withValues(alpha: 0.3)),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.goldDark,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(LucideIcons.shieldCheck, color: Colors.white, size: 24),
              ),
              const SizedBox(width: 14),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Tier 1 Docs Verification',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.dark),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Your listing gets certified document badges and unlocks escrow payouts upon publishing.',
                      style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.3),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // CAC RC Number
        CustomTextField(
          label: 'Corporate Affairs Commission (CAC RC / BN) *',
          hintText: 'RC-1928401',
          prefixIcon: const Icon(LucideIcons.fileCheck, size: 18, color: AppColors.textSecondary),
          controller: _cacController,
        ),
        const SizedBox(height: 16),

        // Tax Identification (TIN)
        CustomTextField(
          label: 'Federal Inland Revenue TIN Number',
          hintText: 'TIN-9920194',
          prefixIcon: const Icon(LucideIcons.fileText, size: 18, color: AppColors.textSecondary),
          controller: _tinController,
        ),
        const SizedBox(height: 16),

        // Owner NIN
        CustomTextField(
          label: 'Director / Host NIN (National Identity Number)',
          hintText: '39201948201',
          prefixIcon: const Icon(LucideIcons.userCheck, size: 18, color: AppColors.textSecondary),
          controller: _ninController,
          keyboardType: TextInputType.number,
        ),
      ],
    );
  }
}
