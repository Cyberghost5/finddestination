import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../common/widgets/custom_button.dart';
import '../models/admin_models.dart';
import '../providers/admin_provider.dart';

class AdminVerifyReportModal extends StatefulWidget {
  final AdminInspectionReportModel report;

  const AdminVerifyReportModal({super.key, required this.report});

  @override
  State<AdminVerifyReportModal> createState() => _AdminVerifyReportModalState();
}

class _AdminVerifyReportModalState extends State<AdminVerifyReportModal> {
  final _notesController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  void _submit(String action) async {
    setState(() => _isSubmitting = true);
    final admin = context.read<AdminProvider>();
    final success = await admin.verifyInspectionReport(
      widget.report.id,
      action: action,
      adminNotes: _notesController.text.trim(),
    );
    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (success) {
      Navigator.pop(context, true);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            action == 'approved'
                ? 'Audit approved! Property promoted to Tier 3 Certified and bounty credited.'
                : 'Report sent back for revision.',
          ),
          backgroundColor: action == 'approved' ? AppColors.success : AppColors.goldDark,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(admin.errorMessage ?? 'Operation failed. Please retry.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final r = widget.report;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.9,
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'AUDIT #${r.id}',
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.primary),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            r.inspectionFeeFormatted,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.success),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        r.propertyName,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.dark),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(LucideIcons.x, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(LucideIcons.mapPin, size: 14, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    '${r.address}, ${r.city}, ${r.state}',
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),
            const Divider(color: AppColors.border),
            const SizedBox(height: 10),

            // Inspector Identity
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 18,
                    backgroundColor: AppColors.info.withValues(alpha: 0.15),
                    child: const Icon(LucideIcons.userCheck, size: 18, color: AppColors.info),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          r.agentName,
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
                        ),
                        Text(
                          '${r.agentEmail} • ${r.agentPhone ?? 'No phone'}',
                          style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // GPS Coordinates Fix Card
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: r.gpsLatitude != null ? AppColors.successBg : AppColors.goldLight,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: r.gpsLatitude != null ? AppColors.success.withValues(alpha: 0.3) : AppColors.goldDark.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  Icon(
                    r.gpsLatitude != null ? LucideIcons.navigation : LucideIcons.alertTriangle,
                    size: 18,
                    color: r.gpsLatitude != null ? AppColors.success : AppColors.goldDark,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          r.gpsLatitude != null ? 'Hardware GPS Coordinate Fix' : 'No GPS Coordinates Captured',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: r.gpsLatitude != null ? AppColors.success : AppColors.goldDark,
                          ),
                        ),
                        if (r.gpsLatitude != null)
                          Text(
                            'Lat: ${r.gpsLatitude!.toStringAsFixed(6)}, Lng: ${r.gpsLongitude!.toStringAsFixed(6)}',
                            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Physical Standards Checklist Breakdown
            const Text(
              'Physical Verification Standards',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _buildCheckBadge('24/7 Power', r.amenitiesCheck['power_24_7'] == true),
                _buildCheckBadge('Treated Water', r.amenitiesCheck['running_water'] == true),
                _buildCheckBadge('Armed Security', r.amenitiesCheck['security_guard'] == true),
                _buildCheckBadge('Room Count Matches', r.amenitiesCheck['room_count_matches'] == true),
                _buildCheckBadge('Perimeter Fence', r.amenitiesCheck['perimeter_fencing'] == true),
                _buildCheckBadge('High Cleanliness', r.amenitiesCheck['cleanliness_hygiene'] == true),
              ],
            ),

            const SizedBox(height: 16),

            // Photos Evidence Gallery
            if (r.photos.isNotEmpty) ...[
              Text(
                'Photographic Evidence (${r.photos.length} Captured)',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 90,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: r.photos.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 10),
                  itemBuilder: (_, idx) {
                    final photo = r.photos[idx];
                    return ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: CachedNetworkImage(
                        imageUrl: photo,
                        width: 110,
                        height: 90,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => Container(
                          width: 110,
                          color: AppColors.background,
                          child: const Icon(LucideIcons.image, color: AppColors.textMuted),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Video URL
            if (r.videoUrl != null && r.videoUrl!.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    const Icon(LucideIcons.video, size: 16, color: AppColors.primary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Video Walkthrough: ${r.videoUrl}',
                        style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Inspector's Field Notes
            if (r.reportNotes != null && r.reportNotes!.isNotEmpty) ...[
              const Text(
                'Inspector Field Notes',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
              ),
              const SizedBox(height: 4),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border),
                ),
                child: Text(
                  r.reportNotes!,
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Admin Review Notes Input
            const Text(
              'Super Admin Review Notes / Instructions',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _notesController,
              maxLines: 2,
              decoration: InputDecoration(
                hintText: 'Enter feedback, approval remarks, or revision requirements...',
                hintStyle: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                fillColor: AppColors.background,
                filled: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Action Buttons
            if (_isSubmitting)
              const Center(child: CircularProgressIndicator())
            else
              Row(
                children: [
                  Expanded(
                    child: CustomButton(
                      text: 'Request Revision',
                      isOutlined: true,
                      textColor: AppColors.goldDark,
                      icon: const Icon(LucideIcons.rotateCcw, size: 16, color: AppColors.goldDark),
                      onPressed: () => _submit('revision_requested'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: CustomButton(
                      text: 'Approve & Tier 3',
                      backgroundColor: AppColors.success,
                      icon: const Icon(LucideIcons.checkCheck, size: 16, color: Colors.white),
                      onPressed: () => _submit('approved'),
                    ),
                  ),
                ],
              ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  Widget _buildCheckBadge(String label, bool passed) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: passed ? AppColors.successBg : AppColors.errorBg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: passed ? AppColors.success.withValues(alpha: 0.3) : AppColors.error.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            passed ? LucideIcons.check : LucideIcons.x,
            size: 13,
            color: passed ? AppColors.success : AppColors.error,
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: passed ? AppColors.success : AppColors.error,
            ),
          ),
        ],
      ),
    );
  }
}
