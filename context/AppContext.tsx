
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Monitor, StockAlert, AppSettings, MonitorStatus, ProfileGroup, Profile,
  ProxyGroup, Proxy, AccountGroup, StoreAccount, TaskGroup, Task, Order,
  ShopifyStore, CaptchaStats
} from '../types';
import { monitoringService } from '../services/MonitoringService';
import { shopifyService, CheckoutProfile } from '../services/ShopifyService';
import { SHOPIFY_STORES } from '../data/stores';

interface AppContextType {
  // Existing
  monitors: Monitor[];
  alerts: StockAlert[];
  settings: AppSettings;
  profileGroups: ProfileGroup[];
  // New
  proxyGroups: ProxyGroup[];
  accountGroups: AccountGroup[];
  taskGroups: TaskGroup[];
  orders: Order[];
  customStores: ShopifyStore[];
  captchaStats: CaptchaStats;
  allStores: ShopifyStore[];

  // Monitor functions
  addMonitor: (monitor: Omit<Monitor, 'id' | 'stats' | 'status'>) => void;
  updateMonitor: (id: string, updates: Partial<Monitor>) => void;
  deleteMonitor: (id: string) => void;
  startMonitor: (id: string) => void;
  stopMonitor: (id: string) => void;
  startAllMonitors: () => void;
  stopAllMonitors: () => void;

  // Alert functions
  addAlert: (alert: Omit<StockAlert, 'id' | 'timestamp'>) => void;
  clearAlerts: () => void;

  // Settings functions
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Profile functions
  addProfileGroup: (name: string) => void;
  updateProfileGroup: (id: string, updates: Partial<ProfileGroup>) => void;
  deleteProfileGroup: (id: string) => void;
  addProfile: (groupId: string, profile: Omit<Profile, 'id'>) => void;
  updateProfile: (groupId: string, profileId: string, updates: Partial<Profile>) => void;
  deleteProfile: (groupId: string, profileId: string) => void;

  // Proxy functions
  addProxyGroup: (name: string) => void;
  updateProxyGroup: (id: string, updates: Partial<ProxyGroup>) => void;
  deleteProxyGroup: (id: string) => void;
  addProxy: (groupId: string, proxy: Omit<Proxy, 'id' | 'status'>) => void;
  addProxiesBulk: (groupId: string, proxiesText: string) => void;
  updateProxy: (groupId: string, proxyId: string, updates: Partial<Proxy>) => void;
  deleteProxy: (groupId: string, proxyId: string) => void;
  deleteSelectedProxies: (groupId: string, proxyIds: string[]) => void;

  // Account functions
  addAccountGroup: (name: string) => void;
  updateAccountGroup: (id: string, updates: Partial<AccountGroup>) => void;
  deleteAccountGroup: (id: string) => void;
  addAccount: (groupId: string, account: Omit<StoreAccount, 'id' | 'status'>) => void;
  updateAccount: (groupId: string, accountId: string, updates: Partial<StoreAccount>) => void;
  deleteAccount: (groupId: string, accountId: string) => void;
  deleteSelectedAccounts: (groupId: string, accountIds: string[]) => void;

