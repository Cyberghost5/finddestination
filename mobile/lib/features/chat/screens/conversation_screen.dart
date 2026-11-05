import 'dart:async';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../models/chat_models.dart';
import '../providers/chat_provider.dart';

class ConversationScreen extends StatefulWidget {
  final ChatThreadModel thread;

  const ConversationScreen({super.key, required this.thread});

  @override
  State<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends State<ConversationScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  Timer? _pollingTimer;

  static const List<String> _quickReplies = [
    'What is the check-in time?',
    'Is 24/7 power backup on right now?',
    'Where is the main security gate entrance?',
    'Please confirm my reservation voucher.',
    'Thank you so much!',
  ];

  @override
  void initState() {
    super.initState();
    final chatProvider = context.read<ChatProvider>();
    chatProvider.setActiveThread(widget.thread);
    chatProvider.fetchMessages(widget.thread.id);

    // Auto-poll every 4 seconds for real-time conversation updates
    _pollingTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (mounted) {
        context.read<ChatProvider>().fetchMessages(widget.thread.id, notify: false);
      }
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _handleSend() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    _messageController.clear();
    final chatProvider = context.read<ChatProvider>();
    final success = await chatProvider.sendMessage(widget.thread.id, text);

    if (success) {
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    final chatProvider = context.watch<ChatProvider>();
    final messages = chatProvider.activeMessages;
    final other = widget.thread.otherParty;
    final prop = widget.thread.property;
    final booking = widget.thread.booking;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        titleSpacing: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: AppColors.dark),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: widget.thread.type == 'support'
                  ? AppColors.primary
                  : AppColors.goldDark,
              child: Icon(
                widget.thread.type == 'support'
                    ? LucideIcons.headset
                    : LucideIcons.user,
                color: Colors.white,
                size: 18,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    other.name,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppColors.dark,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    other.role,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 12),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              other.badge,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: Column(
        children: [
          // Pinned Property / Booking Context Banner
          if (prop != null || booking != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border(bottom: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                children: [
                  if (prop != null)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: CachedNetworkImage(
                        imageUrl: prop.coverImage,
                        width: 40,
                        height: 40,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => Container(
                          width: 40,
                          height: 40,
                          color: AppColors.border,
                          child: const Icon(LucideIcons.building, size: 20),
                        ),
                      ),
                    ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (prop != null)
                          Text(
                            prop.name,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: AppColors.dark,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        Row(
                          children: [
                            if (booking != null) ...[
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.background,
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: Text(
                                  booking.reference,
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    fontFamily: 'monospace',
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 6),
                            ],
                            if (booking?.checkIn != null)
                              Text(
                                '${booking!.checkIn} - ${booking.checkOut ?? ''}',
                                style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

          // Messages View
          Expanded(
            child: chatProvider.isLoadingMessages && messages.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : messages.isEmpty
                    ? _buildEmptyConversation(other)
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                        itemCount: messages.length,
                        itemBuilder: (ctx, index) {
                          final msg = messages[index];
                          final showDateHeader = index == 0 ||
                              messages[index - 1].date != msg.date;

                          return Column(
                            crossAxisAlignment: msg.isMe
                                ? CrossAxisAlignment.end
                                : CrossAxisAlignment.start,
                            children: [
                              if (showDateHeader)
                                Center(
                                  child: Container(
                                    margin: const EdgeInsets.symmetric(vertical: 12),
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppColors.border.withValues(alpha: 0.5),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      msg.date,
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                  ),
                                ),
                              _buildMessageBubble(msg),
                            ],
                          );
                        },
                      ),
          ),

          // Quick Replies Chips
          Container(
            height: 38,
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _quickReplies.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (ctx, idx) {
                final text = _quickReplies[idx];
                return InkWell(
                  onTap: () {
                    _messageController.text = text;
                    _handleSend();
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Center(
                      child: Text(
                        text,
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // Message Input Bar
          Container(
            padding: EdgeInsets.only(
              left: 16,
              right: 16,
              top: 10,
              bottom: MediaQuery.of(context).viewInsets.bottom + 12,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  offset: const Offset(0, -2),
                  blurRadius: 8,
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: TextField(
                      controller: _messageController,
                      maxLines: 4,
                      minLines: 1,
                      textCapitalization: TextCapitalization.sentences,
                      decoration: const InputDecoration(
                        hintText: 'Type message...',
                        hintStyle: TextStyle(fontSize: 14, color: AppColors.textMuted),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.symmetric(vertical: 10),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                InkWell(
                  onTap: chatProvider.isSending ? null : _handleSend,
                  borderRadius: BorderRadius.circular(24),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: chatProvider.isSending
                        ? const Center(
                            child: SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            ),
                          )
                        : const Icon(LucideIcons.sendHorizontal, color: Colors.white, size: 18),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessageModel msg) {
    if (msg.isMe) {
      return Container(
        margin: const EdgeInsets.only(bottom: 8, left: 48),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.primary,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(18),
            topRight: Radius.circular(18),
            bottomLeft: Radius.circular(18),
            bottomRight: Radius.circular(4),
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.2),
              offset: const Offset(0, 2),
              blurRadius: 4,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              msg.text,
              style: const TextStyle(
                fontSize: 14,
                color: Colors.white,
                fontWeight: FontWeight.w500,
                height: 1.35,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  msg.time,
                  style: TextStyle(
                    fontSize: 10,
                    color: Colors.white.withValues(alpha: 0.75),
                  ),
                ),
                const SizedBox(width: 4),
                Icon(
                  LucideIcons.checkCheck,
                  size: 12,
                  color: Colors.white.withValues(alpha: 0.8),
                ),
              ],
            ),
          ],
        ),
      );
    } else {
      return Container(
        margin: const EdgeInsets.only(bottom: 8, right: 48),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(18),
            topRight: Radius.circular(18),
            bottomRight: Radius.circular(18),
            bottomLeft: Radius.circular(4),
          ),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              offset: const Offset(0, 2),
              blurRadius: 4,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  msg.senderName,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: AppColors.dark,
                  ),
                ),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    color: AppColors.infoBg,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    msg.senderRole.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.w800,
                      color: AppColors.info,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              msg.text,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.dark,
                fontWeight: FontWeight.w500,
                height: 1.35,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              msg.time,
              style: const TextStyle(
                fontSize: 10,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
      );
    }
  }

  Widget _buildEmptyConversation(ChatOtherParty other) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(LucideIcons.messageSquare, color: AppColors.primary, size: 28),
            ),
            const SizedBox(height: 16),
            Text(
              'Start conversation with ${other.name}',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: AppColors.dark,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Ask questions about check-in, road directions, amenities, or special requests.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
