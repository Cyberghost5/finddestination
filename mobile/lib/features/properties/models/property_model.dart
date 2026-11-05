import 'room_type_model.dart';

class HostInfo {
  final int id;
  final String name;
  final String? businessName;
  final String? email;
  final String role;
  final String joined;
  final String responseRate;

  HostInfo({
    required this.id,
    required this.name,
    this.businessName,
    this.email,
    this.role = 'Verified Host',
    this.joined = '2024',
    this.responseRate = '99%',
  });

  factory HostInfo.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return HostInfo(id: 0, name: 'Verified Host');
    }
    return HostInfo(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      name: json['name'] ?? 'Verified Host',
      businessName: json['business_name'],
      email: json['email'],
      role: json['role'] ?? 'Verified Host',
      joined: json['joined']?.toString() ?? '2024',
      responseRate: json['response_rate']?.toString() ?? '99%',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'business_name': businessName,
      'email': email,
      'role': role,
      'joined': joined,
      'response_rate': responseRate,
    };
  }
}

class PropertyModel {
  final int id;
  final int hostId;
  final String name;
  final String slug;
  final String propertyType; // 'hotel', 'serviced_apartment', 'lodge', 'guest_house', etc.
  final String category;
  final String city;
  final String state;
  final String neighborhood;
  final String address;
  final String description;
  final String verificationStatus; // 'unverified', 'documents_verified', 'location_verified', 'verified'
  final String verificationTier; // 'tier_1_docs', 'tier_2_location', 'tier_3_certified'
  final bool isPublished;
  final int startingPriceKobo;
  final String startingPriceFormatted;
  final double rating;
  final int reviewCount;
  final List<String> images;
  final List<String> amenities;
  final double latitude;
  final double longitude;
  final HostInfo host;
  final List<RoomTypeModel> rooms;

  PropertyModel({
    required this.id,
    required this.hostId,
    required this.name,
    required this.slug,
    required this.propertyType,
    required this.category,
    required this.city,
    required this.state,
    required this.neighborhood,
    required this.address,
    required this.description,
    required this.verificationStatus,
    required this.verificationTier,
    required this.isPublished,
    required this.startingPriceKobo,
    required this.startingPriceFormatted,
    required this.rating,
    required this.reviewCount,
    required this.images,
    required this.amenities,
    required this.latitude,
    required this.longitude,
    required this.host,
    required this.rooms,
  });

