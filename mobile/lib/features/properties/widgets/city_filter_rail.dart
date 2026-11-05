import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';

class CityFilterRail extends StatelessWidget {
  final List<String> cities;
  final String selectedCity;
  final ValueChanged<String> onSelectCity;

  const CityFilterRail({
    super.key,
    required this.cities,
    required this.selectedCity,
    required this.onSelectCity,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 38,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: cities.length,
        separatorBuilder: (_, __) => const SizedBox(width: 6),
        itemBuilder: (context, index) {
          final city = cities[index];
          final isSelected = city == selectedCity;

          return InkWell(
            onTap: () => onSelectCity(city),
            borderRadius: BorderRadius.circular(20),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.dark : AppColors.background,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected ? AppColors.dark : AppColors.border,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    city == 'All Cities' ? LucideIcons.map : LucideIcons.mapPin,
                    size: 13,
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                  ),
                  const SizedBox(width: 5),
                  Text(
                    city,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      color: isSelected ? Colors.white : AppColors.textSecondary,
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
