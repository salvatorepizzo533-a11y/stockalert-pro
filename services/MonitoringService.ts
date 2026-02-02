
import { Monitor, StockAlert, AppSettings } from '../types';

// CORS proxy for fetching external URLs from browser
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

interface StockCheckResult {
  inStock: boolean;
  productName: string;
  price: string;
  productImage: string;
  error?: string;
}

// Keywords that indicate a product is IN STOCK
const IN_STOCK_INDICATORS = [
  'add to cart',
  'add to bag',
  'buy now',
  'in stock',
  'available',
  'aggiungi al carrello',
  'acquista ora',
  'disponibile',
  'ajouter au panier',
  'añadir al carrito',
  'in den warenkorb',
];

// Keywords that indicate a product is OUT OF STOCK
const OUT_OF_STOCK_INDICATORS = [
  'sold out',
  'out of stock',
  'unavailable',
  'not available',
  'coming soon',
  'notify me',
  'esaurito',
  'non disponibile',
  'épuisé',
  'agotado',
  'ausverkauft',
  'currently unavailable',
  'avvisami',
  'notify when available',
];

class MonitoringService {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private onAlertCallback: ((alert: Omit<StockAlert, 'id' | 'timestamp'>) => void) | null = null;
  private onStatusUpdateCallback: ((monitorId: string, lastCheck: string) => void) | null = null;
  private settings: AppSettings | null = null;
  private lastAlertedUrls: Set<string> = new Set();

  setSettings(settings: AppSettings) {
    this.settings = settings;
  }

  setOnAlert(callback: (alert: Omit<StockAlert, 'id' | 'timestamp'>) => void) {
    this.onAlertCallback = callback;
  }

  setOnStatusUpdate(callback: (monitorId: string, lastCheck: string) => void) {
    this.onStatusUpdateCallback = callback;
  }

