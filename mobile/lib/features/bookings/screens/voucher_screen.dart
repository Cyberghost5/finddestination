import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../../core/constants/app_colors.dart';
import '../../chat/providers/chat_provider.dart';
import '../../chat/screens/conversation_screen.dart';
import '../../common/widgets/custom_button.dart';
import '../models/booking_model.dart';
import '../providers/booking_provider.dart';
import 'order_tracker_screen.dart';

class VoucherScreen extends StatefulWidget {
  final BookingModel booking;

  const VoucherScreen({super.key, required this.booking});

  @override
  State<VoucherScreen> createState() => _VoucherScreenState();
}

class _VoucherScreenState extends State<VoucherScreen> {
  bool _isSendingEmail = false;

  void _shareVoucher() {
    final b = widget.booking;
    final message = '''
FINDDESTINATION STAY VOUCHER
Ref: ${b.bookingReference}
Property: ${b.propertyName} (${b.propertyCity}, ${b.propertyState})
Room: ${b.roomName}
Check-in: ${b.checkInDate} (From 2:00 PM)
Check-out: ${b.checkOutDate} (Until 12:00 PM)
Guest: ${b.guestName}
Status: CONFIRMED (Escrow Protected)
Total Paid: ${b.totalAmountFormatted}
Show this voucher reference at the front desk upon check-in.
''';
    Share.share(message, subject: 'FindDestination Voucher - ${b.bookingReference}');
  }

