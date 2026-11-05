class HostContactInfo {
  final String name;
  final String phone;
  final String? email;
  final String? businessName;

  HostContactInfo({
    required this.name,
    required this.phone,
    this.email,
    this.businessName,
  });

  factory HostContactInfo.fromJson(Map<String, dynamic> json) {
    return HostContactInfo(
      name: json['name'] ?? 'Host Partner',
      phone: json['phone'] ?? '+234 800 000 0000',
      email: json['email'],
      businessName: json['business_name'],
    );
  }
}

class BountyApplicationInfo {
  final int id;
  final String status;
  final String? appliedAt;
  final String? approvedAt;

  BountyApplicationInfo({
    required this.id,
    required this.status,
    this.appliedAt,
    this.approvedAt,
  });

  factory BountyApplicationInfo.fromJson(Map<String, dynamic> json) {
    return BountyApplicationInfo(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      status: json['status'] ?? 'pending',
      appliedAt: json['applied_at'],
      approvedAt: json['approved_at'],
    );
  }
}

class BountyPropertyModel {
  final int id;
  final String name;
  final String slug;
  final String propertyType;
  final String description;
  final String city;
  final String state;
  final String neighborhood;
  final String address;
  final double inspectionFee;
  final String inspectionFeeFormatted;
  final String inspectionStatus;
  final String coverImage;
  final List<String> images;
  final List<String> amenities;
  final BountyApplicationInfo? myApplication;
  final bool canApply;
  final bool isAssignedToOther;

  BountyPropertyModel({
    required this.id,
    required this.name,
    required this.slug,
    required this.propertyType,
    required this.description,
    required this.city,
    required this.state,
    required this.neighborhood,
    required this.address,
    required this.inspectionFee,
    required this.inspectionFeeFormatted,
    required this.inspectionStatus,
    required this.coverImage,
    required this.images,
    required this.amenities,
    this.myApplication,
    required this.canApply,
    required this.isAssignedToOther,
  });

  factory BountyPropertyModel.fromJson(Map<String, dynamic> json) {
    List<String> parsedImages = [];
    if (json['images'] is List) {
      parsedImages = (json['images'] as List).map((e) => e.toString()).toList();
    }
    if (parsedImages.isEmpty) {
      parsedImages = [json['cover_image'] ?? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'];
    }

    List<String> parsedAmenities = [];
    if (json['amenities'] is List) {
      parsedAmenities = (json['amenities'] as List).map((e) => e.toString()).toList();
    }

    final fee = (json['inspection_fee'] is num)
        ? (json['inspection_fee'] as num).toDouble()
        : double.tryParse(json['inspection_fee']?.toString() ?? '15000') ?? 15000.0;

    return BountyPropertyModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      name: json['name'] ?? 'FindDestination Property',
      slug: json['slug'] ?? '',
      propertyType: json['property_type'] ?? 'hotel',
      description: json['description'] ?? '',
      city: json['city'] ?? 'Bauchi',
      state: json['state'] ?? 'Bauchi',
      neighborhood: json['neighborhood'] ?? '',
      address: json['address'] ?? '',
      inspectionFee: fee,
      inspectionFeeFormatted: json['inspection_fee_formatted'] ?? '₦${fee.toInt()}',
      inspectionStatus: json['inspection_status'] ?? 'unassigned',
      coverImage: json['cover_image'] ?? parsedImages.first,
      images: parsedImages,
      amenities: parsedAmenities,
      myApplication: json['my_application'] != null
          ? BountyApplicationInfo.fromJson(json['my_application'])
          : null,
      canApply: json['can_apply'] ?? true,
      isAssignedToOther: json['is_assigned_to_other'] ?? false,
    );
  }
}

class AgentAssignmentModel {
  final int id;
  final int? propertyId;
  final String propertyName;
  final String propertyType;
  final String status; // pending, approved, declined, submitted, verified
  final double inspectionFee;
  final String inspectionFeeFormatted;
  final String? appliedAt;
  final String? approvedAt;
  final String? submittedAt;
  final String? verifiedAt;
  final String coverImage;
  final String city;
  final String state;
  final bool isDetailsUnlocked;
  final HostContactInfo? hostDetails;
  final String unlockedAddress;
  final Map<String, dynamic>? report;