  async checkUrl(url: string): Promise<StockCheckResult> {
    try {
      const response = await fetch(CORS_PROXY + encodeURIComponent(url), {
        headers: {
          'Accept': 'text/html,application/xhtml+xml',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const lowerHtml = html.toLowerCase();

      // Extract product info
      const productName = this.extractProductName(html);
      const price = this.extractPrice(html, url);
      const productImage = this.extractImage(html, url);

      // Check stock status
      let inStock = false;
      let outOfStockFound = false;

      // First check for out of stock indicators
      for (const indicator of OUT_OF_STOCK_INDICATORS) {
        if (lowerHtml.includes(indicator)) {
          outOfStockFound = true;
          break;
        }
      }

      // Then check for in stock indicators
      if (!outOfStockFound) {
        for (const indicator of IN_STOCK_INDICATORS) {
          if (lowerHtml.includes(indicator)) {
            inStock = true;
            break;
          }
        }
      }

      // Shopify specific: check for variant availability in JSON
      const shopifyMatch = html.match(/"available"\s*:\s*(true|false)/gi);
      if (shopifyMatch) {
        inStock = shopifyMatch.some(m => m.includes('true'));
      }

      return {
        inStock,
        productName,
        price,
        productImage
      };
    } catch (error) {
      return {
        inStock: false,
        productName: 'Unknown Product',
        price: '',
        productImage: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private extractProductName(html: string): string {
    // Try meta og:title first
    const ogMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (ogMatch) return this.cleanText(ogMatch[1]);

    // Try twitter:title
    const twitterMatch = html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i);
    if (twitterMatch) return this.cleanText(twitterMatch[1]);

    // Try JSON-LD product name
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatch) {
      for (const match of jsonLdMatch) {
        try {
          const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '');
          const data = JSON.parse(jsonContent);
          if (data['@type'] === 'Product' && data.name) {
            return this.cleanText(data.name);
          }
          if (Array.isArray(data)) {
            const product = data.find((d: any) => d['@type'] === 'Product');
            if (product?.name) return this.cleanText(product.name);
          }
        } catch (e) {}
      }
    }

    // Try title tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)</i);
    if (titleMatch) return this.cleanText(titleMatch[1].split('|')[0].split('-')[0].split('–')[0]);

    return 'Unknown Product';
  }

  private extractPrice(html: string, url: string): string {
    const hostname = new URL(url).hostname.toLowerCase();

    // Detect currency from URL/site
    let defaultCurrency = 'EUR';
    if (hostname.includes('.com') && !hostname.includes('eu.')) {
      defaultCurrency = 'USD';
    } else if (hostname.includes('.co.uk') || hostname.includes('uk.')) {
      defaultCurrency = 'GBP';
    }

    // Method 1: JSON-LD structured data (most reliable)
    const jsonLdPrice = this.extractPriceFromJsonLdScript(html, defaultCurrency);
    if (jsonLdPrice) return jsonLdPrice;

    // Method 2: Shopify specific - product JSON in script
    const shopifyPrice = this.extractShopifyPrice(html, defaultCurrency);
    if (shopifyPrice) return shopifyPrice;

    // Method 3: Meta tags (product:price:amount)
    const metaPriceMatch = html.match(/<meta[^>]*property=["']product:price:amount["'][^>]*content=["']([^"']+)["']/i);
    const metaCurrencyMatch = html.match(/<meta[^>]*property=["']product:price:currency["'][^>]*content=["']([^"']+)["']/i);
    if (metaPriceMatch) {
      const currency = metaCurrencyMatch ? metaCurrencyMatch[1] : defaultCurrency;
      return this.formatPrice(metaPriceMatch[1], currency);
    }

    // Method 4: og:price:amount
    const ogPriceMatch = html.match(/<meta[^>]*property=["']og:price:amount["'][^>]*content=["']([^"']+)["']/i);
    if (ogPriceMatch) {
      const ogCurrencyMatch = html.match(/<meta[^>]*property=["']og:price:currency["'][^>]*content=["']([^"']+)["']/i);
      const currency = ogCurrencyMatch ? ogCurrencyMatch[1] : defaultCurrency;
      return this.formatPrice(ogPriceMatch[1], currency);
    }

    // Method 5: Nike specific
    const nikeMatch = html.match(/"currentPrice"\s*:\s*(\d+(?:\.\d+)?)/);
    if (nikeMatch) {
      return this.formatPrice(nikeMatch[1], defaultCurrency);
    }

    // Method 6: Look for price in common HTML patterns with currency
    const pricePatterns = [
      /€\s*(\d+(?:[.,]\d{2})?)/,
      /(\d+(?:[.,]\d{2})?)\s*€/,
      /EUR\s*(\d+(?:[.,]\d{2})?)/i,
      /(\d+(?:[.,]\d{2})?)\s*EUR/i,
      /\$\s*(\d+(?:[.,]\d{2})?)/,
      /(\d+(?:[.,]\d{2})?)\s*\$/,
      /£\s*(\d+(?:[.,]\d{2})?)/,
      /(\d+(?:[.,]\d{2})?)\s*£/,
    ];

    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match) {
        let currency = defaultCurrency;
        const fullMatch = match[0];
        if (fullMatch.includes('€') || fullMatch.toUpperCase().includes('EUR')) currency = 'EUR';
        if (fullMatch.includes('$') || fullMatch.toUpperCase().includes('USD')) currency = 'USD';
        if (fullMatch.includes('£') || fullMatch.toUpperCase().includes('GBP')) currency = 'GBP';
        return this.formatPrice(match[1], currency);
      }
    }

    return 'Price N/A';
  }

  private extractPriceFromJsonLdScript(html: string, defaultCurrency: string): string | null {
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (!jsonLdMatch) return null;

    for (const match of jsonLdMatch) {
      try {
        const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '');
        const data = JSON.parse(jsonContent);

        // Direct Product type
        if (data['@type'] === 'Product') {
          const price = this.extractPriceFromJsonLdProduct(data, defaultCurrency);
          if (price) return price;
        }

        // Array of types
        if (Array.isArray(data)) {
          for (const item of data) {
            if (item['@type'] === 'Product') {
              const price = this.extractPriceFromJsonLdProduct(item, defaultCurrency);
              if (price) return price;
            }
          }
        }

        // Nested @graph
        if (data['@graph']) {
          for (const item of data['@graph']) {
            if (item['@type'] === 'Product') {
              const price = this.extractPriceFromJsonLdProduct(item, defaultCurrency);
              if (price) return price;
            }
          }
        }
      } catch (e) {}
    }
    return null;
  }

  private extractPriceFromJsonLdProduct(product: any, defaultCurrency: string): string | null {
    if (!product.offers) return null;

    const offers = Array.isArray(product.offers) ? product.offers[0] : product.offers;
    const currency = offers.priceCurrency || defaultCurrency;

    // Try different price fields
    let priceValue: number | null = null;

    if (offers.price !== undefined && offers.price !== null) {
      priceValue = typeof offers.price === 'string' ? parseFloat(offers.price) : offers.price;
    } else if (offers.lowPrice !== undefined) {
      priceValue = typeof offers.lowPrice === 'string' ? parseFloat(offers.lowPrice) : offers.lowPrice;
    } else if (offers.highPrice !== undefined) {
      priceValue = typeof offers.highPrice === 'string' ? parseFloat(offers.highPrice) : offers.highPrice;
    }

    if (priceValue !== null && !isNaN(priceValue)) {
      return this.formatPriceExact(priceValue, currency);
    }

    return null;
  }

  private extractShopifyPrice(html: string, defaultCurrency: string): string | null {
    // Method 1: Look for product JSON with variants
    const productJsonMatch = html.match(/var\s+product\s*=\s*(\{[\s\S]*?\});/i);
    if (productJsonMatch) {
      try {
        const product = JSON.parse(productJsonMatch[1]);
        if (product.variants && product.variants[0]) {
          const priceInCents = product.variants[0].price;
          if (typeof priceInCents === 'number') {
            // Shopify stores prices in cents
            return this.formatPriceExact(priceInCents / 100, defaultCurrency);
          }
        }
      } catch (e) {}
    }

    // Method 2: Look for meta.product
    const metaProductMatch = html.match(/var\s+meta\s*=\s*(\{[\s\S]*?"product"[\s\S]*?\});/i);
    if (metaProductMatch) {
      try {
        const meta = JSON.parse(metaProductMatch[1]);
        if (meta.product?.variants?.[0]?.price) {
          const priceInCents = meta.product.variants[0].price;
          return this.formatPriceExact(priceInCents / 100, defaultCurrency);
        }
      } catch (e) {}
    }

    // Method 3: Look for ShopifyAnalytics with price
    const analyticsMatch = html.match(/ShopifyAnalytics\.meta\s*=\s*(\{[\s\S]*?\});/i);
    if (analyticsMatch) {
      try {
        const analytics = JSON.parse(analyticsMatch[1]);
        if (analytics.product?.price) {
          const priceInCents = analytics.product.price;
          return this.formatPriceExact(priceInCents / 100, defaultCurrency);
        }
      } catch (e) {}
    }

    // Method 4: Look for price in product script (Kith style)
    const priceMatch = html.match(/"price"\s*:\s*(\d+)(?:,|\s|")/);
    if (priceMatch) {
      const priceValue = parseInt(priceMatch[1]);
      // If price > 10000, it's likely in cents (e.g., 5100 = €51.00)
      // If price < 10000, check if it makes sense as cents or euros
      if (priceValue >= 100) {
        // Assume cents for Shopify
        return this.formatPriceExact(priceValue / 100, defaultCurrency);
      }
    }

    // Method 5: Look for Shopify CDN price format
    const cdnPriceMatch = html.match(/"price_min"\s*:\s*(\d+)/);
    if (cdnPriceMatch) {
      const priceInCents = parseInt(cdnPriceMatch[1]);
      return this.formatPriceExact(priceInCents / 100, defaultCurrency);
    }

    return null;
  }

  private formatPriceExact(amount: number, currency: string): string {
    if (isNaN(amount)) return 'Price N/A';

    const currencySymbols: Record<string, string> = {
      'EUR': '€',
      'USD': '$',
      'GBP': '£',
      'CHF': 'CHF ',
    };

    const symbol = currencySymbols[currency] || currency + ' ';

    // Format with exactly 2 decimal places, using comma for European format
    const formatted = amount.toFixed(2);

    // Use comma as decimal separator for EUR
    if (currency === 'EUR' || currency === 'CHF') {
      return `${formatted.replace('.', ',')} ${symbol}`;
    }

    // Use period for USD/GBP
    return `${symbol}${formatted}`;
  }

  private formatPrice(amount: string, currency: string): string {
    // Clean the amount string
    let cleanAmount = amount.trim();

    // Handle European format (comma as decimal)
    if (cleanAmount.includes(',') && !cleanAmount.includes('.')) {
      cleanAmount = cleanAmount.replace(',', '.');
    }
    // Handle format like 1.234,56
    if (cleanAmount.includes('.') && cleanAmount.includes(',')) {
      cleanAmount = cleanAmount.replace('.', '').replace(',', '.');
    }

    const numericPrice = parseFloat(cleanAmount);
    if (isNaN(numericPrice)) return 'Price N/A';

    return this.formatPriceExact(numericPrice, currency);
  }

  private cleanText(text: string): string {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractImage(html: string, baseUrl: string): string {
    // Try og:image first
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (ogMatch) {
      let imgUrl = ogMatch[1];
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
      return imgUrl;
    }

    // Try JSON-LD
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatch) {
      for (const match of jsonLdMatch) {
        try {
          const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '');
          const data = JSON.parse(jsonContent);
          if (data['@type'] === 'Product' && data.image) {
            const img = Array.isArray(data.image) ? data.image[0] : data.image;
            return typeof img === 'string' ? img : img.url || '';
          }
        } catch (e) {}
      }
    }

    return '';
  }

  async startMonitor(monitor: Monitor) {
    // Stop existing interval if any
    this.stopMonitor(monitor.id);

    console.log(`[Monitor] Starting: ${monitor.name}`);

    // Run check immediately
    await this.runCheck(monitor);

    // Set up interval
    const interval = setInterval(async () => {
      await this.runCheck(monitor);
    }, monitor.checkInterval * 1000);

    this.intervals.set(monitor.id, interval);
  }

  private async runCheck(monitor: Monitor) {
    console.log(`[Monitor] Checking: ${monitor.name}`);

    for (const url of monitor.urls) {
      const result = await this.checkUrl(url);

      // Update last check time
      if (this.onStatusUpdateCallback) {
        this.onStatusUpdateCallback(monitor.id, new Date().toLocaleTimeString());
      }

      if (result.error) {
        console.log(`[Monitor] Error checking ${url}: ${result.error}`);
        continue;
      }

      console.log(`[Monitor] ${result.productName} - ${result.price} - ${result.inStock ? 'IN STOCK' : 'OUT OF STOCK'}`);

      // Check keywords filter
      if (monitor.keywords.length > 0 && monitor.keywords[0] !== '') {
        const matchesKeyword = monitor.keywords.some(kw =>
          result.productName.toLowerCase().includes(kw.toLowerCase())
        );
        if (!matchesKeyword) continue;
      }

      // Check negative keywords
      if (monitor.negativeKeywords.length > 0) {
        const matchesNegative = monitor.negativeKeywords.some(kw =>
          result.productName.toLowerCase().includes(kw.toLowerCase())
        );
        if (matchesNegative) continue;
      }

      // Alert if in stock and not already alerted
      const alertKey = `${monitor.id}-${url}`;
      if (result.inStock && !this.lastAlertedUrls.has(alertKey)) {
        console.log(`[Monitor] 🚨 IN STOCK: ${result.productName} - ${result.price}`);

        this.lastAlertedUrls.add(alertKey);

        // Send Discord notification (use restock webhook)
        if (this.settings?.discord.webhookRestock && this.settings.discord.enabled) {
          await this.sendDiscordNotification(result, url, monitor, 'restock');
        }

        // Trigger alert callback
        if (this.onAlertCallback) {
          this.onAlertCallback({
            productName: result.productName,
            productUrl: url,
            productImage: result.productImage,
            storeName: new URL(url).hostname.replace('www.', ''),
            price: result.price,
            status: 'In Stock',
            monitorId: monitor.id
          });
        }

        // Play sound if enabled
        if (this.settings?.soundEnabled) {
          this.playNotificationSound();
        }
      } else if (!result.inStock) {
        // Remove from alerted set if out of stock (so we can alert again if it comes back)
        this.lastAlertedUrls.delete(alertKey);
      }
    }
  }

  private async sendDiscordNotification(
    result: StockCheckResult,
    url: string,
    monitor: Monitor,
    type: 'restock' | 'checkout' | 'decline' = 'restock'
  ) {
    // Get the correct webhook URL based on type
    let webhookUrl: string | undefined;
    let title: string;
    let color: number;

    switch (type) {
      case 'checkout':
        webhookUrl = this.settings?.discord.webhookCheckout;
        title = '✅ CHECKOUT SUCCESS!';
        color = 0x00FF00; // Green
        break;
      case 'decline':
        webhookUrl = this.settings?.discord.webhookDecline;
        title = '❌ PAYMENT DECLINED';
        color = 0xFF0000; // Red
        break;
      case 'restock':
      default:
        webhookUrl = this.settings?.discord.webhookRestock;
        title = '🚨 PRODUCT IN STOCK!';
        color = 0x9D80FE; // Purple (accent color)
        break;
    }

    if (!webhookUrl) return;

    // Parse price to get numeric value for embed
    const priceDisplay = result.price || 'N/A';

    const embed = {
      title,
      description: `**${result.productName}**`,
      color,
      fields: [
        {
          name: '💰 Price',
          value: priceDisplay,
          inline: true
        },
        {
          name: '🏪 Store',
          value: new URL(url).hostname.replace('www.', ''),
          inline: true
        },
        {
          name: '📡 Monitor',
          value: monitor.name,
          inline: true
        },
        {
          name: '🔗 Link',
          value: `[Click to Buy](${url})`,
          inline: false
        }
      ],
      thumbnail: result.productImage ? { url: result.productImage } : undefined,
      timestamp: new Date().toISOString(),
      footer: {
        text: 'StockAlert Pro v1.1.0'
      }
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [embed]
        })
      });
      console.log(`[Discord] ✅ ${type} notification sent!`);
    } catch (error) {
      console.error(`[Discord] ❌ Failed to send ${type} notification:`, error);
    }
  }

  // Public method to send checkout/decline notifications from TaskService
  async sendCheckoutNotification(
    productName: string,
    productUrl: string,
    productImage: string,
    price: string,
    type: 'checkout' | 'decline',
    taskName?: string
  ) {
    const result: StockCheckResult = {
      inStock: true,
      productName,
      price,
      productImage
    };

    const mockMonitor = {
      name: taskName || 'Task'
    } as Monitor;

    await this.sendDiscordNotification(result, productUrl, mockMonitor, type);
  }

  private playNotificationSound() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 200);
    } catch (e) {}
  }

  stopMonitor(monitorId: string) {
    const interval = this.intervals.get(monitorId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(monitorId);
      console.log(`[Monitor] Stopped: ${monitorId}`);
    }
  }

  stopAllMonitors() {
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.intervals.clear();
    console.log('[Monitor] All monitors stopped');
  }

  isRunning(monitorId: string): boolean {
    return this.intervals.has(monitorId);
  }
}

export const monitoringService = new MonitoringService();
