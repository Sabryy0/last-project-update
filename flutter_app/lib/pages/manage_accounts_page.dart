import 'package:flutter/material.dart';
import '../core/services/api_service.dart';

class ManageAccountsPage extends StatefulWidget {
  const ManageAccountsPage({super.key});

  @override
  State<ManageAccountsPage> createState() => _ManageAccountsPageState();
}

class _ManageAccountsPageState extends State<ManageAccountsPage> {
  final ApiService _apiService = ApiService();
  List<Map<String, dynamic>> _profiles = [];
  String _activeProfileKey = '';
  bool _loading = true;
  bool _changed = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final profiles = await _apiService.getSavedProfiles();
    final active = await _apiService.getActiveProfileKey() ?? '';
    if (!mounted) return;
    setState(() {
      _profiles = profiles;
      _activeProfileKey = active;
      _loading = false;
    });
  }

  Future<void> _switchProfile(String profileKey) async {
    try {
      await _apiService.switchProfile(profileKey);
      await _loadData();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Account switched')),
      );
      _changed = true;
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to switch account: ${e.toString().replaceAll('Exception: ', '')}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _removeProfile(String profileKey) async {
    try {
      await _apiService.removeSavedProfile(profileKey);
      await _loadData();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Account removed')),
      );
      _changed = true;
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to remove account: ${e.toString().replaceAll('Exception: ', '')}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _onReorder(int oldIndex, int newIndex) async {
    final rawNewIndex = newIndex;
    setState(() {
      if (newIndex > oldIndex) {
        newIndex -= 1;
      }
      final item = _profiles.removeAt(oldIndex);
      _profiles.insert(newIndex, item);
    });

    await _apiService.reorderSavedProfiles(oldIndex, rawNewIndex);
    await _loadData();
    _changed = true;
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        Navigator.of(context).pop(_changed);
        return false;
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Manage Accounts'),
        ),
        body: _loading
            ? const Center(child: CircularProgressIndicator())
            : _profiles.isEmpty
                ? const Center(
                    child: Text('No saved accounts'),
                  )
                : ReorderableListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _profiles.length,
                  onReorder: _onReorder,
                  itemBuilder: (context, index) {
                    final profile = _profiles[index];
                    final profileKey = profile['profileKey']?.toString() ?? '';
                    final familyTitle = profile['familyTitle']?.toString() ?? 'Family';
                    final username = profile['username']?.toString() ?? 'Member';
                    final mail = profile['mail']?.toString() ?? '';
                    final isActive = profileKey == _activeProfileKey;

                    return Card(
                      key: ValueKey(profileKey),
                      margin: const EdgeInsets.only(bottom: 10),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: const Color(0xFFE8F5E9),
                          child: Text(
                            (username.isNotEmpty ? username[0] : 'A').toUpperCase(),
                            style: const TextStyle(
                              color: Color(0xFF2E7D32),
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        title: Text('$familyTitle ($username)'),
                        subtitle: Text(mail),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (isActive)
                              const Padding(
                                padding: EdgeInsets.only(right: 6),
                                child: Icon(Icons.check_circle, color: Color(0xFF4CAF50)),
                              ),
                            IconButton(
                              tooltip: 'Switch account',
                              icon: const Icon(Icons.swap_horiz),
                              onPressed: isActive ? null : () => _switchProfile(profileKey),
                            ),
                            IconButton(
                              tooltip: 'Remove account',
                              icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                              onPressed: () async {
                                final confirmed = await showDialog<bool>(
                                  context: context,
                                  builder: (dialogContext) => AlertDialog(
                                    title: const Text('Remove account?'),
                                    content: Text('Remove $familyTitle ($username) from this device?'),
                                    actions: [
                                      TextButton(
                                        onPressed: () => Navigator.of(dialogContext).pop(false),
                                        child: const Text('Cancel'),
                                      ),
                                      TextButton(
                                        onPressed: () => Navigator.of(dialogContext).pop(true),
                                        child: const Text('Remove', style: TextStyle(color: Colors.red)),
                                      ),
                                    ],
                                  ),
                                );

                                if (confirmed == true) {
                                  await _removeProfile(profileKey);
                                }
                              },
                            ),
                            const Icon(Icons.drag_handle),
                          ],
                        ),
                      ),
                    );
                  },
                ),
      ),
    );
  }
}
