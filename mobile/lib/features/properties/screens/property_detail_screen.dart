import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../../core/constants/app_colors.dart';
import '../models/property_model.dart';
import '../models/room_type_model.dart';
import '../providers/property_provider.dart';
import '../../bookings/widgets/checkout_bottom_sheet.dart';
import '../../chat/providers/chat_provider.dart';
import '../../chat/screens/conversation_screen.dart';

class PropertyDetailScreen extends StatefulWidget {
  final PropertyModel property;

  const PropertyDetailScreen({super.key, required this.property});

  @override
  State<PropertyDetailScreen> createState() => _PropertyDetailScreenState();
}

class _PropertyDetailScreenState extends State<PropertyDetailScreen> {
  final PageController _imageController = PageController();
  int _currentImageIndex = 0;
  late RoomTypeModel _selectedRoom;

  @override
  void initState() {
    super.initState();
    if (widget.property.rooms.isNotEmpty) {
      _selectedRoom = widget.property.rooms.first;
    } else {
      _selectedRoom = RoomTypeModel(
        id: 1,
        name: 'Executive Room',
        priceKobo: widget.property.startingPriceKobo,
        priceFormatted: widget.property.startingPriceFormatted,
      );
    }
  }

  @override
  void dispose() {
    _imageController.dispose();
    super.dispose();
  }

  void _shareProperty() {
    Share.share(
      'Check out ${widget.property.name} in ${widget.property.city}, Nigeria on FindDestination! Verified lodging starting at ${widget.property.startingPriceFormatted}/night.',
    );
  }

  IconData _getAmenityIcon(String amenity) {
    final lower = amenity.toLowerCase();
    if (lower.contains('power') || lower.contains('electricity') || lower.contains('generator')) {
      return LucideIcons.zap;
    } else if (lower.contains('water')) {
      return LucideIcons.droplets;
    } else if (lower.contains('air') || lower.contains('ac')) {
      return LucideIcons.snowflake;
    } else if (lower.contains('wifi') || lower.contains('internet')) {
      return LucideIcons.wifi;
    } else if (lower.contains('security') || lower.contains('cctv')) {
      return LucideIcons.shieldCheck;
    } else if (lower.contains('parking')) {
      return LucideIcons.car;
    } else if (lower.contains('pool')) {
      return LucideIcons.waves;
    } else if (lower.contains('breakfast') || lower.contains('restaurant')) {
      return LucideIcons.utensils;
    }
    return LucideIcons.check;
  }

