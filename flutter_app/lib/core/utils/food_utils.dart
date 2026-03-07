import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../styling/app_color.dart';

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY ICON HELPER
// ─────────────────────────────────────────────────────────────────────────────

/// Returns an icon for a category based on its [title].
IconData getCategoryIcon(String title) {
  final lower = title.toLowerCase();
  if (lower.contains('fruit')) return Icons.apple;
  if (lower.contains('vegetable') || lower.contains('veggie')) return Icons.eco;
  if (lower.contains('meat') || lower.contains('poultry')) return Icons.set_meal;
  if (lower.contains('dairy') || lower.contains('milk')) return Icons.local_drink;
  if (lower.contains('grain') || lower.contains('bread') || lower.contains('bakery')) return Icons.bakery_dining;
  if (lower.contains('spice') || lower.contains('seasoning') || lower.contains('herb')) return Icons.grass;
  if (lower.contains('beverage') || lower.contains('drink') || lower.contains('juice')) return Icons.local_cafe;
  if (lower.contains('snack') || lower.contains('chip') || lower.contains('candy')) return Icons.cookie;
  if (lower.contains('frozen') || lower.contains('freezer')) return Icons.ac_unit;
  if (lower.contains('fridge') || lower.contains('refrigerat')) return Icons.kitchen;
  if (lower.contains('pantry')) return Icons.shelves;
  if (lower.contains('can') || lower.contains('canned')) return Icons.inventory;
  if (lower.contains('seafood') || lower.contains('fish')) return Icons.water;
  if (lower.contains('sauce') || lower.contains('condiment')) return Icons.local_dining;
  if (lower.contains('oil') || lower.contains('fat')) return Icons.opacity;
  if (lower.contains('supply') || lower.contains('suppli')) return Icons.shopping_bag;
  if (lower.contains('device') || lower.contains('appliance')) return Icons.devices;
  if (lower.contains('clean')) return Icons.cleaning_services;
  if (lower.contains('bathroom') || lower.contains('hygiene')) return Icons.bathroom;
  return Icons.category;
}

// ─────────────────────────────────────────────────────────────────────────────
// STOCK STATUS HELPER
// ─────────────────────────────────────────────────────────────────────────────

/// Whether the item quantity is at or below the threshold.
bool isLowStock(dynamic item) {
  final qty = item['quantity'];
  final threshold = item['threshold_quantity'] ?? 1;
  return qty is num && threshold is num && qty <= threshold;
}

/// Readable unit name from a populated unit record.
String getUnitName(dynamic item) {
  final unit = item['unit_id'];
  if (unit is Map) return unit['unit_name'] ?? '';
  return '';
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM DELETE DIALOG
// ─────────────────────────────────────────────────────────────────────────────

/// Shows a confirm dialog with [title] and [message]. Returns `true` when the
/// user presses the destructive button.
Future<bool> showConfirmDialog(
  BuildContext context, {
  required String title,
  required String message,
  String confirmLabel = 'Delete',
  Color confirmColor = Colors.red,
}) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text(title,
          style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
      content: Text(message, style: GoogleFonts.poppins()),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx, false),
          child: Text('Cancel', style: GoogleFonts.poppins()),
        ),
        ElevatedButton(
          onPressed: () => Navigator.pop(ctx, true),
          style: ElevatedButton.styleFrom(backgroundColor: confirmColor),
          child: Text(confirmLabel,
              style: const TextStyle(color: Colors.white)),
        ),
      ],
    ),
  );
  return result ?? false;
}

// ─────────────────────────────────────────────────────────────────────────────
// SNACK‑BAR HELPERS
// ─────────────────────────────────────────────────────────────────────────────

void showErrorSnack(BuildContext context, String message) {
  if (!context.mounted) return;
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(message),
      backgroundColor: Appcolor.error,
      behavior: SnackBarBehavior.floating,
    ),
  );
}

void showSuccessSnack(BuildContext context, String message) {
  if (!context.mounted) return;
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(message),
      backgroundColor: Appcolor.success,
      behavior: SnackBarBehavior.floating,
    ),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BREADCRUMB PATH BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/// Builds a full path string from the tree root to the given [category].
/// Expects a flat list of all [categories] where each has `_id` and
/// `parent_category_id` (which may be `null` or a Map with `_id`).
String buildCategoryPath(dynamic category, List<dynamic> allCategories) {
  final segments = <String>[];
  dynamic current = category;
  while (current != null) {
    segments.insert(0, current['title'] ?? '');
    final parentRef = current['parent_category_id'];
    String? parentId;
    if (parentRef is Map) {
      parentId = parentRef['_id']?.toString();
    } else if (parentRef is String) {
      parentId = parentRef;
    }
    if (parentId == null) break;
    current = allCategories.firstWhere(
        (c) => c['_id']?.toString() == parentId,
        orElse: () => null);
  }
  return segments.join(' › ');
}
