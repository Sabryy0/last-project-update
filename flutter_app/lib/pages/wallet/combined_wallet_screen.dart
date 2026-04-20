import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:app_frontend/core/services/api_service.dart';
import 'package:app_frontend/core/widgets/app_bottom_nav.dart';

class CombinedWalletScreen extends StatefulWidget {
  const CombinedWalletScreen({super.key});

  @override
  State<CombinedWalletScreen> createState() => _CombinedWalletScreenState();
}

class _CombinedWalletScreenState extends State<CombinedWalletScreen>
    with SingleTickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  final PageController _cardController = PageController(viewportFraction: 0.92);

  late TabController _tabController;

  bool _isLoading = true;
  bool _isParent = false;

  List<dynamic> _members = [];
  String? _selectedMemberId;
  String? _selectedMemberMail;

  Map<String, dynamic> _balance = {};
  List<Map<String, dynamic>> _transactions = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _cardController.dispose();
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      _isParent = await _apiService.isParent();
      final currentMemberId = await _apiService.getCurrentMemberId();
      final currentMemberMail = await _apiService.getCurrentMemberMail();

      if (_isParent) {
        _members = await _apiService.getAllMembers();
        final children = _members.where((m) {
          final type = (m['member_type_id'] is Map)
              ? (m['member_type_id']['type'] ?? '').toString()
              : '';
          return type != 'Parent';
        }).toList();

        if (children.isNotEmpty) {
          final selected = children.firstWhere(
            (m) => m['_id']?.toString() == _selectedMemberId,
            orElse: () => children.first,
          );
          _selectedMemberId = selected['_id']?.toString();
          _selectedMemberMail = selected['mail']?.toString();
        } else {
          _selectedMemberId = currentMemberId;
          _selectedMemberMail = currentMemberMail;
        }
      } else {
        _selectedMemberId = currentMemberId;
        _selectedMemberMail = currentMemberMail;
      }

      final balance = await _apiService.getCombinedBalance(memberId: _selectedMemberId);
      final pointHistory = _isParent && _selectedMemberMail != null
          ? await _apiService.getMemberPointHistory(_selectedMemberMail!)
          : await _apiService.getMyPointHistory();

      setState(() {
        _balance = balance;
        _transactions = _buildCombinedTransactions(pointHistory, balance);
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to load wallet data: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  List<Map<String, dynamic>> _buildCombinedTransactions(
    List<dynamic> pointHistory,
    Map<String, dynamic> balance,
  ) {
    final conversionRate = _pointsToMoneyRate(balance);
    final list = <Map<String, dynamic>>[];

    for (final raw in pointHistory) {
      if (raw is! Map<String, dynamic>) continue;
      final reason = (raw['reason_type'] ?? '').toString();
      final description = (raw['description'] ?? 'Points update').toString();
      final pointsAmount = (raw['points_amount'] ?? 0).toDouble();
      final createdAt = DateTime.tryParse((raw['createdAt'] ?? '').toString());

      final isPositive = pointsAmount >= 0;
      final isConversion = reason == 'conversion';

      list.add({
        'kind': isConversion ? 'conversion' : 'points',
        'title': description,
        'subtitle': isConversion ? 'Points conversion' : 'Points activity',
        'amountText': '${isPositive ? '+' : '-'}${pointsAmount.abs().toStringAsFixed(0)} pts',
        'isPositive': isPositive,
        'date': createdAt,
      });

      // Synthetic money-side record for conversions so users can see both wallet impacts.
      if (isConversion) {
        final moneyEquivalent = pointsAmount.abs() * conversionRate;
        final moneyPositive = pointsAmount < 0;
        list.add({
          'kind': 'money',
          'title': description,
          'subtitle': 'Money side (conversion)',
          'amountText': '${moneyPositive ? '+' : '-'}${moneyEquivalent.toStringAsFixed(2)} EGP',
          'isPositive': moneyPositive,
          'date': createdAt,
        });
      }
    }

    list.sort((a, b) {
      final da = (a['date'] as DateTime?) ?? DateTime.fromMillisecondsSinceEpoch(0);
      final db = (b['date'] as DateTime?) ?? DateTime.fromMillisecondsSinceEpoch(0);
      return db.compareTo(da);
    });

    return list;
  }

  Future<void> _openConversionSheet({required bool moneyToPoints}) async {
    final moneyBalance = (_balance['money_balance'] ?? 0).toDouble();
    final pointsBalance = (_balance['points_balance'] ?? 0).toDouble();

    final maxValue = moneyToPoints ? moneyBalance : pointsBalance;
    if (maxValue <= 0) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(moneyToPoints
              ? 'No money available to convert.'
              : 'No points available to convert.'),
        ),
      );
      return;
    }

    double sliderValue = math.min(maxValue, maxValue > 1 ? 1 : maxValue);

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final m2p = _moneyToPointsRate(_balance);
            final p2m = _pointsToMoneyRate(_balance);
            final converted = moneyToPoints
                ? sliderValue * m2p
                : sliderValue * p2m;

            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    moneyToPoints ? 'Convert Money to Points' : 'Convert Points to Money',
                    style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Current rate: 1 EGP = ${m2p.toStringAsFixed(2)} points, 1 point = ${p2m.toStringAsFixed(2)} EGP',
                    style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[700]),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    moneyToPoints
                        ? "You'll get ${converted.toStringAsFixed(2)} points for ${sliderValue.toStringAsFixed(2)} EGP"
                        : "You'll get ${converted.toStringAsFixed(2)} EGP for ${sliderValue.toStringAsFixed(2)} points",
                    style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 12),
                  Slider(
                    value: sliderValue,
                    min: 0,
                    max: maxValue,
                    divisions: 100,
                    label: sliderValue.toStringAsFixed(2),
                    onChanged: (v) => setModalState(() => sliderValue = v),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1B5E20),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      onPressed: () async {
                        final ok = await showDialog<bool>(
                              context: context,
                              builder: (ctx) => AlertDialog(
                                title: const Text('Confirm Conversion'),
                                content: Text(
                                  moneyToPoints
                                      ? 'Convert ${sliderValue.toStringAsFixed(2)} EGP to ${converted.toStringAsFixed(2)} points?'
                                      : 'Convert ${sliderValue.toStringAsFixed(2)} points to ${converted.toStringAsFixed(2)} EGP?',
                                ),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(ctx, false),
                                    child: const Text('Cancel'),
                                  ),
                                  ElevatedButton(
                                    onPressed: () => Navigator.pop(ctx, true),
                                    child: const Text('Confirm'),
                                  ),
                                ],
                              ),
                            ) ??
                            false;

                        if (!ok) return;

                        try {
                          if (moneyToPoints) {
                            await _apiService.convertMoneyToPoints(sliderValue);
                          } else {
                            await _apiService.convertPointsToMoney(sliderValue);
                          }
                          if (!mounted) return;
                          Navigator.pop(context);
                          await _loadData();
                          if (!mounted) return;
                          ScaffoldMessenger.of(this.context).showSnackBar(
                            const SnackBar(content: Text('Conversion completed successfully.')),
                          );
                        } catch (e) {
                          if (!mounted) return;
                          ScaffoldMessenger.of(this.context).showSnackBar(
                            SnackBar(content: Text('Conversion failed: $e'), backgroundColor: Colors.red),
                          );
                        }
                      },
                      child: const Text('Confirm'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  double _moneyToPointsRate(Map<String, dynamic> balance) {
    final r = balance['conversionRate'];
    if (r is Map && r['money_to_points_rate'] != null) {
      return (r['money_to_points_rate'] as num).toDouble();
    }
    return 10;
  }

  double _pointsToMoneyRate(Map<String, dynamic> balance) {
    final r = balance['conversionRate'];
    if (r is Map && r['points_to_money_rate'] != null) {
      return (r['points_to_money_rate'] as num).toDouble();
    }
    return 0.05;
  }

  String _dateLabel(DateTime? date) {
    if (date == null) return 'Unknown';
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final moneyBalance = (_balance['money_balance'] ?? 0).toDouble();
    final pointsBalance = (_balance['points_balance'] ?? 0).toDouble();
    final totalValueMoney = (_balance['total_value_in_money'] ?? 0).toDouble();

    final lifetimePointsEarned = _transactions
        .where((tx) => tx['kind'] != 'money' && (tx['isPositive'] == true))
        .fold<double>(0, (sum, tx) {
      final text = (tx['amountText'] ?? '').toString().replaceAll(RegExp(r'[^0-9.]'), '');
      return sum + (double.tryParse(text) ?? 0);
    });

    final lifetimeMoneySaved = _transactions
        .where((tx) => tx['kind'] == 'money' && (tx['isPositive'] == true))
        .fold<double>(0, (sum, tx) {
      final text = (tx['amountText'] ?? '').toString().replaceAll(RegExp(r'[^0-9.]'), '');
      return sum + (double.tryParse(text) ?? 0);
    });

    return Scaffold(
      backgroundColor: const Color(0xFFF2F7F3),
      appBar: AppBar(
        title: Text(
          'Combined Wallet',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w700),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      bottomNavigationBar: const AppBottomNav(selectedIndex: 3),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  if (_isParent && _members.isNotEmpty) _buildChildSelector(),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 230,
                    child: PageView(
                      controller: _cardController,
                      children: [
                        _buildMoneyCard(moneyBalance, lifetimeMoneySaved),
                        _buildPointsCard(pointsBalance, lifetimePointsEarned),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildCombinedValue(totalValueMoney),
                  const SizedBox(height: 16),
                  _buildQuickActions(),
                  const SizedBox(height: 16),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        TabBar(
                          controller: _tabController,
                          labelColor: const Color(0xFF1B5E20),
                          unselectedLabelColor: Colors.grey,
                          indicatorColor: const Color(0xFF1B5E20),
                          tabs: const [
                            Tab(text: 'Recent Transactions'),
                            Tab(text: 'Conversion'),
                          ],
                        ),
                        SizedBox(
                          height: 360,
                          child: TabBarView(
                            controller: _tabController,
                            children: [
                              _buildRecentTransactions(),
                              _buildConversionPanel(),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildChildSelector() {
    final children = _members.where((m) {
      final type = (m['member_type_id'] is Map)
          ? (m['member_type_id']['type'] ?? '').toString()
          : '';
      return type != 'Parent';
    }).toList();

    if (children.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _selectedMemberId,
          isExpanded: true,
          hint: const Text('Select child'),
          items: children.map<DropdownMenuItem<String>>((member) {
            return DropdownMenuItem<String>(
              value: member['_id']?.toString(),
              child: Text((member['username'] ?? member['mail'] ?? 'Member').toString()),
            );
          }).toList(),
          onChanged: (value) async {
            if (value == null) return;
            final selected = children.firstWhere((m) => m['_id']?.toString() == value);
            setState(() {
              _selectedMemberId = value;
              _selectedMemberMail = selected['mail']?.toString();
            });
            await _loadData();
          },
        ),
      ),
    );
  }

  Widget _buildMoneyCard(double moneyBalance, double lifetimeMoneySaved) {
    return Container(
      margin: const EdgeInsets.only(right: 10),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0D47A1), Color(0xFF1976D2)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Money Wallet', style: GoogleFonts.poppins(color: Colors.white70)),
          const SizedBox(height: 4),
          Text(
            '${moneyBalance.toStringAsFixed(2)} EGP',
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontSize: 30,
              fontWeight: FontWeight.w800,
            ),
          ),
          Text(
            'Total saved lifetime: ${lifetimeMoneySaved.toStringAsFixed(2)} EGP',
            style: GoogleFonts.poppins(color: Colors.white70, fontSize: 12),
          ),
          const Spacer(),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              if (_isParent)
                _cardButton(
                  'Add Money',
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Add money flow will be connected next.')),
                    );
                  },
                ),
              _cardButton('Convert to Points', onTap: () => _openConversionSheet(moneyToPoints: true)),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildPointsCard(double pointsBalance, double lifetimePointsEarned) {
    return Container(
      margin: const EdgeInsets.only(left: 10),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1B5E20), Color(0xFF43A047)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Points Wallet', style: GoogleFonts.poppins(color: Colors.white70)),
          const SizedBox(height: 4),
          Text(
            '${pointsBalance.toStringAsFixed(0)} pts',
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontSize: 30,
              fontWeight: FontWeight.w800,
            ),
          ),
          Text(
            'Lifetime points earned: ${lifetimePointsEarned.toStringAsFixed(0)}',
            style: GoogleFonts.poppins(color: Colors.white70, fontSize: 12),
          ),
          const Spacer(),
          _cardButton('Convert to Money', onTap: () => _openConversionSheet(moneyToPoints: false)),
        ],
      ),
    );
  }

  Widget _cardButton(String text, {required VoidCallback onTap}) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0,
      ),
      onPressed: onTap,
      child: Text(text, style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 12)),
    );
  }

  Widget _buildCombinedValue(double totalValueMoney) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF263238),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Total Value',
            style: GoogleFonts.poppins(color: Colors.white70, fontSize: 15),
          ),
          Text(
            '${totalValueMoney.toStringAsFixed(2)} EGP',
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Row(
      children: [
        Expanded(
          child: _quickAction(
            icon: Icons.swap_horiz,
            label: 'Transfer',
            onTap: () => _tabController.animateTo(1),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _quickAction(
            icon: Icons.remove_circle_outline,
            label: 'Add Spending',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Spending flow will be connected next.')),
              );
            },
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _quickAction(
            icon: Icons.history,
            label: 'View History',
            onTap: () => _tabController.animateTo(0),
          ),
        ),
      ],
    );
  }

  Widget _quickAction({required IconData icon, required String label, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, color: const Color(0xFF1B5E20)),
            const SizedBox(height: 6),
            Text(label, style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentTransactions() {
    if (_transactions.isEmpty) {
      return Center(
        child: Text(
          'No transactions yet',
          style: GoogleFonts.poppins(color: Colors.grey[600]),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: _transactions.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final tx = _transactions[index];
        final kind = (tx['kind'] ?? 'points').toString();
        final isPositive = tx['isPositive'] == true;
        final color = isPositive ? Colors.green : Colors.red;

        final iconText = kind == 'money'
            ? '💰'
            : kind == 'conversion'
                ? '🔄'
                : '⭐';

        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Row(
            children: [
              Text(iconText, style: const TextStyle(fontSize: 20)),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      (tx['title'] ?? 'Transaction').toString(),
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 13),
                    ),
                    Text(
                      (tx['subtitle'] ?? '').toString(),
                      style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey[600]),
                    ),
                    Text(
                      _dateLabel(tx['date'] as DateTime?),
                      style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey[500]),
                    ),
                  ],
                ),
              ),
              Text(
                (tx['amountText'] ?? '').toString(),
                style: GoogleFonts.poppins(color: color, fontWeight: FontWeight.w700),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildConversionPanel() {
    final m2p = _moneyToPointsRate(_balance);
    final p2m = _pointsToMoneyRate(_balance);
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Conversion Rate',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          Text('1 EGP = ${m2p.toStringAsFixed(2)} points', style: GoogleFonts.poppins()),
          Text('1 point = ${p2m.toStringAsFixed(2)} EGP', style: GoogleFonts.poppins()),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => _openConversionSheet(moneyToPoints: true),
              icon: const Icon(Icons.arrow_upward),
              label: const Text('Convert Money to Points'),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => _openConversionSheet(moneyToPoints: false),
              icon: const Icon(Icons.arrow_downward),
              label: const Text('Convert Points to Money'),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Note: money transaction rows currently include conversion-side records and point history. A dedicated wallet-transaction feed can be added when backend endpoint is exposed.',
            style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }
}
