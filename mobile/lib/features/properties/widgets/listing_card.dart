import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../models/property_model.dart';

class ListingCard extends StatelessWidget {
  final PropertyModel property;
  final bool isWishlisted;
  final VoidCallback onToggleWishlist;
  final VoidCallback onTap;

  const ListingCard({
    super.key,
    required this.property,
    required this.isWishlisted,
    required this.onToggleWishlist,
    required this.onTap,
  });

  Widget _buildVerificationBadge() {
    Color bg;
    Color text;
    String label;
    IconData icon;

    if (property.verificationTier == 'tier_3_certified' ||
        property.verificationStatus == 'verified') {
      bg = AppColors.successBg;
      text = AppColors.badgeTier3;
      label = 'Verified Property';
      icon = LucideIcons.shieldCheck;
    } else if (property.verificationTier == 'tier_2_location' ||
        property.verificationStatus == 'location_verified') {
      bg = AppColors.infoBg;
      text = AppColors.badgeTier2;
      label = 'Location Verified';
      icon = LucideIcons.mapPin;
    } else {
      bg = const Color(0xFFF1F5F9);
      text = AppColors.badgeTier1;
      label = 'Docs Verified';
      icon = LucideIcons.fileText;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: text.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: text),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: text,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final imageUrl = property.images.isNotEmpty
        ? property.images.first
        : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Stack
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(17)),
                  child: AspectRatio(
                    aspectRatio: 16 / 10,
                    child: CachedNetworkImage(
                      imageUrl: imageUrl,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: AppColors.background,
                        child: const Center(
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: AppColors.background,
                        child: const Icon(LucideIcons.image, size: 40, color: AppColors.textMuted),
                      ),
                    ),
                  ),
                ),

                // Top Badges
                Positioned(
                  top: 12,
                  left: 12,
                  child: _buildVerificationBadge(),
                ),

                // Wishlist Heart Button
                Positioned(
                  top: 10,
                  right: 10,
                  child: GestureDetector(
                    onTap: onToggleWishlist,
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.9),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 6,
                          ),
                        ],
                      ),
                      child: Center(
                        child: Icon(
                          isWishlisted ? LucideIcons.heart : LucideIcons.heart,
                          size: 18,
                          color: isWishlisted ? AppColors.error : AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),

            // Property Info
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title & Rating
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          property.name,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppColors.dark,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Row(
                        children: [
                          const Icon(LucideIcons.star, size: 14, color: AppColors.gold),
                          const SizedBox(width: 3),
                          Text(
                            property.rating.toStringAsFixed(1),
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.dark,
                            ),
                          ),
                          Text(
                            ' (${property.reviewCount})',
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  const SizedBox(height: 4),

                  // Location
                  Row(
                    children: [
                      const Icon(LucideIcons.mapPin, size: 13, color: AppColors.textSecondary),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          '${property.neighborhood}, ${property.city}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  // Price
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        property.startingPriceFormatted,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                        ),
                      ),
                      const Text(
                        ' / night',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const Spacer(),
                      const Text(
                        'Taxes included',
                        style: TextStyle(
                          fontSize: 10,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
