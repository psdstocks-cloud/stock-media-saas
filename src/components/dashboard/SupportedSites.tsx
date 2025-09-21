'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Skeleton } from '@/components/ui/skeleton'
import { ExternalLink, Globe, Coins, Star } from 'lucide-react'

interface StockSite {
  id: string
  name: string
  displayName: string
  cost: number
  isActive: boolean
  description?: string
  category?: string
  supportedTypes?: string[]
}

interface SupportedSitesProps {
  className?: string
  showDetails?: boolean
  limit?: number
}

export default function SupportedSites({ 
  className = '', 
  showDetails = true,
  limit 
}: SupportedSitesProps) {
  const [sites, setSites] = useState<StockSite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStockSites = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/stock-sites')
        
        if (!response.ok) {
          throw new Error('Failed to fetch stock sites')
        }
        
        const data = await response.json()
        let activeSites = data.sites?.filter((site: StockSite) => site.isActive) || []
        
        // Apply limit if specified
        if (limit) {
          activeSites = activeSites.slice(0, limit)
        }
        
        setSites(activeSites)
      } catch (err) {
        console.error('Error fetching stock sites:', err)
        setError(err instanceof Error ? err.message : 'Failed to load sites')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStockSites()
  }, [limit])

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'photo':
      case 'image':
        return '📸'
      case 'video':
        return '🎬'
      case 'audio':
      case 'music':
        return '🎵'
      case 'graphics':
      case 'vector':
        return '🎨'
      case 'template':
        return '📄'
      default:
        return '📁'
    }
  }

  const getCostBadgeVariant = (cost: number) => {
    if (cost <= 50) return 'default'
    if (cost <= 100) return 'secondary'
    return 'destructive'
  }

  const getCostBadgeColor = (cost: number) => {
    if (cost <= 50) return 'bg-green-500/20 text-green-400 border-green-500/30'
    if (cost <= 100) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    return 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  if (isLoading) {
    return (
      <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Supported Sites
          </CardTitle>
          <CardDescription className="text-gray-300">
            Loading supported stock media platforms...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border border-white/10 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Skeleton className="h-8 w-8 rounded bg-white/10" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-3/4 bg-white/10" />
                    <Skeleton className="h-3 w-1/2 bg-white/10" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-16 bg-white/10" />
                  <Skeleton className="h-4 w-12 bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Supported Sites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Typography variant="body" className="text-red-400 mb-2">
              Failed to load supported sites
            </Typography>
            <Typography variant="caption" className="text-gray-400">
              {error}
            </Typography>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-white/5 backdrop-blur-sm border-white/10 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          Supported Sites
          {limit && (
            <Badge variant="outline" className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
              Top {limit}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-gray-300">
          {showDetails 
            ? 'Browse and order from these major stock media platforms'
            : `${sites.length} supported platforms available`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showDetails ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map((site) => (
              <div 
                key={site.id} 
                className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors duration-200 group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    {site.displayName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Typography variant="h5" className="text-white truncate group-hover:text-purple-300 transition-colors">
                      {site.displayName}
                    </Typography>
                    {site.category && (
                      <Typography variant="caption" className="text-gray-400 flex items-center">
                        <span className="mr-1">{getCategoryIcon(site.category)}</span>
                        {site.category}
                      </Typography>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <Badge 
                    variant={getCostBadgeVariant(site.cost)}
                    className={getCostBadgeColor(site.cost)}
                  >
                    <Coins className="h-3 w-3 mr-1" />
                    {site.cost} pts
                  </Badge>
                  
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-400 mr-1" />
                    <Typography variant="caption" className="text-gray-400">
                      Active
                    </Typography>
                  </div>
                </div>

                {site.description && (
                  <Typography variant="caption" className="text-gray-300 line-clamp-2">
                    {site.description}
                  </Typography>
                )}

                {site.supportedTypes && site.supportedTypes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {site.supportedTypes.slice(0, 3).map((type, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-white/5 text-gray-300 border-white/20">
                        {type}
                      </Badge>
                    ))}
                    {site.supportedTypes.length > 3 && (
                      <Badge variant="outline" className="text-xs bg-white/5 text-gray-300 border-white/20">
                        +{site.supportedTypes.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sites.map((site) => (
              <Badge 
                key={site.id} 
                variant="outline" 
                className="bg-white/10 text-gray-300 border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <Coins className="h-3 w-3 mr-1" />
                {site.displayName}
                <span className="ml-1 text-xs opacity-75">({site.cost})</span>
              </Badge>
            ))}
          </div>
        )}

        {sites.length === 0 && (
          <div className="text-center py-8">
            <Typography variant="body" className="text-gray-400 mb-2">
              No supported sites available
            </Typography>
            <Typography variant="caption" className="text-gray-500">
              Please check back later or contact support
            </Typography>
          </div>
        )}

        {limit && sites.length >= limit && (
          <div className="mt-4 text-center">
            <Typography variant="caption" className="text-gray-400">
              Showing top {limit} sites. View all supported platforms in your dashboard.
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
