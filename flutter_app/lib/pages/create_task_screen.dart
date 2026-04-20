import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/services/api_service.dart';

enum RewardTypeOption { points, money, both }

class CreateTaskScreen extends StatefulWidget {
  final List<dynamic> categories;

  const CreateTaskScreen({super.key, required this.categories});

  @override
  State<CreateTaskScreen> createState() => _CreateTaskScreenState();
}

class _CreateTaskScreenState extends State<CreateTaskScreen> {
  final ApiService _apiService = ApiService();

  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();

  String? _selectedCategoryId;
  RewardTypeOption _rewardType = RewardTypeOption.points;
  bool _isMandatory = false;
  bool _isSubmitting = false;

  int _pointsAmount = 10;
  double _moneyAmount = 0;
  double _moneyToPointsRate = 10;

  bool _budgetLoaded = false;
  double _rewardsBudgetRemaining = 0;

  @override
  void initState() {
    super.initState();
    _loadRewardMeta();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _loadRewardMeta() async {
    try {
      final memberId = await _apiService.getCurrentMemberId();
      if (memberId != null && memberId.isNotEmpty) {
        final combined = await _apiService.getCombinedBalance(memberId: memberId);
        final conversion = combined['conversionRate'];
        if (conversion is Map<String, dynamic>) {
          final value = conversion['money_to_points_rate'];
          if (value is num && value > 0) {
            _moneyToPointsRate = value.toDouble();
          }
        }
      }

      final budget = await _apiService.getTaskRewardsBudgetStatus();
      _rewardsBudgetRemaining = ((budget['remaining'] ?? 0) as num).toDouble();

      if (!mounted) return;
      setState(() {
        _budgetLoaded = true;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _budgetLoaded = true;
      });
    }
  }

  bool get _usesMoney =>
      _rewardType == RewardTypeOption.money || _rewardType == RewardTypeOption.both;

  bool get _usesPoints =>
      _rewardType == RewardTypeOption.points || _rewardType == RewardTypeOption.both;

  bool get _isBudgetExceeded => _usesMoney && _moneyAmount > _rewardsBudgetRemaining;

  double get _moneyEquivalentInPoints => _moneyAmount * _moneyToPointsRate;

  Future<void> _submit({bool forceCreate = false}) async {
    if (_titleController.text.trim().isEmpty || _selectedCategoryId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill title and category')),
      );
      return;
    }

    if (_usesPoints && _pointsAmount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Points reward must be greater than zero')),
      );
      return;
    }

    if (_usesMoney && _moneyAmount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Money reward must be greater than zero')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final payload = {
        'title': _titleController.text.trim(),
        'description': _descriptionController.text.trim(),
        'category_id': _selectedCategoryId,
        'is_mandatory': _isMandatory,
        'reward_type': _rewardType.name,
        'money_reward': _usesMoney ? _moneyAmount : 0,
        if (forceCreate) 'force_create': true,
      };

      final response = await _apiService.createTask(payload);
      final status = (response['status'] ?? '').toString();

