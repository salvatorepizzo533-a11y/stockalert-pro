
import { AppSettings } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  discord: {
    webhookUrl: '',
    webhookRestock: '',
    webhookCheckout: '',
    webhookDecline: '',
    enabled: true,
    testMode: false
  },
  checkIntervalDefault: 30,
  soundEnabled: true
};
