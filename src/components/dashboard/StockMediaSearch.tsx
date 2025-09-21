'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter,
  Download,
  ExternalLink,
  Coins,
  Image,
  Video,
  Music,
  FileText,
  RefreshCw,
  ShoppingCart,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface StockSite {
  id: string
  name: string
  displayName: string
  baseUrl: string
  supportedTypes: string[]
  costMultiplier: number
}

interface SearchResult {
  id: string
  title: string
  url: string
  imageUrl: string
  type: string
  cost: number
  site: string
  description?: string
}

interface StockMediaSearchProps {
  className?: string
}

export function StockMediaSearch({ className }: StockMediaSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSite, setSelectedSite] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [results, setResults] = useState<SearchResult[]>([])
  const [stockSites, setStockSites] = useState<StockSite[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSites, setIsLoadingSites] = useState(true)
  const [error, setError] = useState('')
  const [currentPoints, setCurrentPoints] = useState(0)

  const fetchStockSites = async () => {
    setIsLoadingSites(true)
    try {
      const response = await fetch('/api/stock-sites')
      if (response.ok) {
        const result = await response.json()
        setStockSites(result.sites || result)
      }
    } catch (error) {
      console.error('Failed to fetch stock sites:', error)
    } finally {
      setIsLoadingSites(false)
    }
  }

  const fetchPointsBalance = async () => {
    try {
      const response = await fetch('/api/points')
      if (response.ok) {
        const result = await response.json()
        setCurrentPoints(result.currentPoints || result.data?.currentPoints || 0)
      }
    } catch (error) {
      console.error('Failed to fetch points:', error)
    }
  }

  useEffect(() => {
    fetchStockSites()
    fetchPointsBalance()
  }, [])

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        query: searchTerm.trim(),
        limit: '20'
      })

      if (selectedSite !== 'all') {
        params.append('site', selectedSite)
      }

      if (selectedType !== 'all') {
        params.append('type', selectedType)
      }

      const response = await fetch(`/api/search?${params}`)
      if (response.ok) {
        const result = await response.json()
        setResults(result.results || result.data || [])
      } else {
        setError('Failed to search stock media')
      }
    } catch (error) {
      setError('An error occurred while searching')
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOrderItem = async (item: SearchResult) => {
    if (currentPoints < item.cost) {
      toast.error('Insufficient points for this item')
      return
    }

    try {
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: item.url,
          site: item.site,
          id: item.id,
          title: item.title,
          cost: item.cost,
          imageUrl: item.imageUrl
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Order placed successfully!')
        fetchPointsBalance() // Refresh points balance
        
        if (result.existingOrder && result.order.downloadUrl) {
          // Open download link if it's an existing order
          window.open(result.order.downloadUrl, '_blank')
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to place order')
      }
    } catch (error) {
      toast.error('An error occurred while placing order')
      console.error('Order error:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    if (!type) return <Image className="h-4 w-4" />
    switch (type.toLowerCase()) {
      case 'image':
      case 'photo':
        return <Image className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'audio':
      case 'music':
        return <Music className="h-4 w-4" />
      case 'vector':
      case 'illustration':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getCostColor = (cost: number) => {
    if (cost <= 1) return 'text-green-600'
    if (cost <= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'vector', label: 'Vectors' },
    { value: 'audio', label: 'Audio' }
  ]

  if (isLoadingSites) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Stock Media Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Stock Media Search
        </CardTitle>
        <CardDescription>
          Search and order from 25+ stock media sites
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Search Controls */}
        <div className="space-y-4 mb-6">
          {/* Search Input */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Search for images, videos, vectors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {stockSites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Points Balance */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Coins className="h-4 w-4 text-primary" />
              <Typography variant="body" className="font-medium">
                Available Points
              </Typography>
            </div>
            <Typography variant="h4" className="font-bold text-primary">
              {currentPoints.toLocaleString()}
            </Typography>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item) => (
              <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.jpg'
                    }}
                  />
                  <Badge className="absolute top-2 left-2">
                    {getTypeIcon(item.type)}
                    <span className="ml-1 capitalize">{item.type}</span>
                  </Badge>
                  <Badge 
                    className={`absolute top-2 right-2 ${getCostColor(item.cost)}`}
                    variant="secondary"
                  >
                    <Coins className="h-3 w-3 mr-1" />
                    {item.cost}
                  </Badge>
                </div>
                
                <div className="p-4">
                  <Typography variant="body" className="font-medium mb-2 line-clamp-2">
                    {item.title}
                  </Typography>
                  
                  <div className="flex items-center justify-between mb-3">
                    <Typography variant="caption" color="muted">
                      {item.site}
                    </Typography>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleOrderItem(item)}
                    disabled={currentPoints < item.cost}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {currentPoints < item.cost ? 'Insufficient Points' : `Order (${item.cost} pts)`}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <Typography variant="h3" className="mb-2">
              No Results Found
            </Typography>
            <Typography variant="body" color="muted">
              Try adjusting your search terms or filters
            </Typography>
          </div>
        ) : (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <Typography variant="h3" className="mb-2">
              Search Stock Media
            </Typography>
            <Typography variant="body" color="muted">
              Enter keywords to search across {stockSites.length}+ stock sites
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StockMediaSearch
