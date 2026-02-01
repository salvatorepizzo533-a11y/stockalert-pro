
import React from 'react';
import {
  Bell,
  ExternalLink,
  ArrowUpRight,
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const AlertsView: React.FC = () => {
  const { alerts, clearAlerts } = useApp();

  const handleClearAll = () => {
    if (alerts.length === 0) return;
    if (confirm('Are you sure you want to clear all alerts?')) {
      clearAlerts();
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alert History</h1>
          <p className="text-sm text-slate-500">View all stock availability notifications sent to Discord.</p>
        </div>
        <div className="flex gap-3">
          {alerts.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-xs font-bold transition-all text-red-400"
            >
              <Trash2 size={14} />
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="glass-card rounded-2xl p-6 hover:border-purple-500/20 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {alert.productImage ? (
                    <img src={alert.productImage} className="w-16 h-16 rounded-xl object-cover bg-slate-800" alt="" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center">
                      <Bell size={24} className="text-slate-600" />
                    </div>
                  )}
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0B0A0F] ${
                    alert.status === 'In Stock' ? 'bg-green-400' :
                    alert.status === 'Notified' ? 'bg-blue-400' :
                    'bg-red-400'
                  }`}></div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg group-hover:accent-purple transition-colors">{alert.productName}</h3>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                      alert.status === 'In Stock' ? 'bg-green-500/10 text-green-400' :
                      alert.status === 'Notified' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{alert.storeName}</span>
                    <span>•</span>
                    <span className="font-bold text-white">{alert.price}</span>
                    <span>•</span>
                    <span>{alert.timestamp}</span>
                  </div>
                  <a href={alert.productUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-500 flex items-center gap-1 hover:text-white mt-1">
                    <ExternalLink size={10} />
                    {alert.productUrl}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#121118] rounded-xl border border-white/5">
                  <Bell size={14} className="accent-purple" />
                  <span className="text-xs font-medium">Discord Notified</span>
                </div>
                <a
                  href={alert.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-accent-purple text-white px-6 py-2.5 rounded-xl text-xs font-bold glow-purple flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <ArrowUpRight size={14} />
                  Go to Product
                </a>
              </div>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="glass-card rounded-3xl p-20 flex flex-col items-center justify-center text-center border-dashed border-2">
            <div className="w-20 h-20 bg-accent-purple/5 rounded-full flex items-center justify-center mb-6">
              <Bell size={40} className="accent-purple opacity-20" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No alerts yet</h2>
            <p className="text-slate-500 max-w-sm">When products become available, you'll see the alerts here and receive Discord notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsView;
