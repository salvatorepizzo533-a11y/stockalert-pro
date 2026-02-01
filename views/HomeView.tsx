
import React from 'react';
import {
  Bell,
  Radio,
  ArrowUpRight,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MonitorStatus } from '../types';

const HomeView: React.FC = () => {
  const { monitors, alerts, settings } = useApp();

  const activeMonitors = monitors.filter(m => m.status === MonitorStatus.RUNNING).length;
  const totalAlerts = monitors.reduce((sum, m) => sum + m.stats.alertsSent, 0);
  const recentAlerts = alerts.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-accent-purple/10 text-accent-purple text-[10px] font-bold rounded-full uppercase tracking-widest">Stock Monitor Dashboard</span>
            <span className="text-slate-500 text-[10px]">• {activeMonitors} Active Monitor{activeMonitors !== 1 ? 's' : ''}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Product Availability Tracker</h1>
        </div>
      </div>

      {/* Discord Warning */}
      {!settings.discord.webhookUrl && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-center gap-4">
          <AlertCircle className="text-yellow-400" size={24} />
          <div>
            <p className="text-sm font-bold text-yellow-400">Discord not configured</p>
            <p className="text-xs text-slate-400">Go to Settings to add your Discord webhook URL and receive notifications.</p>
          </div>
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:border-purple-500/20 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-accent-purple/10 rounded-xl">
              <Bell size={20} className="accent-purple" />
            </div>
          </div>
          <p className="text-slate-400 text-xs font-medium mb-1">Total Alerts Sent</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold">{totalAlerts}</h3>
            <span className="text-slate-500 text-sm pb-1 mb-0.5">all time</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:border-purple-500/20 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-accent-purple/10 rounded-xl">
              <Radio size={20} className="accent-purple" />
            </div>
            {activeMonitors > 0 && (
              <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Active</span>
              </div>
            )}
          </div>
          <p className="text-slate-400 text-xs font-medium mb-1">Monitors</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold">{activeMonitors}</h3>
            <span className="text-slate-500 text-sm pb-1 mb-0.5">of {monitors.length} running</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900/40 to-[#9D80FE]/20 border border-[#9D80FE]/30 p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-purple/20 blur-3xl rounded-full"></div>
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">How It Works</span>
            </div>
            <h4 className="text-xl font-bold mb-2">Stock Monitor Pro</h4>
            <p className="text-xs text-white/60 leading-relaxed max-w-[80%]">Monitor product availability and get instant Discord notifications when items are back in stock.</p>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2 text-xs text-white/80">
              <div className={`w-1.5 h-1.5 rounded-full ${settings.discord.webhookUrl ? 'bg-green-400' : 'bg-slate-500'}`}></div>
              <span>Discord {settings.discord.webhookUrl ? 'connected' : 'not configured'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/80">
              <div className={`w-1.5 h-1.5 rounded-full ${monitors.length > 0 ? 'bg-green-400' : 'bg-slate-500'}`}></div>
              <span>{monitors.length} monitor{monitors.length !== 1 ? 's' : ''} configured</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/80">
              <div className={`w-1.5 h-1.5 rounded-full ${activeMonitors > 0 ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></div>
              <span>{activeMonitors > 0 ? 'Monitoring active' : 'No active monitoring'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="glass-card rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold mb-1">Recent Alerts</h2>
            <p className="text-xs text-slate-500">Latest stock availability notifications</p>
          </div>
        </div>

        {recentAlerts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">
                <tr>
                  <th className="pb-4 px-2">Product Info</th>
                  <th className="pb-4 px-2">Store</th>
                  <th className="pb-4 px-2">Price</th>
                  <th className="pb-4 px-2">Detected</th>
                  <th className="pb-4 px-2">Status</th>
                  <th className="pb-4 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentAlerts.map((alert) => (
                  <tr key={alert.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-4">
                        {alert.productImage ? (
                          <img src={alert.productImage} className="w-10 h-10 rounded-xl object-cover bg-slate-800" alt="" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                            <Bell size={16} className="text-slate-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-white group-hover:accent-purple transition-colors truncate max-w-[200px]">{alert.productName}</p>
                          <a href={alert.productUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-500 flex items-center gap-1 hover:text-white">
                            View Product <ExternalLink size={8} />
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-xs font-medium text-slate-300">{alert.storeName}</span>
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-xs font-bold text-white">{alert.price}</span>
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-xs text-slate-400">{alert.timestamp}</span>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        alert.status === 'In Stock' ? 'bg-green-500/10 text-green-400' :
                        alert.status === 'Notified' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <a href={alert.productUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-accent-purple/10 hover:text-accent-purple transition-colors inline-block">
                        <ArrowUpRight size={16} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell size={40} className="mx-auto mb-4 text-slate-600" />
            <p className="text-slate-500">No alerts yet</p>
            <p className="text-xs text-slate-600 mt-1">Alerts will appear here when products are found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeView;
