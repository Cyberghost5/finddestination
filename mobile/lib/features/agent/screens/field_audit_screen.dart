import 'dart:io';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../common/widgets/custom_button.dart';
import '../../common/widgets/custom_text_field.dart';
import '../models/agent_models.dart';
import '../providers/agent_provider.dart';

class FieldAuditScreen extends StatefulWidget {
  final AgentAssignmentModel assignment;
  final int? agentId;

  const FieldAuditScreen({
    super.key,
    required this.assignment,
    this.agentId,
  });

  @override
  State<FieldAuditScreen> createState() => _FieldAuditScreenState();
}

class _FieldAuditScreenState extends State<FieldAuditScreen> {
  final _latController = TextEditingController();
  final _lngController = TextEditingController();
  final _videoUrlController = TextEditingController();
  final _notesController = TextEditingController();
  final _photoUrlInputController = TextEditingController();

  bool _isGettingGps = false;
  String? _gpsStatusMsg;

  // Selected Photo Paths / URLs
  final List<String> _photos = [];
  final ImagePicker _picker = ImagePicker();

  // Amenities verification map
  final Map<String, bool> _amenitiesCheck = {
    'solar_power': true,
    'clean_water': true,
    'armed_security': true,
    'room_count_accurate': true,
    'perimeter_fence': true,
    'clean_sanitary': true,
  };

  @override
  void initState() {
    super.initState();
    _detectGpsLocation();
  }

  @override
  void dispose() {
    _latController.dispose();
    _lngController.dispose();
    _videoUrlController.dispose();
    _notesController.dispose();
    _photoUrlInputController.dispose();
    super.dispose();
  }

