/**
 * Advanced URL Parser for Stock Media Sites
 * Handles dozens of different URL formats across various platforms
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
 */
export class UrlParser {
  private static readonly URL_PATTERNS = [
    // Major Stock Sites
    { source: 'shutterstock', pattern: /shutterstock\.com\/(?:image-)?(?:photo|vector|illustration|video)\/([^\/\?]+)/i },
    { source: 'getty', pattern: /gettyimages\.com\/detail\/(?:photo|illustration|vector|video)\/([^\/\?]+)/i },
    { source: 'adobe', pattern: /stock\.adobe\.com\/images\/([^\/\?]+)/i },
    { source: 'unsplash', pattern: /unsplash\.com\/photos\/([^\/\?]+)/i },
    { source: 'pexels', pattern: /pexels\.com\/photo\/([^\/\?]+)/i },
    { source: 'pixabay', pattern: /pixabay\.com\/(?:photos|images|vectors|videos)\/([^\/\?]+)/i },
    { source: 'depositphotos', pattern: /depositphotos\.com\/[^\/]+\/[^\/]+\/([^\/\?]+)/i },
    { source: '123rf', pattern: /123rf\.com\/stock-photo\/([^\/\?]+)/i },
    { source: 'dreamstime', pattern: /dreamstime\.com\/stock-photo\/([^\/\?]+)/i },
    { source: 'istock', pattern: /istockphoto\.com\/photo\/([^\/\?]+)/i },
    { source: 'freepik', pattern: /freepik\.com\/(?:photos|vectors|icons)\/([^\/\?]+)/i },
    { source: 'pond5', pattern: /pond5\.com\/stock-footage\/([^\/\?]+)/i },
    { source: 'storyblocks', pattern: /storyblocks\.com\/(?:video|audio|image)\/([^\/\?]+)/i },
    { source: 'envato', pattern: /elements\.envato\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'canva', pattern: /canva\.com\/design\/[^\/]+\/([^\/\?]+)/i },
    { source: 'vecteezy', pattern: /vecteezy\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'bigstock', pattern: /bigstockphoto\.com\/[^\/]+\/[^\/]+\/([^\/\?]+)/i },
    
    // Generic patterns for unknown sites
    { source: 'generic', pattern: /([^\/]+)\.com\/[^\/]+\/([^\/\?]+)/i },
    { source: 'generic', pattern: /([^\/]+)\.net\/[^\/]+\/([^\/\?]+)/i },
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