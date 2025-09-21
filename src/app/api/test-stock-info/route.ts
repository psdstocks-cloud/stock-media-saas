import { NextRequest, NextResponse } from 'next/server';
import { parseStockMediaUrl } from '@/lib/url-parser';

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST API CALLED ===');
    
    const { url } = await request.json();
    console.log('Received URL:', url);

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ 
        success: false,
        message: 'URL is required and must be a string' 
      }, { status: 400 });
    }

    // Test URL parsing
    console.log('Testing URL parsing...');
    const parseResult = parseStockMediaUrl(url);
    console.log('Parse result:', parseResult);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        message: 'URL parsing failed',
        error: parseResult.error
      }, { status: 400 });
    }

    // Return mock data
    return NextResponse.json({
      success: true,
      data: {
        id: parseResult.data?.id,
        source: parseResult.data?.source,
        title: 'Test Image Title',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        points: 10,
        price: 10,
        stockSite: {
          name: parseResult.data?.source,
          displayName: 'Test Site',
          cost: 10
        }
      }
    });

  } catch (error) {
    console.error('Test API Error:', error);
    return NextResponse.json({ 
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