  // Task functions
  addTaskGroup: (name: string, settings: TaskGroup['settings']) => void;
  updateTaskGroup: (id: string, updates: Partial<TaskGroup>) => void;
  deleteTaskGroup: (id: string) => void;
  addTask: (groupId: string, task: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
  updateTask: (groupId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (groupId: string, taskId: string) => void;
  deleteSelectedTasks: (groupId: string, taskIds: string[]) => void;
  startTask: (groupId: string, taskId: string) => void;
  stopTask: (groupId: string, taskId: string) => void;
  startAllTasks: (groupId: string) => void;
  stopAllTasks: (groupId: string) => void;
  startSelectedTasks: (groupId: string, taskIds: string[]) => void;
  stopSelectedTasks: (groupId: string, taskIds: string[]) => void;

  // Order functions
  addOrder: (order: Omit<Order, 'id' | 'timestamp'>) => void;
  clearOrders: () => void;

  // Store functions
  addCustomStore: (store: Omit<ShopifyStore, 'id' | 'isCustom'>) => void;
  deleteCustomStore: (id: string) => void;

  // Captcha functions
  updateCaptchaStats: (stats: Partial<CaptchaStats>) => void;
}

const defaultSettings: AppSettings = {
  discord: {
    webhookUrl: '',
    webhookRestock: '',
    webhookCheckout: '',
    webhookDecline: '',
    enabled: true,
    testMode: false
  },
  captcha: {
    capsolverEnabled: false,
    capsolverApiKey: '',
    autoSolveHCaptcha: true,
    autoSolveReCaptcha: true
  },
  checkIntervalDefault: 30,
  soundEnabled: true
};

const defaultCaptchaStats: CaptchaStats = {
  solvedToday: 0,
  solvedTotal: 0,
  balance: 0
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
  // Existing state
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

  // New state
  const [proxyGroups, setProxyGroups] = useState<ProxyGroup[]>(() =>
    loadFromStorage('stockmonitor_proxygroups', [])
  );
  const [accountGroups, setAccountGroups] = useState<AccountGroup[]>(() =>
    loadFromStorage('stockmonitor_accountgroups', [])
  );
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>(() =>
    loadFromStorage('stockmonitor_taskgroups', [])
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage('stockmonitor_orders', [])
  );
  const [customStores, setCustomStores] = useState<ShopifyStore[]>(() =>
    loadFromStorage('stockmonitor_customstores', [])
  );
  const [captchaStats, setCaptchaStats] = useState<CaptchaStats>(() =>
    loadFromStorage('stockmonitor_captchastats', defaultCaptchaStats)
  );

  // Combine built-in and custom stores
  const allStores = [...SHOPIFY_STORES, ...customStores];

  // Save to localStorage when data changes
  useEffect(() => { saveToStorage('stockmonitor_monitors', monitors); }, [monitors]);
  useEffect(() => { saveToStorage('stockmonitor_alerts', alerts); }, [alerts]);
  useEffect(() => {
    saveToStorage('stockmonitor_settings', settings);
    monitoringService.setSettings(settings);
  }, [settings]);
  useEffect(() => { saveToStorage('stockmonitor_profilegroups', profileGroups); }, [profileGroups]);
  useEffect(() => { saveToStorage('stockmonitor_proxygroups', proxyGroups); }, [proxyGroups]);
  useEffect(() => { saveToStorage('stockmonitor_accountgroups', accountGroups); }, [accountGroups]);
  useEffect(() => { saveToStorage('stockmonitor_taskgroups', taskGroups); }, [taskGroups]);
  useEffect(() => { saveToStorage('stockmonitor_orders', orders); }, [orders]);
  useEffect(() => { saveToStorage('stockmonitor_customstores', customStores); }, [customStores]);
  useEffect(() => { saveToStorage('stockmonitor_captchastats', captchaStats); }, [captchaStats]);

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

    monitors.forEach(monitor => {
      if (monitor.status === MonitorStatus.RUNNING) {
        monitoringService.startMonitor(monitor);
      }
    });

    return () => {
      monitoringService.stopAllMonitors();
    };
  }, []);

  // ============ MONITOR FUNCTIONS ============
  const addMonitor = useCallback((monitorData: Omit<Monitor, 'id' | 'stats' | 'status'>) => {
    const newMonitor: Monitor = {
      ...monitorData,
      id: `m-${Date.now()}`,
      status: MonitorStatus.STOPPED,
      stats: { alertsSent: 0, lastCheck: null }
    };
    setMonitors(prev => [...prev, newMonitor]);
  }, []);

