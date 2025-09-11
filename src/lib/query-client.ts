import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status
          if (status >= 400 && status < 500) {
            return false
          }
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 1
    }
  }
})

// Query keys factory
export const queryKeys = {
  // User queries
  user: ['user'] as const,
  userProfile: (userId: string) => ['user', userId] as const,
  
  // Search queries
  search: (query: string, filters: any) => ['search', query, filters] as const,
  searchSuggestions: (query: string) => ['search-suggestions', query] as const,
  
  // Media queries
  media: ['media'] as const,
  mediaItem: (id: string) => ['media', id] as const,
  mediaBySite: (site: string) => ['media', 'site', site] as const,
  mediaByCategory: (category: string) => ['media', 'category', category] as const,
  
  // Cart queries
  cart: ['cart'] as const,
  
  // Subscription queries
  subscriptionPlans: ['subscription-plans'] as const,
  userSubscription: (userId: string) => ['subscription', userId] as const,
  
  // Analytics queries
  analytics: ['analytics'] as const,
  userAnalytics: (userId: string) => ['analytics', userId] as const
} as const
