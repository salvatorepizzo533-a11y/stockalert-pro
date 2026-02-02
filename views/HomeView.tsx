import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  AlertCircle,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';

type TimeFilter = '1D' | '7D' | '30D' | 'ALL';

const CHANGELOG = [
  { version: '1.1.0', date: '2026-02-01', changes: ['Tasks with Safe/SafePreload/Fast modes', 'Min/Max price filter', 'Proxy rotation', 'New stores: Supreme, Stanley1913, Afew, etc.', 'Removed Alerts section', 'Renamed Monitors to Automations', 'Added clock'] },
  { version: '1.0.2', date: '2026-01-30', changes: ['Multiple webhooks support', 'UI fixes', 'Update script'] },
  { version: '1.0.1', date: '2026-01-28', changes: ['Profiles with billing address', 'Credit card support'] },
  { version: '1.0.0', date: '2026-01-25', changes: ['Initial release', 'Monitors and alerts', 'Discord notifications'] },
];

const HomeView: React.FC = () => {
  const { settings, orders } = useApp();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('1D');

  // Filter orders by time
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const filterMs = {
      '1D': 24 * 60 * 60 * 1000,
      '7D': 7 * 24 * 60 * 60 * 1000,
      '30D': 30 * 24 * 60 * 60 * 1000,
      'ALL': Infinity
    };

    return orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      return (now.getTime() - orderDate.getTime()) <= filterMs[timeFilter];
    });
  }, [orders, timeFilter]);

  // Calculate stats
  const totalCheckouts = filteredOrders.filter(o => o.status === 'success').length;
  const totalSpent = filteredOrders
    .filter(o => o.status === 'success')
    .reduce((sum, o) => sum + o.price, 0);
  const successRate = filteredOrders.length > 0
    ? Math.round((totalCheckouts / filteredOrders.length) * 100)
    : 0;

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={14} className="text-green-400" />;
      case 'declined':
        return <XCircle size={14} className="text-red-400" />;
      default:
        return <Clock size={14} className="text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="px-3 py-1 bg-accent-purple/10 text-accent-purple text-[10px] font-bold rounded-full uppercase tracking-widest">Dashboard</span>
          <h1 className="text-2xl font-bold tracking-tight mt-2">StockAlert Pro</h1>
        </div>
        <div className="flex gap-2">
          {(['1D', '7D', '30D', 'ALL'] as TimeFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                timeFilter === filter
                  ? 'bg-accent-purple text-white'
                  : 'bg-[#121118] text-slate-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Discord Warning */}
      {!settings.discord.webhookRestock && !settings.discord.webhookCheckout && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-center gap-3">
          <AlertCircle className="text-yellow-400" size={20} />
          <div>
            <p className="text-sm font-bold text-yellow-400">Discord webhooks not configured</p>
            <p className="text-xs text-slate-400">Go to Settings to add your webhooks.</p>
          </div>
        </div>
      )}

      {/* Stats - Only 3 cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/10 rounded-xl">
              <ShoppingCart size={18} className="text-green-400" />
            </div>
          </div>
          <p className="text-slate-400 text-xs font-medium mb-1">Total Checkouts</p>
          <h3 className="text-2xl font-bold text-green-400">{totalCheckouts}</h3>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <DollarSign size={18} className="text-blue-400" />
            </div>
          </div>
          <p className="text-slate-400 text-xs font-medium mb-1">Total Spent</p>
          <h3 className="text-2xl font-bold text-blue-400">${totalSpent.toFixed(2)}</h3>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <TrendingUp size={18} className="text-purple-400" />
            </div>
          </div>
          <p className="text-slate-400 text-xs font-medium mb-1">Success Rate</p>
          <h3 className="text-2xl font-bold text-purple-400">{successRate}%</h3>
        </div>
      </div>

      {/* Orders & Changelog */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold">Recent Orders</h2>
            <span className="text-xs text-slate-500">{filteredOrders.length} orders</span>
          </div>

          {filteredOrders.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredOrders.slice(0, 10).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-2 bg-[#0a090e] rounded-xl hover:bg-white/5 transition-colors"
                >
                  {order.productImage ? (
                    <img src={order.productImage} className="w-10 h-10 rounded-lg object-cover bg-slate-800" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      <ShoppingCart size={16} className="text-slate-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{order.productName}</p>
                    <p className="text-xs text-slate-500">{order.storeName} • Size {order.size}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">${order.price.toFixed(2)}</p>
                    <div className="flex items-center gap-1 justify-end">
                      {getStatusIcon(order.status)}
                      <span className={`text-xs capitalize ${
                        order.status === 'success' ? 'text-green-400' :
                        order.status === 'declined' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart size={32} className="mx-auto mb-3 text-slate-600" />
              <p className="text-slate-500 text-sm">No orders yet</p>
            </div>
          )}
        </div>

        {/* Changelog */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-base font-bold mb-4">Changelog</h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {CHANGELOG.map((release) => (
              <div key={release.version} className="border-l-2 border-accent-purple/30 pl-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold">v{release.version}</span>
                  <span className="text-[10px] text-slate-500">{release.date}</span>
                </div>
                <ul className="space-y-0.5">
                  {release.changes.map((change, i) => (
                    <li key={i} className="text-[10px] text-slate-400">• {change}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
