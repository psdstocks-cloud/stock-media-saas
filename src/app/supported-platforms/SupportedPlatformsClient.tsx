'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  ExternalLink, 
  Star, 
  TrendingUp, 
  Clock, 
  Plus,
  Grid3X3,
  List,
  Eye,
  Globe,
  Image,
  Video,
  Music,
  Palette,
  Zap,
  Crown,
  Shield
} from 'lucide-react'
import { SUPPORTED_SITES, SupportedSite } from '@/lib/supported-sites'
import RequestPlatformModal from '@/components/modals/RequestPlatformModal'
import PlatformLogo from '@/components/ui/PlatformLogo'

interface EnhancedSite extends SupportedSite {
  logo?: string
  popularity: number
  quality: 'HD' | '4K' | 'Standard'
  sampleCount: number
  lastUpdated: string
  isPopular: boolean
  isNew: boolean
}

// Enhanced site data with additional metadata
const ENHANCED_SITES: EnhancedSite[] = SUPPORTED_SITES.map((site, index) => ({
  ...site,
  logo: `/assets/logos/${site.name}.svg`, // We'll create these
  popularity: Math.floor(Math.random() * 100) + 1,
  quality: index % 3 === 0 ? '4K' : index % 2 === 0 ? 'HD' : 'Standard',
  sampleCount: Math.floor(Math.random() * 10000) + 1000,
  lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  isPopular: index < 10,
  isNew: index > SUPPORTED_SITES.length - 5
}))

const CATEGORY_ICONS = {
  photos: Image,
  videos: Video,
  audio: Music,
  graphics: Palette,
  icons: Zap,
  templates: Globe,
  '3d': Crown,
  mixed: Shield
}

const QUALITY_COLORS = {
  '4K': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'HD': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Standard': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

export default function SupportedPlatformsClient() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('popularity')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showRequestForm, setShowRequestForm] = useState(false)

  const filteredSites = useMemo(() => {
    let filtered = ENHANCED_SITES

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(site =>
        site.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.website.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(site => site.category === selectedCategory)
    }

    // Sort
    switch (sortBy) {
      case 'popularity':
        filtered.sort((a, b) => b.popularity - a.popularity)
        break
      case 'name':
        filtered.sort((a, b) => a.displayName.localeCompare(b.displayName))
        break
      case 'cost':
        filtered.sort((a, b) => a.cost - b.cost)
        break
      case 'quality':
        const qualityOrder = { '4K': 3, 'HD': 2, 'Standard': 1 }
        filtered.sort((a, b) => qualityOrder[b.quality] - qualityOrder[a.quality])
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
        break
    }

    return filtered
  }, [searchTerm, selectedCategory, sortBy])

  const categories = useMemo(() => {
    const cats = Array.from(new Set(ENHANCED_SITES.map(s => s.category)))
    return cats.map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: ENHANCED_SITES.filter(s => s.category === cat).length
    }))
  }, [])

  const SiteCard = ({ site }: { site: EnhancedSite }) => {
    const CategoryIcon = CATEGORY_ICONS[site.category] || Globe

    return (
      <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-orange-500/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <PlatformLogo name={site.displayName} size="md" />
              <div>
                <CardTitle className="text-lg font-semibold group-hover:text-orange-600 transition-colors">
                  {site.displayName}
                </CardTitle>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <CategoryIcon className="w-4 h-4" />
                  <span className="capitalize">{site.category}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              {site.isPopular && (
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-600 border-orange-500/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              )}
              {site.isNew && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-600 border-green-500/30">
                  <Plus className="w-3 h-3 mr-1" />
                  New
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-2">
            {site.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge className={QUALITY_COLORS[site.quality]}>
                {site.quality}
              </Badge>
              <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500/30">
                {site.cost} pts
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(site.website, '_blank')}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Visit
            </Button>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{site.sampleCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>{site.popularity}%</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{site.lastUpdated}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const SiteListItem = ({ site }: { site: EnhancedSite }) => {
    const CategoryIcon = CATEGORY_ICONS[site.category] || Globe

    return (
      <Card className="group hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <PlatformLogo name={site.displayName} size="sm" />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold group-hover:text-orange-600 transition-colors">
                    {site.displayName}
                  </h3>
                  <CategoryIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 capitalize">{site.category}</span>
                  {site.isPopular && (
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-600 border-orange-500/30 text-xs">
                      Popular
                    </Badge>
                  )}
                  {site.isNew && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{site.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge className={QUALITY_COLORS[site.quality]}>
                  {site.quality}
                </Badge>
                <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500/30">
                  {site.cost} pts
                </Badge>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>{site.popularity}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{site.sampleCount.toLocaleString()}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(site.website, '_blank')}
                className="text-orange-600 hover:text-orange-700"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            Supported Platforms
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Access {ENHANCED_SITES.length} premium stock media platforms • All downloads cost 10 points
          </p>
          
          {/* Stats */}
          <div className="flex justify-center space-x-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{ENHANCED_SITES.length}</div>
              <div className="text-sm text-gray-500">Platforms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">10</div>
              <div className="text-sm text-gray-500">Points Each</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">50+</div>
              <div className="text-sm text-gray-500">Categories</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search platforms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories ({ENHANCED_SITES.length})</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label} ({cat.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="cost">Cost</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing {filteredSites.length} of {ENHANCED_SITES.length} platforms
            </p>
            <Button
              variant="outline"
              onClick={() => setShowRequestForm(true)}
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Request New Platform
            </Button>
          </div>
        </div>

        {/* Platform Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSites.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSites.map((site) => (
              <SiteListItem key={site.id} site={site} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredSites.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No platforms found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Request Platform Modal */}
        <RequestPlatformModal 
          isOpen={showRequestForm} 
          onClose={() => setShowRequestForm(false)} 
        />
      </div>
    </div>
  )
}
