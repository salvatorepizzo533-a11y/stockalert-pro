
export enum AppSection {
  HOME = 'HOME',
  AUTOMATIONS = 'AUTOMATIONS',
  TASKS = 'TASKS',
  PROXIES = 'PROXIES',
  ACCOUNTS = 'ACCOUNTS',
  CAPTCHAS = 'CAPTCHAS',
  PROFILES = 'PROFILES',
  SETTINGS = 'SETTINGS'
}

export enum MonitorStatus {
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  ERROR = 'ERROR'
}

export interface StockAlert {
  id: string;
  productName: string;
  productUrl: string;
  productImage: string;
  storeName: string;
  price: string;
  status: 'In Stock' | 'Notified' | 'Out of Stock';
  timestamp: string;
  monitorId: string;
}

export interface Monitor {
  id: string;
  name: string;
  urls: string[];
  keywords: string[];
  negativeKeywords: string[];
  checkInterval: number; // in seconds
  status: MonitorStatus;
  stats: {
    alertsSent: number;
    lastCheck: string | null;
  };
}

export interface DiscordSettings {
  webhookUrl: string;
  webhookRestock: string;
  webhookCheckout: string;
  webhookDecline: string;
  enabled: boolean;
  testMode: boolean;
}

export interface AppSettings {
  discord: DiscordSettings;
  checkIntervalDefault: number;
  soundEnabled: boolean;
}

export interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  zip: string;
  country: string;
}

export interface PaymentCard {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  shipping: Address;
  billingSameAsShipping: boolean;
  billing?: Address;
  payment?: PaymentCard;
}

export interface ProfileGroup {
  id: string;
  name: string;
  profiles: Profile[];
  createdAt: string;
}

// ============ STORES ============

export interface ShopifyStore {
  id: string;
  name: string;
  url: string;
  region: 'EU' | 'UK';
  isCustom: boolean;
}

// ============ PROXIES ============

export type ProxyType = 'HTTP' | 'HTTPS' | 'SOCKS5';
export type ProxyStatus = 'untested' | 'active' | 'inactive' | 'error';

export interface Proxy {
  id: string;
  host: string;
  port: string;
  username?: string;
  password?: string;
  type: ProxyType;
  status: ProxyStatus;
  speed?: number; // ms
  lastTested?: string;
}

export interface ProxyGroup {
  id: string;
  name: string;
  proxies: Proxy[];
  createdAt: string;
}

// ============ ACCOUNTS ============

export type AccountStatus = 'untested' | 'valid' | 'invalid' | 'error';

export interface StoreAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  storeId: string;
  status: AccountStatus;
  lastTested?: string;
}

export interface AccountGroup {
  id: string;
  name: string;
  accounts: StoreAccount[];
  createdAt: string;
}

// ============ TASKS ============

export type TaskStatus = 'idle' | 'running' | 'waiting' | 'checkout' | 'success' | 'declined' | 'error';
export type InputMode = 'url' | 'keyword' | 'sku' | 'variant';
export type SizeMode = 'random' | 'specific' | 'range';
export type TaskMode = 'safe' | 'safe-preload' | 'fast';

export interface TaskSize {
  mode: SizeMode;
  specific?: string[];
  rangeMin?: string;
  rangeMax?: string;
}

export interface Task {
  id: string;
  productInput: string;
  inputMode: InputMode;
  profileId?: string;
  proxyId?: string;
  accountId?: string;
  size: TaskSize;
  status: TaskStatus;
  statusMessage?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface TaskGroupSettings {
  storeId: string;
  profileGroupId?: string;
  proxyGroupId?: string;
  accountGroupId?: string;
  taskMode: TaskMode;
  delayMin: number;
  delayMax: number;
  cartQuantity: number;
  minPrice?: number;
  maxPrice?: number;
  retryOnDecline: boolean;
  proxyRotation: boolean;
  monitorEnabled: boolean;
  monitorInterval: number;
  captchaAutoSolve: boolean;
}

export interface TaskGroup {
  id: string;
  name: string;
  settings: TaskGroupSettings;
  tasks: Task[];
  createdAt: string;
}

// ============ CAPTCHA ============

export interface CaptchaSettings {
  capsolverEnabled: boolean;
  capsolverApiKey: string;
  autoSolveHCaptcha: boolean;
  autoSolveReCaptcha: boolean;
}

export interface CaptchaStats {
  solvedToday: number;
  solvedTotal: number;
  balance: number;
  lastUpdated?: string;
}

// ============ ORDERS ============

export type OrderStatus = 'success' | 'declined' | 'pending';

export interface Order {
  id: string;
  taskId: string;
  taskGroupId: string;
  productName: string;
  productImage?: string;
  storeName: string;
  size: string;
  price: number;
  status: OrderStatus;
  orderNumber?: string;
  timestamp: string;
}

// ============ APP SETTINGS UPDATE ============

export interface AppSettings {
  discord: DiscordSettings;
  captcha: CaptchaSettings;
  checkIntervalDefault: number;
  soundEnabled: boolean;
}
