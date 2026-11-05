import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../common/widgets/custom_button.dart';
import '../providers/property_provider.dart';
import '../widgets/listing_card.dart';
import 'property_detail_screen.dart';

class WishlistScreen extends StatelessWidget {
  final VoidCallback onExploreTap;

  const WishlistScreen({super.key, required this.onExploreTap});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PropertyProvider>();
    final wishlist = provider.wishlistProperties;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Saved Stays'),
        actions: [
          if (wishlist.isNotEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.only(right: 16),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    '${wishlist.length} ${wishlist.length == 1 ? 'Stay' : 'Stays'}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
      body: wishlist.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: AppColors.errorBg,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(LucideIcons.heart, size: 40, color: AppColors.error),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Your Wishlist is Empty',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: AppColors.dark,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'As you search, tap the heart icon on any verified property to save your favorite stays here.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.5),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: 180,
                      child: CustomButton(
                        text: 'Explore Stays',
                        onPressed: onExploreTap,
                      ),
                    ),
                  ],
                ),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: wishlist.length,
              separatorBuilder: (_, __) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final property = wishlist[index];
                return ListingCard(
                  property: property,
                  isWishlisted: true,
                  onToggleWishlist: () => provider.toggleWishlist(property.id),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => PropertyDetailScreen(property: property),
                      ),
                    );
                  },
                );
              },
            ),
    );
  }
}
