import { NextRequest, NextResponse } from 'next/server';
import { NehtwAPI } from '@/lib/nehtw-api';
import { parseStockMediaUrl } from '@/lib/url-parser';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const id = searchParams.get('id');

  if (!url && !id) {
    return NextResponse.json({ message: 'URL or ID parameter is required' }, { status: 400 });
  }

  try {
    let stockInfo;

    if (id) {
      // Handle ID-based lookup (for modal confirmation)
      // For now, return mock data - in production, this would query your database
      stockInfo = {
        id: id,
        title: `Media Asset ${id}`,
        description: 'High-quality stock media asset',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        previewUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        type: 'photo',
        category: 'nature',
        license: 'royalty-free',
        price: 15,
        points: 50,
        size: '2.5MB',
        dimensions: { width: 1920, height: 1080 },
        author: {
          id: '1',
          name: 'John Doe',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        },
        tags: ['nature', 'landscape', 'mountains', 'sunset'],
        createdAt: '2024-01-15T10:00:00Z',
        rating: 4.8,
        downloadCount: 1250,
        isAvailable: true,
        downloadUrl: `https://example.com/downloads/${id}`
      };
    } else if (url) {
      // Handle URL-based lookup using new URL parser
      const parseResult = parseStockMediaUrl(url);
      if (!parseResult.success || !parseResult.data) {
        return NextResponse.json({ 
          message: parseResult.error || 'URL not supported or could not be parsed.' 
        }, { status: 400 });
      }

      const { source, id: assetId } = parseResult.data;

      const stockSite = await prisma.stockSite.findUnique({
        where: { name: source },
      });

      if (!stockSite || !stockSite.isActive) {
        return NextResponse.json({ 
          message: `Sorry, downloads from '${source}' are temporarily disabled.` 
        }, { status: 400 });
      }

      const apiKey = process.env.NEHTW_API_KEY;
      let info;

      if (!apiKey) {
        console.warn('NEHTW_API_KEY is not configured. Using mock data for development/testing.');
        // Provide mock data when API key is not configured
        info = {
          success: true,
          data: {
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
            title: `Mock ${source.charAt(0).toUpperCase() + source.slice(1)} Asset`,
            id: assetId,
            source: source,
            cost: 10, // Unified cost for mock data
            ext: 'jpg',
            name: `mock-${assetId}.jpg`,
            author: 'Mock Author',
            sizeInBytes: 2500000
          }
        };
      } else {
        const api = new NehtwAPI(apiKey);
        info = await api.getStockInfo(source, assetId, url);

        if (!info.success || !info.data) {
          return NextResponse.json({ message: info.message || 'Could not retrieve information for this item.' }, { status: 502 });
        }
      }
      
      if (info.data) {
      stockInfo = {
        id: info.data.id,
        title: info.data.title,
        description: 'High-quality stock media asset',
        thumbnailUrl: info.data.image,
        previewUrl: info.data.image,
        type: 'photo', // Default type - would be determined from API response
        category: 'general',
        license: 'royalty-free',
        price: stockSite.cost, // Keep original price for reference
        points: 10, // Unified 10 points system for all downloads
        size: '2.5MB', // Would come from API
        dimensions: { width: 1920, height: 1080 }, // Would come from API
        author: {
          id: '1',
          name: info.data.author || 'Unknown Author',
          avatar: undefined
        },
        tags: ['stock', 'media'],
        createdAt: new Date().toISOString(),
        rating: 4.5,
        downloadCount: 0,
        isAvailable: true,
        downloadUrl: url
      };
      } else {
        throw new Error('No data received from API');
      }
    }
    
    return NextResponse.json({
      success: true,
      stockInfo: stockInfo
    });
  } catch (error) {
    console.error('[STOCK_INFO_ERROR]', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ 
        success: false,
        message: 'URL is required and must be a string' 
      }, { status: 400 });
    }

    // Parse the URL using our advanced parser
    const parseResult = parseStockMediaUrl(url);
    
    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json({
        success: false,
        message: parseResult.error || 'Unable to parse URL'
      }, { status: 400 });
    }

    const { source, id: assetId } = parseResult.data;

    // Check if the source site is supported in our database
    const stockSite = await prisma.stockSite.findUnique({
      where: { name: source },
    });

    if (!stockSite) {
      return NextResponse.json({
        success: false,
        message: `Source site '${source}' is not supported`,
        parsedData: parseResult.data
      }, { status: 400 });
    }

    if (!stockSite.isActive) {
      return NextResponse.json({
        success: false,
        message: `Downloads from '${source}' are temporarily disabled`,
        parsedData: parseResult.data
      }, { status: 400 });
    }

    // Get stock info from Nehtw API
    const apiKey = process.env.NEHTW_API_KEY;
    let stockInfo;

    if (!apiKey) {
      console.warn('NEHTW_API_KEY is not configured. Using mock data for development/testing.');
        // Provide mock data when API key is not configured
        stockInfo = {
          success: true,
          data: {
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
            title: `Mock ${source.charAt(0).toUpperCase() + source.slice(1)} Asset`,
            id: assetId,
            source: source,
            cost: 10, // Unified cost for mock data
            ext: 'jpg',
            name: `mock-${assetId}.jpg`,
            author: 'Mock Author',
            sizeInBytes: 2500000
          }
        };
    } else {
      const api = new NehtwAPI(apiKey);
      stockInfo = await api.getStockInfo(source, assetId, url);

      if (!stockInfo.success || !stockInfo.data) {
        return NextResponse.json({
          success: false,
          message: stockInfo.message || 'Could not retrieve stock information',
          parsedData: parseResult.data
        }, { status: 502 });
      }
    }

    // Return comprehensive response
    if (!stockInfo.data) {
      return NextResponse.json({
        success: false,
        message: 'No data received from API'
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      parsedData: parseResult.data,
      stockSite: {
        id: stockSite.id,
        name: stockSite.name,
        displayName: stockSite.displayName,
        cost: stockSite.cost,
        isActive: stockSite.isActive
      },
      stockInfo: {
        id: stockInfo.data.id,
        title: stockInfo.data.title,
        description: 'High-quality stock media asset',
        thumbnailUrl: stockInfo.data.image,
        previewUrl: stockInfo.data.image,
        type: 'photo',
        category: 'general',
        license: 'royalty-free',
        price: stockSite.cost, // Keep original price for reference
        points: 10, // Unified 10 points system for all downloads
        size: '2.5MB',
        dimensions: { width: 1920, height: 1080 },
        author: {
          id: '1',
          name: stockInfo.data.author || 'Unknown Author',
          avatar: undefined
        },
        tags: ['stock', 'media'],
        createdAt: new Date().toISOString(),
        rating: 4.5,
        downloadCount: 0,
        isAvailable: true,
        downloadUrl: url
      }
    });

  } catch (error) {
    console.error('[STOCK_INFO_POST_ERROR]', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ 
      success: false,
      message 
    }, { status: 500 });
  }
}