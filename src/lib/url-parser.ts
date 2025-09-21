/**
 * URL Parser for Stock Media Sites
 * Uses the comprehensive parser for all supported sites
 */

import { comprehensiveParseStockUrl } from './comprehensive-url-parser';

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
 * Parse a URL to extract source and ID using the comprehensive parser
 */
export function parseStockMediaUrl(url: string): UrlParseResult {
  try {
    console.log('Parsing URL:', url);
    
    const result = comprehensiveParseStockUrl(url);
    
    if (result) {
      console.log('Parse result:', result);
      return {
        success: true,
        data: {
          source: result.site,
          id: result.id,
          url: result.url
        }
      };
    } else {
      console.log('No matching pattern found for URL:', url);
        return {
        success: false,
        error: 'Unsupported URL format'
      };
    }
    
    } catch (error) {
    console.error('Error parsing URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    }
  }

  /**
 * Test if a URL matches any supported pattern
 */
export function testStockMediaUrl(url: string): boolean {
  const result = comprehensiveParseStockUrl(url);
  return result !== null;
}

/**
 * Get all supported sources
 */
export function getSupportedSources(): string[] {
  return [
    'shutterstock',
    'adobestock', 
    'dreamstime',
    'depositphotos',
    '123rf',
    'istockphoto',
    'gettyimages',
    'freepik',
    'flaticon',
    'envato',
    'vecteezy',
    'alamy',
    'storyblocks',
    'rawpixel'
  ];
}