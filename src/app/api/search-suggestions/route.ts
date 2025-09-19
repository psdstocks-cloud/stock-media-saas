import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (!query.trim()) {
      return NextResponse.json({ suggestions: [] })
    }

    // Mock suggestions - in production, this would come from your database
    const mockSuggestions = [
      // Recent searches (would be stored per user)
      { id: 'recent-1', text: 'business photos', type: 'recent', category: 'Business' },
      { id: 'recent-2', text: 'nature landscape', type: 'recent', category: 'Nature' },
      { id: 'recent-3', text: 'technology', type: 'recent', category: 'Technology' },
      
      // Trending searches
      { id: 'trending-1', text: 'AI technology', type: 'trending', category: 'Technology' },
      { id: 'trending-2', text: 'sustainable living', type: 'trending', category: 'Lifestyle' },
      { id: 'trending-3', text: 'remote work', type: 'trending', category: 'Business' },
      
      // Query suggestions based on input
      { id: 'query-1', text: `${query} photos`, type: 'query', category: 'Photos' },
      { id: 'query-2', text: `${query} videos`, type: 'query', category: 'Videos' },
      { id: 'query-3', text: `${query} illustrations`, type: 'query', category: 'Illustrations' },
      { id: 'query-4', text: `${query} vectors`, type: 'query', category: 'Vector Graphics' },
    ]

    // Filter suggestions based on query
    const filteredSuggestions = mockSuggestions.filter(suggestion =>
      suggestion.text.toLowerCase().includes(query.toLowerCase())
    )

    // Limit to 8 suggestions
    const suggestions = filteredSuggestions.slice(0, 8)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Error fetching search suggestions:', error)
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 })
  }
}