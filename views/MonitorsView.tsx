
import React, { useState } from 'react';
import {
  Play,
  Pause,
  Trash2,
  Edit3,
  Plus,
  ChevronDown,
  ChevronUp,
  Activity,
  Clock,
  Radio,
  Link
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MonitorStatus } from '../types';
import MonitorModal from '../components/MonitorModal';

const MonitorsView: React.FC = () => {
  const { monitors, addMonitor, updateMonitor, deleteMonitor, startMonitor, stopMonitor, startAllMonitors, stopAllMonitors } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<typeof monitors[0] | null>(null);
  const [expandedMonitor, setExpandedMonitor] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingMonitor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (monitor: typeof monitors[0]) => {
    setEditingMonitor(monitor);
    setIsModalOpen(true);
  };

  const handleSave = (data: { name: string; urls: string[]; keywords: string[]; negativeKeywords: string[]; checkInterval: number }) => {
    if (editingMonitor) {
      updateMonitor(editingMonitor.id, data);
    } else {
      addMonitor(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this monitor?')) {
      deleteMonitor(id);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedMonitor(expandedMonitor === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Monitors</h1>
          <p className="text-sm text-slate-500">Create and manage your product availability monitors.</p>
        </div>
        <div className="flex gap-3">
          {monitors.length > 0 && (
            <>
              <button
                onClick={startAllMonitors}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-xs font-bold transition-all"
              >
                <Play size={14} className="text-green-400 fill-green-400" />
                Start All
              </button>
              <button
                onClick={stopAllMonitors}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-xs font-bold transition-all"
              >
                <Pause size={14} className="text-yellow-400 fill-yellow-400" />
                Stop All
              </button>
            </>
          )}
          <button
            onClick={handleCreate}
            className="bg-accent-purple text-white px-6 py-2.5 rounded-xl text-xs font-bold glow-purple flex items-center gap-2"
          >
            <Plus size={16} />
            New Monitor
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {monitors.map((monitor) => (
          <div key={monitor.id} className="glass-card rounded-2xl overflow-hidden hover:border-purple-500/20 transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{monitor.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                        monitor.status === MonitorStatus.RUNNING ? 'bg-green-500/10 text-green-400' :
                        monitor.status === MonitorStatus.ERROR ? 'bg-red-500/10 text-red-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {monitor.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Activity size={12} className="accent-purple" />
                        {monitor.urls.length} URL{monitor.urls.length !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="accent-purple" />
                        Every {monitor.checkInterval}s
                      </span>
                      <span>Last Check: {monitor.stats.lastCheck || 'Never'}</span>
                    </div>
                    {monitor.keywords.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        {monitor.keywords.slice(0, 3).map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 bg-accent-purple/10 text-accent-purple text-[10px] rounded-full">
                            {kw}
                          </span>
                        ))}
                        {monitor.keywords.length > 3 && (
                          <span className="text-[10px] text-slate-500">+{monitor.keywords.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Alerts Sent</p>
                    <p className="text-xl font-bold accent-purple">{monitor.stats.alertsSent}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {monitor.status === MonitorStatus.RUNNING ? (
                      <button
                        onClick={() => stopMonitor(monitor.id)}
                        className="p-2.5 bg-yellow-500/10 text-yellow-400 rounded-xl hover:bg-yellow-500/20 transition-colors"
                        title="Stop"
                      >
                        <Pause size={18} fill="currentColor" />
                      </button>
                    ) : (
                      <button
                        onClick={() => startMonitor(monitor.id)}
                        className="p-2.5 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500/20 transition-colors"
                        title="Start"
                      >
                        <Play size={18} fill="currentColor" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(monitor)}
                      className="p-2.5 bg-white/5 text-slate-400 rounded-xl hover:bg-white/10 transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(monitor.id)}
                      className="p-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="w-[1px] h-8 bg-white/5 mx-2"></div>
                    <button
                      onClick={() => toggleExpand(monitor.id)}
                      className="p-2 text-slate-500 hover:text-white transition-colors"
                    >
                      {expandedMonitor === monitor.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedMonitor === monitor.id && (
              <div className="border-t border-white/5 p-6 bg-white/[0.01]">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">URLs to Monitor</h4>
                    <div className="space-y-2">
                      {monitor.urls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
                        >
                          <Link size={12} className="accent-purple" />
                          <span className="truncate">{url}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Keywords</h4>
                    {monitor.keywords.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {monitor.keywords.map((kw, i) => (
                          <span key={i} className="px-3 py-1 bg-accent-purple/10 text-accent-purple text-xs rounded-full">
                            {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No keywords set</p>
                    )}

                    {monitor.negativeKeywords.length > 0 && (
                      <>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-4 mb-3">Negative Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {monitor.negativeKeywords.map((kw, i) => (
                            <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 text-xs rounded-full">
                              -{kw}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {monitors.length === 0 && (
          <div className="glass-card rounded-3xl p-20 flex flex-col items-center justify-center text-center border-dashed border-2">
            <div className="w-20 h-20 bg-accent-purple/5 rounded-full flex items-center justify-center mb-6">
              <Radio size={40} className="accent-purple opacity-20" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No monitors yet</h2>
            <p className="text-slate-500 max-w-sm mb-8">Create your first monitor to start tracking product availability and receive Discord notifications.</p>
            <button
              onClick={handleCreate}
              className="bg-accent-purple text-white px-8 py-3 rounded-xl font-bold glow-purple"
            >
              Create First Monitor
            </button>
          </div>
        )}
      </div>

      <MonitorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editMonitor={editingMonitor}
      />
    </div>
  );
};

export default MonitorsView;
