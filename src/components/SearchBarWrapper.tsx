'use client'

import { SearchBar } from './ui/SearchBar'

interface SearchBarWrapperProps {
  placeholder?: string
  showSuggestions?: boolean
  className?: string
}

export function SearchBarWrapper({ 
  placeholder = "Search for images, videos, and more...", 
  showSuggestions = true,
  className 
}: SearchBarWrapperProps) {
  return (
    <SearchBar 
      placeholder={placeholder}
      showSuggestions={showSuggestions}
      className={className}
    />
  )
}
