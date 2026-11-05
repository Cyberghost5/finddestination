import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class RoleBadge extends StatelessWidget {
  final String role;
  final bool isSmall;

  const RoleBadge({
    super.key,
    required this.role,
    this.isSmall = false,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;
    String label;

    switch (role.toLowerCase()) {
      case 'host':
        bg = AppColors.goldLight;
        text = AppColors.goldDark;
        label = 'Host';
        break;
      case 'agent':
        bg = AppColors.infoBg;
        text = AppColors.info;
        label = 'Field Agent';
        break;
      case 'admin':
        bg = const Color(0xFFF3E8FF);
        text = const Color(0xFF7E22CE);
        label = 'Admin';
        break;
      case 'guest':
      default:
        bg = AppColors.successBg;
        text = AppColors.primary;
        label = 'Guest';
        break;
    }

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 8 : 10,
        vertical: isSmall ? 2 : 4,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: text,
          fontSize: isSmall ? 10 : 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
