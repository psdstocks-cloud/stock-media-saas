'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface StockSite {
  id: string
  name: string
  displayName: string
  cost: number
  category: string | null
  isActive: boolean
}

interface SearchResult {
  id: string
  title: string
  image: string
  source: string
  cost: number
  ext: string
  name: string
  author: string
  sizeInBytes: number
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
    if (!selectedSiteData || !searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/search?site=${selectedSiteData.name}&query=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (data.success && data.results) {
        setSearchResults(data.results)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleOrder = async (item: SearchResult) => {
    if (!session?.user?.id || !selectedSiteData) return

    setIsOrdering(item.id)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          stockSiteId: selectedSiteData.id,
          stockItemId: item.id,
          stockItemUrl: `https://${selectedSiteData.name}.com/item/${item.id}`,
          title: item.title,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        // Refresh user balance
        const balanceResponse = await fetch(`/api/points?userId=${session.user.id}`)
        const balanceData = await balanceResponse.json()
        setUserBalance(balanceData.balance?.currentPoints || 0)
        
        // Show success message or redirect to orders
        alert('Order placed successfully! Check your dashboard for updates.')
      } else {
        alert(data.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Order error:', error)
      alert('Failed to place order')
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.id) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Browse Stock Media</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {userBalance} points available
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Site Selection */}
        {!selectedSiteData && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Stock Site</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stockSites.map((site) => (
                <Link
                  key={site.id}
                  href={`/dashboard/browse?site=${site.name}`}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-center">
                    <div className="font-medium text-gray-900 text-sm">
                      {site.displayName}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {site.cost} points
                    </div>
                    <div className="text-xs text-gray-400 mt-1 capitalize">
                      {site.category}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search Interface */}
        {selectedSiteData && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Search {selectedSiteData.displayName}
              </h2>
              <button
                onClick={() => {
                  setSelectedSiteData(null)
                  setSearchResults([])
                  setSearchQuery('')
                  router.push('/dashboard/browse')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Change Site
              </button>
            </div>

            <form onSubmit={handleSearch} className="flex space-x-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${selectedSiteData.displayName}...`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Search Results ({searchResults.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                      {item.title}
                    </h4>
                    <div className="text-xs text-gray-500 mb-2">
                      <div>Author: {item.author}</div>
                      <div>Size: {formatFileSize(item.sizeInBytes)}</div>
                      <div>Format: {item.ext.toUpperCase()}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-blue-600">
                        {selectedSiteData?.cost} points
                      </span>
                      <button
                        onClick={() => handleOrder(item)}
                        disabled={isOrdering === item.id || userBalance < (selectedSiteData?.cost || 0)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isOrdering === item.id ? 'Ordering...' : 'Order'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {selectedSiteData && searchQuery && !isSearching && searchResults.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No results found for "{searchQuery}"</div>
            <div className="text-gray-400 text-sm mt-2">Try a different search term</div>
          </div>
        )}

        {/* Instructions */}
        {!selectedSiteData && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Select a stock site to start browsing</div>
            <div className="text-gray-400 text-sm mt-2">Choose from the available sites above</div>
          </div>
        )}
      </div>
    </div>
  )
}
