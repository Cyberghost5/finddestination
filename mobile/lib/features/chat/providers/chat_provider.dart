import 'package:flutter/material.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../models/chat_models.dart';

class ChatProvider extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  List<ChatThreadModel> _threads = [];
  List<ChatMessageModel> _activeMessages = [];
  ChatThreadModel? _activeThread;

  bool _isLoadingThreads = false;
  bool _isLoadingMessages = false;
  bool _isSending = false;
  String? _errorMessage;

  List<ChatThreadModel> get threads => _threads;
  List<ChatMessageModel> get activeMessages => _activeMessages;
  ChatThreadModel? get activeThread => _activeThread;

  bool get isLoadingThreads => _isLoadingThreads;
  bool get isLoadingMessages => _isLoadingMessages;
  bool get isSending => _isSending;
  String? get errorMessage => _errorMessage;

  int get totalUnreadCount =>
      _threads.fold(0, (sum, t) => sum + t.unreadCount);

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  void setActiveThread(ChatThreadModel? thread) {
    _activeThread = thread;
    _activeMessages = [];
    notifyListeners();
  }

  /// Retrieve all user conversation threads
  Future<void> fetchThreads({bool notify = true}) async {
    _isLoadingThreads = true;
    if (notify) notifyListeners();

    try {
      final response = await _apiClient.get(ApiConstants.chats);

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        if (data['status'] == 'success' && data['data'] is List) {
          _threads = (data['data'] as List)
              .map((t) => ChatThreadModel.fromJson(t))
              .toList();
        }
      }
    } catch (e) {
      _errorMessage = 'Could not load messages: $e';
    } finally {
      _isLoadingThreads = false;
      if (notify) notifyListeners();
    }
  }

  /// Retrieve messages for an active thread and mark as read
  Future<void> fetchMessages(int threadId, {bool notify = true}) async {
    _isLoadingMessages = true;
    if (notify) notifyListeners();

    try {
      final response = await _apiClient.get('${ApiConstants.chats}/$threadId/messages');

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        if (data['status'] == 'success' && data['data']?['messages'] is List) {
          _activeMessages = (data['data']['messages'] as List)
              .map((m) => ChatMessageModel.fromJson(m))
              .toList();

          // Reset unread count locally for this thread
          final threadIdx = _threads.indexWhere((t) => t.id == threadId);
          if (threadIdx != -1) {
            final t = _threads[threadIdx];
            _threads[threadIdx] = ChatThreadModel(
              id: t.id,
              type: t.type,
              title: t.title,
              otherParty: t.otherParty,
              property: t.property,
              booking: t.booking,
              latestMessage: t.latestMessage,
              unreadCount: 0,
              lastMessageAt: t.lastMessageAt,
            );
          }
        }
      }
    } catch (e) {
      _errorMessage = 'Could not load conversation: $e';
    } finally {
      _isLoadingMessages = false;
      if (notify) notifyListeners();
    }
  }

  /// Send a message in thread
  Future<bool> sendMessage(int threadId, String messageText) async {
    final cleanText = messageText.trim();
    if (cleanText.isEmpty) return false;

    _isSending = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        '${ApiConstants.chats}/$threadId/messages',
        data: {'message': cleanText},
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final newMsgJson = response.data?['data'];
        if (newMsgJson != null) {
          final newMsg = ChatMessageModel.fromJson(newMsgJson);
          _activeMessages.add(newMsg);
        } else {
          // Fallback refresh messages
          await fetchMessages(threadId, notify: false);
        }
        // Refresh threads list in background
        fetchThreads(notify: false);
        return true;
      } else {
        _errorMessage = response.data?['message'] ?? 'Failed to send message';
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isSending = false;
      notifyListeners();
    }
  }

  /// Start or open chat for a booking or property
  Future<ChatThreadModel?> startBookingChat({
    String? bookingReference,
    int? propertyId,
  }) async {
    _isLoadingThreads = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.post(
        ApiConstants.startBookingChat,
        data: {
          if (bookingReference != null) 'booking_reference': bookingReference,
          if (propertyId != null) 'property_id': propertyId,
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final threadId = response.data?['data']?['thread_id'];
        await fetchThreads(notify: false);

        if (threadId != null) {
          final found = _threads.firstWhere(
            (t) => t.id == threadId,
            orElse: () => _threads.isNotEmpty ? _threads.first : throw Exception('Thread not found'),
          );
          _activeThread = found;
          return found;
        }
        return _threads.isNotEmpty ? _threads.first : null;
      } else {
        _errorMessage = response.data?['message'] ?? 'Could not start conversation';
        return null;
      }
    } catch (e) {
      _errorMessage = e.toString();
      return null;
    } finally {
      _isLoadingThreads = false;
      notifyListeners();
    }
  }

  /// Open universal FindDestination Support Desk
  Future<ChatThreadModel?> openSupportChat() async {
    _isLoadingThreads = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.post(ApiConstants.supportChat);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final threadId = response.data?['data']?['thread_id'];
        await fetchThreads(notify: false);

        if (threadId != null) {
          final found = _threads.firstWhere(
            (t) => t.id == threadId,
            orElse: () => _threads.isNotEmpty ? _threads.first : throw Exception('Thread not found'),
          );
          _activeThread = found;
          return found;
        }
        return _threads.isNotEmpty ? _threads.first : null;
      } else {
        _errorMessage = response.data?['message'] ?? 'Could not connect to support desk';
        return null;
      }
    } catch (e) {
      _errorMessage = e.toString();
      return null;
    } finally {
      _isLoadingThreads = false;
      notifyListeners();
    }
  }
}
