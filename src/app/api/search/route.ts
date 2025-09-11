import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, filters = {}, page, limit } = SearchRequestSchema.parse(body)

    // Rate limiting check (basic implementation)
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Mock search results for now
    const mockResults = generateMockSearchResults(query, filters, page, limit)
    
    return NextResponse.json({
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
    })
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