import 'package:flutter/material.dart';

/// Professional responsive sizing using MediaQuery
/// No external dependencies needed!
/// Uses intelligent scaling with constraints to prevent over-scaling
/// 
/// Usage:
/// ```dart
/// import 'responsive.dart';
/// 
/// // Responsive width (percentage of screen)
/// width: Responsive.width(context, 100),  // 100% of screen width
/// width: Responsive.width(context, 50),   // 50% of screen width
/// 
/// // Responsive height (percentage of screen)
/// height: Responsive.height(context, 50),  // 50% of screen height
/// 
/// // Responsive font size (intelligent scaling with constraints)
/// fontSize: Responsive.fontSize(context, 18),
/// 
/// // Responsive spacing (intelligent scaling)
/// padding: Responsive.spacing(context, 16),
/// ```

class Responsive {
  // Design reference size (iPhone standard)
  static const double _designWidth = 375;
  static const double _designHeight = 812;
  
  /// Get screen width
  static double screenWidth(BuildContext context) {
    return MediaQuery.of(context).size.width;
  }

  /// Get screen height
  static double screenHeight(BuildContext context) {
    return MediaQuery.of(context).size.height;
  }

  /// Get responsive width (percentage-based)
  /// Example: Responsive.width(context, 50) = 50% of screen width
  static double width(BuildContext context, double percentage) {
    return screenWidth(context) * (percentage / 100);
  }

  /// Get responsive height (percentage-based)
  static double height(BuildContext context, double percentage) {
    return screenHeight(context) * (percentage / 100);
  }

  /// Responsive font size with intelligent scaling
  /// Scales smoothly but with constraints to prevent over-scaling
  /// On mobile: uses 1:1 size, on tablets: caps at 1.2x, on desktop: caps at 1.5x
  static double fontSize(BuildContext context, double baseSize) {
    double screenWidth = MediaQuery.of(context).size.width;
    
    if (screenWidth < 600) {
      // Mobile: use as-is (no scaling)
      return baseSize;
    } else if (screenWidth < 1200) {
      // Tablet: gentle scaling up to 1.2x
      double scaleFactor = 1 + ((screenWidth - 600) / (600)) * 0.2;
      return baseSize * scaleFactor;
    } else {
      // Desktop: cap at 1.5x
      return baseSize * 1.5;
    }
  }

  /// Responsive spacing (icons, margins, padding)
  /// Uses the same intelligent algorithm as fontSize
  static double spacing(BuildContext context, double baseSpacing) {
    double screenWidth = MediaQuery.of(context).size.width;
    
    if (screenWidth < 600) {
      // Mobile: use as-is
      return baseSpacing;
    } else if (screenWidth < 1200) {
      // Tablet: gentle scaling up to 1.2x
      double scaleFactor = 1 + ((screenWidth - 600) / (600)) * 0.2;
      return baseSpacing * scaleFactor;
    } else {
      // Desktop: cap at 1.5x
      return baseSpacing * 1.5;
    }
  }

  /// Check device type
  static bool isMobile(BuildContext context) {
    return screenWidth(context) < 600;
  }

  static bool isTablet(BuildContext context) {
    return screenWidth(context) >= 600 && screenWidth(context) < 1200;
  }

  static bool isDesktop(BuildContext context) {
    return screenWidth(context) >= 1200;
  }

  /// Get device orientation
  static bool isLandscape(BuildContext context) {
    return MediaQuery.of(context).orientation == Orientation.landscape;
  }

  static bool isPortrait(BuildContext context) {
    return MediaQuery.of(context).orientation == Orientation.portrait;
  }

  /// Device padding (safe area)
  static EdgeInsets devicePadding(BuildContext context) {
    return MediaQuery.of(context).padding;
  }

  /// Device view insets (keyboard, etc)
  static EdgeInsets viewInsets(BuildContext context) {
    return MediaQuery.of(context).viewInsets;
  }
}

/// Common responsive values
class AppSize {
  // Spacing
  static double xs(BuildContext context) => Responsive.spacing(context, 4);
  static double sm(BuildContext context) => Responsive.spacing(context, 8);
  static double md(BuildContext context) => Responsive.spacing(context, 16);
  static double lg(BuildContext context) => Responsive.spacing(context, 24);
  static double xl(BuildContext context) => Responsive.spacing(context, 32);
  static double xxl(BuildContext context) => Responsive.spacing(context, 48);

  // Font sizes
  static double h1(BuildContext context) => Responsive.fontSize(context, 32);
  static double h2(BuildContext context) => Responsive.fontSize(context, 28);
  static double h3(BuildContext context) => Responsive.fontSize(context, 24);
  static double h4(BuildContext context) => Responsive.fontSize(context, 20);
  static double bodyLarge(BuildContext context) => Responsive.fontSize(context, 16);
  static double bodyMedium(BuildContext context) => Responsive.fontSize(context, 14);
  static double bodySmall(BuildContext context) => Responsive.fontSize(context, 12);
  static double caption(BuildContext context) => Responsive.fontSize(context, 10);

  // Button heights
  static double buttonSmall(BuildContext context) => Responsive.height(context, 4);
  static double buttonMedium(BuildContext context) => Responsive.height(context, 6);
  static double buttonLarge(BuildContext context) => Responsive.height(context, 8);
}

/// Padding helper
class AppPadding {
  static EdgeInsets all(BuildContext context, double size) {
    return EdgeInsets.all(Responsive.spacing(context, size));
  }

  static EdgeInsets symmetric(BuildContext context, {double horizontal = 16, double vertical = 16}) {
    return EdgeInsets.symmetric(
      horizontal: Responsive.spacing(context, horizontal),
      vertical: Responsive.spacing(context, vertical),
    );
  }

  static EdgeInsets only(
    BuildContext context, {
    double left = 0,
    double top = 0,
    double right = 0,
    double bottom = 0,
  }) {
    return EdgeInsets.only(
      left: Responsive.spacing(context, left),
      top: Responsive.spacing(context, top),
      right: Responsive.spacing(context, right),
      bottom: Responsive.spacing(context, bottom),
    );
  }
}

/// Border radius helper
class AppRadius {
  static BorderRadius circular(BuildContext context, double radius) {
    return BorderRadius.circular(Responsive.spacing(context, radius));
  }

  static BorderRadius xs(BuildContext context) => circular(context, 4);
  static BorderRadius sm(BuildContext context) => circular(context, 8);
  static BorderRadius md(BuildContext context) => circular(context, 12);
  static BorderRadius lg(BuildContext context) => circular(context, 16);
  static BorderRadius xl(BuildContext context) => circular(context, 20);
  static BorderRadius full(BuildContext context) => circular(context, 100);
}
