import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../providers/property_provider.dart';

class FilterModal extends StatefulWidget {
  final PropertyProvider provider;

  const FilterModal({super.key, required this.provider});

  @override
  State<FilterModal> createState() => _FilterModalState();
}

class _FilterModalState extends State<FilterModal> {
  late String _tempCity;
  late String? _tempPropertyType;
  late bool _tempVerifiedOnly;
  late RangeValues _tempPriceRange;

  @override
  void initState() {
    super.initState();
    _tempCity = widget.provider.selectedCity;
    _tempPropertyType = widget.provider.selectedPropertyType;
    _tempVerifiedOnly = widget.provider.verifiedOnly;

    final min = (widget.provider.minPriceKobo != null)
        ? (widget.provider.minPriceKobo! / 100).toDouble()
        : 10000.0;
    final max = (widget.provider.maxPriceKobo != null)
        ? (widget.provider.maxPriceKobo! / 100).toDouble()
        : 200000.0;
    _tempPriceRange = RangeValues(min, max);
  }

  void _apply() {
    widget.provider.setAdvancedFilters(
      city: _tempCity,
      propertyType: _tempPropertyType,
      verifiedOnly: _tempVerifiedOnly,
      minPriceKobo: (_tempPriceRange.start * 100).round(),
      maxPriceKobo: (_tempPriceRange.end * 100).round(),
    );
    Navigator.pop(context);
  }

  void _reset() {
    widget.provider.resetFilters();
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(top: 20, left: 20, right: 20, bottom: 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Filters',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: AppColors.dark,
                    ),
                  ),
                  TextButton(
                    onPressed: _reset,
                    child: const Text(
                      'Clear all',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),

              const Divider(color: AppColors.border),
              const SizedBox(height: 12),

              // Destination City
              const Text(
                'Destination State / City',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.dark),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: PropertyProvider.cities.map((city) {
                  final isSelected = _tempCity == city;
                  return ChoiceChip(
                    label: Text(city),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    backgroundColor: Colors.white,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      fontSize: 12,
                    ),
                    side: BorderSide(
                      color: isSelected ? AppColors.primary : AppColors.border,
                    ),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    onSelected: (selected) {
                      if (selected) setState(() => _tempCity = city);
                    },
                  );
                }).toList(),
              ),

              const SizedBox(height: 20),

              // Property Type
              const Text(
                'Property Type',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.dark),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildTypeChip('Any Type', null),
                  _buildTypeChip('Hotel', 'hotel'),
                  _buildTypeChip('Serviced Apt', 'serviced_apartment'),
                  _buildTypeChip('Guest House', 'guest_house'),
                  _buildTypeChip('Lodge', 'lodge'),
                  _buildTypeChip('Resort', 'resort'),
                ],
              ),

              const SizedBox(height: 20),

              // Price Range
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Price per Night',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.dark),
                  ),
                  Text(
                    '${CurrencyFormatter.formatNaira(_tempPriceRange.start.round())} – ${CurrencyFormatter.formatNaira(_tempPriceRange.end.round())}',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              RangeSlider(
                values: _tempPriceRange,
                min: 5000,
                max: 300000,
                divisions: 59,
                activeColor: AppColors.primary,
                inactiveColor: AppColors.border,
                onChanged: (values) => setState(() => _tempPriceRange = values),
              ),

              const SizedBox(height: 16),

              // Verified Only Switch
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: const BoxDecoration(
                        color: AppColors.successBg,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(LucideIcons.shieldCheck, size: 18, color: AppColors.primary),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Verified Properties Only',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
                          ),
                          Text(
                            'Show only listings with Tier 3 certified badges',
                            style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                    Switch(
                      value: _tempVerifiedOnly,
                      activeThumbColor: AppColors.primary,
                      onChanged: (v) => setState(() => _tempVerifiedOnly = v),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Apply Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _apply,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text(
                    'Apply Filters',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTypeChip(String label, String? value) {
    final isSelected = _tempPropertyType == value;

    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      selectedColor: AppColors.dark,
      backgroundColor: Colors.white,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : AppColors.textPrimary,
        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
        fontSize: 12,
      ),
      side: BorderSide(
        color: isSelected ? AppColors.dark : AppColors.border,
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      onSelected: (selected) {
        if (selected) setState(() => _tempPropertyType = value);
      },
    );
  }
}