      if (status == 'warning' && !forceCreate) {
        if (!mounted) return;
        final proceed = await showDialog<bool>(
              context: context,
              builder: (context) => AlertDialog(
                title: Text('Budget Warning', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
                content: Text(
                  'This reward exceeds your monthly rewards budget. Continue?',
                  style: GoogleFonts.poppins(),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context, false),
                    child: Text('Cancel', style: GoogleFonts.poppins()),
                  ),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context, true),
                    child: Text('Continue', style: GoogleFonts.poppins()),
                  ),
                ],
              ),
            ) ??
            false;

        if (proceed) {
          await _submit(forceCreate: true);
        }
        return;
      }

      if (!mounted) return;
      Navigator.pop(context, true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Task template created successfully'), backgroundColor: Colors.green),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final totalValuePoints = _pointsAmount + _moneyEquivalentInPoints;

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
          'Create Task Template',
          style: GoogleFonts.poppins(color: Colors.black, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 620),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _label('Title *'),
                const SizedBox(height: 6),
                TextField(
                  controller: _titleController,
                  decoration: _inputDecoration('e.g., Clean Room'),
                ),
                const SizedBox(height: 14),

                _label('Description'),
                const SizedBox(height: 6),
                TextField(
                  controller: _descriptionController,
                  maxLines: 3,
                  decoration: _inputDecoration('Task details...'),
                ),
                const SizedBox(height: 14),

                _label('Category *'),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  value: _selectedCategoryId,
                  decoration: _inputDecoration(''),
                  hint: const Text('Select category'),
                  items: widget.categories.map((cat) {
                    return DropdownMenuItem<String>(
                      value: cat['_id']?.toString(),
                      child: Text((cat['title'] ?? 'Unknown').toString()),
                    );
                  }).toList(),
                  onChanged: (value) => setState(() => _selectedCategoryId = value),
                ),
                const SizedBox(height: 8),
                CheckboxListTile(
                  value: _isMandatory,
                  title: Text('Mandatory Task', style: GoogleFonts.poppins()),
                  contentPadding: EdgeInsets.zero,
                  onChanged: (v) => setState(() => _isMandatory = v ?? false),
                ),
                const SizedBox(height: 12),

                _label('Reward Type Selector'),
                const SizedBox(height: 8),
                SegmentedButton<RewardTypeOption>(
                  segments: const [
                    ButtonSegment<RewardTypeOption>(
                      value: RewardTypeOption.points,
                      label: Text('Points'),
                      icon: Icon(Icons.star),
                    ),
                    ButtonSegment<RewardTypeOption>(
                      value: RewardTypeOption.money,
                      label: Text('Money'),
                      icon: Icon(Icons.payments),
                    ),
                    ButtonSegment<RewardTypeOption>(
                      value: RewardTypeOption.both,
                      label: Text('Both'),
                      icon: Icon(Icons.auto_awesome),
                    ),
                  ],
                  selected: {_rewardType},
                  onSelectionChanged: (selection) {
                    setState(() => _rewardType = selection.first);
                  },
                ),
                const SizedBox(height: 14),

                if (_usesPoints) ...[
                  _label('Points Amount Input'),
                  const SizedBox(height: 6),
                  TextFormField(
                    initialValue: _pointsAmount.toString(),
                    keyboardType: TextInputType.number,
                    decoration: _inputDecoration('Points').copyWith(
                      prefixIcon: Icon(Icons.star, color: Colors.amber[700]),
                    ),
                    onChanged: (v) {
                      setState(() => _pointsAmount = int.tryParse(v) ?? 0);
                    },
                  ),
                  const SizedBox(height: 12),
                ],

                if (_usesMoney) ...[
                  _label('Money Amount Input (EGP)'),
                  const SizedBox(height: 6),
                  TextFormField(
                    initialValue: _moneyAmount == 0 ? '' : _moneyAmount.toStringAsFixed(2),
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: _inputDecoration('Money amount').copyWith(
                      prefixIcon: const Icon(Icons.currency_exchange),
                      suffixText: 'EGP',
                    ),
                    onChanged: (v) {
                      setState(() => _moneyAmount = double.tryParse(v) ?? 0);
                    },
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Equivalent to ${_moneyEquivalentInPoints.toStringAsFixed(1)} points',
                    style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[700]),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _budgetLoaded
                        ? 'Rewards category has ${_rewardsBudgetRemaining.toStringAsFixed(2)} EGP remaining'
                        : 'Loading rewards budget...',
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      color: _isBudgetExceeded ? Colors.orange[800] : Colors.grey[700],
                      fontWeight: _isBudgetExceeded ? FontWeight.w700 : FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                if (_rewardType == RewardTypeOption.both)
                  Container(
                    width: double.infinity,
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.blue[50],
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.blue[200]!),
                    ),
                    child: Text(
                      'Total value: ${totalValuePoints.toStringAsFixed(1)} points equivalent',
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w600, color: Colors.blue[800]),
                    ),
                  ),

                if (_isBudgetExceeded)
                  Container(
                    width: double.infinity,
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.yellow[100],
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.yellow[700]!),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.warning_amber_rounded, color: Colors.yellow[900]),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'This reward exceeds your monthly rewards budget. Continue?',
                            style: GoogleFonts.poppins(
                              color: Colors.yellow[900],
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _isSubmitting ? null : () => _submit(),
                    icon: const Icon(Icons.check_circle_outline, color: Colors.white),
                    label: _isSubmitting
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : Text(
                            'Create Task',
                            style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w600),
                          ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green[700],
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Text _label(String text) {
    return Text(
      text,
      style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 13),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
    );
  }
}
