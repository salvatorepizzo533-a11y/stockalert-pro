
import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppSection } from '../types';

// App version from package.json
const APP_VERSION = '1.1.0';

interface TopBarProps {
  setActiveSection: (section: AppSection) => void;
}

const TopBar: React.FC<TopBarProps> = ({ setActiveSection }) => {
  const { settings, monitors, startAllMonitors, stopAllMonitors } = useApp();
  const isDiscordConnected = !!settings.discord.webhookUrl || !!settings.discord.webhookRestock;
  const runningMonitors = monitors.filter(m => m.status === 'RUNNING').length;
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    if (runningMonitors > 0) {
      stopAllMonitors();
      setTimeout(() => startAllMonitors(), 500);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="h-16 flex items-center justify-between px-8 bg-[#0B0A0F]/50 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search tasks, products..."
            className="w-full bg-[#121118] border border-white/5 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-accent-purple/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Clock */}
        <div className="flex items-center gap-2 bg-[#121118] border border-white/5 rounded-xl px-4 py-2">
          <Clock size={14} className="accent-purple" />
          <span className="text-xs font-mono text-slate-300">{formatTime(currentTime)}</span>
        </div>

        {/* Version Badge */}
        <div className="text-[10px] text-slate-600 font-mono">
          v{APP_VERSION}
        </div>

        <div className={`flex items-center gap-2 bg-[#121118] border rounded-xl px-4 py-2 ${
          isDiscordConnected ? 'border-green-500/30' : 'border-yellow-500/30'
        }`}>
          {isDiscordConnected ? (
            <>
              <Wifi size={14} className="text-green-400" />
              <span className="text-xs font-medium text-green-400">Discord</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-yellow-400" />
              <span className="text-xs font-medium text-yellow-400">No Discord</span>
            </>
          )}
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-[#121118] border border-white/5 rounded-xl px-4 py-2 text-xs font-medium hover:bg-white/5 transition-colors active:scale-95"
          title={runningMonitors > 0 ? "Restart all monitors" : "No monitors running"}
        >
          <RefreshCw size={14} className="accent-purple" />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
