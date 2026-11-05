import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';

class CategoryRail extends StatelessWidget {
  final List<String> categories;
  final String selectedCategory;
  final ValueChanged<String> onSelectCategory;

  const CategoryRail({
    super.key,
    required this.categories,
    required this.selectedCategory,
    required this.onSelectCategory,
  });

  IconData _getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'hotels':
        return LucideIcons.hotel;
      case 'serviced apartments':
        return LucideIcons.building2;
      case 'guest houses':
        return LucideIcons.home;
      case 'lodges':
        return LucideIcons.tent;
      case 'resorts':
        return LucideIcons.palmtree;
      case 'all stays':
      default:
        return LucideIcons.sparkles;
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 48,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final cat = categories[index];
          final isSelected = cat == selectedCategory;
          final icon = _getCategoryIcon(cat);

          return InkWell(
            onTap: () => onSelectCategory(cat),
            borderRadius: BorderRadius.circular(24),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: isSelected ? AppColors.primary : AppColors.border,
                  width: 1,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.2),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ]
                    : null,
              ),
              child: Row(
                children: [
                  Icon(
                    icon,
                    size: 15,
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    cat,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