  AgentAssignmentModel({
    required this.id,
    this.propertyId,
    required this.propertyName,
    required this.propertyType,
    required this.status,
    required this.inspectionFee,
    required this.inspectionFeeFormatted,
    this.appliedAt,
    this.approvedAt,
    this.submittedAt,
    this.verifiedAt,
    required this.coverImage,
    required this.city,
    required this.state,
    required this.isDetailsUnlocked,
    this.hostDetails,
    required this.unlockedAddress,
    this.report,
  });

  factory AgentAssignmentModel.fromJson(Map<String, dynamic> json) {
    final fee = (json['inspection_fee'] is num)
        ? (json['inspection_fee'] as num).toDouble()
        : double.tryParse(json['inspection_fee']?.toString() ?? '15000') ?? 15000.0;

    return AgentAssignmentModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      propertyId: json['property_id'] is int
          ? json['property_id']
          : int.tryParse(json['property_id']?.toString() ?? '0'),
      propertyName: json['property_name'] ?? 'FindDestination Property',
      propertyType: json['property_type'] ?? 'hotel',
      status: json['status'] ?? 'pending',
      inspectionFee: fee,
      inspectionFeeFormatted: json['inspection_fee_formatted'] ?? '₦${fee.toInt()}',
      appliedAt: json['applied_at'],
      approvedAt: json['approved_at'],
      submittedAt: json['submitted_at'],
      verifiedAt: json['verified_at'],
      coverImage: json['cover_image'] ?? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      isDetailsUnlocked: json['is_details_unlocked'] ?? false,
      hostDetails: json['host_details'] != null
          ? HostContactInfo.fromJson(json['host_details'])
          : null,
      unlockedAddress: json['unlocked_address'] ?? 'Hidden until approved',
      report: json['report'] is Map ? Map<String, dynamic>.from(json['report']) : null,
    );
  }
}

class WalletTransactionModel {
  final int id;
  final String type; // credit, debit
  final String? category;
  final double amount;
  final String amountFormatted;
  final double balanceAfter;
  final String balanceAfterFormatted;
  final String reference;
  final String description;
  final String status;
  final String date;
  final String createdAt;

  WalletTransactionModel({
    required this.id,
    required this.type,
    this.category,
    required this.amount,
    required this.amountFormatted,
    required this.balanceAfter,
    required this.balanceAfterFormatted,
    required this.reference,
    required this.description,
    required this.status,
    required this.date,
    required this.createdAt,
  });

  factory WalletTransactionModel.fromJson(Map<String, dynamic> json) {
    return WalletTransactionModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      type: json['type'] ?? 'credit',
      category: json['category'],
      amount: (json['amount'] is num) ? (json['amount'] as num).toDouble() : 0.0,
      amountFormatted: json['amount_formatted'] ?? '₦0.00',
      balanceAfter: (json['balance_after'] is num) ? (json['balance_after'] as num).toDouble() : 0.0,
      balanceAfterFormatted: json['balance_after_formatted'] ?? '₦0.00',
      reference: json['reference'] ?? '',
      description: json['description'] ?? 'Field Bounty',
      status: json['status'] ?? 'completed',
      date: json['date'] ?? '',
      createdAt: json['created_at'] ?? '',
    );
  }
}

class WithdrawalHistoryModel {
  final int id;
  final double amount;
  final String amountFormatted;
  final String bankName;
  final String accountNumber;
  final String accountName;
  final String status;
  final String? adminNote;
  final String transactionReference;
  final String requestedAt;
  final String? processedAt;

  WithdrawalHistoryModel({
    required this.id,
    required this.amount,
    required this.amountFormatted,
    required this.bankName,
    required this.accountNumber,
    required this.accountName,
    required this.status,
    this.adminNote,
    required this.transactionReference,
    required this.requestedAt,
    this.processedAt,
  });

