

class BookingModel {
  final int id;
  final String bookingReference;
  final int? userId;
  final int propertyId;
  final String propertyName;
  final String propertyCity;
  final String propertyState;
  final String? propertyAddress;
  final String? propertyImage;
  final int roomTypeId;
  final String roomName;
  final int roomPriceKobo;
  final int roomsCount;
  final String checkInDate;
  final String checkOutDate;
  final int totalNights;
  final int totalAmountKobo;
  final String totalAmountFormatted;
  final int platformCommissionKobo;
  final int hostPayoutKobo;
  final String bookingStatus; // 'pending', 'confirmed', 'checked_in', 'completed', 'cancelled'
  final String? holdExpiresAt;
  final String guestName;
  final String? guestPhone;
  final String guestEmail;
  final String paymentGateway; // 'paystack', 'monnify'
  final String? virtualAccountNumber;
  final String? virtualBankName;
  final String? virtualAccountName;
  final String? createdAt;

  BookingModel({
    required this.id,
    required this.bookingReference,
    this.userId,
    required this.propertyId,
    required this.propertyName,
    required this.propertyCity,
    required this.propertyState,
    this.propertyAddress,
    this.propertyImage,
    required this.roomTypeId,
    required this.roomName,
    required this.roomPriceKobo,
    this.roomsCount = 1,
    required this.checkInDate,
    required this.checkOutDate,
    required this.totalNights,
    required this.totalAmountKobo,
    required this.totalAmountFormatted,
    this.platformCommissionKobo = 0,
    this.hostPayoutKobo = 0,
    this.bookingStatus = 'pending',
    this.holdExpiresAt,
    required this.guestName,
    this.guestPhone,
    required this.guestEmail,
    this.paymentGateway = 'paystack',
    this.virtualAccountNumber,
    this.virtualBankName,
    this.virtualAccountName,
    this.createdAt,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    // 1. Resolve Property info
    int propId = 0;
    String propName = 'FindDestination Verified Stay';
    String propCity = 'Bauchi';
    String propState = 'Bauchi';
    String? propAddr;
    String? propImg;

    if (json['property'] is Map) {
      final p = json['property'] as Map;
      propId = p['id'] is int ? p['id'] : int.tryParse(p['id']?.toString() ?? '0') ?? 0;
      propName = p['name'] ?? propName;
      propCity = p['city'] ?? propCity;
      propState = p['state'] ?? propState;
      propAddr = p['address'];
      if (p['images'] is List && (p['images'] as List).isNotEmpty) {
        propImg = (p['images'] as List).first.toString();
      }
    } else {
      propId = json['property_id'] is int
          ? json['property_id']
          : int.tryParse(json['property_id']?.toString() ?? '0') ?? 0;
      propName = json['property_name'] ?? json['property_title'] ?? propName;
      propCity = json['property_city'] ?? json['city'] ?? propCity;
      propState = json['property_state'] ?? json['state'] ?? propState;
      propAddr = json['property_address'] ?? json['address'];
      propImg = json['property_image'] ?? json['cover_image'];
    }

    // 2. Resolve Room info
    int rId = 0;
    String rName = 'Executive Suite';
    int rPrice = 3500000;

    if (json['room_type'] is Map) {
      final r = json['room_type'] as Map;
      rId = r['id'] is int ? r['id'] : int.tryParse(r['id']?.toString() ?? '0') ?? 0;
      rName = r['name'] ?? rName;
      rPrice = r['base_price_kobo'] is int ? r['base_price_kobo'] : rPrice;
    } else {
      rId = json['room_type_id'] is int
          ? json['room_type_id']
          : int.tryParse(json['room_type_id']?.toString() ?? '0') ?? 0;
      rName = json['room_name'] ?? rName;
      rPrice = json['room_price_kobo'] is int
          ? json['room_price_kobo']
          : int.tryParse(json['room_price_kobo']?.toString() ?? '3500000') ?? 3500000;
    }

    final totalKobo = json['total_amount_kobo'] is int
        ? json['total_amount_kobo']
        : int.tryParse(json['total_amount_kobo']?.toString() ?? '0') ?? (rPrice * (json['total_nights'] ?? 1));

    final totalFormatted = json['total_amount_formatted'] ?? '₦${(totalKobo / 100).round()}';

    // 3. Resolve Virtual Account details if available
    String? vAccountNum;
    String? vBankName;
    String? vAccountName;

    if (json['payment_details'] is Map) {
      final pd = json['payment_details'] as Map;
      vAccountNum = pd['account_number'];
      vBankName = pd['bank_name'];
      vAccountName = pd['account_name'];
    } else {
      vAccountNum = json['virtual_account_number'];
      vBankName = json['virtual_bank_name'];
      vAccountName = json['virtual_account_name'];
    }

    return BookingModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      bookingReference: json['booking_reference'] ?? json['reference'] ?? 'TAF-REF',
      userId: json['user_id'] is int ? json['user_id'] : int.tryParse(json['user_id']?.toString() ?? '0'),
      propertyId: propId,
      propertyName: propName,
      propertyCity: propCity,
      propertyState: propState,
      propertyAddress: propAddr,
      propertyImage: propImg,
      roomTypeId: rId,
      roomName: rName,
      roomPriceKobo: rPrice,
      roomsCount: json['rooms_count'] is int ? json['rooms_count'] : 1,
      checkInDate: json['check_in_date'] ?? '2026-11-10',
      checkOutDate: json['check_out_date'] ?? '2026-11-12',
      totalNights: json['total_nights'] is int
          ? json['total_nights']
          : int.tryParse(json['total_nights']?.toString() ?? '1') ?? 1,
      totalAmountKobo: totalKobo,
      totalAmountFormatted: totalFormatted,
      platformCommissionKobo: json['platform_commission_kobo'] is int ? json['platform_commission_kobo'] : 0,
      hostPayoutKobo: json['host_payout_kobo'] is int ? json['host_payout_kobo'] : 0,
      bookingStatus: json['booking_status'] ?? json['status'] ?? 'confirmed',
      holdExpiresAt: json['hold_expires_at'],
      guestName: json['guest_name'] ?? json['user']?['name'] ?? 'Guest Traveler',
      guestPhone: json['guest_phone'] ?? json['user']?['phone'],
      guestEmail: json['guest_email'] ?? json['user']?['email'] ?? 'guest@example.com',
      paymentGateway: json['payment_gateway'] ?? 'monnify',
      virtualAccountNumber: vAccountNum,
      virtualBankName: vBankName,
      virtualAccountName: vAccountName,
      createdAt: json['created_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'booking_reference': bookingReference,
      'user_id': userId,
      'property_id': propertyId,
      'property_name': propertyName,
      'property_city': propertyCity,
      'property_state': propertyState,
      'property_address': propertyAddress,
      'property_image': propertyImage,
      'room_type_id': roomTypeId,
      'room_name': roomName,
      'room_price_kobo': roomPriceKobo,
      'rooms_count': roomsCount,
      'check_in_date': checkInDate,
      'check_out_date': checkOutDate,
      'total_nights': totalNights,
      'total_amount_kobo': totalAmountKobo,
      'total_amount_formatted': totalAmountFormatted,
      'platform_commission_kobo': platformCommissionKobo,
      'host_payout_kobo': hostPayoutKobo,
      'booking_status': bookingStatus,
      'hold_expires_at': holdExpiresAt,
      'guest_name': guestName,
      'guest_phone': guestPhone,
      'guest_email': guestEmail,
      'payment_gateway': paymentGateway,
      'virtual_account_number': virtualAccountNumber,
      'virtual_bank_name': virtualBankName,
      'virtual_account_name': virtualAccountName,
      'created_at': createdAt,
    };
  }
}

