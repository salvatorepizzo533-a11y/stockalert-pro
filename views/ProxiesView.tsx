import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Play,
  MoreVertical,
  FolderPlus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProxyGroup, Proxy } from '../types';

const ProxiesView: React.FC = () => {
  const {
    proxyGroups,
    addProxyGroup,
    updateProxyGroup,
    deleteProxyGroup,
    addProxy,
    addProxiesBulk,
    updateProxy,
    deleteProxy,
    deleteSelectedProxies
  } = useApp();

  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showProxyModal, setShowProxyModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [editingProxy, setEditingProxy] = useState<Proxy | null>(null);
  const [selectedProxies, setSelectedProxies] = useState<Set<string>>(new Set());
  const [newGroupName, setNewGroupName] = useState('');
  const [bulkProxies, setBulkProxies] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const [proxyForm, setProxyForm] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    type: 'HTTP' as 'HTTP' | 'HTTPS' | 'SOCKS5'
  });

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      addProxyGroup(newGroupName.trim());
      setNewGroupName('');
      setShowNewGroupModal(false);
    }
  };

  const handleAddProxy = () => {
    if (selectedGroupId && proxyForm.host && proxyForm.port) {
      if (editingProxy) {
        updateProxy(selectedGroupId, editingProxy.id, proxyForm);
      } else {
        addProxy(selectedGroupId, proxyForm);
      }
      resetProxyForm();
      setShowProxyModal(false);
    }
  };

  const handleBulkImport = () => {
    if (selectedGroupId && bulkProxies.trim()) {
      addProxiesBulk(selectedGroupId, bulkProxies);
      setBulkProxies('');
      setShowBulkModal(false);
    }
  };

  const resetProxyForm = () => {
    setProxyForm({ host: '', port: '', username: '', password: '', type: 'HTTP' });
    setEditingProxy(null);
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

  const toggleProxySelection = (proxyId: string) => {
    const newSelected = new Set(selectedProxies);
    if (newSelected.has(proxyId)) {
      newSelected.delete(proxyId);
    } else {
      newSelected.add(proxyId);
    }
    setSelectedProxies(newSelected);
  };

  const selectAllInGroup = (group: ProxyGroup) => {
    const newSelected = new Set(selectedProxies);
    const allSelected = group.proxies.every(p => selectedProxies.has(p.id));
    if (allSelected) {
      group.proxies.forEach(p => newSelected.delete(p.id));
    } else {
      group.proxies.forEach(p => newSelected.add(p.id));
    }
    setSelectedProxies(newSelected);
  };

  const handleDeleteSelected = (groupId: string) => {
    const proxyIds = Array.from(selectedProxies);
    deleteSelectedProxies(groupId, proxyIds);
    setSelectedProxies(new Set());
  };

  const getStatusIcon = (status: Proxy['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={14} className="text-green-400" />;
      case 'inactive':
        return <XCircle size={14} className="text-red-400" />;
      case 'error':
        return <AlertCircle size={14} className="text-yellow-400" />;
      default:
        return <div className="w-3.5 h-3.5 rounded-full bg-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proxies</h1>
          <p className="text-sm text-slate-500">Manage proxy groups for your tasks</p>
        </div>
        <button
          onClick={() => setShowNewGroupModal(true)}
          className="bg-accent-purple text-white px-4 py-2.5 rounded-xl text-xs font-bold glow-purple flex items-center gap-2"
        >
          <FolderPlus size={16} />
          New Group
        </button>
      </div>

      {proxyGroups.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <Globe size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Proxy Groups</h3>
          <p className="text-sm text-slate-500 mb-6">Create a proxy group to start adding proxies</p>
          <button
            onClick={() => setShowNewGroupModal(true)}
            className="bg-accent-purple text-white px-6 py-2.5 rounded-xl text-sm font-bold"
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {proxyGroups.map((group) => (
            <div key={group.id} className="glass-card rounded-2xl overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"
                onClick={() => toggleGroupExpand(group.id)}
              >
                <div className="flex items-center gap-3">
                  <Globe size={20} className="accent-purple" />
                  <div>
                    <h3 className="font-semibold">{group.name}</h3>
                    <p className="text-xs text-slate-500">{group.proxies.length} proxies</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGroupId(group.id);
                      setShowBulkModal(true);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Bulk Import"
                  >
                    <Upload size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGroupId(group.id);
                      resetProxyForm();
                      setShowProxyModal(true);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Add Proxy"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this proxy group?')) {
                        deleteProxyGroup(group.id);
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
                  {group.proxies.length > 0 && (
                    <div className="p-3 bg-[#0a090e] flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={group.proxies.every(p => selectedProxies.has(p.id))}
                          onChange={() => selectAllInGroup(group)}
                          className="rounded"
                        />
                        Select All
                      </label>
                      {selectedProxies.size > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{selectedProxies.size} selected</span>
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

                  {group.proxies.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      No proxies in this group
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {group.proxies.map((proxy) => (
                        <div
                          key={proxy.id}
                          className="p-3 flex items-center gap-3 hover:bg-white/5"
                        >
                          <input
                            type="checkbox"
                            checked={selectedProxies.has(proxy.id)}
                            onChange={() => toggleProxySelection(proxy.id)}
                            className="rounded"
                          />
                          {getStatusIcon(proxy.status)}
                          <div className="flex-1 font-mono text-sm">
                            {proxy.host}:{proxy.port}
                            {proxy.username && (
                              <span className="text-slate-500">@{proxy.username}</span>
                            )}
                          </div>
                          <span className="text-xs px-2 py-1 bg-slate-800 rounded">
                            {proxy.type}
                          </span>
                          {proxy.speed && (
                            <span className="text-xs text-slate-500">{proxy.speed}ms</span>
                          )}
                          <button
                            onClick={() => {
                              setSelectedGroupId(group.id);
                              setEditingProxy(proxy);
                              setProxyForm({
                                host: proxy.host,
                                port: proxy.port,
                                username: proxy.username || '',
                                password: proxy.password || '',
                                type: proxy.type
                              });
                              setShowProxyModal(true);
                            }}
                            className="p-1.5 hover:bg-white/10 rounded"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => deleteProxy(group.id, proxy.id)}
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
            <h2 className="text-xl font-bold mb-4">New Proxy Group</h2>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name (e.g., Residential EU)"
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

      {/* Proxy Modal */}
      {showProxyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#121118] rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h2 className="text-xl font-bold mb-4">
              {editingProxy ? 'Edit Proxy' : 'Add Proxy'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={proxyForm.host}
                  onChange={(e) => setProxyForm({ ...proxyForm, host: e.target.value })}
                  placeholder="Host (IP)"
                  className="bg-[#0a090e] border border-white/10 rounded-xl py-3 px-4"
                />
                <input
                  type="text"
                  value={proxyForm.port}
                  onChange={(e) => setProxyForm({ ...proxyForm, port: e.target.value })}
                  placeholder="Port"
                  className="bg-[#0a090e] border border-white/10 rounded-xl py-3 px-4"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={proxyForm.username}
                  onChange={(e) => setProxyForm({ ...proxyForm, username: e.target.value })}
                  placeholder="Username (optional)"
                  className="bg-[#0a090e] border border-white/10 rounded-xl py-3 px-4"
                />
                <input
                  type="password"
                  value={proxyForm.password}
                  onChange={(e) => setProxyForm({ ...proxyForm, password: e.target.value })}
                  placeholder="Password (optional)"
                  className="bg-[#0a090e] border border-white/10 rounded-xl py-3 px-4"
                />
              </div>
              <select
                value={proxyForm.type}
                onChange={(e) => setProxyForm({ ...proxyForm, type: e.target.value as any })}
                className="w-full bg-[#0a090e] border border-white/10 rounded-xl py-3 px-4"
              >
                <option value="HTTP">HTTP</option>
                <option value="HTTPS">HTTPS</option>
                <option value="SOCKS5">SOCKS5</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowProxyModal(false);
                  resetProxyForm();
                }}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProxy}
                className="flex-1 py-2.5 rounded-xl bg-accent-purple font-bold"
              >
                {editingProxy ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#121118] rounded-2xl p-6 w-full max-w-lg border border-white/10">
            <h2 className="text-xl font-bold mb-2">Bulk Import Proxies</h2>
            <p className="text-xs text-slate-500 mb-4">
              One proxy per line: host:port or host:port:user:pass
            </p>
            <textarea
              value={bulkProxies}
              onChange={(e) => setBulkProxies(e.target.value)}
              placeholder="192.168.1.1:8080&#10;192.168.1.2:8080:user:pass&#10;..."
              className="w-full bg-[#0a090e] border border-white/10 rounded-xl py-3 px-4 h-48 font-mono text-sm"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkProxies('');
                }}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkImport}
                className="flex-1 py-2.5 rounded-xl bg-accent-purple font-bold"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProxiesView;
