import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/services/api_service.dart';

class RedeemScreen extends StatefulWidget {
  const RedeemScreen({super.key});

  @override
  State<RedeemScreen> createState() => _RedeemScreenState();
}

class _RedeemScreenState extends State<RedeemScreen> {
  final ApiService _apiService = ApiService();

  bool _isParent = false;
  int _userPoints = 0;
  double _moneyBalance = 0;
  double _pointsToMoneyRate = 0.05;
  bool _isLoading = true;
  bool _initializedArgs = false;
  List<Map<String, dynamic>> _wishlistItems = [];
  List<Map<String, dynamic>> _pendingRedemptions = [];

  String? _prefillItemId;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_initializedArgs) return;
    _initializedArgs = true;

    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is Map && args['prefillItem'] is Map) {
      final prefillItem = Map<String, dynamic>.from(args['prefillItem']);
      _prefillItemId = prefillItem['_id']?.toString();
    }
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      _isParent = await _apiService.isParent();
      final wallet = await _apiService.getMyWallet();

      final memberId = await _apiService.getCurrentMemberId();
      if (memberId != null && memberId.isNotEmpty) {
        final combined = await _apiService.getCombinedBalance(memberId: memberId);
        _moneyBalance = ((combined['money_balance'] ?? 0) as num).toDouble();
        final conversionRate = combined['conversionRate'];
        if (conversionRate is Map<String, dynamic>) {
          final rate = conversionRate['points_to_money_rate'];
          if (rate is num && rate > 0) {
            _pointsToMoneyRate = rate.toDouble();
          }
        }
      }

      if (_isParent) {
        final pending = await _apiService.getPendingRedemptions();
        _pendingRedemptions = pending
            .whereType<Map>()
            .map((e) => Map<String, dynamic>.from(e))
            .toList();
      } else {
        final wishlist = await _apiService.getMyWishlistItems();
        _wishlistItems = wishlist
            .whereType<Map>()
            .map((e) => Map<String, dynamic>.from(e))
            .toList();
      }

      setState(() {
        _userPoints = wallet['total_points'] ?? 0;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading redeem data: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _openPaymentSelector(Map<String, dynamic> item) async {
    final itemTitle = (item['item_name'] ?? 'Reward').toString();
    final itemDescription = (item['description'] ?? '').toString();
    final pointsPrice = ((item['required_points'] ?? 0) as num).toDouble();
    final moneyPrice = double.parse((pointsPrice * _pointsToMoneyRate).toStringAsFixed(2));

    String paymentMethod = 'points';
    double splitMoney = double.parse((moneyPrice / 2).toStringAsFixed(2));
    bool isSubmitting = false;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final splitPoints = pointsPrice - (splitMoney / _pointsToMoneyRate);
            final pointsToUse = paymentMethod == 'points'
                ? pointsPrice
                : paymentMethod == 'money'
                    ? 0
                    : splitPoints.clamp(0, pointsPrice);
            final moneyToUse = paymentMethod == 'points'
                ? 0.0
                : paymentMethod == 'money'
                    ? moneyPrice
                    : splitMoney;

            final hasEnoughPoints = _userPoints >= pointsToUse.ceil();
            final hasEnoughMoney = _moneyBalance >= moneyToUse;
            final canSubmit = hasEnoughPoints && hasEnoughMoney && !isSubmitting;

            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
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
                    itemTitle,
                    style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w700),
                  ),
                  if (itemDescription.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(itemDescription, style: GoogleFonts.poppins(color: Colors.grey[700])),
                  ],
                  const SizedBox(height: 14),
                  Text('Payment Method', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: [
                      ChoiceChip(
                        label: const Text('Pay with Points'),
                        selected: paymentMethod == 'points',
                        onSelected: (_) => setModalState(() => paymentMethod = 'points'),
                      ),
                      ChoiceChip(
                        label: const Text('Pay with Money'),
                        selected: paymentMethod == 'money',
                        onSelected: (_) => setModalState(() => paymentMethod = 'money'),
                      ),
                      ChoiceChip(
                        label: const Text('Split Payment'),
                        selected: paymentMethod == 'mixed',
                        onSelected: (_) => setModalState(() => paymentMethod = 'mixed'),
                      ),
                    ],
                  ),
                  if (paymentMethod == 'mixed') ...[
                    const SizedBox(height: 12),
                    Text(
                      'Split Slider (${splitMoney.toStringAsFixed(2)} EGP)',
                      style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[700]),
                    ),
                    Slider(
                      min: 0,
                      max: moneyPrice,
                      value: splitMoney.clamp(0, moneyPrice),
                      activeColor: Colors.green,
                      onChanged: (value) {
                        setModalState(() => splitMoney = double.parse(value.toStringAsFixed(2)));
                      },
                    ),
                  ],
                  const SizedBox(height: 10),
                  _buildCalcRow('Points to use', '${pointsToUse.ceil()} pts'),
                  _buildCalcRow('Money to use', '${moneyToUse.toStringAsFixed(2)} EGP'),
                  _buildCalcRow('Remaining points', '${(_userPoints - pointsToUse.ceil()).clamp(0, 1 << 30)} pts'),
                  _buildCalcRow('Remaining money', '${(_moneyBalance - moneyToUse).toStringAsFixed(2)} EGP'),
                  if (!hasEnoughPoints || !hasEnoughMoney) ...[
                    const SizedBox(height: 8),
                    Text(
                      'Insufficient balance for this payment split.',
                      style: GoogleFonts.poppins(color: Colors.red[700], fontWeight: FontWeight.w600),
                    ),
                  ],
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: canSubmit
                          ? () async {
                              setModalState(() => isSubmitting = true);
                              try {
                                final requestBody = {
                                  'wishlist_item_id': item['_id'],
                                  'request_details': itemTitle,
                                  'payment_method': paymentMethod,
                                  'point_deduction': pointsPrice.ceil(),
                                  'points_used': pointsToUse.ceil(),
                                  'money_used': double.parse(moneyToUse.toStringAsFixed(2)),
                                };

                                if (paymentMethod == 'points') {
                                  await _apiService.requestRedemption(requestBody);
                                } else {
                                  await _apiService.requestRedemptionWithMoney(requestBody);
                                }

                                if (!mounted) return;
                                Navigator.pop(context);
                                await _showCelebrationDialog(itemTitle);
                                await _loadData();
                              } catch (e) {
                                if (!mounted) return;
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Redemption failed: $e'), backgroundColor: Colors.red),
                                );
                              } finally {
                                if (mounted) {
                                  setModalState(() => isSubmitting = false);
                                }
                              }
                            }
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green[700],
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: isSubmitting
                          ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : Text('Confirm Redemption', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
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

  Future<void> _showCelebrationDialog(String title) async {
    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Text('Request Sent', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.7, end: 1.0),
              duration: const Duration(milliseconds: 450),
              curve: Curves.elasticOut,
              builder: (context, value, child) => Transform.scale(scale: value, child: child),
              child: const Icon(Icons.celebration, color: Colors.orange, size: 56),
            ),
            const SizedBox(height: 10),
            Text(
              '$title redemption request submitted. Waiting for parent approval.',
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(fontSize: 13),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Close', style: GoogleFonts.poppins()),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, '/rewards');
            },
            child: Text('Back to Rewards', style: GoogleFonts.poppins()),
          ),
        ],
      ),
    );
  }

  Future<void> _approvePending(Map<String, dynamic> redeem, {bool forceApprove = false}) async {
    final redeemId = redeem['_id']?.toString();
    if (redeemId == null || redeemId.isEmpty) return;

    try {
      final response = await _apiService.parentApproveRedemption(redeemId, true, forceApprove: forceApprove);
      final status = (response['status'] ?? '').toString();

      if (status == 'warning' && !forceApprove) {
        final warningData = response['data'] as Map<String, dynamic>?;
        final requiredAmount = warningData?['required_amount'] ?? 0;
        final remainingBudget = warningData?['remaining_budget'] ?? 0;

        if (!mounted) return;
        final proceed = await showDialog<bool>(
              context: context,
              builder: (context) => AlertDialog(
                title: Text('Budget Warning', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
                content: Text(
                  'Rewards budget is low. Remaining: $remainingBudget EGP, required: $requiredAmount EGP. Approve anyway?',
                  style: GoogleFonts.poppins(),
                ),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(context, false), child: Text('Cancel', style: GoogleFonts.poppins())),
                  ElevatedButton(onPressed: () => Navigator.pop(context, true), child: Text('Force Approve', style: GoogleFonts.poppins())),
                ],
              ),
            ) ??
            false;

        if (proceed) {
          await _approvePending(redeem, forceApprove: true);
        }
        return;
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Redemption approved'), backgroundColor: Colors.green),
      );
      await _loadData();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Approval failed: $e'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _rejectPending(Map<String, dynamic> redeem) async {
    final redeemId = redeem['_id']?.toString();
    if (redeemId == null || redeemId.isEmpty) return;

    final controller = TextEditingController();
    final confirmed = await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: Text('Reject Redemption', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
            content: TextField(
              controller: controller,
              maxLines: 2,
              decoration: const InputDecoration(
                labelText: 'Reason (optional)',
                border: OutlineInputBorder(),
              ),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(context, false), child: Text('Cancel', style: GoogleFonts.poppins())),
              ElevatedButton(onPressed: () => Navigator.pop(context, true), child: Text('Reject', style: GoogleFonts.poppins())),
            ],
          ),
        ) ??
        false;

    if (!confirmed) return;

    try {
      await _apiService.parentApproveRedemption(redeemId, false, note: controller.text.trim());
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Redemption rejected'), backgroundColor: Colors.orange),
      );
      await _loadData();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Rejection failed: $e'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE8F5E9),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.green),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          _isParent ? 'Approve Redemptions' : 'Redeem Rewards',
          style: GoogleFonts.poppins(color: Colors.black, fontWeight: FontWeight.bold),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.green))
          : Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 700),
                child: RefreshIndicator(
                  onRefresh: _loadData,
                  child: _isParent ? _buildParentView() : _buildChildView(),
                ),
              ),
            ),
    );
  }

  Widget _buildChildView() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.green[700]!, Colors.green[500]!],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Available Points', style: GoogleFonts.poppins(color: Colors.white70)),
                  Text('$_userPoints', style: GoogleFonts.poppins(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('Money Wallet', style: GoogleFonts.poppins(color: Colors.white70)),
                  Text('${_moneyBalance.toStringAsFixed(2)} EGP', style: GoogleFonts.poppins(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        Text(
          'Tap any item to choose Points, Money, or Split Payment.',
          style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[700]),
        ),
        const SizedBox(height: 14),
        if (_wishlistItems.isEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
            child: Text('No wishlist items available for redemption.', style: GoogleFonts.poppins()),
          )
        else
          ..._wishlistItems.map(_buildWishlistRedeemCard),
      ],
    );
  }

  Widget _buildParentView() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (_pendingRedemptions.isEmpty)
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
            child: Text('No pending redemptions right now.', style: GoogleFonts.poppins()),
          )
        else
          ..._pendingRedemptions.map(_buildPendingApprovalCard),
      ],
    );
  }

  Widget _buildWishlistRedeemCard(Map<String, dynamic> item) {
    final title = (item['item_name'] ?? 'Reward').toString();
    final desc = (item['description'] ?? '').toString();
    final itemId = item['_id']?.toString();
    final points = ((item['required_points'] ?? 0) as num).toDouble();
    final money = double.parse((points * _pointsToMoneyRate).toStringAsFixed(2));
    final splitPoints = (points / 2).round();
    final splitMoney = double.parse((money / 2).toStringAsFixed(2));
    final highlighted = _prefillItemId != null && itemId == _prefillItemId;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: highlighted ? Border.all(color: Colors.green, width: 2) : null,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.card_giftcard, color: Colors.green),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
          if (desc.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(desc, style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[700])),
          ],
          const SizedBox(height: 8),
          Text('Cost: ${points.toStringAsFixed(0)} Points', style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600)),
          Text('OR: ${money.toStringAsFixed(2)} EGP', style: GoogleFonts.poppins(fontSize: 13, color: Colors.green[700])),
          Text('OR: $splitPoints Points + ${splitMoney.toStringAsFixed(2)} EGP', style: GoogleFonts.poppins(fontSize: 13, color: Colors.orange[700])),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => _openPaymentSelector(item),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green[700],
                foregroundColor: Colors.white,
              ),
              child: Text('Redeem', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPendingApprovalCard(Map<String, dynamic> redeem) {
    final details = (redeem['request_details'] ?? 'Redemption').toString();
    final points = ((redeem['points_used'] ?? redeem['point_deduction'] ?? 0) as num).toDouble();
    final money = ((redeem['money_used'] ?? 0) as num).toDouble();
    final requesterRaw = redeem['requester'];
    final requester = requesterRaw is Map
        ? (requesterRaw['mail'] ?? requesterRaw['username'] ?? 'Member').toString()
        : requesterRaw?.toString() ?? 'Member';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(details, style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          Text('Requested by: $requester', style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[700])),
          Text('Points impact: ${points.toStringAsFixed(0)} pts', style: GoogleFonts.poppins(fontSize: 12)),
          Text('Budget impact: ${money.toStringAsFixed(2)} EGP', style: GoogleFonts.poppins(fontSize: 12, color: money > 0 ? Colors.orange[800] : Colors.grey[700])),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => _rejectPending(redeem),
                  style: OutlinedButton.styleFrom(foregroundColor: Colors.red[700]),
                  child: Text('Reject', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton(
                  onPressed: () => _approvePending(redeem),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.green[700], foregroundColor: Colors.white),
                  child: Text('Approve', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCalcRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[700])),
          Text(value, style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
