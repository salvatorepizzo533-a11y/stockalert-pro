
import React from 'react';
import { Search, Bell, Settings, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

const TopBar: React.FC = () => {
  const { settings } = useApp();
  const isDiscordConnected = !!settings.discord.webhookUrl;

  return (
    <div className="h-20 flex items-center justify-between px-8 bg-[#0B0A0F]/50 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search monitors, products, or keywords..."
            className="w-full bg-[#121118] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent-purple/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className={`flex items-center gap-2 bg-[#121118] border rounded-xl px-4 py-2 ${
          isDiscordConnected ? 'border-green-500/30' : 'border-yellow-500/30'
        }`}>
          {isDiscordConnected ? (
            <>
              <Wifi size={14} className="text-green-400" />
              <span className="text-xs font-medium text-green-400">Discord Connected</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-yellow-400" />
              <span className="text-xs font-medium text-yellow-400">Discord Not Set</span>
            </>
          )}
        </div>

        <button className="flex items-center gap-2 bg-[#121118] border border-white/5 rounded-xl px-4 py-2 text-xs font-medium hover:bg-white/5 transition-colors">
          <RefreshCw size={14} className="accent-purple" />
          <span>Refresh</span>
        </button>

        <div className="flex items-center gap-3">
          <button className="relative p-2.5 bg-[#121118] border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
            <Bell size={18} className="text-slate-300" />
          </button>
          <button className="p-2.5 bg-[#121118] border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
            <Settings size={18} className="text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
