import 'package:intl/intl.dart';

class CurrencyFormatter {
  static final NumberFormat _nairaFormat = NumberFormat('#,##0', 'en_US');

  /// Formats kobo amount (NGN * 100) into ₦ standard representation
  static String formatKobo(dynamic amountKobo) {
    if (amountKobo == null) return '₦0';
    final int kobo = (amountKobo is num) ? amountKobo.toInt() : (int.tryParse(amountKobo.toString()) ?? 0);
    final int naira = (kobo / 100).round();
    return '₦${_nairaFormat.format(naira)}';
  }

  /// Formats naira integer directly
  static String formatNaira(dynamic amountNaira) {
    if (amountNaira == null) return '₦0';
    final int naira = (amountNaira is num) ? amountNaira.toInt() : (int.tryParse(amountNaira.toString()) ?? 0);
    return '₦${_nairaFormat.format(naira)}';
  }
}
