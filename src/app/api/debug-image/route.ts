import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }

  try {
    // Test if the image URL is accessible
    const response = await fetch(imageUrl, { method: 'HEAD' });
    
    return NextResponse.json({
      url: imageUrl,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      accessible: response.ok
    });
  } catch (error) {
    return NextResponse.json({
      url: imageUrl,
      error: error instanceof Error ? error.message : 'Unknown error',
      accessible: false
    });
  }
}
