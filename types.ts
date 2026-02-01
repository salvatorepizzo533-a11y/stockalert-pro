
export enum AppSection {
  HOME = 'HOME',
  MONITORS = 'MONITORS',
  ALERTS = 'ALERTS',
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
  enabled: boolean;
  mentionEveryone: boolean;
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
