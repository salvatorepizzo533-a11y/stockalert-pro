import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Trash2,
  Edit3,
  Play,
  Square,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Settings2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskGroup, Task, TaskStatus, InputMode, SizeMode, TaskMode } from '../types';
import { DEFAULT_SIZES, TASK_MODES } from '../data/stores';

const TasksView: React.FC = () => {
  const {
    taskGroups,
    addTaskGroup,
    updateTaskGroup,
    deleteTaskGroup,
    addTask,
    updateTask,
    deleteTask,
    deleteSelectedTasks,
    startTask,
    stopTask,
    startAllTasks,
    stopAllTasks,
    startSelectedTasks,
    stopSelectedTasks,
    allStores,
    profileGroups,
    proxyGroups,
    accountGroups
  } = useApp();

  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showQuickTaskModal, setShowQuickTaskModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const [groupForm, setGroupForm] = useState({
    name: '',
    storeId: '',
    profileGroupId: '',
    proxyGroupId: '',
    accountGroupId: '',
    taskMode: 'safe' as TaskMode,
    delayMin: 1000,
    delayMax: 3000,
    cartQuantity: 1,
    minPrice: '',
    maxPrice: '',
    retryOnDecline: true,
    proxyRotation: true,
    monitorEnabled: false,
    monitorInterval: 5000,
    captchaAutoSolve: true
  });

  const [taskForm, setTaskForm] = useState({
    productInput: '',
    inputMode: 'url' as InputMode,
    profileId: '',
    size: {
      mode: 'random' as SizeMode,
      specific: [] as string[],
      rangeMin: '',
      rangeMax: ''
    },
    quantity: 1
  });

  const handleCreateGroup = () => {
    if (groupForm.name && groupForm.storeId) {
      addTaskGroup(groupForm.name, {
        storeId: groupForm.storeId,
        profileGroupId: groupForm.profileGroupId || undefined,
        proxyGroupId: groupForm.proxyGroupId || undefined,
        accountGroupId: groupForm.accountGroupId || undefined,
        taskMode: groupForm.taskMode,
        delayMin: groupForm.delayMin,
        delayMax: groupForm.delayMax,
        cartQuantity: groupForm.cartQuantity,
        minPrice: groupForm.minPrice ? parseFloat(groupForm.minPrice) : undefined,
        maxPrice: groupForm.maxPrice ? parseFloat(groupForm.maxPrice) : undefined,
        retryOnDecline: groupForm.retryOnDecline,
        proxyRotation: groupForm.proxyRotation,
        monitorEnabled: groupForm.monitorEnabled,
        monitorInterval: groupForm.monitorInterval,
        captchaAutoSolve: groupForm.captchaAutoSolve
      });
      resetGroupForm();
      setShowNewGroupModal(false);
    }
  };

  const handleAddTask = () => {
    if (selectedGroupId && taskForm.productInput) {
      const quantity = taskForm.quantity || 1;
      for (let i = 0; i < quantity; i++) {
        addTask(selectedGroupId, {
          productInput: taskForm.productInput,
          inputMode: taskForm.inputMode,
          profileId: taskForm.profileId || undefined,
          size: taskForm.size
        });
      }
      resetTaskForm();
      setShowTaskModal(false);
    }
  };

  const resetGroupForm = () => {
    setGroupForm({
      name: '',
      storeId: '',
      profileGroupId: '',
      proxyGroupId: '',
      accountGroupId: '',
      taskMode: 'safe' as TaskMode,
      delayMin: 1000,
      delayMax: 3000,
      cartQuantity: 1,
      minPrice: '',
      maxPrice: '',
      retryOnDecline: true,
      proxyRotation: true,
      monitorEnabled: false,
      monitorInterval: 5000,
      captchaAutoSolve: true
    });
  };

  const resetTaskForm = () => {
    setTaskForm({
      productInput: '',
      inputMode: 'url',
      profileId: '',
      size: { mode: 'random', specific: [], rangeMin: '', rangeMax: '' },
      quantity: 1
    });
    setEditingTask(null);
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

  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const selectAllInGroup = (group: TaskGroup) => {
    const newSelected = new Set(selectedTasks);
    const allSelected = group.tasks.every(t => selectedTasks.has(t.id));
    if (allSelected) {
      group.tasks.forEach(t => newSelected.delete(t.id));
    } else {
      group.tasks.forEach(t => newSelected.add(t.id));
    }
    setSelectedTasks(newSelected);
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'running':
        return <Loader2 size={14} className="text-blue-400 animate-spin" />;
      case 'waiting':
        return <Clock size={14} className="text-yellow-400" />;
      case 'checkout':
        return <Loader2 size={14} className="text-purple-400 animate-spin" />;
      case 'success':
        return <CheckCircle size={14} className="text-green-400" />;
      case 'declined':
      case 'error':
        return <XCircle size={14} className="text-red-400" />;
      default:
        return <div className="w-3.5 h-3.5 rounded-full bg-slate-600" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'running': return 'text-blue-400';
      case 'waiting': return 'text-yellow-400';
      case 'checkout': return 'text-purple-400';
      case 'success': return 'text-green-400';
      case 'declined':
      case 'error': return 'text-red-400';
      default: return 'text-slate-500';
    }
  };

  const getStoreName = (storeId: string) => {
    const store = allStores.find(s => s.id === storeId);
    return store?.name || storeId;
  };

  const getSelectedInGroup = (group: TaskGroup) => {
    return group.tasks.filter(t => selectedTasks.has(t.id)).map(t => t.id);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-slate-500">Manage checkout tasks for Shopify EU stores</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQuickTaskModal(true)}
            className="bg-[#121118] border border-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/5"
          >
            <Zap size={16} />
            Quick Task
          </button>
          <button
            onClick={() => setShowNewGroupModal(true)}
            className="bg-accent-purple text-white px-4 py-2.5 rounded-xl text-xs font-bold glow-purple flex items-center gap-2"
          >
            <FolderPlus size={16} />
            New Group
          </button>
        </div>
      </div>

      {taskGroups.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <Zap size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Task Groups</h3>
          <p className="text-sm text-slate-500 mb-6">Create a task group to start adding checkout tasks</p>
          <button
            onClick={() => setShowNewGroupModal(true)}
            className="bg-accent-purple text-white px-6 py-2.5 rounded-xl text-sm font-bold"
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {taskGroups.map((group) => (
            <div key={group.id} className="glass-card rounded-2xl overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => toggleGroupExpand(group.id)}
                >
                  {expandedGroups.has(group.id) ? (
                    <ChevronDown size={20} className="text-slate-500" />
                  ) : (
                    <ChevronRight size={20} className="text-slate-500" />
                  )}
                  <Zap size={20} className="accent-purple" />
                  <div>
                    <h3 className="font-semibold">{group.name}</h3>
                    <p className="text-xs text-slate-500">
                      {getStoreName(group.settings.storeId)} • {group.tasks.length} tasks
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startAllTasks(group.id)}
                    className="p-2 hover:bg-green-500/20 rounded-lg transition-colors text-green-400"
                    title="Start All"
                  >
                    <Play size={16} />
                  </button>
                  <button
                    onClick={() => stopAllTasks(group.id)}
                    className="p-2 hover:bg-yellow-500/20 rounded-lg transition-colors text-yellow-400"
                    title="Stop All"
                  >
                    <Square size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      resetTaskForm();
                      setShowTaskModal(true);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Add Task"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this task group and all tasks?')) {
                        deleteTaskGroup(group.id);
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
                  {group.tasks.length > 0 && (
                    <div className="p-3 bg-[#0a090e] flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={group.tasks.length > 0 && group.tasks.every(t => selectedTasks.has(t.id))}
                          onChange={() => selectAllInGroup(group)}
                          className="rounded"
                        />
                        Select All
                      </label>
                      {getSelectedInGroup(group).length > 0 && (
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">
                            {getSelectedInGroup(group).length} selected
                          </span>
                          <button
                            onClick={() => startSelectedTasks(group.id, getSelectedInGroup(group))}
                            className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                          >
                            <Play size={12} />
                            Start
                          </button>
                          <button
                            onClick={() => stopSelectedTasks(group.id, getSelectedInGroup(group))}
                            className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
                          >
                            <Square size={12} />
                            Stop
                          </button>
                          <button
                            onClick={() => {
                              deleteSelectedTasks(group.id, getSelectedInGroup(group));
                              setSelectedTasks(new Set());
                            }}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {group.tasks.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      No tasks in this group
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {group.tasks.map((task, index) => (
                        <div
                          key={task.id}
                          className="p-3 flex items-center gap-3 hover:bg-white/5"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTasks.has(task.id)}
                            onChange={() => toggleTaskSelection(task.id)}
                            className="rounded"
                          />
                          <span className="text-xs text-slate-600 w-6">#{index + 1}</span>
                          {getStatusIcon(task.status)}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-mono truncate">{task.productInput}</div>
                            <div className="text-xs text-slate-500">
                              {task.inputMode.toUpperCase()} • Size: {task.size.mode}
                            </div>
                          </div>
                          <span className={`text-xs font-medium capitalize ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          {task.status === 'idle' ? (
                            <button
                              onClick={() => startTask(group.id, task.id)}
                              className="p-1.5 hover:bg-green-500/20 rounded text-green-400"
                            >
                              <Play size={14} />
                            </button>
                          ) : task.status === 'running' || task.status === 'waiting' || task.status === 'checkout' ? (
                            <button
                              onClick={() => stopTask(group.id, task.id)}
                              className="p-1.5 hover:bg-yellow-500/20 rounded text-yellow-400"
                            >
                              <Square size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                updateTask(group.id, task.id, { status: 'idle' });
                              }}
                              className="p-1.5 hover:bg-blue-500/20 rounded text-blue-400"
                              title="Reset"
                            >
                              <Play size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteTask(group.id, task.id)}
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

      {/* New Group Modal - Compact Design */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0e13] rounded-2xl w-full max-w-3xl border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-bold">New Task Group</h2>
              <button
                onClick={() => { setShowNewGroupModal(false); resetGroupForm(); }}
                className="text-slate-500 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-4 grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="Group Name"
                  className="w-full bg-[#1a1820] border border-white/10 rounded-lg py-2.5 px-3 text-sm"
                />

                <select
                  value={groupForm.storeId}
                  onChange={(e) => setGroupForm({ ...groupForm, storeId: e.target.value })}
                  className="w-full bg-[#1a1820] border border-white/10 rounded-lg py-2.5 px-3 text-sm"
                >
                  <option value="">Select Store</option>
                  {allStores.map((store) => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>

                <div className="flex gap-2">
                  {TASK_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setGroupForm({ ...groupForm, taskMode: mode.id as TaskMode })}
                      className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                        groupForm.taskMode === mode.id
                          ? 'bg-accent-purple text-white'
                          : 'bg-[#1a1820] border border-white/10 hover:border-white/20'
                      }`}
                    >
                      {mode.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={groupForm.profileGroupId}
                    onChange={(e) => setGroupForm({ ...groupForm, profileGroupId: e.target.value })}
                    className="bg-[#1a1820] border border-white/10 rounded-lg py-2 px-2 text-xs"
                  >
                    <option value="">Profile</option>
                    {profileGroups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <select
                    value={groupForm.proxyGroupId}
                    onChange={(e) => setGroupForm({ ...groupForm, proxyGroupId: e.target.value })}
                    className="bg-[#1a1820] border border-white/10 rounded-lg py-2 px-2 text-xs"
                  >
                    <option value="">Proxy</option>
                    {proxyGroups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <select
                    value={groupForm.accountGroupId}
                    onChange={(e) => setGroupForm({ ...groupForm, accountGroupId: e.target.value })}
                    className="bg-[#1a1820] border border-white/10 rounded-lg py-2 px-2 text-xs"
                  >
                    <option value="">Account</option>
                    {accountGroups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Delay Min</label>
                    <input
                      type="number"
                      value={groupForm.delayMin}
                      onChange={(e) => setGroupForm({ ...groupForm, delayMin: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#1a1820] border border-white/10 rounded-lg py-2 px-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Delay Max</label>
                    <input
                      type="number"
                      value={groupForm.delayMax}
                      onChange={(e) => setGroupForm({ ...groupForm, delayMax: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#1a1820] border border-white/10 rounded-lg py-2 px-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={groupForm.cartQuantity}
                      onChange={(e) => setGroupForm({ ...groupForm, cartQuantity: parseInt(e.target.value) || 1 })}
                      min={1}
                      className="w-full bg-[#1a1820] border border-white/10 rounded-lg py-2 px-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Min Price</label>
                    <input
                      type="number"
                      value={groupForm.minPrice}
                      onChange={(e) => setGroupForm({ ...groupForm, minPrice: e.target.value })}
                      placeholder="€0"
                      className="w-full bg-[#1a1820] border border-white/10 rounded-lg py-2 px-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Max Price</label>
                    <input
                      type="number"
                      value={groupForm.maxPrice}
                      onChange={(e) => setGroupForm({ ...groupForm, maxPrice: e.target.value })}
                      placeholder="No limit"
                      className="w-full bg-[#1a1820] border border-white/10 rounded-lg py-2 px-2 text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <label className="flex items-center gap-2 bg-[#1a1820] rounded-lg px-3 py-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={groupForm.retryOnDecline}
                      onChange={(e) => setGroupForm({ ...groupForm, retryOnDecline: e.target.checked })}
                      className="rounded w-3.5 h-3.5"
                    />
                    Retry
                  </label>
                  <label className="flex items-center gap-2 bg-[#1a1820] rounded-lg px-3 py-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={groupForm.proxyRotation}
                      onChange={(e) => setGroupForm({ ...groupForm, proxyRotation: e.target.checked })}
                      className="rounded w-3.5 h-3.5"
                    />
                    Proxy Rotate
                  </label>
                  <label className="flex items-center gap-2 bg-[#1a1820] rounded-lg px-3 py-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={groupForm.captchaAutoSolve}
                      onChange={(e) => setGroupForm({ ...groupForm, captchaAutoSolve: e.target.checked })}
                      className="rounded w-3.5 h-3.5"
                    />
                    Captcha
                  </label>
                  <label className="flex items-center gap-2 bg-[#1a1820] rounded-lg px-3 py-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={groupForm.monitorEnabled}
                      onChange={(e) => setGroupForm({ ...groupForm, monitorEnabled: e.target.checked })}
                      className="rounded w-3.5 h-3.5"
                    />
                    Monitor
                  </label>
                </div>

                {groupForm.monitorEnabled && (
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Monitor Interval (ms)</label>
                    <input
                      type="number"
                      value={groupForm.monitorInterval}
                      onChange={(e) => setGroupForm({ ...groupForm, monitorInterval: parseInt(e.target.value) || 5000 })}
                      className="w-full bg-[#1a1820] border border-white/10 rounded-lg py-2 px-2 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-4 border-t border-white/10">
              <button
                onClick={() => { setShowNewGroupModal(false); resetGroupForm(); }}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupForm.name || !groupForm.storeId}
                className="flex-1 py-2.5 rounded-xl bg-accent-purple font-bold text-sm disabled:opacity-50"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121118] rounded-2xl p-6 w-full max-w-lg border border-white/10">
            <h2 className="text-xl font-bold mb-4">Add Tasks</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Input Mode</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['url', 'keyword', 'sku', 'variant'] as InputMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTaskForm({ ...taskForm, inputMode: mode })}
                      className={`py-2 px-3 rounded-lg text-xs font-medium uppercase ${
                        taskForm.inputMode === mode
                          ? 'bg-accent-purple text-white'
                          : 'bg-[#0a090e] border border-white/10 hover:bg-white/5'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {taskForm.inputMode === 'url' && 'Product URL'}
                  {taskForm.inputMode === 'keyword' && 'Keywords (+include -exclude)'}
                  {taskForm.inputMode === 'sku' && 'SKU'}
                  {taskForm.inputMode === 'variant' && 'Variant ID'}
                </label>
                <input
                  type="text"
                  value={taskForm.productInput}
                  onChange={(e) => setTaskForm({ ...taskForm, productInput: e.target.value })}
                  placeholder={
                    taskForm.inputMode === 'url' ? 'https://store.com/products/...' :
                    taskForm.inputMode === 'keyword' ? '+jordan +retro -women' :
                    taskForm.inputMode === 'sku' ? 'SKU123456' :
                    '39876543210'
                  }
                  className="w-full bg-[#0a090e] border border-white/10 rounded-xl py-3 px-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Size Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['random', 'specific', 'range'] as SizeMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTaskForm({ ...taskForm, size: { ...taskForm.size, mode } })}
                      className={`py-2 px-3 rounded-lg text-xs font-medium capitalize ${
                        taskForm.size.mode === mode
                          ? 'bg-accent-purple text-white'
                          : 'bg-[#0a090e] border border-white/10 hover:bg-white/5'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {taskForm.size.mode === 'specific' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Sizes</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-[#0a090e] rounded-xl">
                    {DEFAULT_SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          const specific = taskForm.size.specific || [];
                          const newSpecific = specific.includes(size)
                            ? specific.filter(s => s !== size)
                            : [...specific, size];
                          setTaskForm({ ...taskForm, size: { ...taskForm.size, specific: newSpecific } });
                        }}
                        className={`px-2 py-1 rounded text-xs ${
                          (taskForm.size.specific || []).includes(size)
                            ? 'bg-accent-purple text-white'
                            : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {taskForm.size.mode === 'range' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Min Size</label>
                    <select
                      value={taskForm.size.rangeMin}
                      onChange={(e) => setTaskForm({ ...taskForm, size: { ...taskForm.size, rangeMin: e.target.value } })}
                      className="w-full bg-[#0a090e] border border-white/10 rounded-xl py-2 px-3"
                    >
                      <option value="">Select</option>
                      {DEFAULT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Max Size</label>
                    <select
                      value={taskForm.size.rangeMax}
                      onChange={(e) => setTaskForm({ ...taskForm, size: { ...taskForm.size, rangeMax: e.target.value } })}
                      className="w-full bg-[#0a090e] border border-white/10 rounded-xl py-2 px-3"
                    >
                      <option value="">Select</option>
                      {DEFAULT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Task Quantity</label>
                <input
                  type="number"
                  value={taskForm.quantity}
                  onChange={(e) => setTaskForm({ ...taskForm, quantity: parseInt(e.target.value) || 1 })}
                  min={1}
                  max={100}
                  className="w-full bg-[#0a090e] border border-white/10 rounded-xl py-3 px-4"
                />
                <p className="text-xs text-slate-500 mt-1">Number of tasks to create</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  resetTaskForm();
                }}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="flex-1 py-2.5 rounded-xl bg-accent-purple font-bold"
              >
                Add {taskForm.quantity > 1 ? `${taskForm.quantity} Tasks` : 'Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Task Modal */}
      {showQuickTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121118] rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap size={20} className="accent-purple" />
              Quick Task
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Create a single task quickly. Select or create a task group first.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Task Group</label>
                <select
                  value={selectedGroupId || ''}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full bg-[#0a090e] border border-white/10 rounded-xl py-3 px-4"
                >
                  <option value="">Select Group</option>
                  {taskGroups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Product URL</label>
                <input
                  type="text"
                  value={taskForm.productInput}
                  onChange={(e) => setTaskForm({ ...taskForm, productInput: e.target.value, inputMode: 'url' })}
                  placeholder="https://store.com/products/..."
                  className="w-full bg-[#0a090e] border border-white/10 rounded-xl py-3 px-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Size</label>
                <select
                  value={taskForm.size.specific?.[0] || 'random'}
                  onChange={(e) => {
                    if (e.target.value === 'random') {
                      setTaskForm({ ...taskForm, size: { mode: 'random', specific: [] } });
                    } else {
                      setTaskForm({ ...taskForm, size: { mode: 'specific', specific: [e.target.value] } });
                    }
                  }}
                  className="w-full bg-[#0a090e] border border-white/10 rounded-xl py-3 px-4"
                >
                  <option value="random">Random</option>
                  {DEFAULT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowQuickTaskModal(false);
                  resetTaskForm();
                  setSelectedGroupId(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedGroupId && taskForm.productInput) {
                    addTask(selectedGroupId, {
                      productInput: taskForm.productInput,
                      inputMode: 'url',
                      size: taskForm.size
                    });
                    startTask(selectedGroupId, `t-${Date.now()}`);
                    setShowQuickTaskModal(false);
                    resetTaskForm();
                  }
                }}
                disabled={!selectedGroupId || !taskForm.productInput}
                className="flex-1 py-2.5 rounded-xl bg-accent-purple font-bold disabled:opacity-50"
              >
                Create & Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksView;
