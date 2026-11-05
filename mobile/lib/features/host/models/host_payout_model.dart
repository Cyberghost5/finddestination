class BankDetailsModel {
  final String bankName;
  final String accountNumber;
  final String accountName;
  final String? bankCode;
  final bool isConfigured;

  BankDetailsModel({
    required this.bankName,
    required this.accountNumber,
    required this.accountName,
    this.bankCode,
    required this.isConfigured,
  });

  factory BankDetailsModel.fromJson(Map<String, dynamic> json) {
    return BankDetailsModel(
      bankName: json['bank_name'] ?? 'Access Bank Plc',
      accountNumber: json['account_number'] ?? '',
      accountName: json['account_name'] ?? '',
      bankCode: json['bank_code'],
      isConfigured: json['is_configured'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'bank_name': bankName,
      'account_number': accountNumber,
      'account_name': accountName,
      'bank_code': bankCode,
    };
  }
}

class PayoutTransactionModel {
  final int id;
  final String reference;
  final double amount;
  final String amountFormatted;
  final String bankName;
  final String accountNumber;
  final String accountName;
  final String status;
  final String? adminNote;
  final String requestedAt;
  final String? processedAt;

  PayoutTransactionModel({
    required this.id,
    required this.reference,
    required this.amount,
    required this.amountFormatted,
    required this.bankName,
    required this.accountNumber,
    required this.accountName,
    required this.status,
    this.adminNote,
    required this.requestedAt,
    this.processedAt,
  });

  factory PayoutTransactionModel.fromJson(Map<String, dynamic> json) {
    return PayoutTransactionModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      reference: json['reference'] ?? '',
      amount: (json['amount'] is num) ? (json['amount'] as num).toDouble() : 0.0,
      amountFormatted: json['amount_formatted'] ?? '₦0.00',
      bankName: json['bank_name'] ?? '',
      accountNumber: json['account_number'] ?? '',
      accountName: json['account_name'] ?? '',
      status: json['status'] ?? 'pending',
      adminNote: json['admin_note'],
      requestedAt: json['requested_at'] ?? '',
      processedAt: json['processed_at'],
    );
  }
}

class HostPayoutModel {
  final int walletId;
  final double balance;
  final String balanceFormatted;
  final double totalEarned;
  final String totalEarnedFormatted;
  final double pendingPayoutAmount;
  final String pendingPayoutFormatted;
  final BankDetailsModel bankDetails;
  final List<PayoutTransactionModel> payouts;

  HostPayoutModel({
    required this.walletId,
    required this.balance,
    required this.balanceFormatted,
    required this.totalEarned,
    required this.totalEarnedFormatted,
    required this.pendingPayoutAmount,
    required this.pendingPayoutFormatted,
    required this.bankDetails,
    required this.payouts,
  });

  factory HostPayoutModel.fromJson(Map<String, dynamic> json) {
    var rawPayouts = json['payouts'] as List? ?? [];
    List<PayoutTransactionModel> payoutsList =
        rawPayouts.map((item) => PayoutTransactionModel.fromJson(item)).toList();

    return HostPayoutModel(
      walletId: json['wallet_id'] is int
          ? json['wallet_id']
          : int.tryParse(json['wallet_id']?.toString() ?? '0') ?? 0,
      balance: (json['balance'] is num) ? (json['balance'] as num).toDouble() : 0.0,
      balanceFormatted: json['balance_formatted'] ?? '₦0.00',
      totalEarned:
          (json['total_earned'] is num) ? (json['total_earned'] as num).toDouble() : 0.0,
      totalEarnedFormatted: json['total_earned_formatted'] ?? '₦0.00',
      pendingPayoutAmount: (json['pending_payout_amount'] is num)
          ? (json['pending_payout_amount'] as num).toDouble()
          : 0.0,
      pendingPayoutFormatted: json['pending_payout_formatted'] ?? '₦0.00',
      bankDetails: json['bank_details'] != null
          ? BankDetailsModel.fromJson(json['bank_details'])
          : BankDetailsModel(
              bankName: 'Access Bank Plc',
              accountNumber: '0182947192',
              accountName: 'Host Partner',
              isConfigured: true,
            ),
      payouts: payoutsList,
    );
  }
}

class HostBookingModel {
  final String id;
  final int dbId;
  final String guestName;
  final String guestEmail;
  final String guestPhone;
  final String property;
  final String room;
  final String dates;
  final String amount;
  final String payoutStatus;
  final String rail;
  final String createdAt;

  HostBookingModel({
    required this.id,
    required this.dbId,
    required this.guestName,
    required this.guestEmail,
    required this.guestPhone,
    required this.property,
    required this.room,
    required this.dates,
    required this.amount,
    required this.payoutStatus,
    required this.rail,
    required this.createdAt,
  });

  factory HostBookingModel.fromJson(Map<String, dynamic> json) {
    return HostBookingModel(
      id: json['id']?.toString() ?? '',
      dbId: json['db_id'] is int
          ? json['db_id']
          : int.tryParse(json['db_id']?.toString() ?? '0') ?? 0,
      guestName: json['guestName'] ?? 'Guest Traveler',
      guestEmail: json['guestEmail'] ?? '',
      guestPhone: json['guestPhone'] ?? '',
      property: json['property'] ?? 'FindDestination Property',
      room: json['room'] ?? 'Executive Suite',
      dates: json['dates'] ?? '',
      amount: json['amount'] ?? '₦0.00',
      payoutStatus: json['payoutStatus'] ?? 'Escrow Held',
      rail: json['rail'] ?? 'Direct Transfer',
      createdAt: json['created_at'] ?? '',
    );
  }
}
