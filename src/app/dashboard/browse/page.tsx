'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Clock, 
  Star,
  Grid3X3,
  List,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Video,
  Music
} from 'lucide-react'

interface StockSite {
  id: string
  name: string
  displayName: string
  category: string
  cost: number
  isActive: boolean
}

interface SearchResult {
  id: string
  title: string
  description: string
  url: string
  thumbnailUrl: string
  type: string
  sizeInBytes: number
  site: string
  tags: string[]
}

export default function BrowsePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedSite = searchParams.get('site')

  const [stockSites, setStockSites] = useState<StockSite[]>([])
  const [selectedSiteData, setSelectedSiteData] = useState<StockSite | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOrdering, setIsOrdering] = useState<string | null>(null)
  const [userBalance, setUserBalance] = useState<number>(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    type: 'all',
    sortBy: 'relevance',
    priceRange: 'all'
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user?.id) {
      router.push('/login')
      return
    }

    // Fetch stock sites and user balance
    const fetchData = async () => {
      try {
        const [sitesResponse, balanceResponse] = await Promise.all([
          fetch('/api/stock-sites'),
          fetch(`/api/points?userId=${session.user.id}`)
        ])

        const sitesData = await sitesResponse.json()
        const balanceData = await balanceResponse.json()

        setStockSites(sitesData.stockSites || [])
        setUserBalance(balanceData.balance?.currentPoints || 0)

        // Set selected site if specified in URL
        if (selectedSite) {
          const site = sitesData.stockSites?.find((s: StockSite) => s.name === selectedSite)
          if (site) {
            setSelectedSiteData(site)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [session, status, router, selectedSite])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || !selectedSiteData) return

    setIsSearching(true)
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          site: selectedSiteData.name,
          filters
        }),
      })

      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleOrder = async (result: SearchResult) => {
    if (!selectedSiteData) return

    setIsOrdering(result.id)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: result.title,
          description: result.description,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          type: result.type,
          sizeInBytes: result.sizeInBytes,
          siteId: selectedSiteData.id,
          cost: selectedSiteData.cost
        }),
      })

      const data = await response.json()
      if (response.ok) {
        // Update user balance
        setUserBalance(prev => prev - selectedSiteData.cost)
        // Show success message or redirect
        router.push('/dashboard/orders')
      } else {
        console.error('Order failed:', data.error)
      }
    } catch (error) {
      console.error('Order error:', error)
    } finally {
      setIsOrdering(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="w-4 h-4" />
      case 'audio':
      case 'music':
        return <Music className="w-4 h-4" />
      default:
        return <ImageIcon className="w-4 h-4" />
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.id) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">Browse Media</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-600">
                <span className="font-medium">{userBalance}</span> points available
              </div>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                My Orders
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Site Selection */}
        {!selectedSiteData && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Choose a Stock Site</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stockSites.map((site) => (
                <Card 
                  key={site.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md"
                  onClick={() => setSelectedSiteData(site)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">{site.displayName}</h3>
                      <Badge variant={site.isActive ? "success" : "secondary"}>
                        {site.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-slate-600 mb-4 capitalize">{site.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-slate-900">{site.cost} pts</span>
                      <Button size="sm" disabled={!site.isActive}>
                        Browse
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search Interface */}
        {selectedSiteData && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedSiteData.displayName}</h2>
                <p className="text-slate-600">Search from millions of {selectedSiteData.category} files</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedSiteData(null)}
              >
                Change Site
              </Button>
            </div>

            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search for images, videos, or audio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-lg py-3"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-5 h-5" />
                </Button>
              </div>
            </form>

            {/* Filters */}
            {showFilters && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                      <select
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full p-2 border border-slate-300 rounded-lg"
                      >
                        <option value="all">All Types</option>
                        <option value="image">Images</option>
                        <option value="video">Videos</option>
                        <option value="audio">Audio</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                        className="w-full p-2 border border-slate-300 rounded-lg"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="newest">Newest</option>
                        <option value="popular">Most Popular</option>
                        <option value="size">File Size</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Price Range</label>
                      <select
                        value={filters.priceRange}
                        onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                        className="w-full p-2 border border-slate-300 rounded-lg"
                      >
                        <option value="all">All Prices</option>
                        <option value="free">Free</option>
                        <option value="low">Low (1-10 pts)</option>
                        <option value="medium">Medium (11-50 pts)</option>
                        <option value="high">High (50+ pts)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* View Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600">
                  {searchResults.length} results found
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length === 0 && searchQuery && !isSearching && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No results found</h3>
                <p className="text-slate-600">Try adjusting your search terms or filters</p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }>
                {searchResults.map((result) => (
                  <Card key={result.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                    <CardContent className="p-0">
                      <div className="relative">
                        <div className="aspect-square bg-slate-100 rounded-t-lg overflow-hidden">
                          <img
                            src={result.thumbnailUrl}
                            alt={result.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="bg-white/90 text-slate-700">
                            {getTypeIcon(result.type)}
                            <span className="ml-1 capitalize">{result.type}</span>
                          </Badge>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-white/90 text-slate-700">
                            {formatFileSize(result.sizeInBytes)}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                          {result.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {result.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-slate-900">
                            {selectedSiteData.cost} pts
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleOrder(result)}
                            disabled={isOrdering === result.id || userBalance < selectedSiteData.cost}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                          >
                            {isOrdering === result.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        {userBalance < selectedSiteData.cost && (
                          <p className="text-xs text-red-600 mt-2">
                            Insufficient points
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}