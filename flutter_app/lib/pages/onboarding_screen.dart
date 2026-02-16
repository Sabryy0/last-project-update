import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/styling/responsive.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _controller = PageController();
  int _currentIndex = 0;

  final List<Map<String, dynamic>> _pages = [
    {
      'title': 'Welcome to Family Hub',
      'subtitle': 'Your seamless solution for managing\nfamily life, together',
      'icon': Icons.family_restroom,
    },
    {
      'title': 'Stay Organized, Together',
      'subtitle': 'Manage tasks, chores and schedules with ease.\nEveryone knows their role',
      'icon': Icons.checklist,
    },
    {
      'title': 'Connect & Communicate',
      'subtitle': 'Share moments, send messages, and stay\nin sync instantly',
      'icon': Icons.chat_bubble_outline,
    },
    {
      'title': 'Rewards & Recognition',
      'subtitle': 'Earn points for completed tasks and\nredeem exciting rewards',
      'icon': Icons.emoji_events,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE8F5E9),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          TextButton(
            onPressed: () => Navigator.pushReplacementNamed(context, '/login'),
            child: Text(
              'Skip',
              style: GoogleFonts.poppins(color: const Color(0xFF388E3C), fontSize: Responsive.fontSize(context, 16)),
            ),
          ),
          SizedBox(width: Responsive.spacing(context, 16)),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: PageView.builder(
              controller: _controller,
              onPageChanged: (index) => setState(() => _currentIndex = index),
              itemCount: _pages.length,
              itemBuilder: (context, index) {
                return Padding(
                  padding: EdgeInsets.all(Responsive.spacing(context, 24)),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Illustration
                      Container(
                        height: Responsive.spacing(context, 250),
                        width: Responsive.spacing(context, 250),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.green.withOpacity(0.1),
                              blurRadius: Responsive.spacing(context, 30),
                              spreadRadius: Responsive.spacing(context, 10),
                            ),
                          ],
                        ),
                        child: Icon(
                          _pages[index]['icon'] as IconData,
                          size: Responsive.fontSize(context, 100),
                          color: const Color(0xFF388E3C),
                        ),
                      ),
                      SizedBox(height: Responsive.spacing(context, 50)),
                      Text(
                        _pages[index]['title']!,
                        textAlign: TextAlign.center,
                        style: GoogleFonts.poppins(
                          fontSize: Responsive.fontSize(context, 24),
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF2E3E33),
                        ),
                      ),
                      SizedBox(height: Responsive.spacing(context, 16)),
                      Text(
                        _pages[index]['subtitle']!,
                        textAlign: TextAlign.center,
                        style: GoogleFonts.poppins(
                          fontSize: Responsive.fontSize(context, 14),
                          color: Colors.grey[600],
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          // Indicators
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(
              _pages.length,
              (index) => AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: EdgeInsets.symmetric(horizontal: Responsive.spacing(context, 4)),
                height: Responsive.spacing(context, 4),
                width: _currentIndex == index ? Responsive.spacing(context, 40) : Responsive.spacing(context, 20),
                decoration: BoxDecoration(
                  color: _currentIndex == index
                      ? const Color(0xFF388E3C)
                      : Colors.grey[300],
                  borderRadius: BorderRadius.circular(Responsive.spacing(context, 2)),
                ),
              ),
            ),
          ),
          SizedBox(height: Responsive.spacing(context, 32)),
          // Next Button
          Padding(
            padding: EdgeInsets.symmetric(horizontal: Responsive.spacing(context, 24), vertical: Responsive.spacing(context, 24)),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  if (_currentIndex == _pages.length - 1) {
                    Navigator.pushReplacementNamed(context, '/login');
                  } else {
                    _controller.nextPage(
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4CAF50),
                  padding: EdgeInsets.symmetric(vertical: Responsive.spacing(context, 16)),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(Responsive.spacing(context, 12)),
                  ),
                ),
                child: Text(
                  _currentIndex == _pages.length - 1 ? 'Get Started' : 'Next',
                  style: GoogleFonts.poppins(
                    fontSize: Responsive.fontSize(context, 16),
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