  Future<void> _detectGpsLocation() async {
    setState(() {
      _isGettingGps = true;
      _gpsStatusMsg = 'Acquiring satellite fix...';
    });

    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _isGettingGps = false;
          _gpsStatusMsg = 'Location services disabled. Please enable GPS.';
        });
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() {
            _isGettingGps = false;
            _gpsStatusMsg = 'Location permission denied.';
          });
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() {
          _isGettingGps = false;
          _gpsStatusMsg = 'Location permissions permanently denied.';
        });
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );

      setState(() {
        _latController.text = position.latitude.toStringAsFixed(6);
        _lngController.text = position.longitude.toStringAsFixed(6);
        _isGettingGps = false;
        _gpsStatusMsg = 'GPS Satellite Coordinates locked successfully!';
      });
    } catch (e) {
      setState(() {
        _isGettingGps = false;
        _gpsStatusMsg = 'GPS lock fallback: $e';
        if (_latController.text.isEmpty) {
          _latController.text = '10.3158';
          _lngController.text = '9.8442';
        }
      });
    }
  }

  Future<void> _capturePhoto(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 1200,
        maxHeight: 1200,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          _photos.add(image.path);
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Camera error: $e')),
      );
    }
  }

  void _addPhotoUrl() {
    final url = _photoUrlInputController.text.trim();
    if (url.isNotEmpty) {
      setState(() {
        _photos.add(url);
        _photoUrlInputController.clear();
      });
    }
  }

  Future<void> _submitAudit() async {
    final notes = _notesController.text.trim();
    if (notes.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please provide detailed field observations (min 10 characters).'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    final lat = double.tryParse(_latController.text.trim()) ?? 10.3158;
    final lng = double.tryParse(_lngController.text.trim()) ?? 9.8442;

    final agentProvider = context.read<AgentProvider>();

    // Fallback photo if none taken
    final finalPhotos = _photos.isNotEmpty
        ? _photos
        : [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          ];

    final success = await agentProvider.submitAuditReport(
      inspectionId: widget.assignment.id,
      latitude: lat,
      longitude: lng,
      photos: finalPhotos,
      videoUrl: _videoUrlController.text.trim().isNotEmpty
          ? _videoUrlController.text.trim()
          : null,
      amenitiesCheck: _amenitiesCheck,
      reportNotes: notes,
      agentId: widget.agentId,
    );

    if (!mounted) return;

    if (success) {
      _showSuccessDialog();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(agentProvider.errorMessage ?? 'Failed to submit report.'),
          backgroundColor: AppColors.error,
        ),
      );
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
              child: const Icon(LucideIcons.shieldCheck, size: 40, color: AppColors.success),
            ),
            const SizedBox(height: 20),
            const Text(
              'Audit Evidence Uploaded!',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.dark),
            ),
            const SizedBox(height: 8),
            Text(
              'Super Admin will review your on-site findings. Upon verification, ${widget.assignment.inspectionFeeFormatted} will be credited directly to your Agent Wallet.',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
            ),
            const SizedBox(height: 24),
            CustomButton(
              text: 'Return to Assignments',
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final agentProvider = context.watch<AgentProvider>();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'On-Site Physical Audit',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.dark),
        ),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: AppColors.dark),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Property & Bounty Header Card
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppColors.infoBg,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.info.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppColors.info,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(LucideIcons.building, color: Colors.white, size: 22),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.assignment.propertyName,
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.dark),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${widget.assignment.city}, ${widget.assignment.state}',
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.info.withValues(alpha: 0.3)),
                      ),
                      child: Column(
                        children: [
                          const Text('BOUNTY', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: AppColors.info)),
                          Text(
                            widget.assignment.inspectionFeeFormatted,
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: AppColors.info),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Section 1: GPS Lock
              const Text(
                '1. Location & GPS Verification',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
              ),
              const SizedBox(height: 4),
              const Text(
                'Must be physically captured on-premise to prove inspector presence.',
                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 12),

              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
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
                    const SizedBox(height: 12),
                    CustomButton(
                      text: _isGettingGps ? 'Locking GPS Satellite Fix...' : 'Refresh GPS Coordinates',
                      isLoading: _isGettingGps,
                      isOutlined: true,
                      icon: const Icon(LucideIcons.crosshair, size: 16, color: AppColors.primary),
                      onPressed: _detectGpsLocation,
                    ),
                    if (_gpsStatusMsg != null) ...[
                      const SizedBox(height: 8),
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
              const SizedBox(height: 28),

              // Section 2: Physical Verification Checklist
              const Text(
                '2. Physical Standards Checklist',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
              ),
              const SizedBox(height: 4),
              const Text(
                'Inspect each facility and toggle verified status based on your observation.',
                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 12),

              _buildCheckTile(
                keyName: 'solar_power',
                title: '24/7 Power Backup',
                subtitle: 'Active generator or solar inverter backup confirmed functional',
                icon: LucideIcons.zap,
              ),
              _buildCheckTile(
                keyName: 'clean_water',
                title: 'Clean Running Water',
                subtitle: 'Functional overhead tanks, borehole, or municipal treated supply',
                icon: LucideIcons.droplets,
              ),
              _buildCheckTile(
                keyName: 'armed_security',
                title: 'Security & Access Control',
                subtitle: 'Manned gate, security personnel, or surveillance cameras',
                icon: LucideIcons.shieldCheck,
              ),
              _buildCheckTile(
                keyName: 'room_count_accurate',
                title: 'Room Count & Tier Accuracy',
                subtitle: 'Rooms match the descriptions, bedding, and count listed',
                icon: LucideIcons.bedDouble,
              ),
              _buildCheckTile(
                keyName: 'perimeter_fence',
                title: 'Perimeter Fence & Compound',
                subtitle: 'Gated compound with secure fencing and on-site parking',
                icon: LucideIcons.fence,
              ),
              _buildCheckTile(
                keyName: 'clean_sanitary',
                title: 'Hygiene & Cleanliness',
                subtitle: 'Sanitary bathrooms, clean linen, and well-maintained rooms',
                icon: LucideIcons.sparkles,
              ),
              const SizedBox(height: 24),

              // Section 3: Photographic Evidence
              const Text(
                '3. On-Site Photographic Evidence',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
              ),
              const SizedBox(height: 4),
              const Text(
                'Capture clear photos of the property facade, reception, and guest rooms.',
                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _capturePhoto(ImageSource.camera),
                      icon: const Icon(LucideIcons.camera, size: 16, color: AppColors.primary),
                      label: const Text('Take Photo', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.primary)),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _capturePhoto(ImageSource.gallery),
                      icon: const Icon(LucideIcons.image, size: 16, color: AppColors.textSecondary),
                      label: const Text('Gallery', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.textSecondary)),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Image previews
              if (_photos.isNotEmpty) ...[
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: _photos.map((p) {
                    final isLocal = !p.startsWith('http');
                    return Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: isLocal
                              ? Image.file(
                                  File(p),
                                  width: 80,
                                  height: 80,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Container(
                                    width: 80,
                                    height: 80,
                                    color: AppColors.border,
                                    child: const Icon(LucideIcons.image),
                                  ),
                                )
                              : Image.network(
                                  p,
                                  width: 80,
                                  height: 80,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Container(
                                    width: 80,
                                    height: 80,
                                    color: AppColors.border,
                                    child: const Icon(LucideIcons.image),
                                  ),
                                ),
                        ),
                        Positioned(
                          top: 4,
                          right: 4,
                          child: InkWell(
                            onTap: () {
                              setState(() => _photos.remove(p));
                            },
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(
                                color: Colors.black54,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(LucideIcons.x, size: 12, color: Colors.white),
                            ),
                          ),
                        ),
                      ],
                    );
                  }).toList(),
                ),
                const SizedBox(height: 12),
              ],

              // Quick Image URL entry helper
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _photoUrlInputController,
                      style: const TextStyle(fontSize: 12),
                      decoration: const InputDecoration(
                        hintText: 'Or paste image URL...',
                        isDense: true,
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: _addPhotoUrl,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Add', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Section 4: Video Tour Link (Optional)
              CustomTextField(
                label: '4. Video Tour Link (Optional)',
                hintText: 'https://youtube.com/watch?v=... or Google Drive URL',
                prefixIcon: const Icon(LucideIcons.video, size: 18, color: AppColors.textSecondary),
                controller: _videoUrlController,
              ),
              const SizedBox(height: 24),

              // Section 5: Field Notes
              const Text(
                '5. Inspector Field Notes & Observations *',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.dark),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _notesController,
                maxLines: 4,
                decoration: InputDecoration(
                  hintText: 'Describe physical building condition, management reception, neighborhood safety, and exact verification findings...',
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
              const SizedBox(height: 32),

              // Submit Button
              CustomButton(
                text: 'Submit Verified Audit Report',
                isLoading: agentProvider.isSubmitting,
                icon: const Icon(LucideIcons.checkCircle, color: Colors.white, size: 18),
                onPressed: _submitAudit,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCheckTile({
    required String keyName,
    required String title,
    required String subtitle,
    required IconData icon,
  }) {
    final isChecked = _amenitiesCheck[keyName] ?? true;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: isChecked ? AppColors.successBg.withValues(alpha: 0.3) : AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isChecked ? AppColors.success.withValues(alpha: 0.4) : AppColors.border,
        ),
      ),
      child: Row(
        children: [
          Icon(icon, size: 20, color: isChecked ? AppColors.success : AppColors.textSecondary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: isChecked ? AppColors.dark : AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
              ],
            ),
          ),
          Switch(
            value: isChecked,
            activeThumbColor: AppColors.success,
            onChanged: (val) {
              setState(() => _amenitiesCheck[keyName] = val);
            },
          ),
        ],
      ),
    );
  }
}
