
import { AppSettings } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  discord: {
    webhookUrl: '',
    enabled: true,
    mentionEveryone: false,
    testMode: false
  },
  checkIntervalDefault: 30,
  soundEnabled: true
};