  const updateMonitor = useCallback((id: string, updates: Partial<Monitor>) => {
    setMonitors(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
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
        m.id === id ? { ...m, status: MonitorStatus.RUNNING, stats: { ...m.stats, lastCheck: 'Starting...' } } : m
      );
    });
  }, []);

  const stopMonitor = useCallback((id: string) => {
    monitoringService.stopMonitor(id);
    setMonitors(prev => prev.map(m => m.id === id ? { ...m, status: MonitorStatus.STOPPED } : m));
  }, []);

  const startAllMonitors = useCallback(() => {
    setMonitors(prev => {
      prev.forEach(monitor => {
        monitoringService.startMonitor({ ...monitor, status: MonitorStatus.RUNNING });
      });
      return prev.map(m => ({ ...m, status: MonitorStatus.RUNNING, stats: { ...m.stats, lastCheck: 'Starting...' } }));
    });
  }, []);

  const stopAllMonitors = useCallback(() => {
    monitoringService.stopAllMonitors();
    setMonitors(prev => prev.map(m => ({ ...m, status: MonitorStatus.STOPPED })));
  }, []);

  // ============ ALERT FUNCTIONS ============
  const addAlert = useCallback((alertData: Omit<StockAlert, 'id' | 'timestamp'>) => {
    const newAlert: StockAlert = {
      ...alertData,
      id: `a-${Date.now()}`,
      timestamp: new Date().toLocaleString()
    };
    setAlerts(prev => [newAlert, ...prev].slice(0, 100));
  }, []);

  const clearAlerts = useCallback(() => { setAlerts([]); }, []);

  // ============ SETTINGS FUNCTIONS ============
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.discord) {
        updated.discord = { ...prev.discord, ...newSettings.discord };
      }
      if (newSettings.captcha) {
        updated.captcha = { ...prev.captcha, ...newSettings.captcha };
      }
      return updated;
    });
  }, []);

  // ============ PROFILE FUNCTIONS ============
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
    setProfileGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, []);

  const deleteProfileGroup = useCallback((id: string) => {
    setProfileGroups(prev => prev.filter(g => g.id !== id));
  }, []);

  const addProfile = useCallback((groupId: string, profileData: Omit<Profile, 'id'>) => {
    const newProfile: Profile = { ...profileData, id: `p-${Date.now()}` };
    setProfileGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, profiles: [...g.profiles, newProfile] } : g
    ));
  }, []);

  const updateProfile = useCallback((groupId: string, profileId: string, updates: Partial<Profile>) => {
    setProfileGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, profiles: g.profiles.map(p => p.id === profileId ? { ...p, ...updates } : p) } : g
    ));
  }, []);

  const deleteProfile = useCallback((groupId: string, profileId: string) => {
    setProfileGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, profiles: g.profiles.filter(p => p.id !== profileId) } : g
    ));
  }, []);

  // ============ PROXY FUNCTIONS ============
  const addProxyGroup = useCallback((name: string) => {
    const newGroup: ProxyGroup = {
      id: `pxg-${Date.now()}`,
      name,
      proxies: [],
      createdAt: new Date().toISOString()
    };
    setProxyGroups(prev => [...prev, newGroup]);
  }, []);

  const updateProxyGroup = useCallback((id: string, updates: Partial<ProxyGroup>) => {
    setProxyGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, []);

  const deleteProxyGroup = useCallback((id: string) => {
    setProxyGroups(prev => prev.filter(g => g.id !== id));
  }, []);

  const addProxy = useCallback((groupId: string, proxyData: Omit<Proxy, 'id' | 'status'>) => {
    const newProxy: Proxy = { ...proxyData, id: `px-${Date.now()}`, status: 'untested' };
    setProxyGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, proxies: [...g.proxies, newProxy] } : g
    ));
  }, []);

  const addProxiesBulk = useCallback((groupId: string, proxiesText: string) => {
    const lines = proxiesText.split('\n').filter(line => line.trim());
    const newProxies: Proxy[] = lines.map((line, index) => {
      const parts = line.trim().split(':');
      return {
        id: `px-${Date.now()}-${index}`,
        host: parts[0] || '',
        port: parts[1] || '',
        username: parts[2] || undefined,
        password: parts[3] || undefined,
        type: 'HTTP' as const,
        status: 'untested' as const
      };
    });
    setProxyGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, proxies: [...g.proxies, ...newProxies] } : g
    ));
  }, []);

  const updateProxy = useCallback((groupId: string, proxyId: string, updates: Partial<Proxy>) => {
    setProxyGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, proxies: g.proxies.map(p => p.id === proxyId ? { ...p, ...updates } : p) } : g
    ));
  }, []);

  const deleteProxy = useCallback((groupId: string, proxyId: string) => {
    setProxyGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, proxies: g.proxies.filter(p => p.id !== proxyId) } : g
    ));
  }, []);

  const deleteSelectedProxies = useCallback((groupId: string, proxyIds: string[]) => {
    setProxyGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, proxies: g.proxies.filter(p => !proxyIds.includes(p.id)) } : g
    ));
  }, []);

  // ============ ACCOUNT FUNCTIONS ============
  const addAccountGroup = useCallback((name: string) => {
    const newGroup: AccountGroup = {
      id: `ag-${Date.now()}`,
      name,
      accounts: [],
      createdAt: new Date().toISOString()
    };
    setAccountGroups(prev => [...prev, newGroup]);
  }, []);

  const updateAccountGroup = useCallback((id: string, updates: Partial<AccountGroup>) => {
    setAccountGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, []);

  const deleteAccountGroup = useCallback((id: string) => {
    setAccountGroups(prev => prev.filter(g => g.id !== id));
  }, []);

  const addAccount = useCallback((groupId: string, accountData: Omit<StoreAccount, 'id' | 'status'>) => {
    const newAccount: StoreAccount = { ...accountData, id: `acc-${Date.now()}`, status: 'untested' };
    setAccountGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, accounts: [...g.accounts, newAccount] } : g
    ));
  }, []);

  const updateAccount = useCallback((groupId: string, accountId: string, updates: Partial<StoreAccount>) => {
    setAccountGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, accounts: g.accounts.map(a => a.id === accountId ? { ...a, ...updates } : a) } : g
    ));
  }, []);

  const deleteAccount = useCallback((groupId: string, accountId: string) => {
    setAccountGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, accounts: g.accounts.filter(a => a.id !== accountId) } : g
    ));
  }, []);

  const deleteSelectedAccounts = useCallback((groupId: string, accountIds: string[]) => {
    setAccountGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, accounts: g.accounts.filter(a => !accountIds.includes(a.id)) } : g
    ));
  }, []);

  // ============ TASK FUNCTIONS ============
  const addTaskGroup = useCallback((name: string, settings: TaskGroup['settings']) => {
    const newGroup: TaskGroup = {
      id: `tg-${Date.now()}`,
      name,
      settings,
      tasks: [],
      createdAt: new Date().toISOString()
    };
    setTaskGroups(prev => [...prev, newGroup]);
  }, []);

  const updateTaskGroup = useCallback((id: string, updates: Partial<TaskGroup>) => {
    setTaskGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, []);

  const deleteTaskGroup = useCallback((id: string) => {
    setTaskGroups(prev => prev.filter(g => g.id !== id));
  }, []);

  const addTask = useCallback((groupId: string, taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `t-${Date.now()}`,
      status: 'idle',
      createdAt: new Date().toISOString()
    };
    setTaskGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, tasks: [...g.tasks, newTask] } : g
    ));
  }, []);

  const updateTask = useCallback((groupId: string, taskId: string, updates: Partial<Task>) => {
    setTaskGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, tasks: g.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) } : g
    ));
  }, []);

  const deleteTask = useCallback((groupId: string, taskId: string) => {
    setTaskGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, tasks: g.tasks.filter(t => t.id !== taskId) } : g
    ));
  }, []);

  const deleteSelectedTasks = useCallback((groupId: string, taskIds: string[]) => {
    setTaskGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, tasks: g.tasks.filter(t => !taskIds.includes(t.id)) } : g
    ));
  }, []);

  const startTask = useCallback(async (groupId: string, taskId: string) => {
    // Find the task and group
    const group = taskGroups.find(g => g.id === groupId);
    const task = group?.tasks.find(t => t.id === taskId);
    if (!group || !task) return;

    // Update status to running
    setTaskGroups(prev => prev.map(g =>
      g.id === groupId ? {
        ...g,
        tasks: g.tasks.map(t => t.id === taskId ? { ...t, status: 'running' as const, startedAt: new Date().toISOString() } : t)
      } : g
    ));

    try {
      // Process the task
      console.log(`[Task] Starting: ${task.productInput}`);

      // Find profile for pre-fill
      let checkoutProfile: CheckoutProfile | undefined;

      // First check if task has a specific profile
      if (task.profileId) {
        for (const pg of profileGroups) {
          const profile = pg.profiles.find(p => p.id === task.profileId);
          if (profile && profile.shipping) {
            checkoutProfile = {
              email: profile.email,
              firstName: profile.shipping.firstName,
              lastName: profile.shipping.lastName,
              address1: profile.shipping.address1,
              address2: profile.shipping.address2 || '',
              city: profile.shipping.city,
              province: profile.shipping.province,
              zip: profile.shipping.zip,
              country: profile.shipping.country,
              phone: profile.phone
            };
            console.log(`[Task] Using profile: ${profile.shipping.firstName} ${profile.shipping.lastName}`);
            break;
          }
        }
      }

      // If no task profile, try group's profile group
      if (!checkoutProfile && group.settings.profileGroupId) {
        const profileGroup = profileGroups.find(pg => pg.id === group.settings.profileGroupId);
        if (profileGroup && profileGroup.profiles.length > 0) {
          // Use first profile in group (could randomize later)
          const profile = profileGroup.profiles[0];
          if (profile.shipping) {
            checkoutProfile = {
              email: profile.email,
              firstName: profile.shipping.firstName,
              lastName: profile.shipping.lastName,
              address1: profile.shipping.address1,
              address2: profile.shipping.address2 || '',
              city: profile.shipping.city,
              province: profile.shipping.province,
              zip: profile.shipping.zip,
              country: profile.shipping.country,
              phone: profile.phone
            };
            console.log(`[Task] Using group profile: ${profile.shipping.firstName} ${profile.shipping.lastName}`);
          }
        }
      }

      // Determine product URL
      let productUrl = task.productInput;
      if (task.inputMode === 'url' && productUrl) {
        // Process checkout
        const result = await shopifyService.processTask(
          productUrl,
          task.size.mode,
          task.size.specific,
          task.size.rangeMin,
          task.size.rangeMax,
          group.settings.minPrice,
          group.settings.maxPrice,
          checkoutProfile,
          group.settings.cartQuantity || 1
        );

        if (result.success && result.checkoutUrl) {
          console.log(`[Task] ✅ Checkout URL: ${result.checkoutUrl}`);

          // Update task status to checkout
          setTaskGroups(prev => prev.map(g =>
            g.id === groupId ? {
              ...g,
              tasks: g.tasks.map(t => t.id === taskId ? { ...t, status: 'checkout' as const } : t)
            } : g
          ));

          // Open checkout in browser
          shopifyService.openCheckout(result.checkoutUrl);

          // Add to orders directly using setOrders
          const newOrder: Order = {
            id: `o-${Date.now()}`,
            productName: result.productName || 'Unknown Product',
            productUrl,
            productImage: '',
            storeName: new URL(productUrl).hostname.replace('www.', ''),
            price: parseFloat(result.price?.replace(/[^0-9.]/g, '') || '0'),
            size: result.size || 'N/A',
            status: 'pending',
            timestamp: new Date().toISOString()
          };
          setOrders(prev => [newOrder, ...prev].slice(0, 500));

          // Send Discord notification if checkout webhook is set
          if (settings.discord.webhookCheckout && settings.discord.enabled) {
            await monitoringService.sendCheckoutNotification(
              result.productName || 'Unknown Product',
              productUrl,
              '',
              result.price || 'N/A',
              'checkout',
              group.name
            );
          }

          // Update task to success after a delay
          setTimeout(() => {
            setTaskGroups(prev => prev.map(g =>
              g.id === groupId ? {
                ...g,
                tasks: g.tasks.map(t => t.id === taskId ? { ...t, status: 'success' as const } : t)
              } : g
            ));
          }, 2000);
        } else {
          console.log(`[Task] ❌ Failed: ${result.error}`);

          // Update task to error
          setTaskGroups(prev => prev.map(g =>
            g.id === groupId ? {
              ...g,
              tasks: g.tasks.map(t => t.id === taskId ? { ...t, status: 'error' as const } : t)
            } : g
          ));
        }
      } else {
        // For non-URL modes, just mark as error for now
        console.log(`[Task] Mode ${task.inputMode} not yet supported for auto-checkout`);
        setTaskGroups(prev => prev.map(g =>
          g.id === groupId ? {
            ...g,
            tasks: g.tasks.map(t => t.id === taskId ? { ...t, status: 'error' as const } : t)
          } : g
        ));
      }
    } catch (error) {
      console.error('[Task] Error:', error);
      setTaskGroups(prev => prev.map(g =>
        g.id === groupId ? {
          ...g,
          tasks: g.tasks.map(t => t.id === taskId ? { ...t, status: 'error' as const } : t)
        } : g
      ));
    }
  }, [taskGroups, settings, profileGroups]);

  const stopTask = useCallback((groupId: string, taskId: string) => {
    setTaskGroups(prev => prev.map(g =>
      g.id === groupId ? {
        ...g,
        tasks: g.tasks.map(t => t.id === taskId ? { ...t, status: 'idle' as const } : t)
      } : g
    ));
  }, []);

  const startAllTasks = useCallback((groupId: string) => {
    setTaskGroups(prev => prev.map(g =>
      g.id === groupId ? {
        ...g,
        tasks: g.tasks.map(t => ({ ...t, status: 'running' as const, startedAt: new Date().toISOString() }))
      } : g
    ));
  }, []);

  const stopAllTasks = useCallback((groupId: string) => {
    setTaskGroups(prev => prev.map(g =>
      g.id === groupId ? {
        ...g,
        tasks: g.tasks.map(t => ({ ...t, status: 'idle' as const }))
      } : g
    ));
  }, []);

  const startSelectedTasks = useCallback((groupId: string, taskIds: string[]) => {
    setTaskGroups(prev => prev.map(g =>
      g.id === groupId ? {
        ...g,
        tasks: g.tasks.map(t => taskIds.includes(t.id) ? { ...t, status: 'running' as const, startedAt: new Date().toISOString() } : t)
      } : g
    ));
  }, []);

  const stopSelectedTasks = useCallback((groupId: string, taskIds: string[]) => {
    setTaskGroups(prev => prev.map(g =>
      g.id === groupId ? {
        ...g,
        tasks: g.tasks.map(t => taskIds.includes(t.id) ? { ...t, status: 'idle' as const } : t)
      } : g
    ));
  }, []);

  // ============ ORDER FUNCTIONS ============
  const addOrder = useCallback((orderData: Omit<Order, 'id' | 'timestamp'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `o-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setOrders(prev => [newOrder, ...prev].slice(0, 500));
  }, []);

  const clearOrders = useCallback(() => { setOrders([]); }, []);

  // ============ STORE FUNCTIONS ============
  const addCustomStore = useCallback((storeData: Omit<ShopifyStore, 'id' | 'isCustom'>) => {
    const newStore: ShopifyStore = {
      ...storeData,
      id: `cs-${Date.now()}`,
      isCustom: true
    };
    setCustomStores(prev => [...prev, newStore]);
  }, []);

  const deleteCustomStore = useCallback((id: string) => {
    setCustomStores(prev => prev.filter(s => s.id !== id));
  }, []);

  // ============ CAPTCHA FUNCTIONS ============
  const updateCaptchaStats = useCallback((stats: Partial<CaptchaStats>) => {
    setCaptchaStats(prev => ({ ...prev, ...stats }));
  }, []);

  return (
    <AppContext.Provider value={{
      monitors,
      alerts,
      settings,
      profileGroups,
      proxyGroups,
      accountGroups,
      taskGroups,
      orders,
      customStores,
      captchaStats,
      allStores,
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
      deleteProfile,
      addProxyGroup,
      updateProxyGroup,
      deleteProxyGroup,
      addProxy,
      addProxiesBulk,
      updateProxy,
      deleteProxy,
      deleteSelectedProxies,
      addAccountGroup,
      updateAccountGroup,
      deleteAccountGroup,
      addAccount,
      updateAccount,
      deleteAccount,
      deleteSelectedAccounts,
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
      addOrder,
      clearOrders,
      addCustomStore,
      deleteCustomStore,
      updateCaptchaStats
    }}>
      {children}
    </AppContext.Provider>
  );
};