  factory PropertyModel.fromJson(Map<String, dynamic> json) {
    // Images fallback
    List<String> parsedImages = [];
    if (json['images'] is List) {
      parsedImages = (json['images'] as List).map((e) => e.toString()).toList();
    }
    if (parsedImages.isEmpty) {
      if (json['cover_image_url'] != null) {
        parsedImages = [json['cover_image_url'].toString()];
      } else {
        parsedImages = [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        ];
      }
    }

    // Amenities fallback
    List<String> parsedAmenities = [];
    if (json['amenities'] is List) {
      parsedAmenities = (json['amenities'] as List).map((e) => e.toString()).toList();
    }
    if (parsedAmenities.isEmpty) {
      parsedAmenities = [
        '24/7 Power Backup',
        'Treated Running Water',
        'Air Conditioning',
        'High-Speed WiFi',
        'Gated Security & CCTV',
      ];
    }

    // Rooms fallback
    List<RoomTypeModel> parsedRooms = [];
    if (json['rooms'] is List) {
      parsedRooms = (json['rooms'] as List)
          .map((r) => RoomTypeModel.fromJson(Map<String, dynamic>.from(r)))
          .toList();
    }

    final rawPrice = json['starting_price_kobo'] ?? 3500000;
    final priceKobo = rawPrice is int ? rawPrice : int.tryParse(rawPrice.toString()) ?? 3500000;

    final rawRating = json['rating'] ?? 4.8;
    final ratingDouble = rawRating is num ? rawRating.toDouble() : double.tryParse(rawRating.toString()) ?? 4.8;

    return PropertyModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      hostId: json['host_id'] is int ? json['host_id'] : int.tryParse(json['host_id']?.toString() ?? '0') ?? 0,
      name: json['name'] ?? 'FindDestination Stay',
      slug: json['slug'] ?? '',
      propertyType: json['property_type'] ?? 'hotel',
      category: json['category'] ?? 'All Stays',
      city: json['city'] ?? 'Bauchi',
      state: json['state'] ?? 'Bauchi',
      neighborhood: json['neighborhood'] ?? '${json['city'] ?? 'City'} Central',
      address: json['address'] ?? '',
      description: json['description'] ?? 'Verified Nigerian lodging with guaranteed power and amenities.',
      verificationStatus: json['verification_status'] ?? 'verified',
      verificationTier: json['verification_tier'] ?? 'tier_3_certified',
      isPublished: json['is_published'] != false && json['is_published'] != 0,
      startingPriceKobo: priceKobo,
      startingPriceFormatted: json['starting_price_formatted'] ?? '₦${(priceKobo / 100).round()}',
      rating: ratingDouble,
      reviewCount: json['review_count'] is int
          ? json['review_count']
          : int.tryParse(json['review_count']?.toString() ?? '48') ?? 48,
      images: parsedImages,
      amenities: parsedAmenities,
      latitude: json['latitude'] is num
          ? (json['latitude'] as num).toDouble()
          : double.tryParse(json['latitude']?.toString() ?? '10.3158') ?? 10.3158,
      longitude: json['longitude'] is num
          ? (json['longitude'] as num).toDouble()
          : double.tryParse(json['longitude']?.toString() ?? '9.8442') ?? 9.8442,
      host: HostInfo.fromJson(json['host'] is Map ? Map<String, dynamic>.from(json['host']) : null),
      rooms: parsedRooms,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'host_id': hostId,
      'name': name,
      'slug': slug,
      'property_type': propertyType,
      'category': category,
      'city': city,
      'state': state,
      'neighborhood': neighborhood,
      'address': address,
      'description': description,
      'verification_status': verificationStatus,
      'verification_tier': verificationTier,
      'is_published': isPublished,
      'starting_price_kobo': startingPriceKobo,
      'starting_price_formatted': startingPriceFormatted,
      'rating': rating,
      'review_count': reviewCount,
      'images': images,
      'amenities': amenities,
      'latitude': latitude,
      'longitude': longitude,
      'host': host.toJson(),
      'rooms': rooms.map((r) => r.toJson()).toList(),
    };
  }

  PropertyModel copyWith({
    int? id,
    int? hostId,
    String? name,
    String? slug,
    String? propertyType,
    String? category,
    String? city,
    String? state,
    String? neighborhood,
    String? address,
    String? description,
    String? verificationStatus,
    String? verificationTier,
    bool? isPublished,
    int? startingPriceKobo,
    String? startingPriceFormatted,
    double? rating,
    int? reviewCount,
    List<String>? images,
    List<String>? amenities,
    double? latitude,
    double? longitude,
    HostInfo? host,
    List<RoomTypeModel>? rooms,
  }) {
    return PropertyModel(
      id: id ?? this.id,
      hostId: hostId ?? this.hostId,
      name: name ?? this.name,
      slug: slug ?? this.slug,
      propertyType: propertyType ?? this.propertyType,
      category: category ?? this.category,
      city: city ?? this.city,
      state: state ?? this.state,
      neighborhood: neighborhood ?? this.neighborhood,
      address: address ?? this.address,
      description: description ?? this.description,
      verificationStatus: verificationStatus ?? this.verificationStatus,
      verificationTier: verificationTier ?? this.verificationTier,
      isPublished: isPublished ?? this.isPublished,
      startingPriceKobo: startingPriceKobo ?? this.startingPriceKobo,
      startingPriceFormatted: startingPriceFormatted ?? this.startingPriceFormatted,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      images: images ?? this.images,
      amenities: amenities ?? this.amenities,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      host: host ?? this.host,
      rooms: rooms ?? this.rooms,
    );
  }
}
