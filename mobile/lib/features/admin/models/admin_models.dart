import 'package:intl/intl.dart';

class AdminHostModel {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String? businessName;
  final String? cacNumber;
  final bool isApproved;
  final String hostStatus; // 'approved', 'pending', 'rejected'
  final String? cacVerifiedAt;
  final Map<String, dynamic>? cacVerificationData;
  final String? createdAt;

  AdminHostModel({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.businessName,
    this.cacNumber,
    this.isApproved = false,
    this.hostStatus = 'pending',
    this.cacVerifiedAt,
    this.cacVerificationData,
    this.createdAt,
  });

  bool get isCacVerified => cacVerifiedAt != null || (cacVerificationData != null && cacVerificationData!['status'] == 'verified');

  factory AdminHostModel.fromJson(Map<String, dynamic> json) {
    final status = (json['host_status'] ?? (json['is_approved'] == true ? 'approved' : 'pending')).toString().toLowerCase();
    return AdminHostModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      name: json['name'] ?? 'Host',
      email: json['email'] ?? '',
      phone: json['phone']?.toString(),
      businessName: json['business_name']?.toString(),
      cacNumber: json['cac_number']?.toString(),
      isApproved: json['is_approved'] == true || status == 'approved',
      hostStatus: status,
      cacVerifiedAt: json['cac_verified_at']?.toString(),
      cacVerificationData: json['cac_verification_data'] is Map<String, dynamic> ? json['cac_verification_data'] : null,
      createdAt: json['created_at']?.toString(),
    );
  }
}

class AdminInspectionReportModel {
  final int id;
  final int? propertyId;
  final String propertyName;
  final String propertyType;
  final String address;
  final String city;
  final String state;
  final String verificationTier;
  final double inspectionFee;
  final String inspectionFeeFormatted;
  final String status; // 'submitted', 'verified', 'approved', 'declined'
  final String agentName;
  final String agentEmail;
  final String? agentPhone;
  final String? hostName;
  final String? hostPhone;
  final double? gpsLatitude;
  final double? gpsLongitude;
  final List<String> photos;
  final String? videoUrl;
  final Map<String, dynamic> amenitiesCheck;
  final String? reportNotes;
  final String? adminReviewNotes;
  final String? appliedAt;
  final String? submittedAt;
  final String? verifiedAt;

  AdminInspectionReportModel({
    required this.id,
    this.propertyId,
    required this.propertyName,
    required this.propertyType,
    required this.address,
    required this.city,
    required this.state,
    required this.verificationTier,
    required this.inspectionFee,
    required this.inspectionFeeFormatted,
    required this.status,
    required this.agentName,
    required this.agentEmail,
    this.agentPhone,
    this.hostName,
    this.hostPhone,
    this.gpsLatitude,
    this.gpsLongitude,
    required this.photos,
    this.videoUrl,
    required this.amenitiesCheck,
    this.reportNotes,
    this.adminReviewNotes,
    this.appliedAt,
    this.submittedAt,
    this.verifiedAt,
  });

  bool get isVerified => status == 'verified';
  bool get isPendingReview => status == 'submitted';

  factory AdminInspectionReportModel.fromJson(Map<String, dynamic> json) {
    final fee = json['inspection_fee'] != null ? double.tryParse(json['inspection_fee'].toString()) ?? 0.0 : 0.0;
    
    List<String> photoList = [];
    if (json['photos'] is List) {
      photoList = (json['photos'] as List).map((p) => p.toString()).toList();
    }

    Map<String, dynamic> checkMap = {};
    if (json['amenities_check'] is Map) {
      checkMap = Map<String, dynamic>.from(json['amenities_check']);
    }

    final agentMap = json['agent'] is Map ? json['agent'] : {};
    final hostMap = json['host'] is Map ? json['host'] : {};

    return AdminInspectionReportModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      propertyId: json['property_id'] is int ? json['property_id'] : int.tryParse(json['property_id']?.toString() ?? ''),
      propertyName: json['property_name'] ?? 'Property',
      propertyType: json['property_type'] ?? 'Stay',
      address: json['address'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      verificationTier: json['verification_tier'] ?? 'tier_1_basic',
      inspectionFee: fee,
      inspectionFeeFormatted: json['inspection_fee_formatted'] ?? '₦${NumberFormat('#,##0.00').format(fee)}',
      status: (json['status'] ?? 'submitted').toString().toLowerCase(),
      agentName: agentMap['name'] ?? 'Assigned Agent',
      agentEmail: agentMap['email'] ?? '',
      agentPhone: agentMap['phone']?.toString(),
      hostName: hostMap['name']?.toString(),
      hostPhone: hostMap['phone']?.toString(),
      gpsLatitude: json['gps_latitude'] != null ? double.tryParse(json['gps_latitude'].toString()) : null,
      gpsLongitude: json['gps_longitude'] != null ? double.tryParse(json['gps_longitude'].toString()) : null,
      photos: photoList,
      videoUrl: json['video_url']?.toString(),
      amenitiesCheck: checkMap,
      reportNotes: json['report_notes']?.toString(),
      adminReviewNotes: json['admin_review_notes']?.toString(),
      appliedAt: json['applied_at']?.toString(),
      submittedAt: json['submitted_at']?.toString(),
      verifiedAt: json['verified_at']?.toString(),
    );
  }
}

class AdminWithdrawalModel {
  final int id;
  final int agentId;
  final String agentName;
  final String agentEmail;
  final String? agentPhone;
  final double amount;
  final String amountFormatted;
  final String bankName;
  final String accountNumber;
  final String accountName;
  final String status; // 'pending', 'approved', 'rejected'
  final String transactionReference;
  final String? adminNote;
  final String? processedByName;
  final String createdAt;
  final String? processedAt;
  final double currentWalletBalance;

