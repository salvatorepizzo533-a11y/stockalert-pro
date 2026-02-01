
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Monitor, StockAlert, AppSettings, MonitorStatus, ProfileGroup, Profile } from '../types';
import { monitoringService } from '../services/MonitoringService';

interface AppContextType {
  monitors: Monitor[];
  alerts: StockAlert[];
  settings: AppSettings;
  profileGroups: ProfileGroup[];
  addMonitor: (monitor: Omit<Monitor, 'id' | 'stats' | 'status'>) => void;
  updateMonitor: (id: string, updates: Partial<Monitor>) => void;
  deleteMonitor: (id: string) => void;
  startMonitor: (id: string) => void;
  stopMonitor: (id: string) => void;
  startAllMonitors: () => void;
  stopAllMonitors: () => void;
  addAlert: (alert: Omit<StockAlert, 'id' | 'timestamp'>) => void;
  clearAlerts: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addProfileGroup: (name: string) => void;
  updateProfileGroup: (id: string, updates: Partial<ProfileGroup>) => void;
  deleteProfileGroup: (id: string) => void;
  addProfile: (groupId: string, profile: Omit<Profile, 'id'>) => void;
  updateProfile: (groupId: string, profileId: string, updates: Partial<Profile>) => void;
  deleteProfile: (groupId: string, profileId: string) => void;
}

