import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../models/chat_models.dart';
import '../providers/chat_provider.dart';
import 'conversation_screen.dart';

class InboxScreen extends StatefulWidget {
  const InboxScreen({super.key});

  @override
  State<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends State<InboxScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ChatProvider>().fetchThreads();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _openSupport(ChatProvider chatProvider) async {
    final thread = await chatProvider.openSupportChat();
    if (!mounted) return;

    if (thread != null) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => ConversationScreen(thread: thread)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final chatProvider = context.watch<ChatProvider>();
    final allThreads = chatProvider.threads;

    final filteredThreads = allThreads.where((t) {
      if (_searchQuery.isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      final matchName = t.otherParty.name.toLowerCase().contains(q);
      final matchProp = t.property?.name.toLowerCase().contains(q) ?? false;
      final matchRef = t.booking?.reference.toLowerCase().contains(q) ?? false;
      return matchName || matchProp || matchRef;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => chatProvider.fetchThreads(),
          child: Column(
            children: [
              // Top Header
              Padding(
                padding: const EdgeInsets.only(left: 20, right: 20, top: 16, bottom: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Messages',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: AppColors.dark,
                            letterSpacing: -0.5,
                          ),
                        ),
                        Text(
                          chatProvider.totalUnreadCount > 0
                              ? '${chatProvider.totalUnreadCount} unread message${chatProvider.totalUnreadCount == 1 ? '' : 's'}'
                              : 'Real-time host and support conversations',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: chatProvider.totalUnreadCount > 0 ? FontWeight.w700 : FontWeight.w500,
                            color: chatProvider.totalUnreadCount > 0 ? AppColors.primary : AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(LucideIcons.refreshCw, size: 18),
                      onPressed: chatProvider.isLoadingThreads
                          ? null
                          : () => chatProvider.fetchThreads(),
                    ),
                  ],
                ),
              ),

              // 24/7 Escrow Support Desk Pinned Banner
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: InkWell(
                  onTap: () => _openSupport(chatProvider),
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppColors.primary.withValues(alpha: 0.12),
                          AppColors.primaryLight.withValues(alpha: 0.5),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(LucideIcons.headset, color: Colors.white, size: 20),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'FindDestination Care Desk',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.dark,
                                ),
                              ),
                              SizedBox(height: 2),
                              Text(
                                '24/7 Escrow & Booking Help',
                                style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                          ),
                          child: const Row(
                            children: [
                              Text('Chat Now', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primary)),
                              SizedBox(width: 4),
                              Icon(LucideIcons.chevronRight, size: 12, color: AppColors.primary),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Search Filter Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      const Icon(LucideIcons.search, size: 16, color: AppColors.textMuted),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          onChanged: (val) => setState(() => _searchQuery = val.trim()),
                          style: const TextStyle(fontSize: 13),
                          decoration: const InputDecoration(
                            hintText: 'Search chats, hosts, or booking refs...',
                            hintStyle: TextStyle(fontSize: 13, color: AppColors.textMuted),
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding: EdgeInsets.symmetric(vertical: 10),
                          ),
                        ),
                      ),
                      if (_searchQuery.isNotEmpty)
                        IconButton(
                          icon: const Icon(LucideIcons.x, size: 14),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                          },
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 6),

              // Thread List
              Expanded(
                child: chatProvider.isLoadingThreads && allThreads.isEmpty
                    ? const Center(child: CircularProgressIndicator())
                    : filteredThreads.isEmpty
                        ? _buildEmptyState(chatProvider)
                        : ListView.separated(
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                            itemCount: filteredThreads.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 10),
                            itemBuilder: (ctx, index) {
                              final thread = filteredThreads[index];
                              return _buildThreadTile(thread);
                            },
                          ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildThreadTile(ChatThreadModel thread) {
    final other = thread.otherParty;
    final latest = thread.latestMessage;
    final hasUnread = thread.unreadCount > 0;
    final isSupport = thread.type == 'support';

    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ConversationScreen(thread: thread),
          ),
        );
      },
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: hasUnread ? AppColors.primary.withValues(alpha: 0.4) : AppColors.border,
            width: hasUnread ? 1.5 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              offset: const Offset(0, 2),
              blurRadius: 6,
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Avatar
            Stack(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: isSupport
                      ? AppColors.primary
                      : AppColors.gold.withValues(alpha: 0.2),
                  child: Icon(
                    isSupport ? LucideIcons.headset : LucideIcons.building,
                    color: isSupport ? Colors.white : AppColors.goldDark,
                    size: 22,
                  ),
                ),
                if (hasUnread)
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 14),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          other.name,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: hasUnread ? FontWeight.w900 : FontWeight.w700,
                            color: AppColors.dark,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (latest != null)
                        Text(
                          latest.time,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: hasUnread ? FontWeight.w700 : FontWeight.w500,
                            color: hasUnread ? AppColors.primary : AppColors.textMuted,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 3),

                  // Property or Reference pill
                  if (thread.property != null || thread.booking != null) ...[
                    Row(
                      children: [
                        if (thread.booking != null)
                          Container(
                            margin: const EdgeInsets.only(right: 6),
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                            decoration: BoxDecoration(
                              color: AppColors.background,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              thread.booking!.reference,
                              style: const TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w700,
                                fontFamily: 'monospace',
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        if (thread.property != null)
                          Expanded(
                            child: Text(
                              thread.property!.name,
                              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                  ],

                  // Message Preview & Unread Pill
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          latest?.text ?? 'No messages yet in conversation',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: hasUnread ? FontWeight.w700 : FontWeight.w400,
                            color: hasUnread ? AppColors.dark : AppColors.textSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (thread.unreadCount > 0)
                        Container(
                          margin: const EdgeInsets.only(left: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            '${thread.unreadCount}',
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(ChatProvider chatProvider) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(LucideIcons.messageSquare, size: 32, color: AppColors.primary),
            ),
            const SizedBox(height: 18),
            const Text(
              'No Messages Yet',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.dark),
            ),
            const SizedBox(height: 6),
            const Text(
              'When you book stays or message hosts, your conversations and stay support threads will appear here.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () => _openSupport(chatProvider),
              icon: const Icon(LucideIcons.headset, size: 16, color: Colors.white),
              label: const Text('Contact Escrow Support Desk', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
