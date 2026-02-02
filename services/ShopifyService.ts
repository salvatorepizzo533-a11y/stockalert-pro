/**
 * ShopifyService - Basic Shopify checkout operations
 *
 * This service provides basic Shopify product fetching and cart operations.
 * It does NOT include any anti-bot bypass or fingerprint evasion.
 */

import { monitoringService } from './MonitoringService';

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  vendor: string;
  product_type: string;
  variants: ShopifyVariant[];
  images: { src: string }[];
  available: boolean;
}

export interface ShopifyVariant {
  id: number;
  title: string;
  price: string;
  available: boolean;
  option1: string | null; // Usually size
  option2: string | null; // Usually color
  option3: string | null;
  sku: string;
  inventory_quantity?: number;
}

export interface CartItem {
  variantId: number;
  quantity: number;
}

export interface CheckoutProfile {
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone: string;
}

export interface CheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
  productName?: string;
  price?: string;
  size?: string;
}

// CORS proxies for browser requests (fallback list)
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest='
];

let currentProxyIndex = 0;

class ShopifyService {
  /**
   * Fetch product data from Shopify store
   * Uses the public /products/{handle}.json endpoint
   */
  async getProduct(productUrl: string): Promise<ShopifyProduct | null> {
    try {
      const url = new URL(productUrl);
      const pathParts = url.pathname.split('/');
      const productsIndex = pathParts.indexOf('products');

      if (productsIndex === -1) {
        console.error('[Shopify] Invalid product URL - no "products" in path');
        return null;
      }

      const handle = pathParts[productsIndex + 1]?.split('?')[0];
      if (!handle) {
        console.error('[Shopify] Could not extract product handle');
        return null;
      }

      const jsonUrl = `${url.origin}/products/${handle}.json`;
      console.log(`[Shopify] Fetching product: ${jsonUrl}`);

      // Try each CORS proxy until one works
      for (let i = 0; i < CORS_PROXIES.length; i++) {
        const proxyIndex = (currentProxyIndex + i) % CORS_PROXIES.length;
        const proxy = CORS_PROXIES[proxyIndex];

        try {
          console.log(`[Shopify] Trying proxy ${proxyIndex + 1}/${CORS_PROXIES.length}`);

          const response = await fetch(proxy + encodeURIComponent(jsonUrl), {
            headers: {
              'Accept': 'application/json',
            }
          });

          if (!response.ok) {
            console.log(`[Shopify] Proxy ${proxyIndex + 1} returned HTTP ${response.status}`);
            continue;
          }

          const data = await response.json();
          if (data.product) {
            // Remember which proxy worked
            currentProxyIndex = proxyIndex;
            console.log(`[Shopify] ✅ Product fetched: ${data.product.title}`);
            return data.product as ShopifyProduct;
          }
        } catch (proxyError) {
          console.log(`[Shopify] Proxy ${proxyIndex + 1} failed:`, proxyError);
          continue;
        }
      }

      console.error('[Shopify] All proxies failed');
      return null;
    } catch (error) {
      console.error('[Shopify] Error fetching product:', error);
      return null;
    }
  }

  /**
   * Find a variant by size
   */
  findVariantBySize(product: ShopifyProduct, targetSize: string): ShopifyVariant | null {
    const normalizedTarget = targetSize.toLowerCase().trim();

    // Try exact match first
    for (const variant of product.variants) {
      if (!variant.available) continue;

      const variantSize = (variant.option1 || variant.title || '').toLowerCase().trim();
      if (variantSize === normalizedTarget) {
        return variant;
      }
    }

    // Try partial match (e.g., "42" matches "EU 42" or "42 EU")
    for (const variant of product.variants) {
      if (!variant.available) continue;

      const variantSize = (variant.option1 || variant.title || '').toLowerCase();
      if (variantSize.includes(normalizedTarget) || normalizedTarget.includes(variantSize.replace(/[^0-9.]/g, ''))) {
        return variant;
      }
    }

    return null;
  }

