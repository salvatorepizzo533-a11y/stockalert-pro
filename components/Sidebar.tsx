
import React from 'react';
import {
  LayoutDashboard,
  Radio,
  Bell,
  Settings,
  LogOut,
  Users,
  Info,
  Zap,
  Globe,
  UserCircle,
  ShieldCheck
} from 'lucide-react';
import { AppSection } from '../types';

interface SidebarProps {
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
}

const APP_VERSION = '1.1.0';

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: AppSection.HOME, icon: LayoutDashboard, label: 'Dashboard' },
    { id: AppSection.AUTOMATIONS, icon: Radio, label: 'Automations' },
    { id: AppSection.TASKS, icon: Zap, label: 'Tasks' },
    { id: AppSection.PROXIES, icon: Globe, label: 'Proxies' },
    { id: AppSection.ACCOUNTS, icon: UserCircle, label: 'Accounts' },
    { id: AppSection.CAPTCHAS, icon: ShieldCheck, label: 'Captchas' },
    { id: AppSection.PROFILES, icon: Users, label: 'Profiles' },
    { id: AppSection.SETTINGS, icon: Settings, label: 'Settings' },
  ];

  const handleExit = () => {
    if (window.confirm('Sei sicuro di voler chiudere StockAlert Pro?')) {
      window.close();
      // Fallback per Electron
      if (window.electronAPI) {
        window.electronAPI.quit?.();
      }
    }
  };

  const handleAbout = () => {
    alert(`StockAlert Pro v${APP_VERSION}\n\nStock Monitor Dashboard\nMonitor product availability and get instant Discord notifications.`);
  };

  return (
    <div className="w-64 bg-[#0B0A0F] border-r border-white/5 flex flex-col h-full shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-accent-purple rounded-lg flex items-center justify-center glow-purple">
          <Radio size={20} color="white" />
        </div>
        <span className="font-bold text-xl tracking-tight">StockAlert <span className="text-[10px] align-top accent-purple">PRO</span></span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-4 mb-4">Main Menu</div>
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                ? 'bg-[#121118] text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} className={isActive ? 'accent-purple' : 'group-hover:accent-purple'} />
              <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
              {isActive && <div className="w-1.5 h-1.5 bg-accent-purple rounded-full"></div>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5">
        <button
          onClick={handleAbout}
          className="w-full bg-[#121118] p-4 rounded-2xl border border-white/5 group hover:border-purple-500/30 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Radio size={20} className="text-white" />
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-xs font-bold text-white truncate">StockAlert Pro</p>
              <p className="text-[10px] text-slate-500 truncate">v{APP_VERSION}</p>
            </div>
            <Info size={14} className="text-slate-600" />
          </div>
        </button>
        <button
          onClick={handleExit}
          className="w-full mt-4 flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">Exit</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
