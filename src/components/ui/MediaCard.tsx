'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { MediaItem } from '@/lib/store'
import { useAppStore } from '@/lib/store'

interface MediaCardProps {
  media: MediaItem
  viewMode?: 'grid' | 'list'
  onSelect?: (media: MediaItem) => void
  onDownload?: (media: MediaItem) => void
  onAddToFavorites?: (media: MediaItem) => void
  className?: string
}

export function MediaCard({
  media,
  viewMode = 'grid',
  onSelect,
  onDownload,
  onAddToFavorites,
  className
}: MediaCardProps) {
  const { selectedMedia, toggleMediaSelection, addToCart } = useAppStore()
  const [imageError, setImageError] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  
  const isSelected = selectedMedia.some(item => item.id === media.id)
  
  const handleSelect = () => {
    if (onSelect) {
      onSelect(media)
    } else {
      toggleMediaSelection(media)
    }
  }
  
  const handleDownload = () => {
    if (onDownload) {
      onDownload(media)
    } else {
      addToCart(media)
    }
  }
  
  const handleAddToFavorites = () => {
    if (onAddToFavorites) {
      onAddToFavorites(media)
    }
  }

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-all duration-200',
          isSelected && 'ring-2 ring-blue-500 bg-blue-50',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-20 h-20 flex-shrink-0">
          {!imageError ? (
            <Image
              src={media.imageUrl}
              alt={media.title}
              fill
              className="rounded object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{media.title}</h3>
          <p className="text-sm text-gray-500 capitalize">{media.site}</p>
          <p className="text-sm text-gray-600 truncate">{media.description}</p>
          {media.tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {media.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-blue-600">
            {media.cost} pts
          </span>
          <Button
            size="sm"
            variant={isSelected ? "secondary" : "outline"}
            onClick={handleSelect}
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={handleDownload}
          >
            Download
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group relative bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-200 overflow-hidden',
        isSelected && 'ring-2 ring-blue-500',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        {!imageError ? (
          <Image
            src={media.imageUrl}
            alt={media.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        
        {/* Overlay */}
        <div className={cn(
          'absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center',
          isHovered && 'bg-opacity-30'
        )}>
          <div className={cn(
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2',
            isHovered && 'opacity-100'
          )}>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSelect}
            >
              {isSelected ? 'Selected' : 'Select'}
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={handleDownload}
            >
              Download
            </Button>
          </div>
        </div>
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate mb-1">
          {media.title}
        </h3>
        <p className="text-sm text-gray-500 capitalize mb-2">
          {media.site}
        </p>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {media.description}
        </p>
        
        {/* Tags */}
        {media.tags && media.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {media.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
            {media.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                +{media.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Price and actions */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-blue-600">
            {media.cost} pts
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAddToFavorites}
            >
              ♥
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
