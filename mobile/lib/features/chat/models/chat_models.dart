class ChatOtherParty {
  final String name;
  final String role;
  final String? email;
  final String? phone;
  final String? avatar;
  final String badge;

  ChatOtherParty({
    required this.name,
    required this.role,
    this.email,
    this.phone,
    this.avatar,
    required this.badge,
  });

  factory ChatOtherParty.fromJson(Map<String, dynamic> json) {
    return ChatOtherParty(
      name: json['name'] ?? 'User',
      role: json['role'] ?? 'Participant',
      email: json['email'],
      phone: json['phone'],
      avatar: json['avatar'],
      badge: json['badge'] ?? 'Participant',
    );
  }
}

class ChatPropertyContext {
  final int id;
  final String name;
  final String city;
  final String state;
  final String coverImage;

  ChatPropertyContext({
    required this.id,
    required this.name,
    required this.city,
    required this.state,
    required this.coverImage,
  });

  factory ChatPropertyContext.fromJson(Map<String, dynamic> json) {
    return ChatPropertyContext(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      name: json['name'] ?? 'FindDestination Property',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      coverImage: json['cover_image'] ?? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    );
  }
}

class ChatBookingContext {
  final String reference;
  final String? checkIn;
  final String? checkOut;
  final String status;

  ChatBookingContext({
    required this.reference,
    this.checkIn,
    this.checkOut,
    required this.status,
  });

  factory ChatBookingContext.fromJson(Map<String, dynamic> json) {
    return ChatBookingContext(
      reference: json['reference'] ?? '',
      checkIn: json['check_in'],
      checkOut: json['check_out'],
      status: json['status'] ?? 'confirmed',
    );
  }
}

class ChatLatestMessage {
  final int id;
  final String text;
  final String senderRole;
  final bool isMe;
  final String time;

  ChatLatestMessage({
    required this.id,
    required this.text,
    required this.senderRole,
    required this.isMe,
    required this.time,
  });

  factory ChatLatestMessage.fromJson(Map<String, dynamic> json) {
    return ChatLatestMessage(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      text: json['text'] ?? '',
      senderRole: json['sender_role'] ?? 'user',
      isMe: json['is_me'] ?? false,
      time: json['time'] ?? '',
    );
  }
}

class ChatThreadModel {
  final int id;
  final String type; // 'booking', 'support', 'direct'
  final String title;
  final ChatOtherParty otherParty;
  final ChatPropertyContext? property;
  final ChatBookingContext? booking;
  final ChatLatestMessage? latestMessage;
  final int unreadCount;
  final String lastMessageAt;

  ChatThreadModel({
    required this.id,
    required this.type,
    required this.title,
    required this.otherParty,
    this.property,
    this.booking,
    this.latestMessage,
    required this.unreadCount,
    required this.lastMessageAt,
  });

  factory ChatThreadModel.fromJson(Map<String, dynamic> json) {
    return ChatThreadModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      type: json['type'] ?? 'direct',
      title: json['title'] ?? 'Conversation',
      otherParty: json['other_party'] != null
          ? ChatOtherParty.fromJson(json['other_party'])
          : ChatOtherParty(
              name: 'Participant',
              role: 'User',
              badge: 'Participant',
            ),
      property: json['property'] != null
          ? ChatPropertyContext.fromJson(json['property'])
          : null,
      booking: json['booking'] != null
          ? ChatBookingContext.fromJson(json['booking'])
          : null,
      latestMessage: json['latest_message'] != null
          ? ChatLatestMessage.fromJson(json['latest_message'])
          : null,
      unreadCount: json['unread_count'] is int
          ? json['unread_count']
          : int.tryParse(json['unread_count']?.toString() ?? '0') ?? 0,
      lastMessageAt: json['last_message_at'] ?? '',
    );
  }
}

class ChatMessageModel {
  final int id;
  final int senderId;
  final String senderName;
  final String senderRole;
  final bool isMe;
  final String text;
  final bool isRead;
  final String time;
  final String date;
  final String createdAt;

  ChatMessageModel({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.senderRole,
    required this.isMe,
    required this.text,
    required this.isRead,
    required this.time,
    required this.date,
    required this.createdAt,
  });

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) {
    return ChatMessageModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      senderId: json['sender_id'] is int
          ? json['sender_id']
          : int.tryParse(json['sender_id']?.toString() ?? '0') ?? 0,
      senderName: json['sender_name'] ?? 'User',
      senderRole: json['sender_role'] ?? 'guest',
      isMe: json['is_me'] ?? false,
      text: json['text'] ?? '',
      isRead: json['is_read'] ?? false,
      time: json['time'] ?? '',
      date: json['date'] ?? '',
      createdAt: json['created_at'] ?? '',
    );
  }
}
