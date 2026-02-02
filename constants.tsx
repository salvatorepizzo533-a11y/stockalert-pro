
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
  captcha: {
    capsolverEnabled: false,
    capsolverApiKey: '',
    autoSolveHCaptcha: true,
    autoSolveReCaptcha: true
  },
  checkIntervalDefault: 30,
  soundEnabled: true
};
