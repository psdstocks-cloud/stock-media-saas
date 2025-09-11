import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { MediaItem, SearchFilters } from '@/lib/store'

// API functions
const searchStockMedia = async (query: string, filters: SearchFilters, page = 0) => {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      filters,
      page,
      limit: 20
    })
  })

  if (!response.ok) {
    throw new Error('Failed to search stock media')
  }

  return response.json()
}

const getStockInfo = async (url: string) => {
  const response = await fetch('/api/stock-info', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url })
  })

  if (!response.ok) {
    throw new Error('Failed to get stock info')
  }

  return response.json()
}

const getSearchSuggestions = async (query: string) => {
  const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`)
  
  if (!response.ok) {
    throw new Error('Failed to get search suggestions')
  }

  return response.json()
}

// Hooks
export const useSearchStockMedia = (query: string, filters: SearchFilters) => {
  return useQuery({
    queryKey: queryKeys.search(query, filters),
    queryFn: () => searchStockMedia(query, filters),
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  })
}

export const useInfiniteSearchStockMedia = (query: string, filters: SearchFilters) => {
  return useInfiniteQuery({
    queryKey: queryKeys.search(query, filters),
    queryFn: ({ pageParam = 0 }) => searchStockMedia(query, filters, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined
    },
    initialPageParam: 0,
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000,
  })
}

export const useStockInfo = (url: string) => {
  return useQuery({
    queryKey: ['stock-info', url],
    queryFn: () => getStockInfo(url),
    enabled: !!url,
    staleTime: 10 * 60 * 1000, // 10 minutes for stock info
  })
}

export const useSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: queryKeys.searchSuggestions(query),
    queryFn: () => getSearchSuggestions(query),
    enabled: !!query && query.length > 1,
    staleTime: 5 * 60 * 1000, // 5 minutes for suggestions
  })
}

export const useDownloadMedia = () => {
  return useMutation({
    mutationFn: async (mediaItems: MediaItem[]) => {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: mediaItems })
      })

      if (!response.ok) {
        throw new Error('Failed to download media')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Handle successful download
      console.log('Download successful:', data)
    },
    onError: (error) => {
      // Handle download error
      console.error('Download failed:', error)
    }
  })
}

export const useAddToFavorites = () => {
  return useMutation({
    mutationFn: async (mediaItem: MediaItem) => {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mediaItem })
      })

      if (!response.ok) {
        throw new Error('Failed to add to favorites')
      }

      return response.json()
    }
  })
}

export const useRemoveFromFavorites = () => {
  return useMutation({
    mutationFn: async (mediaId: string) => {
      const response = await fetch(`/api/favorites/${mediaId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to remove from favorites')
      }

      return response.json()
    }
  })
}

export const useFavorites = () => {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await fetch('/api/favorites')
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorites')
      }

      return response.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}
