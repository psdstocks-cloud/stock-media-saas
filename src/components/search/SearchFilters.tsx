'use client'

import React, { useState } from 'react'
import { Filter, X, ChevronDown } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Typography, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface SearchFiltersType {
  type: string[]
  category: string[]
  license: string[]
  orientation: string[]
  color: string[]
  size: string[]
  duration: string[] // for videos/audio
  priceRange: string[]
  dateRange: string[]
}

interface SearchFiltersProps {
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType) => void
  onClearFilters: () => void
  className?: string
}

const FILTER_OPTIONS = {
  type: [
    { value: 'photo', label: 'Photos' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'vector', label: 'Vector Graphics' },
    { value: 'illustration', label: 'Illustrations' }
  ],
  category: [
    { value: 'business', label: 'Business' },
    { value: 'technology', label: 'Technology' },
    { value: 'nature', label: 'Nature' },
    { value: 'people', label: 'People' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'architecture', label: 'Architecture' },
    { value: 'food', label: 'Food' },
    { value: 'travel', label: 'Travel' },
    { value: 'sports', label: 'Sports' }
  ],
  license: [
    { value: 'royalty-free', label: 'Royalty Free' },
    { value: 'rights-managed', label: 'Rights Managed' },
    { value: 'editorial', label: 'Editorial' },
    { value: 'creative-commons', label: 'Creative Commons' }
  ],
  orientation: [
    { value: 'landscape', label: 'Landscape' },
    { value: 'portrait', label: 'Portrait' },
    { value: 'square', label: 'Square' }
  ],
  color: [
    { value: 'red', label: 'Red' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'purple', label: 'Purple' },
    { value: 'orange', label: 'Orange' },
    { value: 'pink', label: 'Pink' },
    { value: 'black', label: 'Black' },
    { value: 'white', label: 'White' },
    { value: 'gray', label: 'Gray' }
  ],
  size: [
    { value: 'small', label: 'Small (< 1MB)' },
    { value: 'medium', label: 'Medium (1-10MB)' },
    { value: 'large', label: 'Large (10-100MB)' },
    { value: 'xlarge', label: 'Extra Large (> 100MB)' }
  ],
  duration: [
    { value: 'short', label: 'Short (< 30s)' },
    { value: 'medium', label: 'Medium (30s-2min)' },
    { value: 'long', label: 'Long (> 2min)' }
  ],
  priceRange: [
    { value: 'free', label: 'Free' },
    { value: 'low', label: 'Low ($1-10)' },
    { value: 'medium', label: 'Medium ($10-50)' },
    { value: 'high', label: 'High ($50+)' }
  ],
  dateRange: [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ]
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [_activeFilter, _setActiveFilter] = useState<string | null>(null)

  const handleFilterChange = (filterType: keyof SearchFiltersType, value: string) => {
    const currentValues = filters[filterType]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    onFiltersChange({
      ...filters,
      [filterType]: newValues
    })
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce((count, filterArray) => count + filterArray.length, 0)
  }

  const hasActiveFilters = getActiveFiltersCount() > 0

  const renderFilterSection = (filterType: keyof SearchFiltersType, title: string) => {
    const options = FILTER_OPTIONS[filterType]
    const selectedValues = filters[filterType]

    return (
      <div key={filterType} className="space-y-3">
        <Typography variant="h6" className="text-sm font-medium">
          {title}
        </Typography>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <Button
              key={option.value}
              variant={selectedValues.includes(option.value) ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange(filterType, option.value)}
              className="h-8"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filters</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={cn("space-y-6", !isExpanded && "hidden md:block")}>
        {renderFilterSection('type', 'Media Type')}
        {renderFilterSection('category', 'Category')}
        {renderFilterSection('license', 'License Type')}
        {renderFilterSection('orientation', 'Orientation')}
        {renderFilterSection('color', 'Color')}
        {renderFilterSection('size', 'File Size')}
        {renderFilterSection('duration', 'Duration')}
        {renderFilterSection('priceRange', 'Price Range')}
        {renderFilterSection('dateRange', 'Date Added')}
      </CardContent>
    </Card>
  )
}

export default SearchFilters
