import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Main layout structure
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Header Section
              _buildHeader(),
              const SizedBox(height: 24),

              // 2. Family Members Section
              const Text(
                'Mahmoud Family',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2E3E33),
                ),
              ),
              const SizedBox(height: 12),
              _buildFamilyMembersScroll(),
              const SizedBox(height: 24),

              // 3. Quick Actions Card
              const Text(
                'Quick Actions',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2E3E33),
                ),
              ),
              const SizedBox(height: 12),
              _buildQuickActionsCard(),
              const SizedBox(height: 24),

              // 4. Upcoming Activities
              const Text(
                'Upcoming Activites',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2E3E33),
                ),
              ),
              const SizedBox(height: 12),
              _buildUpcomingActivitiesSection(),
              const SizedBox(height: 24),

              // 5. Safety & Connection
              const Text(
                'Safety & Connection',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2E3E33),
                ),
              ),
              const SizedBox(height: 12),
              _buildSafetySection(),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNavigationBar(context),
    );
  }

  // --- Helper Widgets to maintain structure ---

  Widget _buildHeader() {
    return Row(
      children: [
        // Avatar
        Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFF43A047), width: 2),
            image: const DecorationImage(
              // Placeholder for the cartoon avatar
              image: NetworkImage('https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671142.jpg'),
              fit: BoxFit.cover,
            ),
          ),
        ),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Mahmoud Family',
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF2E3E33),
              ),
            ),
            Text(
              'Welcome Home, Boss',
              style: GoogleFonts.poppins(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
          ],
        )
      ],
    );
  }

  Widget _buildFamilyMembersScroll() {
    // Static data to match screenshot
    final members = [
      {'label': 'Parent', 'isAdd': true},
      {'label': 'Mother', 'isAdd': false},
      {'label': 'Child', 'isAdd': false},
      {'label': 'Child', 'isAdd': false},
      {'label': 'Child', 'isAdd': false},
      {'label': 'Child', 'isAdd': false},
    ];

    return SizedBox(
      height: 90,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: members.length,
        separatorBuilder: (context, index) => const SizedBox(width: 16),
        itemBuilder: (context, index) {
          final isAdd = members[index]['isAdd'] as bool;
          final label = members[index]['label'] as String;
          return Column(
            children: [
              Stack(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFFD0E8D4), // Light green circle
                      border: Border.all(color: const Color(0xFF8ABF92)),
                    ),
                  ),
                  if (isAdd)
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: const BoxDecoration(
                          color: Color(0xFF43A047),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.add, color: Colors.white, size: 12),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                label,
                style: GoogleFonts.poppins(fontSize: 12, color: const Color(0xFF555555)),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildQuickActionsCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFE0F2E4), // Slightly darker mint than bg
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Left Column
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.home_outlined, color: Color(0xFF388E3C)),
                      const SizedBox(width: 8),
                      Text(
                        'Family Focus',
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF388E3C),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      const Icon(Icons.home_outlined, size: 16, color: Colors.grey),
                      const SizedBox(width: 8),
                      SizedBox(
                        width: 140,
                        child: LinearProgressIndicator(
                          value: 0.7,
                          backgroundColor: Colors.grey[300],
                          color: const Color(0xFF388E3C),
                          minHeight: 4,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Weekly Chores Complete: 70%',
                    style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey[600]),
                  ),
                ],
              ),
              // Right Column (Circle Indicator)
              Column(
                children: [
                  SizedBox(
                    width: 50,
                    height: 50,
                    child: CircularProgressIndicator(
                      value: 0.8,
                      strokeWidth: 4,
                      color: const Color(0xFF388E3C),
                      backgroundColor: Colors.grey[300],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Pending Invites (1)',
                    style: GoogleFonts.poppins(
                        fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey[700]),
                  ),
                  Text(
                    'Awaiting acceptance',
                    style: GoogleFonts.poppins(fontSize: 9, color: Colors.grey[500]),
                  ),
                ],
              )
            ],
          ),
          const SizedBox(height: 20),
          // Buttons Row
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF388E3C)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: Text(
                    'Set Family Title',
                    style: GoogleFonts.poppins(color: const Color(0xFF388E3C), fontSize: 12),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF388E3C),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: Text(
                    'View Family Hub',
                    style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                  ),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildUpcomingActivitiesSection() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Calendar Placeholder (Left)
        Container(
          width: 110,
          height: 120,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFFA5D6A7), Color(0xFF81C784)],
            ),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Simplified calendar grid visual
                const Icon(Icons.calendar_today, color: Colors.white24, size: 40),
                const SizedBox(height: 4),
                Text('Calendar', style: GoogleFonts.poppins(color: Colors.white, fontSize: 10))
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        // Tasks List (Right)
        Expanded(
          child: Column(
            children: [
              _buildTaskCard(
                icon: Icons.description_outlined,
                title: 'Requirments Gathering',
                subtitle: 'Mon, 6pm',
              ),
              const SizedBox(height: 10),
              _buildTaskCard(
                icon: Icons.home_outlined,
                title: 'Family Movie Night',
                subtitle: 'Fri, 6pm',
              ),
            ],
          ),
        )
      ],
    );
  }

  Widget _buildTaskCard({required IconData icon, required String title, required String subtitle}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F8F6), // Very light green/white
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFDcedC8),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: const Color(0xFF558B2F), size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.poppins(
                      fontSize: 11, fontWeight: FontWeight.w600, color: const Color(0xFF2E3E33)),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  subtitle,
                  style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey),
                ),
              ],
            ),
          ),
          Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              border: Border.all(color: const Color(0xFF388E3C), width: 1.5),
              borderRadius: BorderRadius.circular(4),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildSafetySection() {
    return Column(
      children: [
        _buildToggleTile(Icons.location_on_outlined, 'Location Sharing On', 'App Access Control', true),
        const SizedBox(height: 12),
        _buildToggleTile(Icons.lock_outline, 'View Protection Setting', '', false),
      ],
    );
  }

  Widget _buildToggleTile(IconData icon, String title, String subtitle, bool isActive) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF5FBF6),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: const BoxDecoration(
              color: Color(0xFF43A047),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.poppins(
                      fontSize: 13, fontWeight: FontWeight.w500, color: const Color(0xFF2E3E33)),
                ),
                if (subtitle.isNotEmpty)
                  Text(
                    subtitle,
                    style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey),
                  ),
              ],
            ),
          ),
          Switch(
            value: isActive,
            onChanged: (val) {},
            activeThumbColor: Colors.white,
            activeTrackColor: const Color(0xFF81C784),
            inactiveThumbColor: Colors.white,
            inactiveTrackColor: Colors.grey[300],
          )
        ],
      ),
    );
  }

  Widget _buildBottomNavigationBar(BuildContext context) {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      currentIndex: 0,
      selectedItemColor: const Color(0xFF43A047),
      unselectedItemColor: Colors.grey,
      onTap: (index) {
        if (index == 0) return; // already on Home
        if (index == 1) {
          Navigator.pushReplacementNamed(context, '/dashboard');
        } else {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Feature coming soon')));
        }
      },
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: 'Home'),
        BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
        BottomNavigationBarItem(icon: Icon(Icons.calendar_today_outlined), label: 'Schedule'),
        BottomNavigationBarItem(icon: Icon(Icons.chat_bubble_outline), label: 'Chat'),
        BottomNavigationBarItem(icon: Icon(Icons.settings_outlined), label: 'Settings'),
      ],
    );
  }

  // legacy: individual nav item builder removed in favor of BottomNavigationBar
}
