
import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import HomeView from './views/HomeView';
import MonitorsView from './views/MonitorsView';
import AlertsView from './views/AlertsView';
import ProfilesView from './views/ProfilesView';
import SettingsView from './views/SettingsView';
import { AppSection } from './types';

const AppContent: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.HOME);

  const renderSection = () => {
    switch (activeSection) {
      case AppSection.HOME:
        return <HomeView />;
      case AppSection.MONITORS:
        return <MonitorsView />;
      case AppSection.ALERTS:
        return <AlertsView />;
      case AppSection.PROFILES:
        return <ProfilesView />;
      case AppSection.SETTINGS:
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0B0A0F] text-slate-200 overflow-hidden font-sans">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[30%] bg-purple-900/10 blur-[150px] rounded-full -z-10"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-indigo-900/10 blur-[150px] rounded-full -z-10"></div>

        <TopBar setActiveSection={setActiveSection} />

        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
          <div className="max-w-[1440px] mx-auto">
            {renderSection()}
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
