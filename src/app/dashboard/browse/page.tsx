'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Download, 
  Star, 
  Clock,
  Coins,
  ExternalLink,
  Grid3X3,
  List
} from 'lucide-react'

interface StockSite {
  id: string
  name: string
  displayName: string
  category: string
  cost: number
  isActive: boolean
  description?: string
}

export default function BrowsePage() {
  const [stockSites, setStockSites] = useState<StockSite[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    loadStockSites()
  }, [])

  const loadStockSites = async () => {
    try {
      // Mock data for now - you can replace with actual API call
      const mockSites: StockSite[] = [
        {
          id: '1',
          name: 'shutterstock',
          displayName: 'Shutterstock',
          category: 'photography',
          cost: 2.5,
          isActive: true,
          description: 'High-quality stock photos and vectors'
        },
        {
          id: '2',
          name: 'adobe-stock',
          displayName: 'Adobe Stock',
          category: 'photography',
          cost: 3.0,
          isActive: true,
          description: 'Creative assets from Adobe'
        },
        {
          id: '3',
          name: 'freepik',
          displayName: 'Freepik',
          category: 'design',
          cost: 0.15,
          isActive: true,
          description: 'Free and premium graphic resources'
        },
        {
          id: '4',
          name: 'unsplash',
          displayName: 'Unsplash',
          category: 'photography',
          cost: 0.1,
          isActive: true,
          description: 'Beautiful free photos'
        },
        {
          id: '5',
          name: 'pexels',
          displayName: 'Pexels',
          category: 'photography',
          cost: 0.1,
          isActive: true,
          description: 'Free stock photos and videos'
        },
        {
          id: '6',
          name: 'istock',
          displayName: 'iStock',
          category: 'photography',
          cost: 4.0,
          isActive: true,
          description: 'Premium stock content by Getty Images'
        }
      ]
      
      setStockSites(mockSites)
    } catch (error) {
      console.error('Failed to load stock sites:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSites = stockSites.filter(site => {
    const matchesSearch = site.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || site.category === selectedCategory
    return matchesSearch && matchesCategory && site.isActive
  })

  const categories = Array.from(new Set(stockSites.map(site => site.category)))

  const getCostColor = (cost: number) => {
    if (cost < 1) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
    if (cost < 3) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  }

  const getCostLabel = (cost: number) => {
    if (cost < 1) return 'Low Cost'
    if (cost < 3) return 'Medium Cost'
    return 'Premium'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Browse Stock Media</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Access 25+ premium stock sites with your points. Find the perfect assets for your projects.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search stock sites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="border-gray-200 dark:border-gray-600"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="border-gray-200 dark:border-gray-600"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sites Grid/List */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'space-y-4'
      }>
        {filteredSites.map((site) => (
          <Card key={site.id} className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{site.displayName}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{site.description}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={getCostColor(site.cost)}>
                    {getCostLabel(site.cost)}
                  </Badge>
                  <div className="flex items-center space-x-1 text-sm">
                    <Coins className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{site.cost}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span className="capitalize">{site.category}</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span>Popular</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button className="flex-1 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Browse
                </Button>
                <Button variant="outline" size="sm" className="border-gray-200 dark:border-gray-600">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredSites.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No sites found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Popular Sites */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
            <Star className="h-5 w-5" />
            <span>Most Popular This Month</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredSites.slice(0, 4).map((site) => (
              <div key={site.id} className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-300 dark:hover:border-orange-600 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-700/50">
                <div className="font-medium text-gray-900 dark:text-gray-100">{site.displayName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{site.cost} points</div>
                <Badge className="mt-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                  Trending
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}