  /**
   * Find a random available variant
   */
  findRandomAvailableVariant(product: ShopifyProduct): ShopifyVariant | null {
    const available = product.variants.filter(v => v.available);
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  /**
   * Find variant within size range
   */
  findVariantInRange(product: ShopifyProduct, minSize: string, maxSize: string): ShopifyVariant | null {
    const minNum = parseFloat(minSize);
    const maxNum = parseFloat(maxSize);

    const available = product.variants.filter(v => {
      if (!v.available) return false;
      const sizeStr = v.option1 || v.title || '';
      const sizeNum = parseFloat(sizeStr.replace(/[^0-9.]/g, ''));
      return !isNaN(sizeNum) && sizeNum >= minNum && sizeNum <= maxNum;
    });

    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  /**
   * Generate add to cart URL (direct cart method)
   */
  getDirectCartUrl(storeUrl: string, variantId: number, quantity: number = 1): string {
    const origin = new URL(storeUrl).origin;
    return `${origin}/cart/${variantId}:${quantity}`;
  }

  /**
   * Generate checkout URL with variant
   */
  getCheckoutUrl(storeUrl: string, variantId: number, quantity: number = 1): string {
    const origin = new URL(storeUrl).origin;
    return `${origin}/checkout?updates[${variantId}]=${quantity}`;
  }

  /**
   * Generate checkout URL with pre-filled profile data
   * Shopify accepts checkout parameters for pre-filling customer info
   */
  getCheckoutUrlWithProfile(
    storeUrl: string,
    variantId: number,
    quantity: number = 1,
    profile?: CheckoutProfile
  ): string {
    const origin = new URL(storeUrl).origin;
    const params = new URLSearchParams();

    // Add cart item
    params.append(`updates[${variantId}]`, quantity.toString());

    // Add profile data if provided
    if (profile) {
      // Email
      if (profile.email) {
        params.append('checkout[email]', profile.email);
      }

      // Shipping address
      if (profile.firstName) {
        params.append('checkout[shipping_address][first_name]', profile.firstName);
      }
      if (profile.lastName) {
        params.append('checkout[shipping_address][last_name]', profile.lastName);
      }
      if (profile.address1) {
        params.append('checkout[shipping_address][address1]', profile.address1);
      }
      if (profile.address2) {
        params.append('checkout[shipping_address][address2]', profile.address2);
      }
      if (profile.city) {
        params.append('checkout[shipping_address][city]', profile.city);
      }
      if (profile.province) {
        params.append('checkout[shipping_address][province]', profile.province);
      }
      if (profile.zip) {
        params.append('checkout[shipping_address][zip]', profile.zip);
      }
      if (profile.country) {
        params.append('checkout[shipping_address][country]', profile.country);
      }
      if (profile.phone) {
        params.append('checkout[shipping_address][phone]', profile.phone);
      }

      // Billing address (same as shipping)
      if (profile.firstName) {
        params.append('checkout[billing_address][first_name]', profile.firstName);
      }
      if (profile.lastName) {
        params.append('checkout[billing_address][last_name]', profile.lastName);
      }
      if (profile.address1) {
        params.append('checkout[billing_address][address1]', profile.address1);
      }
      if (profile.address2) {
        params.append('checkout[billing_address][address2]', profile.address2);
      }
      if (profile.city) {
        params.append('checkout[billing_address][city]', profile.city);
      }
      if (profile.province) {
        params.append('checkout[billing_address][province]', profile.province);
      }
      if (profile.zip) {
        params.append('checkout[billing_address][zip]', profile.zip);
      }
      if (profile.country) {
        params.append('checkout[billing_address][country]', profile.country);
      }
      if (profile.phone) {
        params.append('checkout[billing_address][phone]', profile.phone);
      }
    }

    return `${origin}/cart/${variantId}:${quantity}?${params.toString()}`;
  }

  /**
   * Process a task - fetch product, find variant, return checkout URL
   */
  async processTask(
    productUrl: string,
    sizeMode: 'random' | 'specific' | 'range',
    specificSizes?: string[],
    rangeMin?: string,
    rangeMax?: string,
    minPrice?: number,
    maxPrice?: number,
    profile?: CheckoutProfile,
    quantity: number = 1
  ): Promise<CheckoutResult> {
    try {
      // 1. Fetch product data
      const product = await this.getProduct(productUrl);
      if (!product) {
        return { success: false, error: 'Failed to fetch product data' };
      }

      console.log(`[Shopify] Product: ${product.title}`);
      console.log(`[Shopify] Variants: ${product.variants.length}`);

      // 2. Check price filter
      const priceStr = product.variants[0]?.price || '0';
      const price = parseFloat(priceStr);

      if (minPrice && price < minPrice) {
        return { success: false, error: `Price ${price} below minimum ${minPrice}` };
      }
      if (maxPrice && price > maxPrice) {
        return { success: false, error: `Price ${price} above maximum ${maxPrice}` };
      }

      // 3. Find variant based on size mode
      let variant: ShopifyVariant | null = null;

      if (sizeMode === 'specific' && specificSizes && specificSizes.length > 0) {
        // Try each specific size until we find one available
        for (const size of specificSizes) {
          variant = this.findVariantBySize(product, size);
          if (variant) break;
        }
        if (!variant) {
          return { success: false, error: 'Specified sizes not available' };
        }
      } else if (sizeMode === 'range' && rangeMin && rangeMax) {
        variant = this.findVariantInRange(product, rangeMin, rangeMax);
        if (!variant) {
          return { success: false, error: 'No sizes available in specified range' };
        }
      } else {
        // Random mode
        variant = this.findRandomAvailableVariant(product);
        if (!variant) {
          return { success: false, error: 'No variants available' };
        }
      }

      console.log(`[Shopify] Selected variant: ${variant.title} (ID: ${variant.id})`);

      // 4. Generate checkout URL with profile pre-fill
      const checkoutUrl = profile
        ? this.getCheckoutUrlWithProfile(productUrl, variant.id, quantity, profile)
        : this.getDirectCartUrl(productUrl, variant.id, quantity);

      console.log(`[Shopify] Checkout URL generated ${profile ? 'with profile pre-fill' : 'without profile'}`);

      // 5. Format price for display
      const formattedPrice = `€${parseFloat(variant.price).toFixed(2)}`;

      return {
        success: true,
        checkoutUrl,
        productName: product.title,
        price: formattedPrice,
        size: variant.option1 || variant.title
      };
    } catch (error) {
      console.error('[Shopify] Task processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Open checkout in browser (for Electron)
   */
  openCheckout(checkoutUrl: string) {
    // In Electron, this will open in system browser
    // In web, this opens a new tab
    window.open(checkoutUrl, '_blank');
  }
}

export const shopifyService = new ShopifyService();
