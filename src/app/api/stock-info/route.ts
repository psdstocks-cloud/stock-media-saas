import { NextResponse } from 'next/server';
import { NehtwAPI } from '@/lib/nehtw-api';
import { parseStockUrl } from '@/lib/url-parser';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ message: 'URL parameter is required' }, { status: 400 });
  }

  try {
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
    // Pass the full URL to getStockInfo as per API documentation best practices
    const info = await api.getStockInfo(parsed.site, parsed.id, url);

    if (!info.success || !info.data) {
      return NextResponse.json({ message: info.message || 'Could not retrieve information for this item.' }, { status: 502 });
    }
    
    return NextResponse.json({
        site: info.data.source,
        id: info.data.id,
        title: info.data.title,
        imageUrl: info.data.image,
        cost: stockSite.cost, // Use our internal cost from the database
        author: info.data.author,
        stockItemUrl: url,
    });
  } catch (error) {
    console.error('[STOCK_INFO_ERROR]', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ message }, { status: 500 });
  }
}