const defaultSettings: AppSettings = {
  discord: {
    webhookUrl: '',
    enabled: true,
    mentionEveryone: false,
    testMode: false
  },
  checkIntervalDefault: 30,
  soundEnabled: true
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [monitors, setMonitors] = useState<Monitor[]>(() =>
    loadFromStorage('stockmonitor_monitors', [])
  );
  const [alerts, setAlerts] = useState<StockAlert[]>(() =>
    loadFromStorage('stockmonitor_alerts', [])
  );
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadFromStorage('stockmonitor_settings', defaultSettings)
  );
  const [profileGroups, setProfileGroups] = useState<ProfileGroup[]>(() =>
    loadFromStorage('stockmonitor_profilegroups', [])
  );

  // Save to localStorage when data changes
  useEffect(() => {
    saveToStorage('stockmonitor_monitors', monitors);
  }, [monitors]);

  useEffect(() => {
    saveToStorage('stockmonitor_alerts', alerts);
  }, [alerts]);

  useEffect(() => {
    saveToStorage('stockmonitor_settings', settings);
    monitoringService.setSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveToStorage('stockmonitor_profilegroups', profileGroups);
  }, [profileGroups]);

  // Set up monitoring service callbacks
  useEffect(() => {
    monitoringService.setSettings(settings);

    monitoringService.setOnAlert((alertData) => {
      const newAlert: StockAlert = {
        ...alertData,
        id: `a-${Date.now()}`,
        timestamp: new Date().toLocaleString()
      };
      setAlerts(prev => [newAlert, ...prev].slice(0, 100));

      // Update monitor stats
      setMonitors(prev => prev.map(m =>
        m.id === alertData.monitorId
          ? { ...m, stats: { ...m.stats, alertsSent: m.stats.alertsSent + 1 } }
          : m
      ));
    });

    monitoringService.setOnStatusUpdate((monitorId, lastCheck) => {
      setMonitors(prev => prev.map(m =>
        m.id === monitorId
          ? { ...m, stats: { ...m.stats, lastCheck } }
          : m
      ));
    });

    // Restart any monitors that were running before page reload
    monitors.forEach(monitor => {
      if (monitor.status === MonitorStatus.RUNNING) {
        monitoringService.startMonitor(monitor);
      }
    });

    // Cleanup on unmount
    return () => {
      monitoringService.stopAllMonitors();
    };
  }, []);

  const addMonitor = useCallback((monitorData: Omit<Monitor, 'id' | 'stats' | 'status'>) => {
    const newMonitor: Monitor = {
      ...monitorData,
      id: `m-${Date.now()}`,
      status: MonitorStatus.STOPPED,
      stats: {
        alertsSent: 0,
        lastCheck: null
      }
    };
    setMonitors(prev => [...prev, newMonitor]);
  }, []);

  const updateMonitor = useCallback((id: string, updates: Partial<Monitor>) => {
    setMonitors(prev => prev.map(m =>
      m.id === id ? { ...m, ...updates } : m
    ));
  }, []);

  const deleteMonitor = useCallback((id: string) => {
    monitoringService.stopMonitor(id);
    setMonitors(prev => prev.filter(m => m.id !== id));
  }, []);

  const startMonitor = useCallback((id: string) => {
    setMonitors(prev => {
      const monitor = prev.find(m => m.id === id);
      if (monitor) {
        monitoringService.startMonitor({ ...monitor, status: MonitorStatus.RUNNING });
      }
      return prev.map(m =>
        m.id === id ? {
          ...m,
          status: MonitorStatus.RUNNING,
          stats: { ...m.stats, lastCheck: 'Starting...' }
        } : m
      );
    });
  }, []);

  const stopMonitor = useCallback((id: string) => {
    monitoringService.stopMonitor(id);
    setMonitors(prev => prev.map(m =>
      m.id === id ? { ...m, status: MonitorStatus.STOPPED } : m
    ));
  }, []);

  const startAllMonitors = useCallback(() => {
    setMonitors(prev => {
      prev.forEach(monitor => {
        monitoringService.startMonitor({ ...monitor, status: MonitorStatus.RUNNING });
      });
      return prev.map(m => ({
        ...m,
        status: MonitorStatus.RUNNING,
        stats: { ...m.stats, lastCheck: 'Starting...' }
      }));
    });
  }, []);

  const stopAllMonitors = useCallback(() => {
    monitoringService.stopAllMonitors();
    setMonitors(prev => prev.map(m => ({
      ...m,
      status: MonitorStatus.STOPPED
    })));
  }, []);

  const addAlert = useCallback((alertData: Omit<StockAlert, 'id' | 'timestamp'>) => {
    const newAlert: StockAlert = {
      ...alertData,
      id: `a-${Date.now()}`,
      timestamp: new Date().toLocaleString()
    };
    setAlerts(prev => [newAlert, ...prev].slice(0, 100));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.discord) {
        updated.discord = { ...prev.discord, ...newSettings.discord };
      }
      return updated;
    });
  }, []);

  // Profile Group functions
  const addProfileGroup = useCallback((name: string) => {
    const newGroup: ProfileGroup = {
      id: `pg-${Date.now()}`,
      name,
      profiles: [],
      createdAt: new Date().toISOString()
    };
    setProfileGroups(prev => [...prev, newGroup]);
  }, []);

  const updateProfileGroup = useCallback((id: string, updates: Partial<ProfileGroup>) => {
    setProfileGroups(prev => prev.map(g =>
      g.id === id ? { ...g, ...updates } : g
    ));
  }, []);

  const deleteProfileGroup = useCallback((id: string) => {
    setProfileGroups(prev => prev.filter(g => g.id !== id));
  }, []);

  const addProfile = useCallback((groupId: string, profileData: Omit<Profile, 'id'>) => {
    const newProfile: Profile = {
      ...profileData,
      id: `p-${Date.now()}`
    };
    setProfileGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, profiles: [...g.profiles, newProfile] } : g
    ));
  }, []);

  const updateProfile = useCallback((groupId: string, profileId: string, updates: Partial<Profile>) => {
    setProfileGroups(prev => prev.map(g =>
      g.id === groupId ? {
        ...g,
        profiles: g.profiles.map(p => p.id === profileId ? { ...p, ...updates } : p)
      } : g
    ));
  }, []);

  const deleteProfile = useCallback((groupId: string, profileId: string) => {
    setProfileGroups(prev => prev.map(g =>
      g.id === groupId ? {
        ...g,
        profiles: g.profiles.filter(p => p.id !== profileId)
      } : g
    ));
  }, []);

  return (
    <AppContext.Provider value={{
      monitors,
      alerts,
      settings,
      profileGroups,
      addMonitor,
      updateMonitor,
      deleteMonitor,
      startMonitor,
      stopMonitor,
      startAllMonitors,
      stopAllMonitors,
      addAlert,
      clearAlerts,
      updateSettings,
      addProfileGroup,
      updateProfileGroup,
      deleteProfileGroup,
      addProfile,
      updateProfile,
      deleteProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};
