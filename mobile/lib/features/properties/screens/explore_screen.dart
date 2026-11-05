import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../providers/property_provider.dart';
import '../widgets/category_rail.dart';
import '../widgets/city_filter_rail.dart';
import '../widgets/filter_modal.dart';
import '../widgets/listing_card.dart';
import '../widgets/search_bar_widget.dart';
import 'property_detail_screen.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PropertyProvider>().fetchProperties();
    });
  }

  void _openFilterModal(BuildContext context) {
    final provider = context.read<PropertyProvider>();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => FilterModal(provider: provider),
    );
  }

  void _openSearchDialog(BuildContext context) {
    final provider = context.read<PropertyProvider>();
    final controller = TextEditingController(text: provider.searchQuery);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(
          'Search Accommodations',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.dark),
        ),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Enter hotel name, city or state...',
            prefixIcon: Icon(LucideIcons.search, size: 18, color: AppColors.primary),
          ),
          onSubmitted: (query) {
            provider.setSearchQuery(query);
            Navigator.pop(ctx);
          },
        ),
        actions: [
          if (provider.searchQuery.isNotEmpty)
            TextButton(
              onPressed: () {
                provider.setSearchQuery('');
                Navigator.pop(ctx);
              },
              child: const Text('Clear', style: TextStyle(color: AppColors.error)),
            ),
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              provider.setSearchQuery(controller.text);
              Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Search'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PropertyProvider>();
    final properties = provider.properties;

    final hasActiveFilters = provider.selectedCity != 'All Cities' ||
        provider.selectedCategory != 'All Stays' ||
        provider.verifiedOnly ||
        provider.selectedPropertyType != null ||
        provider.minPriceKobo != null ||
        provider.maxPriceKobo != null;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => provider.fetchProperties(refresh: true),
          color: AppColors.primary,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
            slivers: [
              // Top Spacing
              const SliverToBoxAdapter(child: SizedBox(height: 12)),

              // Search Bar
              SliverToBoxAdapter(
                child: SearchBarWidget(
                  searchQuery: provider.searchQuery,
                  selectedCity: provider.selectedCity,
                  hasActiveFilters: hasActiveFilters,
                  onSearchTap: () => _openSearchDialog(context),
                  onFilterTap: () => _openFilterModal(context),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 14)),

              // Category Rail
              SliverToBoxAdapter(
                child: CategoryRail(
                  categories: PropertyProvider.categories,
                  selectedCategory: provider.selectedCategory,
                  onSelectCategory: provider.setCategory,
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 10)),

              // City Quick Filter Rail
              SliverToBoxAdapter(
                child: CityFilterRail(
                  cities: PropertyProvider.cities,
                  selectedCity: provider.selectedCity,
                  onSelectCity: provider.setCity,
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 14)),

              // Results Count Bar
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${properties.length} Verified Stays Available',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.dark,
                        ),
                      ),
                      if (hasActiveFilters)
                        GestureDetector(
                          onTap: provider.resetFilters,
                          child: const Text(
                            'Reset filters',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 10)),

              // Content Body (Loading / Empty / List)
              if (provider.isLoading && properties.isEmpty)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(40),
                    child: Center(
                      child: Column(
                        children: [
                          const CircularProgressIndicator(color: AppColors.primary),
                          const SizedBox(height: 16),
                          Text(
                            'Loading verified accommodations...',
                            style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              else if (provider.errorMessage != null && properties.isEmpty)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
                    child: Center(
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppColors.errorBg,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(LucideIcons.wifiOff, size: 40, color: AppColors.error),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Unable to Load Stays',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.dark),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            provider.errorMessage!,
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
                          ),
                          const SizedBox(height: 20),
                          ElevatedButton.icon(
                            onPressed: () => provider.fetchProperties(refresh: true),
                            icon: const Icon(LucideIcons.refreshCw, size: 16),
                            label: const Text('Retry Connection'),
                            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              else if (properties.isEmpty)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
                    child: Center(
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppColors.primaryLight,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(LucideIcons.searchX, size: 40, color: AppColors.primary),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'No properties found',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.dark),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'We could not find any stays matching your selected filters. Try broadening your location or price range.',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
                          ),
                          const SizedBox(height: 20),
                          ElevatedButton(
                            onPressed: provider.resetFilters,
                            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                            child: const Text('Reset All Filters'),
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.only(left: 16, right: 16, bottom: 24),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final property = properties[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: ListingCard(
                            property: property,
                            isWishlisted: provider.isWishlisted(property.id),
                            onToggleWishlist: () => provider.toggleWishlist(property.id),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => PropertyDetailScreen(property: property),
                                ),
                              );
                            },
                          ),
                        );
                      },
                      childCount: properties.length,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