  Future<void> _generatePdfAndDownload() async {
    final b = widget.booking;
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return pw.Container(
            padding: const pw.EdgeInsets.all(32),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                // Header
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text(
                          'FindDestination',
                          style: pw.TextStyle(
                            fontSize: 26,
                            fontWeight: pw.FontWeight.bold,
                            color: PdfColor.fromHex('008753'),
                          ),
                        ),
                        pw.Text(
                          'Verified Lodging Voucher & Check-in Pass',
                          style: const pw.TextStyle(fontSize: 12, color: PdfColors.grey700),
                        ),
                      ],
                    ),
                    pw.Container(
                      padding: const pw.EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: pw.BoxDecoration(
                        color: PdfColor.fromHex('D1FAE5'),
                        borderRadius: pw.BorderRadius.circular(16),
                      ),
                      child: pw.Text(
                        'CONFIRMED & ESCROW PROTECTED',
                        style: pw.TextStyle(
                          color: PdfColor.fromHex('008753'),
                          fontWeight: pw.FontWeight.bold,
                          fontSize: 10,
                        ),
                      ),
                    ),
                  ],
                ),
                pw.SizedBox(height: 24),
                pw.Divider(color: PdfColors.grey300),
                pw.SizedBox(height: 16),

                // Booking Ref & Guest
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('BOOKING REFERENCE', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey600)),
                        pw.Text(b.bookingReference, style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
                      ],
                    ),
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.end,
                      children: [
                        pw.Text('LEAD GUEST', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey600)),
                        pw.Text(b.guestName, style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold)),
                      ],
                    ),
                  ],
                ),

                pw.SizedBox(height: 20),

                // Hotel Details
                pw.Container(
                  padding: const pw.EdgeInsets.all(16),
                  decoration: pw.BoxDecoration(
                    color: PdfColor.fromHex('F8FAFC'),
                    borderRadius: pw.BorderRadius.circular(10),
                    border: pw.Border.all(color: PdfColors.grey300),
                  ),
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text(b.propertyName, style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold)),
                      pw.SizedBox(height: 4),
                      pw.Text('${b.propertyAddress ?? b.propertyName}, ${b.propertyCity}, ${b.propertyState}', style: const pw.TextStyle(fontSize: 12, color: PdfColors.grey700)),
                      pw.SizedBox(height: 12),
                      pw.Row(
                        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                        children: [
                          pw.Text('Room Tier: ${b.roomName}', style: const pw.TextStyle(fontSize: 12)),
                          pw.Text('Rooms: ${b.roomsCount}', style: const pw.TextStyle(fontSize: 12)),
                          pw.Text('Nights: ${b.totalNights}', style: const pw.TextStyle(fontSize: 12)),
                        ],
                      ),
                    ],
                  ),
                ),

                pw.SizedBox(height: 20),

                // Schedule
                pw.Row(
                  children: [
                    pw.Expanded(
                      child: pw.Container(
                        padding: const pw.EdgeInsets.all(12),
                        decoration: pw.BoxDecoration(border: pw.Border.all(color: PdfColors.grey300)),
                        child: pw.Column(
                          crossAxisAlignment: pw.CrossAxisAlignment.start,
                          children: [
                            pw.Text('CHECK-IN DATE', style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey600)),
                            pw.Text(b.checkInDate, style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold)),
                            pw.Text('From 2:00 PM', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey700)),
                          ],
                        ),
                      ),
                    ),
                    pw.SizedBox(width: 12),
                    pw.Expanded(
                      child: pw.Container(
                        padding: const pw.EdgeInsets.all(12),
                        decoration: pw.BoxDecoration(border: pw.Border.all(color: PdfColors.grey300)),
                        child: pw.Column(
                          crossAxisAlignment: pw.CrossAxisAlignment.start,
                          children: [
                            pw.Text('CHECK-OUT DATE', style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey600)),
                            pw.Text(b.checkOutDate, style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold)),
                            pw.Text('Until 12:00 PM', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey700)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),

                pw.SizedBox(height: 24),

                // Payment Summary
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('Total Settlement Amount (Paid via Escrow):', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                    pw.Text(b.totalAmountFormatted, style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold, color: PdfColor.fromHex('008753'))),
                  ],
                ),

                pw.Spacer(),

                // Verification barcode / QR footer
                pw.Center(
                  child: pw.Column(
                    children: [
                      pw.BarcodeWidget(
                        barcode: pw.Barcode.code128(),
                        data: b.bookingReference,
                        width: 200,
                        height: 50,
                      ),
                      pw.SizedBox(height: 6),
                      pw.Text(
                        'Present this digital barcode pass at the front desk upon arrival for guaranteed room key release.',
                        textAlign: pw.TextAlign.center,
                        style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey600),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdf.save(),
      name: 'FindDestination-Voucher-${b.bookingReference}.pdf',
    );
  }

  void _sendVoucherEmail() async {
    setState(() => _isSendingEmail = true);
    final bookingProvider = context.read<BookingProvider>();

    final success = await bookingProvider.sendVoucherEmail(
      bookingReference: widget.booking.bookingReference,
      email: widget.booking.guestEmail,
    );

    if (!mounted) return;
    setState(() => _isSendingEmail = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Voucher sent successfully to ${widget.booking.guestEmail}'),
          backgroundColor: AppColors.success,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to dispatch voucher email. Please try downloading the PDF instead.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final b = widget.booking;

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9), // Slate 100
      appBar: AppBar(
        title: const Text('Stay Voucher Pass'),
        backgroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.share2, size: 20),
            onPressed: _shareVoucher,
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            children: [
              // 1. TICKET CARD with Circular Notches & Perforation
              ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.08),
                        blurRadius: 18,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      // Upper Ticket Section: Hotel Branding & Ref
                      Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(6),
                                      decoration: BoxDecoration(
                                        color: AppColors.primary,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Icon(LucideIcons.hotel, size: 16, color: Colors.white),
                                    ),
                                    const SizedBox(width: 8),
                                    const Text(
                                      'FindDestination',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.dark,
                                        letterSpacing: -0.5,
                                      ),
                                    ),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.successBg,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: const Row(
                                    children: [
                                      Icon(LucideIcons.shieldCheck, size: 12, color: AppColors.success),
                                      SizedBox(width: 4),
                                      Text(
                                        'CONFIRMED',
                                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.success),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 18),

                            const Text(
                              'BOOKING REFERENCE',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.textSecondary, letterSpacing: 1),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              b.bookingReference,
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                                color: AppColors.dark,
                                letterSpacing: 1.5,
                              ),
                            ),

                            const SizedBox(height: 16),

                            // Property Name & Room
                            Text(
                              b.propertyName,
                              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.dark),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${b.propertyCity}, ${b.propertyState} • ${b.roomName}',
                              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                            ),

                            const SizedBox(height: 16),

                            // Guest & Dates Grid
                            Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: AppColors.background,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text('CHECK-IN', style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                                        const SizedBox(height: 2),
                                        Text(b.checkInDate, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark)),
                                        const Text('From 2:00 PM', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                                      ],
                                    ),
                                  ),
                                  Container(width: 1, height: 36, color: AppColors.border),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text('CHECK-OUT', style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                                        const SizedBox(height: 2),
                                        Text(b.checkOutDate, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark)),
                                        const Text('Until 12:00 PM', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Perforated Notched Cutouts Divider
                      SizedBox(
                        height: 28,
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            // Dashed Divider line
                            Positioned.fill(
                              child: Center(
                                child: LayoutBuilder(
                                  builder: (context, constraints) {
                                    return Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: List.generate(
                                        (constraints.constrainWidth() / 10).floor(),
                                        (_) => const SizedBox(
                                          width: 5,
                                          height: 1.5,
                                          child: DecoratedBox(
                                            decoration: BoxDecoration(color: AppColors.border),
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ),
                            ),
                            // Left Notch
                            Positioned(
                              left: -14,
                              child: Container(
                                width: 28,
                                height: 28,
                                decoration: const BoxDecoration(
                                  color: Color(0xFFF1F5F9), // Same as scaffold background
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ),
                            // Right Notch
                            Positioned(
                              right: -14,
                              child: Container(
                                width: 28,
                                height: 28,
                                decoration: const BoxDecoration(
                                  color: Color(0xFFF1F5F9), // Same as scaffold background
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Lower Ticket Section: QR Code & Check-in Details
                      Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('LEAD GUEST', style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                                    Text(b.guestName, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark)),
                                  ],
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    const Text('TOTAL PAID (ESCROW)', style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                                    Text(b.totalAmountFormatted, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primary)),
                                  ],
                                ),
                              ],
                            ),

                            const SizedBox(height: 18),

                            // QR Placeholder & Scan Note
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Column(
                                children: [
                                  const Icon(LucideIcons.qrCode, size: 84, color: AppColors.dark),
                                  const SizedBox(height: 6),
                                  Text(
                                    b.bookingReference,
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 2, color: AppColors.dark),
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 12),
                            const Text(
                              'Present this QR voucher or reference at hotel reception upon arrival.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // 2. ACTION BUTTONS (Download PDF, Chat with Host, Email Voucher, Track)
              CustomButton(
                text: 'Download Official PDF Voucher',
                icon: const Icon(LucideIcons.download, size: 18, color: Colors.white),
                onPressed: _generatePdfAndDownload,
              ),

              const SizedBox(height: 12),

              CustomButton(
                text: 'Chat with Host Directly',
                isOutlined: true,
                icon: const Icon(LucideIcons.messageSquare, size: 18, color: AppColors.primary),
                textColor: AppColors.primary,
                onPressed: () async {
                  final chatProvider = context.read<ChatProvider>();
                  final thread = await chatProvider.startBookingChat(
                    bookingReference: b.bookingReference,
                    propertyId: b.propertyId,
                  );
                  if (!mounted) return;
                  if (thread != null) {
                    Navigator.push(
                      this.context,
                      MaterialPageRoute(builder: (_) => ConversationScreen(thread: thread)),
                    );
                  }
                },
              ),

              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _isSendingEmail ? null : _sendVoucherEmail,
                      icon: _isSendingEmail
                          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Icon(LucideIcons.mail, size: 16, color: AppColors.dark),
                      label: Text(_isSendingEmail ? 'Sending...' : 'Email Voucher'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        side: const BorderSide(color: AppColors.border),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => OrderTrackerScreen(initialReference: b.bookingReference),
                          ),
                        );
                      },
                      icon: const Icon(LucideIcons.activity, size: 16, color: AppColors.primary),
                      label: const Text('Track Order', style: TextStyle(color: AppColors.primary)),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        side: const BorderSide(color: AppColors.primary),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
