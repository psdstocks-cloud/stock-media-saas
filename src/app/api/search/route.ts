import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'
import { StockMediaCache } from '@/lib/cache'

// Search request validation schema
const SearchRequestSchema = z.object({
  query: z.string().min(1).max(100),
  filters: z.object({
    category: z.array(z.string()).optional(),
    color: z.array(z.string()).optional(),
    orientation: z.enum(['landscape', 'portrait', 'square']).optional(),
    size: z.enum(['small', 'medium', 'large']).optional(),
    dateRange: z.array(z.string()).optional(),
    priceRange: z.array(z.number()).optional(),
    license: z.enum(['free', 'premium', 'exclusive']).optional()
  }).optional(),
  page: z.number().min(0).default(0),
  limit: z.number().min(1).max(50).default(20)
})

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request)
    const rateLimitResult = await checkRateLimit(identifier, 'search')
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: rateLimitResult.headers
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'relevance'
    
    // Parse filters from query parameters
    const filters = {
      type: searchParams.get('type')?.split(',').filter(Boolean) || [],
      category: searchParams.get('category')?.split(',').filter(Boolean) || [],
      license: searchParams.get('license')?.split(',').filter(Boolean) || [],
      orientation: searchParams.get('orientation')?.split(',').filter(Boolean) || [],
      color: searchParams.get('color')?.split(',').filter(Boolean) || [],
      size: searchParams.get('size')?.split(',').filter(Boolean) || [],
      duration: searchParams.get('duration')?.split(',').filter(Boolean) || [],
      priceRange: searchParams.get('priceRange')?.split(',').filter(Boolean) || [],
      dateRange: searchParams.get('dateRange')?.split(',').filter(Boolean) || []
    }
    
    // Check cache first
    const cachedResults = await StockMediaCache.getSearchResults(query, filters)
    if (cachedResults) {
      console.log('Returning cached search results for:', query)
      return NextResponse.json(cachedResults)
    }
    
    // Mock search results for now
    const mockResults = {
      items: [
        {
          id: '1',
          title: 'Beautiful Sunset Landscape',
          description: 'Stunning sunset over mountains with vibrant colors',
          thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
          type: 'photo',
          category: 'nature',
          license: 'royalty-free',
          price: 15,
          points: 50,
          size: '2.5MB',
          dimensions: { width: 1920, height: 1080 },
          author: { id: '1', name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
          tags: ['sunset', 'landscape', 'nature', 'mountains'],
          createdAt: '2024-01-15T10:00:00Z',
          rating: 4.8,
          downloadCount: 1250
        },
        {
          id: '2',
          title: 'Modern Office Space',
          description: 'Clean and modern office interior design',
          thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop',
          type: 'photo',
          category: 'business',
          license: 'royalty-free',
          price: 20,
          points: 75,
          size: '3.2MB',
          dimensions: { width: 2560, height: 1440 },
          author: { id: '2', name: 'Jane Smith', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face' },
          tags: ['office', 'business', 'modern', 'interior'],
          createdAt: '2024-01-14T14:30:00Z',
          rating: 4.6,
          downloadCount: 890
        }
      ],
      total: 2,
      page: page,
      totalPages: 1,
      hasMore: false
    }

    // Cache the results
    await StockMediaCache.setSearchResults(query, filters, mockResults)
    
    return NextResponse.json(mockResults)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request)
    const rateLimitResult = await checkRateLimit(identifier, 'search')
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: rateLimitResult.headers
        }
      )
    }

    const body = await request.json()
    const { query, filters = {}, page, limit } = SearchRequestSchema.parse(body)
    
    // Mock search results for now
    const mockResults = generateMockSearchResults(query, filters, page, limit)
    
    const result = {
      success: true,
      data: {
        results: mockResults.results,
        total: mockResults.total,
        page,
        limit,
        hasMore: mockResults.hasMore,
        query,
        filters
      }
    }

    // Cache the result
    await StockMediaCache.setSearchResults(query, filters, result)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Search error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid search parameters',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// Mock search results generator
function generateMockSearchResults(query: string, filters: any, page: number, limit: number) {
  const allResults = [
    {
      id: '1',
      site: 'unsplash',
      title: 'Beautiful Nature Landscape',
      url: 'https://unsplash.com/photos/beautiful-nature-landscape',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      cost: 5,
      description: 'Stunning mountain landscape with clear blue sky',
      tags: ['nature', 'landscape', 'mountains', 'sky'],
      dimensions: { width: 400, height: 300 }
    },
    {
      id: '2',
      site: 'pexels',
      title: 'Modern Office Building',
      url: 'https://pexels.com/photo/modern-office-building',
      imageUrl: 'https://images.pexels.com/photos/323775/pexels-photo-323775.jpeg?w=400&h=300&fit=crop',
      cost: 3,
      description: 'Contemporary office building with glass facade',
      tags: ['business', 'office', 'building', 'modern'],
      dimensions: { width: 400, height: 300 }
    },
    {
      id: '3',
      site: 'pixabay',
      title: 'Abstract Technology Background',
      url: 'https://pixabay.com/photos/abstract-technology-background',
      imageUrl: 'https://cdn.pixabay.com/photo/2017/07/03/20/17/colorful-2468874_640.jpg?w=400&h=300&fit=crop',
      cost: 2,
      description: 'Colorful abstract technology background',
      tags: ['technology', 'abstract', 'colorful', 'background'],
      dimensions: { width: 400, height: 300 }
    },
    {
      id: '4',
      site: 'freepik',
      title: 'Business Team Meeting',
      url: 'https://freepik.com/photos/business-team-meeting',
      imageUrl: 'https://img.freepik.com/free-photo/business-people-meeting_53876-8893.jpg?w=400&h=300&fit=crop',
      cost: 8,
      description: 'Professional business team in meeting room',
      tags: ['business', 'team', 'meeting', 'professional'],
      dimensions: { width: 400, height: 300 }
    },
    {
      id: '5',
      site: 'shutterstock',
      title: 'Creative Design Elements',
      url: 'https://shutterstock.com/image/creative-design-elements',
      imageUrl: 'https://image.shutterstock.com/image-photo/creative-design-elements-260nw-1234567890.jpg?w=400&h=300&fit=crop',
      cost: 10,
      description: 'Modern creative design elements and icons',
      tags: ['design', 'creative', 'elements', 'icons'],
      dimensions: { width: 400, height: 300 }
    }
  ]

  // Simple filtering logic
  let filteredResults = allResults

  if (filters.category && filters.category.length > 0) {
    filteredResults = filteredResults.filter(result =>
      filters.category.some((cat: string) => result.tags.includes(cat))
    )
  }

  if (filters.orientation) {
    // Mock orientation filtering
    filteredResults = filteredResults.filter(result => {
      const { width, height } = result.dimensions
      const ratio = width / height
      
      switch (filters.orientation) {
        case 'landscape':
          return ratio > 1.2
        case 'portrait':
          return ratio < 0.8
        case 'square':
          return ratio >= 0.8 && ratio <= 1.2
        default:
          return true
      }
    })
  }

  if (filters.priceRange && filters.priceRange.length === 2) {
    const [minPrice, maxPrice] = filters.priceRange
    filteredResults = filteredResults.filter(result =>
      result.cost >= minPrice && result.cost <= maxPrice
    )
  }

  // Pagination
  const startIndex = page * limit
  const endIndex = startIndex + limit
  const paginatedResults = filteredResults.slice(startIndex, endIndex)
  const hasMore = endIndex < filteredResults.length

  return {
    results: paginatedResults,
    total: filteredResults.length,
    hasMore
  }
}