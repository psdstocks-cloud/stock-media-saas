'use client'

import * as React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from './Input'
import { Button } from './Button'
import { useSearchSuggestions } from '@/hooks/useStockMedia'
import { useAppStore } from '@/lib/store'

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
  showSuggestions?: boolean
}

export function SearchBar({
  placeholder = "Search millions of stock photos, videos, and graphics...",
  onSearch,
  className,
  showSuggestions = true
}: SearchBarProps) {
  const [query, setQuery] = React.useState('')
  const [isFocused, setIsFocused] = React.useState(false)
  const [showSuggestionsList, setShowSuggestionsList] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  
  const { setSearchQuery } = useAppStore()
  
  // Debounced search
  const debouncedSearch = React.useCallback(
    React.useMemo(
      () => {
        const timeoutId = setTimeout(() => {
          if (query.length > 2) {
            setSearchQuery(query)
            if (onSearch) {
              onSearch(query)
            }
          }
        }, 300)
        return () => clearTimeout(timeoutId)
      },
      [query, setSearchQuery, onSearch]
    ),
    [query, setSearchQuery, onSearch]
  )

  // Get search suggestions
  const { data: suggestions, isLoading: suggestionsLoading } = useSearchSuggestions(query)

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      setSearchQuery(searchQuery)
      if (onSearch) {
        onSearch(searchQuery)
      }
      setShowSuggestionsList(false)
      inputRef.current?.blur()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    } else if (e.key === 'Escape') {
      setShowSuggestionsList(false)
      inputRef.current?.blur()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
  }

  const clearQuery = () => {
    setQuery('')
    setSearchQuery('')
    inputRef.current?.focus()
  }

  React.useEffect(() => {
    if (query.length > 1 && isFocused) {
      setShowSuggestionsList(true)
    } else {
      setShowSuggestionsList(false)
    }
  }, [query, isFocused])

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to allow suggestion clicks
            setTimeout(() => setIsFocused(false), 200)
          }}
          className="pl-10 pr-20 h-12 text-base"
        />
        
        {query && (
          <button
            onClick={clearQuery}
            className="absolute inset-y-0 right-12 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        <Button
          onClick={() => handleSearch(query)}
          className="absolute inset-y-0 right-0 rounded-l-none h-12 px-6"
          variant="gradient"
        >
          Search
        </Button>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && showSuggestionsList && suggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestionsLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              Loading suggestions...
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  {suggestion}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Popular Search Terms */}
      {!query && isFocused && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Popular searches:</div>
          <div className="flex flex-wrap gap-2">
            {['nature', 'business', 'technology', 'people', 'abstract'].map((term) => (
              <button
                key={term}
                onClick={() => handleSuggestionClick(term)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
