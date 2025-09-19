import { NextResponse } from 'next/server';
import { NehtwAPI } from '@/lib/nehtw-api';
import { parseStockUrl } from '@/lib/url-parser';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
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
      // Handle URL-based lookup (existing functionality)
      const parsed = parseStockUrl(url);
      if (!parsed) {
        return NextResponse.json({ message: 'URL not supported or could not be parsed.' }, { status: 400 });
      }

      const stockSite = await prisma.stockSite.findUnique({
        where: { name: parsed.site },
      });

      if (!stockSite || !stockSite.isActive) {
        return NextResponse.json({ message: `Sorry, downloads from '${parsed.site}' are temporarily disabled.` }, { status: 400 });
      }

      const apiKey = process.env.NEHTW_API_KEY;
      if (!apiKey) {
        throw new Error('NEHTW_API_KEY is not configured on the server.');
      }
      
      const api = new NehtwAPI(apiKey);
      const info = await api.getStockInfo(parsed.site, parsed.id, url);

      if (!info.success || !info.data) {
        return NextResponse.json({ message: info.message || 'Could not retrieve information for this item.' }, { status: 502 });
      }
      
      stockInfo = {
        id: info.data.id,
        title: info.data.title,
        description: 'High-quality stock media asset',
        thumbnailUrl: info.data.image,
        previewUrl: info.data.image,
        type: 'photo', // Default type - would be determined from API response
        category: 'general',
        license: 'royalty-free',
        price: stockSite.cost,
        points: stockSite.cost * 10, // Convert to points (example conversion)
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