import 'package:flutter/material.dart';

/// Shared bottom navigation bar used across all main screens.
///
/// Pass the current [selectedIndex] (0‑4) to highlight the active tab.
/// The navigation targets are:
///   0 → /home
///   1 → /dashboard
///   2 → Schedule (coming soon)
///   3 → Chat (coming soon)
///   4 → /settings
class AppBottomNav extends StatelessWidget {
  final int selectedIndex;
  const AppBottomNav({super.key, this.selectedIndex = 0});

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      currentIndex: selectedIndex,
      selectedItemColor: const Color(0xFF388E3C),
      unselectedItemColor: Colors.grey,
      showUnselectedLabels: true,
      onTap: (index) => _onTap(context, index),
      items: const [
        BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined), label: 'Home'),
        BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
        BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today_outlined), label: 'Schedule'),
        BottomNavigationBarItem(
            icon: Icon(Icons.chat_bubble_outline), label: 'Chat'),
        BottomNavigationBarItem(
            icon: Icon(Icons.settings_outlined), label: 'Settings'),
      ],
    );
  }

  void _onTap(BuildContext context, int index) {
    if (index == selectedIndex) return;
    switch (index) {
      case 0:
        Navigator.pushReplacementNamed(context, '/home');
        break;
      case 1:
        Navigator.pushReplacementNamed(context, '/dashboard');
        break;
      case 2:
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Schedule — Coming soon!')),
        );
        break;
      case 3:
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Chat — Coming soon!')),
        );
        break;
      case 4:
        Navigator.pushReplacementNamed(context, '/settings');
        break;
    }
  }
}
