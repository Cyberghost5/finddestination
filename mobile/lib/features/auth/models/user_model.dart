class UserModel {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String role; // 'guest', 'host', 'agent', 'admin'
  final String? businessName;
  final String? cacNumber;
  final String? hostApprovalStatus;
  final bool isEmailVerified;
  final bool onboardingCompleted;
  final String? firstName;
  final String? lastName;
  final String? dob;
  final bool isActive;
  final String? createdAt;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.role,
    this.businessName,
    this.cacNumber,
    this.hostApprovalStatus,
    this.isEmailVerified = false,
    this.onboardingCompleted = false,
    this.firstName,
    this.lastName,
    this.dob,
    this.isActive = true,
    this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      role: json['role'] ?? 'guest',
      businessName: json['business_name'],
      cacNumber: json['cac_number'],
      hostApprovalStatus: json['host_approval_status'],
      isEmailVerified: json['email_verified_at'] != null,
      onboardingCompleted: json['onboarding_completed'] == true || json['onboarding_completed'] == 1,
      firstName: json['first_name'],
      lastName: json['last_name'],
      dob: json['dob'],
      isActive: json['is_active'] != false && json['is_active'] != 0,
      createdAt: json['created_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role,
      'business_name': businessName,
      'cac_number': cacNumber,
      'host_approval_status': hostApprovalStatus,
      'email_verified_at': isEmailVerified ? 'verified' : null,
      'onboarding_completed': onboardingCompleted,
      'first_name': firstName,
      'last_name': lastName,
      'dob': dob,
      'is_active': isActive,
      'created_at': createdAt,
    };
  }

  UserModel copyWith({
    int? id,
    String? name,
    String? email,
    String? phone,
    String? role,
    String? businessName,
    String? cacNumber,
    String? hostApprovalStatus,
    bool? isEmailVerified,
    bool? onboardingCompleted,
    String? firstName,
    String? lastName,
    String? dob,
    bool? isActive,
    String? createdAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      businessName: businessName ?? this.businessName,
      cacNumber: cacNumber ?? this.cacNumber,
      hostApprovalStatus: hostApprovalStatus ?? this.hostApprovalStatus,
      isEmailVerified: isEmailVerified ?? this.isEmailVerified,
      onboardingCompleted: onboardingCompleted ?? this.onboardingCompleted,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      dob: dob ?? this.dob,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
