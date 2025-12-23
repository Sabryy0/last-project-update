import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'screens/splash_screen.dart';
import 'screens/onboarding_screen.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/home_screen.dart';
import 'screens/tasks_screen.dart';   
import 'screens/status_screen.dart';  
import 'screens/rewards_screen.dart'; 
import 'screens/redeem_screen.dart';  
import 'screens/settings_screen.dart' as settings_screen;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Family Hub',
      theme: ThemeData(
        useMaterial3: true,
        primaryColor: const Color(0xFF43A047),
        scaffoldBackgroundColor: const Color(0xFFE8F6EF),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          centerTitle: true,
        ),
        textTheme: GoogleFonts.poppinsTextTheme(),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const SplashScreen(),
        '/onboarding': (context) => const OnboardingScreen(),
        '/login': (context) => const LoginScreen(),
        '/signup': (context) => const SignUpScreen(),
        '/dashboard': (context) => const FamilyDashboardScreen(),
        '/home': (context) => const HomeScreen(),
        '/tasks': (context) => const TasksScreen(),
        '/status': (context) => const StatusScreen(),
        '/rewards': (context) => const RewardsScreen(),
        '/redeem': (context) => const RedeemScreen(),
        '/settings': (context) => settings_screen.SettingsScreen(),
      },
    );
  }
}