  AdminWithdrawalModel({
    required this.id,
    required this.agentId,
    required this.agentName,
    required this.agentEmail,
    this.agentPhone,
    required this.amount,
    required this.amountFormatted,
    required this.bankName,
    required this.accountNumber,
    required this.accountName,
    required this.status,
    required this.transactionReference,
    this.adminNote,
    this.processedByName,
    required this.createdAt,
    this.processedAt,
    this.currentWalletBalance = 0.0,
  });

  bool get isPending => status == 'pending';

  factory AdminWithdrawalModel.fromJson(Map<String, dynamic> json) {
    final amt = json['amount'] != null ? double.tryParse(json['amount'].toString()) ?? 0.0 : 0.0;
    final bal = json['current_wallet_balance'] != null ? double.tryParse(json['current_wallet_balance'].toString()) ?? 0.0 : 0.0;

    return AdminWithdrawalModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      agentId: json['agent_id'] is int ? json['agent_id'] : int.tryParse(json['agent_id']?.toString() ?? '') ?? 0,
      agentName: json['agent_name'] ?? 'Agent',
      agentEmail: json['agent_email'] ?? '',
      agentPhone: json['agent_phone']?.toString(),
      amount: amt,
      amountFormatted: json['amount_formatted'] ?? '₦${NumberFormat('#,##0.00').format(amt)}',
      bankName: json['bank_name'] ?? 'Bank',
      accountNumber: json['account_number'] ?? '',
      accountName: json['account_name'] ?? '',
      status: (json['status'] ?? 'pending').toString().toLowerCase(),
      transactionReference: json['transaction_reference'] ?? '',
      adminNote: json['admin_note']?.toString(),
      processedByName: json['processed_by_name']?.toString(),
      createdAt: json['created_at']?.toString() ?? '',
      processedAt: json['processed_at']?.toString(),
      currentWalletBalance: bal,
    );
  }
}

class AdminTransactionModel {
  final int id;
  final String transactionReference;
  final String? gatewayReference;
  final String gateway; // 'paystack', 'monnify'
  final String paymentChannel;
  final String? virtualAccountNumber;
  final String? virtualBankName;
  final int amountPaidKobo;
  final String amountFormatted;
  final int platformCommissionKobo;
  final String platformCommissionFormatted;
  final int hostPayoutKobo;
  final String hostPayoutFormatted;
  final String status; // 'successful', 'initiated', 'refunded', 'failed'
  final String? paidAt;
  final String createdAt;
  final String? bookingReference;
  final String? propertyName;
  final String? guestName;
  final String? guestEmail;

  AdminTransactionModel({
    required this.id,
    required this.transactionReference,
    this.gatewayReference,
    required this.gateway,
    required this.paymentChannel,
    this.virtualAccountNumber,
    this.virtualBankName,
    required this.amountPaidKobo,
    required this.amountFormatted,
    required this.platformCommissionKobo,
    required this.platformCommissionFormatted,
    required this.hostPayoutKobo,
    required this.hostPayoutFormatted,
    required this.status,
    this.paidAt,
    required this.createdAt,
    this.bookingReference,
    this.propertyName,
    this.guestName,
    this.guestEmail,
  });

  bool get isSuccessful => status == 'successful';

  factory AdminTransactionModel.fromJson(Map<String, dynamic> json) {
    final amtKobo = json['amount_paid_kobo'] is int ? json['amount_paid_kobo'] : int.tryParse(json['amount_paid_kobo']?.toString() ?? '') ?? 0;
    final commKobo = json['platform_commission_kobo'] is int ? json['platform_commission_kobo'] : int.tryParse(json['platform_commission_kobo']?.toString() ?? '') ?? 0;
    final hostKobo = json['host_payout_kobo'] is int ? json['host_payout_kobo'] : int.tryParse(json['host_payout_kobo']?.toString() ?? '') ?? 0;

    final bookingMap = json['booking'] is Map ? json['booking'] : null;
    final userMap = bookingMap != null && bookingMap['user'] is Map ? bookingMap['user'] : null;
    final propMap = bookingMap != null && bookingMap['property'] is Map ? bookingMap['property'] : null;

    return AdminTransactionModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      transactionReference: json['transaction_reference'] ?? '',
      gatewayReference: json['gateway_reference']?.toString(),
      gateway: (json['gateway'] ?? 'paystack').toString().toLowerCase(),
      paymentChannel: json['payment_channel'] ?? 'card',
      virtualAccountNumber: json['virtual_account_number']?.toString(),
      virtualBankName: json['virtual_bank_name']?.toString(),
      amountPaidKobo: amtKobo,
      amountFormatted: json['amount_formatted'] ?? '₦${NumberFormat('#,##0.00').format(amtKobo / 100)}',
      platformCommissionKobo: commKobo,
      platformCommissionFormatted: json['platform_commission_formatted'] ?? '₦${NumberFormat('#,##0.00').format(commKobo / 100)}',
      hostPayoutKobo: hostKobo,
      hostPayoutFormatted: json['host_payout_formatted'] ?? '₦${NumberFormat('#,##0.00').format(hostKobo / 100)}',
      status: (json['status'] ?? 'initiated').toString().toLowerCase(),
      paidAt: json['paid_at']?.toString(),
      createdAt: json['created_at']?.toString() ?? '',
      bookingReference: bookingMap != null ? bookingMap['booking_reference']?.toString() : null,
      propertyName: propMap != null ? propMap['name']?.toString() : null,
      guestName: userMap != null ? userMap['name']?.toString() : (bookingMap != null ? bookingMap['guest_name']?.toString() : null),
      guestEmail: userMap != null ? userMap['email']?.toString() : (bookingMap != null ? bookingMap['guest_email']?.toString() : null),
    );
  }
}
