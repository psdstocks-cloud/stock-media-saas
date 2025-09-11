import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Mock suggestions based on query
    const suggestions = generateSuggestions(query)
    
    return NextResponse.json({
      success: true,
      suggestions
    })
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateSuggestions(query: string) {
  const allSuggestions = [
    'nature landscape',
    'business meeting',
    'technology background',
    'abstract design',
    'people working',
    'city skyline',
    'food photography',
    'medical equipment',
    'education classroom',
    'sports action',
    'travel destination',
    'fashion model',
    'architecture building',
    'science laboratory',
    'art creative'
  ]

  return allSuggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5)
}
