import { NextRequest, NextResponse } from 'next/server'
import { NehtwAPI } from '@/lib/nehtw-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const site = searchParams.get('site')
    const query = searchParams.get('query')

    if (!site || !query) {
      return NextResponse.json({ error: 'Site and query parameters required' }, { status: 400 })
    }

    // For now, we'll return mock data since we don't have a real search API
    // In a real implementation, you would integrate with the nehtw.com search API
    const mockResults = [
      {
        id: '1',
        title: 'Beautiful landscape photography',
        image: 'https://images.unsplash.com/photo-1506905925346-14bda5d4c4c0?w=400&h=300&fit=crop',
        source: site,
        cost: 0.2,
        ext: 'jpg',
        name: 'landscape-1',
        author: 'John Doe',
        sizeInBytes: 2048000,
      },
      {
        id: '2',
        title: 'Modern business office interior',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
        source: site,
        cost: 0.2,
        ext: 'jpg',
        name: 'office-1',
        author: 'Jane Smith',
        sizeInBytes: 1536000,
      },
      {
        id: '3',
        title: 'Abstract geometric patterns',
        image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop',
        source: site,
        cost: 0.2,
        ext: 'jpg',
        name: 'abstract-1',
        author: 'Mike Johnson',
        sizeInBytes: 1024000,
      },
      {
        id: '4',
        title: 'Technology and innovation concept',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
        source: site,
        cost: 0.2,
        ext: 'jpg',
        name: 'tech-1',
        author: 'Sarah Wilson',
        sizeInBytes: 2560000,
      },
      {
        id: '5',
        title: 'Nature and wildlife photography',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
        source: site,
        cost: 0.2,
        ext: 'jpg',
        name: 'nature-1',
        author: 'David Brown',
        sizeInBytes: 3072000,
      },
      {
        id: '6',
        title: 'Urban cityscape at night',
        image: 'https://images.unsplash.com/photo-1519501025264-65f15a6c4c4c?w=400&h=300&fit=crop',
        source: site,
        cost: 0.2,
        ext: 'jpg',
        name: 'city-1',
        author: 'Lisa Davis',
        sizeInBytes: 1792000,
      },
    ]

    // Filter results based on query (simple mock filtering)
    const filteredResults = mockResults.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.author.toLowerCase().includes(query.toLowerCase())
    )

    return NextResponse.json({
      success: true,
      results: filteredResults,
      total: filteredResults.length,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
