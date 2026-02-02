import React, { useState } from 'react';
import {
  UserCircle,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  AlertCircle,
  FolderPlus,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AccountGroup, StoreAccount } from '../types';

const AccountsView: React.FC = () => {
  const {
    accountGroups,
    addAccountGroup,
    deleteAccountGroup,
    addAccount,
    updateAccount,
    deleteAccount,
    deleteSelectedAccounts,
    allStores
  } = useApp();

  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<StoreAccount | null>(null);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [newGroupName, setNewGroupName] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());

  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    password: '',
    storeId: ''
  });

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      addAccountGroup(newGroupName.trim());
      setNewGroupName('');
      setShowNewGroupModal(false);
    }
  };

  const handleAddAccount = () => {
    if (selectedGroupId && accountForm.email && accountForm.password && accountForm.storeId) {
      if (editingAccount) {
        updateAccount(selectedGroupId, editingAccount.id, accountForm);
      } else {
        addAccount(selectedGroupId, {
          ...accountForm,
          name: accountForm.name || accountForm.email.split('@')[0]
        });
      }
      resetAccountForm();
      setShowAccountModal(false);
    }
  };

  const resetAccountForm = () => {
    setAccountForm({ name: '', email: '', password: '', storeId: '' });
    setEditingAccount(null);
  };

  const toggleGroupExpand = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleAccountSelection = (accountId: string) => {
    const newSelected = new Set(selectedAccounts);
    if (newSelected.has(accountId)) {
      newSelected.delete(accountId);
    } else {
      newSelected.add(accountId);
    }
    setSelectedAccounts(newSelected);
  };

  const selectAllInGroup = (group: AccountGroup) => {
    const newSelected = new Set(selectedAccounts);
    const allSelected = group.accounts.every(a => selectedAccounts.has(a.id));
    if (allSelected) {
      group.accounts.forEach(a => newSelected.delete(a.id));
    } else {
      group.accounts.forEach(a => newSelected.add(a.id));
    }
    setSelectedAccounts(newSelected);
  };

  const handleDeleteSelected = (groupId: string) => {
    const accountIds = Array.from(selectedAccounts);
    deleteSelectedAccounts(groupId, accountIds);
    setSelectedAccounts(new Set());
  };

  const togglePasswordVisibility = (accountId: string) => {
    const newShow = new Set(showPasswords);
    if (newShow.has(accountId)) {
      newShow.delete(accountId);
    } else {
      newShow.add(accountId);
    }
    setShowPasswords(newShow);
  };

  const getStatusIcon = (status: StoreAccount['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle size={14} className="text-green-400" />;
      case 'invalid':
        return <XCircle size={14} className="text-red-400" />;
      case 'error':
        return <AlertCircle size={14} className="text-yellow-400" />;
      default:
        return <div className="w-3.5 h-3.5 rounded-full bg-slate-600" />;
    }
  };

  const getStoreName = (storeId: string) => {
    const store = allStores.find(s => s.id === storeId);
    return store?.name || storeId;
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-sm text-slate-500">Manage store accounts for faster checkout</p>
        </div>
        <button
          onClick={() => setShowNewGroupModal(true)}
          className="bg-accent-purple text-white px-4 py-2.5 rounded-xl text-xs font-bold glow-purple flex items-center gap-2"
        >
          <FolderPlus size={16} />
          New Group
        </button>
      </div>

      {accountGroups.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <UserCircle size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Account Groups</h3>
          <p className="text-sm text-slate-500 mb-6">Create an account group to start adding store accounts</p>
          <button
            onClick={() => setShowNewGroupModal(true)}
            className="bg-accent-purple text-white px-6 py-2.5 rounded-xl text-sm font-bold"
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {accountGroups.map((group) => (
            <div key={group.id} className="glass-card rounded-2xl overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"
                onClick={() => toggleGroupExpand(group.id)}
              >
                <div className="flex items-center gap-3">
                  <UserCircle size={20} className="accent-purple" />
                  <div>
                    <h3 className="font-semibold">{group.name}</h3>
                    <p className="text-xs text-slate-500">{group.accounts.length} accounts</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGroupId(group.id);
                      resetAccountForm();
                      setShowAccountModal(true);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Add Account"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this account group?')) {
                        deleteAccountGroup(group.id);
                      }
                    }}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                    title="Delete Group"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {expandedGroups.has(group.id) && (
                <div className="border-t border-white/5">
                  {group.accounts.length > 0 && (
                    <div className="p-3 bg-[#0a090e] flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={group.accounts.every(a => selectedAccounts.has(a.id))}
                          onChange={() => selectAllInGroup(group)}
                          className="rounded"
                        />
                        Select All
                      </label>
                      {selectedAccounts.size > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{selectedAccounts.size} selected</span>
                          <button
                            onClick={() => handleDeleteSelected(group.id)}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                          >
                            <Trash2 size={12} />
                            Delete Selected
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {group.accounts.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      No accounts in this group
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {group.accounts.map((account) => (
                        <div
                          key={account.id}
                          className="p-3 flex items-center gap-3 hover:bg-white/5"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAccounts.has(account.id)}
                            onChange={() => toggleAccountSelection(account.id)}
                            className="rounded"
                          />
                          {getStatusIcon(account.status)}
                          <div className="flex-1">
                            <div className="text-sm font-medium">{account.name}</div>
                            <div className="text-xs text-slate-500">{account.email}</div>
                          </div>
                          <span className="text-xs px-2 py-1 bg-slate-800 rounded">
                            {getStoreName(account.storeId)}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-mono text-slate-500">
                              {showPasswords.has(account.id) ? account.password : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(account.id)}
                              className="p-1 hover:bg-white/10 rounded"
                            >
                              {showPasswords.has(account.id) ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedGroupId(group.id);
                              setEditingAccount(account);
                              setAccountForm({
                                name: account.name,
                                email: account.email,
                                password: account.password,
                                storeId: account.storeId
                              });
                              setShowAccountModal(true);
                            }}
                            className="p-1.5 hover:bg-white/10 rounded"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => deleteAccount(group.id, account.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Group Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#121118] rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h2 className="text-xl font-bold mb-4">New Account Group</h2>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name (e.g., Main Accounts)"
              className="w-full bg-[#0a090e] border border-white/10 rounded-xl py-3 px-4 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="flex-1 py-2.5 rounded-xl bg-accent-purple font-bold"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#121118] rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h2 className="text-xl font-bold mb-4">
              {editingAccount ? 'Edit Account' : 'Add Account'}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                value={accountForm.name}
                onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                placeholder="Account name (optional)"
                className="w-full bg-[#0a090e] border border-white/10 rounded-xl py-3 px-4"
              />
              <input
                type="email"
                value={accountForm.email}
                onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                placeholder="Email"
                className="w-full bg-[#0a090e] border border-white/10 rounded-xl py-3 px-4"
              />
              <input
                type="password"
                value={accountForm.password}
                onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                placeholder="Password"
                className="w-full bg-[#0a090e] border border-white/10 rounded-xl py-3 px-4"
              />
              <select
                value={accountForm.storeId}
                onChange={(e) => setAccountForm({ ...accountForm, storeId: e.target.value })}
                className="w-full bg-[#0a090e] border border-white/10 rounded-xl py-3 px-4"
              >
                <option value="">Select Store</option>
                {allStores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name} ({store.url})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAccountModal(false);
                  resetAccountForm();
                }}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAccount}
                className="flex-1 py-2.5 rounded-xl bg-accent-purple font-bold"
              >
                {editingAccount ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsView;
