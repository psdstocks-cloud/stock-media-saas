/**
 * Comprehensive URL Parser for Stock Media Sites
 * Handles 25+ different URL formats across various platforms
 * Based on Nehtw API's idExtractor function
 */

export interface ParsedUrl {
  source: string;
  id: string;
  url: string;
}

export interface UrlParseResult {
  success: boolean;
  data?: ParsedUrl;
  error?: string;
}

/**
 * Comprehensive URL parser for stock media sites
 * Translated from Nehtw API's idExtractor function
 */
export class UrlParser {
  private static readonly URL_PATTERNS = [
    // Shutterstock patterns - extract just the numeric ID
    { source: 'shutterstock', pattern: /shutterstock\.com\/(?:image-)?(?:photo|vector|illustration|video)\/[^\/\?]*?(\d+)/i },
    { source: 'shutterstock', pattern: /shutterstock\.com\/[^\/]*?(\d+)/i },
    
    // Getty Images patterns
    { source: 'getty', pattern: /gettyimages\.com\/detail\/(?:photo|illustration|vector|video)\/([^\/\?]+)/i },
    { source: 'getty', pattern: /gettyimages\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Adobe Stock patterns
    { source: 'adobe', pattern: /stock\.adobe\.com\/images\/([^\/\?]+)/i },
    { source: 'adobe', pattern: /adobe\.com\/stock\/[^\/]+\/([^\/\?]+)/i },
    
    // Unsplash patterns
    { source: 'unsplash', pattern: /unsplash\.com\/photos\/([^\/\?]+)/i },
    { source: 'unsplash', pattern: /unsplash\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Pexels patterns
    { source: 'pexels', pattern: /pexels\.com\/photo\/([^\/\?]+)/i },
    { source: 'pexels', pattern: /pexels\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Pixabay patterns
    { source: 'pixabay', pattern: /pixabay\.com\/(?:photos|images|vectors|videos)\/([^\/\?]+)/i },
    { source: 'pixabay', pattern: /pixabay\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Depositphotos patterns
    { source: 'depositphotos', pattern: /depositphotos\.com\/[^\/]+\/[^\/]+\/([^\/\?]+)/i },
    { source: 'depositphotos', pattern: /depositphotos\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // 123RF patterns
    { source: '123rf', pattern: /123rf\.com\/stock-photo\/([^\/\?]+)/i },
    { source: '123rf', pattern: /123rf\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Dreamstime patterns
    { source: 'dreamstime', pattern: /dreamstime\.com\/stock-photo-([^\/\?]+)/i },
    { source: 'dreamstime', pattern: /dreamstime\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // iStock patterns
    { source: 'istock', pattern: /istockphoto\.com\/photo\/([^\/\?]+)/i },
    { source: 'istock', pattern: /istockphoto\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Freepik patterns
    { source: 'freepik', pattern: /freepik\.com\/(?:photos|vectors|icons)\/([^\/\?]+)/i },
    { source: 'freepik', pattern: /freepik\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Pond5 patterns
    { source: 'pond5', pattern: /pond5\.com\/stock-footage\/([^\/\?]+)/i },
    { source: 'pond5', pattern: /pond5\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Storyblocks patterns
    { source: 'storyblocks', pattern: /storyblocks\.com\/(?:video|audio|image)\/([^\/\?]+)/i },
    { source: 'storyblocks', pattern: /storyblocks\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Envato Elements patterns
    { source: 'envato', pattern: /elements\.envato\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'envato', pattern: /envato\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Canva patterns
    { source: 'canva', pattern: /canva\.com\/design\/[^\/]+\/([^\/\?]+)/i },
    { source: 'canva', pattern: /canva\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Vecteezy patterns
    { source: 'vecteezy', pattern: /vecteezy\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'vecteezy', pattern: /vecteezy\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Bigstock patterns
    { source: 'bigstock', pattern: /bigstockphoto\.com\/[^\/]+\/[^\/]+\/([^\/\?]+)/i },
    { source: 'bigstock', pattern: /bigstockphoto\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Alamy patterns
    { source: 'alamy', pattern: /alamy\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'alamy', pattern: /alamy\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Rawpixel patterns
    { source: 'rawpixel', pattern: /rawpixel\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'rawpixel', pattern: /rawpixel\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Flaticon patterns
    { source: 'flaticon', pattern: /flaticon\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'flaticon', pattern: /flaticon\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // IconScout patterns
    { source: 'iconscout', pattern: /iconscout\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'iconscout', pattern: /iconscout\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Motion Array patterns
    { source: 'motionarray', pattern: /motionarray\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'motionarray', pattern: /motionarray\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Videoblocks patterns
    { source: 'videoblocks', pattern: /videoblocks\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'videoblocks', pattern: /videoblocks\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Epidemic Sound patterns
    { source: 'epidemicsound', pattern: /epidemicsound\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'epidemicsound', pattern: /epidemicsound\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Soundstripe patterns
    { source: 'soundstripe', pattern: /soundstripe\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'soundstripe', pattern: /soundstripe\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Artlist patterns
    { source: 'artlist', pattern: /artlist\.io\/[^\/]+\/([^\/\?]+)/i },
    { source: 'artlist', pattern: /artlist\.io\/[^\/]+\/([^\/\?]+)/i },
    
    // Creative Fabrica patterns
    { source: 'creativefabrica', pattern: /creativefabrica\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'creativefabrica', pattern: /creativefabrica\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Craftwork patterns
    { source: 'craftwork', pattern: /craftwork\.design\/[^\/]+\/([^\/\?]+)/i },
    { source: 'craftwork', pattern: /craftwork\.design\/[^\/]+\/([^\/\?]+)/i },
    
    // UI8 patterns
    { source: 'ui8', pattern: /ui8\.net\/[^\/]+\/([^\/\?]+)/i },
    { source: 'ui8', pattern: /ui8\.net\/[^\/]+\/([^\/\?]+)/i },
    
    // Pixeden patterns
    { source: 'pixeden', pattern: /pixeden\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'pixeden', pattern: /pixeden\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Pixel Buddha patterns
    { source: 'pixelbuddha', pattern: /pixelbuddha\.net\/[^\/]+\/([^\/\?]+)/i },
    { source: 'pixelbuddha', pattern: /pixelbuddha\.net\/[^\/]+\/([^\/\?]+)/i },
    
    // Pixelsquid patterns
    { source: 'pixelsquid', pattern: /pixelsquid\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'pixelsquid', pattern: /pixelsquid\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Footage Crate patterns
    { source: 'footagecrate', pattern: /footagecrate\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'footagecrate', pattern: /footagecrate\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Yellow Images patterns
    { source: 'yellowimages', pattern: /yellowimages\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'yellowimages', pattern: /yellowimages\.com\/[^\/]+\/([^\/\?]+)/i },
    
    // Generic patterns for unknown sites
    { source: 'generic', pattern: /([^\/]+)\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'generic', pattern: /([^\/]+)\.net\/[^\/]+\/([^\/\?]+)/i },
    { source: 'generic', pattern: /([^\/]+)\.io\/[^\/]+\/([^\/\?]+)/i },
  ];

  /**
   * Parse a URL to extract source site and asset ID
   */
  static parseUrl(url: string): UrlParseResult {
    try {
      const cleanUrl = this.cleanUrl(url);
      if (!cleanUrl) {
        return {
          success: false,
          error: 'Invalid URL format'
        };
      }

      // Try to match against known patterns
      for (const pattern of this.URL_PATTERNS) {
        const match = cleanUrl.match(pattern.pattern);
        if (match) {
          const id = match[1] || match[2] || match[0];
          if (id && id.length > 0) {
        return {
              success: true,
              data: {
                source: pattern.source,
                id: this.cleanId(id),
                url: cleanUrl
              }
            };
          }
        }
      }

      // Try generic extraction for unknown sites
      const genericResult = this.extractGenericId(cleanUrl);
      if (genericResult) {
        return {
          success: true,
          data: genericResult
        };
      }

        return {
        success: false,
        error: 'Unable to identify source site or extract asset ID from URL'
      };

    } catch (error) {
        return {
        success: false,
        error: `URL parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Clean and normalize URL
   */
  private static cleanUrl(url: string): string | null {
    if (!url || typeof url !== 'string') {
      return null;
    }

    let cleanUrl = url.trim().replace(/\s/g, '');
    
    // Add protocol if missing
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    // Validate URL format
    try {
      new URL(cleanUrl);
      return cleanUrl;
    } catch {
      return null;
    }
  }

  /**
   * Clean and normalize asset ID
   */
  private static cleanId(id: string): string {
    if (!id) return '';
    
    // Remove query parameters and fragments
    let cleanId = id.split('?')[0].split('#')[0];
    
    // Clean up the ID
    cleanId = cleanId.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9]+$/, '');
    cleanId = cleanId.replace(/[^a-zA-Z0-9\-_]/g, '-');
    cleanId = cleanId.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    
    return cleanId;
  }

  /**
   * Extract ID using generic patterns for unknown sites
   */
  private static extractGenericId(url: string): ParsedUrl | null {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname;

      // Extract domain name
      const domainParts = hostname.split('.');
      const source = domainParts[0];

      // Try to extract ID from path
      const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
      
      // Look for segments that might be IDs
      for (const segment of pathSegments) {
        if (segment.length >= 3 && /[a-zA-Z0-9]/.test(segment)) {
          return {
            source: source,
            id: this.cleanId(segment),
            url: url
          };
        }
      }

      // Use the last non-empty segment as fallback
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (lastSegment) {
        return {
          source: source,
          id: this.cleanId(lastSegment),
          url: url
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get supported sites list
   */
  static getSupportedSites(): string[] {
    const sites = new Set<string>();
    this.URL_PATTERNS.forEach(pattern => {
      sites.add(pattern.source);
    });
    return Array.from(sites).sort();
  }

  /**
   * Check if a site is supported
   */
  static isSiteSupported(source: string): boolean {
    return this.getSupportedSites().includes(source.toLowerCase());
  }

  /**
   * Test URL parsing with detailed results
   */
  static testUrl(url: string): { result: UrlParseResult; details: any } {
    const result = this.parseUrl(url);
    const details = {
      originalUrl: url,
      cleanedUrl: this.cleanUrl(url),
      matchedPattern: null as any,
      extractedId: null as string | null
    };

    if (result.success) {
      // Find which pattern matched
      const cleanUrl = this.cleanUrl(url);
      if (cleanUrl) {
        for (const pattern of this.URL_PATTERNS) {
          const match = cleanUrl.match(pattern.pattern);
          if (match) {
            details.matchedPattern = pattern;
            details.extractedId = match[1] || match[2] || match[0];
            break;
          }
        }
      }
    }

    return { result, details };
  }
}

/**
 * Convenience functions
 */
export function parseStockMediaUrl(url: string): UrlParseResult {
  return UrlParser.parseUrl(url);
}

export function getSupportedSites(): string[] {
  return UrlParser.getSupportedSites();
}

export function isSiteSupported(source: string): boolean {
  return UrlParser.isSiteSupported(source);
}

export function testUrlParsing(url: string): { result: UrlParseResult; details: any } {
  return UrlParser.testUrl(url);
}