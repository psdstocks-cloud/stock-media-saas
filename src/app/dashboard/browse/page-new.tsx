'use client'

import { useState } from 'react'
import { SearchBar } from '@/components/ui/SearchBar'
import { MediaCard } from '@/components/ui/MediaCard'
import { SearchResultsSkeleton, MediaListSkeleton } from '@/components/ui/LoadingSkeleton'
import { Button } from '@/components/ui/Button'
import { useSearchStockMedia } from '@/hooks/useStockMedia'
import { useAppStore } from '@/lib/store'

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { searchFilters } = useAppStore()

  const { 
    data: searchData, 
    isLoading, 
    error 
  } = useSearchStockMedia(searchQuery, searchFilters)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Browse Stock Media</h1>
            <p className="mt-2 text-gray-600">
              Discover millions of premium stock photos, videos, and graphics
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-2xl">
            <SearchBar 
              placeholder="Search for images, videos, graphics..."
              onSearch={handleSearch}
              showSuggestions={true}
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {searchData?.data?.total || 0} results
              {searchQuery && ` for "${searchQuery}"`}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          viewMode === 'grid' ? (
            <SearchResultsSkeleton />
          ) : (
            <MediaListSkeleton />
          )
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading results</h3>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'Something went wrong'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : searchData?.data?.results?.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {searchData.data.results.map((media: any) => (
              <MediaCard
                key={media.id}
                media={media}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? `No results found for "${searchQuery}". Try a different search term.`
                : 'Start by searching for stock media above.'
              }
            </p>
            {searchQuery && (
              <Button 
                variant="outline"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Load More Button */}
        {searchData?.data?.hasMore && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Results
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
