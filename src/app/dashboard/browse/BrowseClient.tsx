'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { User } from 'next-auth'
import { Search, Grid, List, SlidersHorizontal, SortAsc, SortDesc } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Typography, Skeleton, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchFilters, SearchFilters as SearchFiltersType } from '@/components/search/SearchFilters'
import { MediaCard, MediaItem } from '@/components/search/MediaCard'
import { OrderConfirmationModal } from '@/components/modals/OrderConfirmationModal'
import { cn } from '@/lib/utils'

interface SearchResults {
  items: MediaItem[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

interface BrowseClientProps {
  user: User
}

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'points-low', label: 'Points: Low to High' },
  { value: 'points-high', label: 'Points: High to Low' }
]

function BrowseContent({ user }: BrowseClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('relevance')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFiltersType>({
    type: [],
    category: [],
    license: [],
    orientation: [],
    color: [],
    size: [],
    duration: [],
    priceRange: [],
    dateRange: []
  })

  // No need for purchase context anymore - using Zustand store

  // Initialize from URL params
  useEffect(() => {
    const query = searchParams.get('q') || ''
    const sort = searchParams.get('sort') || 'relevance'
    const view = searchParams.get('view') || 'grid'
    
    setSearchQuery(query)
    setSortBy(sort)
    setViewMode(view as 'grid' | 'list')
  }, [searchParams])

  // Search function
  const performSearch = useCallback(async (query: string, page: number = 1, append: boolean = false) => {
    if (!query.trim() && page === 1) {
      // Load featured content when no query
      await loadFeaturedContent()
      return
    }

    setIsLoading(page === 1)
    if (page > 1) setIsLoadingMore(true)

    try {
      const searchParams = new URLSearchParams({
        q: query,
        page: page.toString(),
        sort: sortBy,
        ...Object.entries(filters).reduce((acc, [key, values]) => {
          if (values.length > 0) {
            acc[key] = values.join(',')
          }
          return acc
        }, {} as Record<string, string>)
      })

      const response = await fetch(`/api/search?${searchParams}`)
      if (response.ok) {
        const data = await response.json()
        
        if (append && searchResults) {
          setSearchResults(prev => ({
            ...data,
            items: [...(prev?.items || []), ...data.items]
          }))
        } else {
          setSearchResults(data)
        }
      } else {
        console.error('Search failed:', response.statusText)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [sortBy, filters, searchResults])

  // Load featured content
  const loadFeaturedContent = async () => {
    setIsLoading(true)
    try {
      // Mock featured content - in production, this would come from an API
      const mockFeatured: SearchResults = {
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
          },
          {
            id: '3',
            title: 'Abstract Geometric Pattern',
            description: 'Colorful abstract geometric design',
            thumbnailUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=400&fit=crop',
            type: 'vector',
            category: 'abstract',
            license: 'free',
            price: 0,
            points: 0,
            size: '1.8MB',
            dimensions: { width: 2000, height: 2000 },
            author: { id: '3', name: 'Mike Johnson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' },
            tags: ['abstract', 'geometric', 'pattern', 'colorful'],
            createdAt: '2024-01-13T09:15:00Z',
            rating: 4.4,
            downloadCount: 2100
          }
        ],
        total: 3,
        page: 1,
        totalPages: 1,
        hasMore: false
      }
      
      setSearchResults(mockFeatured)
    } catch (error) {
      console.error('Error loading featured content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery)
    } else {
      loadFeaturedContent()
    }
  }, [])

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    performSearch(query)
    
    // Update URL
    const params = new URLSearchParams(searchParams)
    if (query) {
      params.set('q', query)
    } else {
      params.delete('q')
    }
    router.push(`/dashboard/browse?${params.toString()}`)
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters)
    if (searchQuery) {
      performSearch(searchQuery)
    }
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      type: [],
      category: [],
      license: [],
      orientation: [],
      color: [],
      size: [],
      duration: [],
      priceRange: [],
      dateRange: []
    })
    if (searchQuery) {
      performSearch(searchQuery)
    }
  }

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    if (searchQuery) {
      performSearch(searchQuery)
    }
    
    // Update URL
    const params = new URLSearchParams(searchParams)
    params.set('sort', newSort)
    router.push(`/dashboard/browse?${params.toString()}`)
  }

  // Handle load more
  const handleLoadMore = () => {
    if (searchResults?.hasMore && !isLoadingMore) {
      performSearch(searchQuery, (searchResults.page || 1) + 1, true)
    }
  }

  // Handle media actions
  const handleDownload = async (media: MediaItem) => {
    console.log('Downloading media:', media.id)
    // TODO: Implement download logic
  }

  const handleFavorite = (media: MediaItem) => {
    console.log('Toggling favorite for media:', media.id)
    // TODO: Implement favorite logic
  }

  const handlePreview = (media: MediaItem) => {
    console.log('Previewing media:', media.id)
    // TODO: Implement preview modal
  }

  const handleAuthorClick = (authorId: string) => {
    console.log('Viewing author:', authorId)
    // TODO: Navigate to author profile
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Typography variant="h1" className="flex items-center space-x-2">
            <Search className="h-8 w-8" />
            <span>Browse Media</span>
          </Typography>
          <Typography variant="body-lg" color="muted">
            Discover millions of high-quality stock photos, videos, and audio tracks.
          </Typography>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl">
          <SearchBar
            placeholder="Search for photos, videos, audio..."
            onSearch={handleSearch}
            autoFocus
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Typography variant="body-sm">Sort by:</Typography>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <SearchFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          )}

          {/* Results */}
          <div className="flex-1 space-y-6">
            {/* Results Header */}
            {searchResults && (
              <div className="flex items-center justify-between">
                <Typography variant="body-lg">
                  {searchQuery ? (
                    <>
                      {searchResults.total.toLocaleString()} results for "{searchQuery}"
                    </>
                  ) : (
                    <>
                      Featured Content ({searchResults.total} items)
                    </>
                  )}
                </Typography>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className={cn(
                "grid gap-6",
                viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              )}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-square w-full" />
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && searchResults && (
              <div className={cn(
                "grid gap-6",
                viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              )}>
                {searchResults.items.map((media) => (
                  <MediaCard
                    key={media.id}
                    media={media}
                    onDownload={handleDownload}
                    onFavorite={handleFavorite}
                    onPreview={handlePreview}
                    onAuthorClick={handleAuthorClick}
                    className={viewMode === 'list' ? "flex flex-row" : ""}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && searchResults && searchResults.items.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <Typography variant="h3" className="mb-2">
                    No results found
                  </Typography>
                  <Typography variant="body" color="muted" className="text-center max-w-md">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Load More Button */}
            {searchResults?.hasMore && (
              <div className="flex justify-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  size="lg"
                >
                  {isLoadingMore ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal />
    </div>
  )
}

export default function BrowseClient({ user }: BrowseClientProps) {
  return <BrowseContent user={user} />
}
