import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';

class SearchBarWidget extends StatelessWidget {
  final String searchQuery;
  final String selectedCity;
  final bool hasActiveFilters;
  final VoidCallback onSearchTap;
  final VoidCallback onFilterTap;

  const SearchBarWidget({
    super.key,
    required this.searchQuery,
    required this.selectedCity,
    required this.hasActiveFilters,
    required this.onSearchTap,
    required this.onFilterTap,
  });

  @override
  Widget build(BuildContext context) {
    String displayLocation = 'Where in Nigeria?';
    if (searchQuery.isNotEmpty) {
      displayLocation = '"$searchQuery"';
    } else if (selectedCity != 'All Cities') {
      displayLocation = selectedCity;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            // Search Input Area
            Expanded(
              child: InkWell(
                onTap: onSearchTap,
                borderRadius: const BorderRadius.horizontal(left: Radius.circular(32)),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    children: [
                      const Icon(LucideIcons.search, size: 20, color: AppColors.primary),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              displayLocation,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AppColors.dark,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const Text(
                              'Verified Stays • Escrow Protected',
                              style: TextStyle(
                                fontSize: 11,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Vertical divider
            Container(
              height: 24,
              width: 1,
              color: AppColors.border,
            ),

            // Filter button
            InkWell(
              onTap: onFilterTap,
              borderRadius: const BorderRadius.horizontal(right: Radius.circular(32)),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: hasActiveFilters
                            ? AppColors.primaryLight
                            : AppColors.background,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        LucideIcons.slidersHorizontal,
                        size: 18,
                        color: hasActiveFilters
                            ? AppColors.primary
                            : AppColors.textSecondary,
                      ),
                    ),
                    if (hasActiveFilters)
                      Positioned(
                        top: -2,
                        right: -2,
                        child: Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
