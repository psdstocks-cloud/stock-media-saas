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

      // Temporarily force mock data mode until API key is properly configured
      if (!apiKey || process.env.FORCE_MOCK_DATA === 'true') {
        console.warn('Using mock data mode for testing. Set NEHTW_API_KEY and FORCE_MOCK_DATA=false for production.');
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
        try {
          const api = new NehtwAPI(apiKey);
          info = await api.getStockInfo(source, assetId, url);

          if (!info.success || !info.data) {
            console.error('Nehtw API returned error:', info.message);
            return NextResponse.json({ 
              message: info.message || 'Could not retrieve information for this item. Please check the URL and try again.' 
            }, { status: 400 });
          }
        } catch (error) {
          console.error('Error calling Nehtw API:', error);
          return NextResponse.json({ 
            message: 'Unable to retrieve file information at this time. Please check the URL or try again later.' 
          }, { status: 500 });
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
    const { url, userId } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ 
        success: false,
        message: 'URL is required and must be a string' 
      }, { status: 400 });
    }

    // Check if user has enough points before parsing (optional validation)
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { pointsBalance: true }
      });

      if (!user?.pointsBalance || user.pointsBalance.currentPoints < 10) {
        return NextResponse.json({
          success: false,
          message: 'Insufficient points. You need at least 10 points to download media.',
          requiredPoints: 10,
          currentPoints: user?.pointsBalance?.currentPoints || 0
        }, { status: 400 });
      }
    }

    // Parse the URL using our advanced parser
    const parseResult = parseStockMediaUrl(url);
    
    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or unsupported URL. Please check the link and try again.',
        error: parseResult.error || 'Unable to parse URL',
        supportedSites: [
          'Shutterstock', 'Getty Images', 'Adobe Stock', 'Unsplash', 'Pexels', 
          'Pixabay', 'Depositphotos', '123RF', 'Dreamstime', 'iStock', 
          'Freepik', 'Pond5', 'Storyblocks', 'Envato Elements', 'Canva', 
          'Vecteezy', 'Bigstock', 'Alamy', 'Rawpixel', 'Flaticon', 
          'IconScout', 'Motion Array', 'Videoblocks', 'Epidemic Sound', 
          'Soundstripe', 'Artlist', 'Creative Fabrica', 'Craftwork', 
          'UI8', 'Pixeden', 'Pixel Buddha', 'Pixelsquid', 'Footage Crate', 
          'Yellow Images'
        ]
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
        message: `Sorry, we don't currently support downloads from '${source}'. Please try a different stock media site.`,
        error: `Source site '${source}' is not supported`,
        parsedData: parseResult.data,
        supportedSites: [
          'Shutterstock', 'Getty Images', 'Adobe Stock', 'Unsplash', 'Pexels', 
          'Pixabay', 'Depositphotos', '123RF', 'Dreamstime', 'iStock', 
          'Freepik', 'Pond5', 'Storyblocks', 'Envato Elements', 'Canva', 
          'Vecteezy', 'Bigstock', 'Alamy', 'Rawpixel', 'Flaticon', 
          'IconScout', 'Motion Array', 'Videoblocks', 'Epidemic Sound', 
          'Soundstripe', 'Artlist', 'Creative Fabrica', 'Craftwork', 
          'UI8', 'Pixeden', 'Pixel Buddha', 'Pixelsquid', 'Footage Crate', 
          'Yellow Images'
        ]
      }, { status: 400 });
    }

    if (!stockSite.isActive) {
      return NextResponse.json({
        success: false,
        message: `Downloads from '${source}' are temporarily disabled. Please try a different stock media site.`,
        error: `Source site '${source}' is temporarily disabled`,
        parsedData: parseResult.data,
        suggestion: 'This site may be under maintenance. Please try again later or use a different stock media platform.'
      }, { status: 400 });
    }

    // Get stock info from Nehtw API
    const apiKey = process.env.NEHTW_API_KEY;
    let stockInfo;

    // Temporarily force mock data mode until API key is properly configured
    if (!apiKey || process.env.FORCE_MOCK_DATA === 'true') {
      console.warn('Using mock data mode for testing. Set NEHTW_API_KEY and FORCE_MOCK_DATA=false for production.');
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
      try {
        const api = new NehtwAPI(apiKey);
        stockInfo = await api.getStockInfo(source, assetId, url);

        if (!stockInfo.success || !stockInfo.data) {
          console.error('Nehtw API returned error:', stockInfo.message);
          return NextResponse.json({
            success: false,
            message: 'Unable to retrieve file information. The URL may be invalid or the content may not be available.',
            error: stockInfo.message || 'Could not retrieve stock information',
            parsedData: parseResult.data,
            suggestion: 'Please verify the URL is correct and try again. If the problem persists, the content may not be available for download.'
          }, { status: 400 });
        }
      } catch (error) {
        console.error('Error calling Nehtw API:', error);
        return NextResponse.json({
          success: false,
          message: 'Unable to retrieve file information at this time. Please check the URL or try again later.',
          error: 'External API service temporarily unavailable',
          parsedData: parseResult.data,
          suggestion: 'The external service may be experiencing issues. Please try again in a few minutes.'
        }, { status: 500 });
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