  void _onReservePressed() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => CheckoutBottomSheet(
        property: widget.property,
        selectedRoom: _selectedRoom,
      ),
    );

  }

  @override
  Widget build(BuildContext context) {
    final property = widget.property;
    final provider = context.watch<PropertyProvider>();
    final isWishlisted = provider.isWishlisted(property.id);

    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Scrollable Body
          SingleChildScrollView(
            padding: const EdgeInsets.only(bottom: 110),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Hero Image Gallery
                Stack(
                  children: [
                    SizedBox(
                      height: 320,
                      child: PageView.builder(
                        controller: _imageController,
                        onPageChanged: (idx) => setState(() => _currentImageIndex = idx),
                        itemCount: property.images.length,
                        itemBuilder: (context, index) {
                          return CachedNetworkImage(
                            imageUrl: property.images[index],
                            fit: BoxFit.cover,
                            placeholder: (_, __) => Container(
                              color: AppColors.background,
                              child: const Center(child: CircularProgressIndicator()),
                            ),
                            errorWidget: (_, __, ___) => Container(
                              color: AppColors.background,
                              child: const Icon(LucideIcons.image, size: 50, color: AppColors.textMuted),
                            ),
                          );
                        },
                      ),
                    ),

                    // Top Action Bar Overlay
                    SafeArea(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            _buildCircleButton(
                              icon: LucideIcons.chevronLeft,
                              onTap: () => Navigator.pop(context),
                            ),
                            Row(
                              children: [
                                _buildCircleButton(
                                  icon: LucideIcons.share2,
                                  onTap: _shareProperty,
                                ),
                                const SizedBox(width: 8),
                                _buildCircleButton(
                                  icon: isWishlisted ? LucideIcons.heart : LucideIcons.heart,
                                  iconColor: isWishlisted ? AppColors.error : AppColors.dark,
                                  onTap: () => provider.toggleWishlist(property.id),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Page Dots Indicator
                    if (property.images.length > 1)
                      Positioned(
                        bottom: 16,
                        right: 16,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.6),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Text(
                            '${_currentImageIndex + 1} / ${property.images.length}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),

                // 2. Title & Verified Badge
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Badge Pill
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.successBg,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(LucideIcons.shieldCheck, size: 14, color: AppColors.primary),
                            SizedBox(width: 5),
                            Text(
                              'FindDestination Verified (Tier 3)',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 12),

                      // Name
                      Text(
                        property.name,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: AppColors.dark,
                          letterSpacing: -0.5,
                        ),
                      ),

                      const SizedBox(height: 8),

                      // Location & Reviews
                      Row(
                        children: [
                          const Icon(LucideIcons.mapPin, size: 15, color: AppColors.textSecondary),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              '${property.address}, ${property.city}, ${property.state}',
                              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 6),

                      Row(
                        children: [
                          const Icon(LucideIcons.star, size: 15, color: AppColors.gold),
                          const SizedBox(width: 4),
                          Text(
                            property.rating.toStringAsFixed(1),
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark),
                          ),
                          Text(
                            ' (${property.reviewCount} verified guest reviews)',
                            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),
                      const Divider(color: AppColors.border),
                      const SizedBox(height: 16),

                      // 3. Host Profile Card
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
                                CircleAvatar(
                                  radius: 24,
                                  backgroundColor: AppColors.primary,
                                  child: Text(
                                    property.host.name.isNotEmpty ? property.host.name[0] : 'H',
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        property.host.name,
                                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.dark),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        '${property.host.role} • Joined ${property.host.joined}',
                                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.goldLight,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    '${property.host.responseRate} Response',
                                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.goldDark),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            InkWell(
                              onTap: () async {
                                final chatProvider = context.read<ChatProvider>();
                                final thread = await chatProvider.startBookingChat(propertyId: property.id);
                                if (!context.mounted) return;
                                if (thread != null) {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (_) => ConversationScreen(thread: thread)),
                                  );
                                }
                              },
                              borderRadius: BorderRadius.circular(10),
                              child: Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(LucideIcons.messageSquare, size: 14, color: AppColors.primary),
                                    SizedBox(width: 6),
                                    Text(
                                      'Chat with Host Directly',
                                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // 4. Guaranteed Essential Amenities (Nigeria-specific)
                      const Text(
                        'Verified Infrastructure & Amenities',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Inspected by field agents for guaranteed comfort & security',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 14),

                      GridView.builder(
                        padding: EdgeInsets.zero,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 10,
                          mainAxisSpacing: 10,
                          childAspectRatio: 3.4,
                        ),
                        itemCount: property.amenities.length,
                        itemBuilder: (context, idx) {
                          final amenity = property.amenities[idx];
                          final icon = _getAmenityIcon(amenity);

                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Row(
                              children: [
                                Icon(icon, size: 16, color: AppColors.primary),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    amenity,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.textPrimary,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),

                      const SizedBox(height: 24),
                      const Divider(color: AppColors.border),
                      const SizedBox(height: 16),

                      // 5. Room Tier Selection
                      const Text(
                        'Select Room Tier',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Choose the room category for your stay reservation',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 14),

                      ...property.rooms.map((room) {
                        final isSelected = _selectedRoom.id == room.id;

                        return InkWell(
                          onTap: () => setState(() => _selectedRoom = room),
                          borderRadius: BorderRadius.circular(14),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: isSelected ? AppColors.primaryLight : Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: isSelected ? AppColors.primary : AppColors.border,
                                width: isSelected ? 2 : 1,
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  isSelected ? LucideIcons.checkCircle2 : LucideIcons.circle,
                                  size: 20,
                                  color: isSelected ? AppColors.primary : AppColors.textMuted,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        room.name,
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w700,
                                          color: isSelected ? AppColors.primaryDark : AppColors.dark,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        '${room.bedType} • Max ${room.maxOccupancy} Guests',
                                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                      ),
                                    ],
                                  ),
                                ),
                                Text(
                                  room.priceFormatted,
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    color: isSelected ? AppColors.primary : AppColors.dark,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),

                      const SizedBox(height: 20),
                      const Divider(color: AppColors.border),
                      const SizedBox(height: 16),

                      // 6. Description
                      const Text(
                        'About this stay',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        property.description,
                        style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.6),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Sticky Bottom Booking Bar
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: BoxDecoration(
                color: Colors.white,
                border: const Border(top: BorderSide(color: AppColors.border)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 16,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: SafeArea(
                top: false,
                child: Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              _selectedRoom.priceFormatted,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: AppColors.primary,
                              ),
                            ),
                            const Text(
                              ' / night',
                              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                        Text(
                          _selectedRoom.name,
                          style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                    const Spacer(),
                    InkWell(
                      onTap: () async {
                        final chatProvider = context.read<ChatProvider>();
                        final thread = await chatProvider.startBookingChat(propertyId: property.id);
                        if (!context.mounted) return;
                        if (thread != null) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => ConversationScreen(thread: thread)),
                          );
                        }
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                        ),
                        child: const Icon(LucideIcons.messageSquare, size: 20, color: AppColors.primary),
                      ),
                    ),
                    const SizedBox(width: 8),
                    SizedBox(
                      width: 140,
                      child: ElevatedButton(
                        onPressed: _onReservePressed,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Reserve',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white),
                            ),
                            SizedBox(width: 6),
                            Icon(LucideIcons.arrowRight, size: 16, color: Colors.white),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCircleButton({
    required IconData icon,
    required VoidCallback onTap,
    Color? iconColor,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.9),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.15),
              blurRadius: 8,
            ),
          ],
        ),
        child: Center(
          child: Icon(icon, size: 20, color: iconColor ?? AppColors.dark),
        ),
      ),
    );
  }
}