  factory WithdrawalHistoryModel.fromJson(Map<String, dynamic> json) {
    return WithdrawalHistoryModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      amount: (json['amount'] is num) ? (json['amount'] as num).toDouble() : 0.0,
      amountFormatted: json['amount_formatted'] ?? '₦0.00',
      bankName: json['bank_name'] ?? '',
      accountNumber: json['account_number'] ?? '',
      accountName: json['account_name'] ?? '',
      status: json['status'] ?? 'pending',
      adminNote: json['admin_note'],
      transactionReference: json['transaction_reference'] ?? '',
      requestedAt: json['requested_at'] ?? '',
      processedAt: json['processed_at'],
    );
  }
}

class AgentBankDetailsModel {
  final String bankName;
  final String accountNumber;
  final String accountName;
  final String? bankCode;
  final bool isConfigured;

  AgentBankDetailsModel({
    required this.bankName,
    required this.accountNumber,
    required this.accountName,
    this.bankCode,
    required this.isConfigured,
  });

  factory AgentBankDetailsModel.fromJson(Map<String, dynamic> json) {
    return AgentBankDetailsModel(
      bankName: json['bank_name'] ?? 'Access Bank Plc',
      accountNumber: json['account_number'] ?? '',
      accountName: json['account_name'] ?? '',
      bankCode: json['bank_code'],
      isConfigured: json['is_configured'] ?? false,
    );
  }
}

class AgentWalletModel {
  final int walletId;
  final double balance;
  final String balanceFormatted;
  final double totalEarned;
  final String totalEarnedFormatted;
  final double pendingWithdrawalAmount;
  final String pendingWithdrawalFormatted;
  final AgentBankDetailsModel bankDetails;
  final List<WalletTransactionModel> transactions;
  final List<WithdrawalHistoryModel> withdrawals;

  AgentWalletModel({
    required this.walletId,
    required this.balance,
    required this.balanceFormatted,
    required this.totalEarned,
    required this.totalEarnedFormatted,
    required this.pendingWithdrawalAmount,
    required this.pendingWithdrawalFormatted,
    required this.bankDetails,
    required this.transactions,
    required this.withdrawals,
  });

  factory AgentWalletModel.fromJson(Map<String, dynamic> json) {
    var rawTx = json['transactions'] as List? ?? [];
    List<WalletTransactionModel> txList =
        rawTx.map((item) => WalletTransactionModel.fromJson(item)).toList();

    var rawWd = json['withdrawals'] as List? ?? [];
    List<WithdrawalHistoryModel> wdList =
        rawWd.map((item) => WithdrawalHistoryModel.fromJson(item)).toList();

    return AgentWalletModel(
      walletId: json['wallet_id'] is int
          ? json['wallet_id']
          : int.tryParse(json['wallet_id']?.toString() ?? '0') ?? 0,
      balance: (json['balance'] is num) ? (json['balance'] as num).toDouble() : 0.0,
      balanceFormatted: json['balance_formatted'] ?? '₦0.00',
      totalEarned:
          (json['total_earned'] is num) ? (json['total_earned'] as num).toDouble() : 0.0,
      totalEarnedFormatted: json['total_earned_formatted'] ?? '₦0.00',
      pendingWithdrawalAmount: (json['pending_withdrawal_amount'] is num)
          ? (json['pending_withdrawal_amount'] as num).toDouble()
          : 0.0,
      pendingWithdrawalFormatted: json['pending_withdrawal_formatted'] ?? '₦0.00',
      bankDetails: json['bank_details'] != null
          ? AgentBankDetailsModel.fromJson(json['bank_details'])
          : AgentBankDetailsModel(
              bankName: 'Access Bank Plc',
              accountNumber: '0182947192',
              accountName: 'Field Agent',
              isConfigured: true,
            ),
      transactions: txList,
      withdrawals: wdList,
    );
  }
}
