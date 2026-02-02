import { ShopifyStore } from '../types';

export const SHOPIFY_STORES: ShopifyStore[] = [
  { id: 'supreme', name: 'Supreme', url: 'supremenewyork.com', region: 'EU', isCustom: false },
  { id: 'stanley1913', name: 'Stanley 1913', url: 'stanley1913.com', region: 'EU', isCustom: false },
  { id: 'slam-jam', name: 'Slam Jam', url: 'slamjam.com', region: 'EU', isCustom: false },
  { id: 'afew', name: 'Afew', url: 'afew-store.com', region: 'EU', isCustom: false },
  { id: 'naked', name: 'Naked', url: 'nakedcph.com', region: 'EU', isCustom: false },
  { id: 'sns', name: 'Sneakersnstuff', url: 'sneakersnstuff.com', region: 'EU', isCustom: false },
  { id: 'asphaltgold', name: 'Asphaltgold', url: 'asphaltgold.com', region: 'EU', isCustom: false },
  { id: 'kith', name: 'Kith', url: 'kith.com', region: 'EU', isCustom: false },
];

export const DEFAULT_SIZES = [
  'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
  '35', '35.5', '36', '36.5', '37', '37.5', '38', '38.5', '39', '39.5',
  '40', '40.5', '41', '41.5', '42', '42.5', '43', '43.5', '44', '44.5',
  '45', '45.5', '46', '46.5', '47', '47.5', '48', '48.5', '49', '50'
];

export const TASK_MODES = [
  { id: 'safe', name: 'Safe', description: 'Use when there are variants and a password page' },
  { id: 'safe-preload', name: 'Safe Preload', description: 'Use when anti-bot is active during a drop' },
  { id: 'fast', name: 'Fast', description: 'Use only when there is no anti-bot protection' },
];
