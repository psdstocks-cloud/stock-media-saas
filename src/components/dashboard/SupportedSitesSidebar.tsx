'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Skeleton } from '@/components/ui/skeleton'
import { Globe, Coins, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

export function SupportedSitesSidebar() {
  const [sites, setSites] = useState<StockSite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [_isExpanded, _setIsExpanded] = useState(false)

  useEffect(() => {
    fetchStockSites()
  }, [])

  const fetchStockSites = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/stock-sites')
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock sites')
      }
      
      const data = await response.json()
      const activeSites = data.sites?.filter((site: StockSite) => site.isActive) || []
      
      // Sort by popularity/common usage
      const sortedSites = activeSites.sort((a: StockSite, b: StockSite) => {
        const popularSites = ['shutterstock', 'getty', 'adobe', 'unsplash', 'pexels', 'pixabay']
        const aIndex = popularSites.indexOf(a.name.toLowerCase())
        const bIndex = popularSites.indexOf(b.name.toLowerCase())
        
        if (aIndex === -1 && bIndex === -1) return a.displayName.localeCompare(b.displayName)
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        return aIndex - bIndex
      })
      
      setSites(sortedSites)
    } catch (error) {
      console.error('Error fetching stock sites:', error)
      setError('Failed to load supported sites')
    } finally {
      setIsLoading(false)
    }
  }

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
      case 'vector':
        return '🎨'
      default:
        return '🌐'
    }
  }

  const _getCostBadgeVariant = (_cost: number) => {
    return 'success' as const
  }

  const getCostBadgeColor = (_cost: number) => {
    return 'bg-green-500/20 text-green-300 border-green-500/30'
  }

  const displayedSites = showAll ? sites : sites.slice(0, 6)

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-white text-lg">
            <Globe className="h-5 w-5 mr-2" />
            Supported Sites
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-white text-lg">
            <Globe className="h-5 w-5 mr-2" />
            Supported Sites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Typography variant="body" className="text-white/70 mb-2">
              {error}
            </Typography>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchStockSites}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-white text-lg">
          <Globe className="h-5 w-5 mr-2" />
          Supported Sites
        </CardTitle>
        <CardDescription className="text-white/70">
          Unified pricing: All downloads cost 10 points
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Sites List */}
        <div className="space-y-2">
          {displayedSites.map((site) => (
            <div 
              key={site.id}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="text-lg">
                  {getCategoryIcon(site.category || 'photo')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <Typography variant="body" className="text-white font-medium truncate">
                      {site.displayName}
                    </Typography>
                    <Badge 
                      className={`${getCostBadgeColor(site.cost)} text-xs px-2 py-1 font-semibold`}
                    >
                      {site.cost} pts
                    </Badge>
                  </div>
                  <Typography variant="caption" className="text-white/60">
                    {site.category || 'Photos'}
                  </Typography>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {sites.length > 6 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full text-white/70 hover:text-white hover:bg-white/10"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show All ({sites.length})
              </>
            )}
          </Button>
        )}

        {/* Info Footer */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center text-white/60 text-sm">
            <Coins className="h-4 w-4 mr-2" />
            <span>Unified pricing system</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
