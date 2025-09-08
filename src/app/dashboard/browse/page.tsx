'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

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
        return '🎥'
      case 'audio':
      case 'music':
        return '🎵'
      default:
        return '🖼️'
    }
  }

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '128px',
            height: '128px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{
            marginTop: '16px',
            color: '#64748b',
            fontSize: '18px'
          }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.id) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <button
                onClick={() => router.back()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'transparent',
                  color: '#64748b',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                ← Back
              </button>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>SM</span>
              </div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Browse Media</h1>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#64748b'
              }}>
                <span style={{ fontWeight: '500' }}>{userBalance}</span> points available
              </div>
              <button
                onClick={() => router.push('/dashboard/orders')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                👁️ My Orders
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 1rem'
      }}>
        {/* Site Selection */}
        {!selectedSiteData && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#0f172a',
              marginBottom: '24px'
            }}>Choose a Stock Site</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {stockSites.map((site) => (
                <div
                  key={site.id}
                  onClick={() => setSelectedSiteData(site)}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: 'none'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#0f172a'
                    }}>{site.displayName}</h3>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: site.isActive ? '#dcfce7' : '#f1f5f9',
                      color: site.isActive ? '#166534' : '#64748b'
                    }}>
                      {site.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p style={{
                    color: '#64748b',
                    marginBottom: '16px',
                    textTransform: 'capitalize'
                  }}>{site.category}</p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#0f172a'
                    }}>{site.cost} pts</span>
                    <button
                      disabled={!site.isActive}
                      style={{
                        padding: '8px 16px',
                        background: site.isActive ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#9ca3af',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: site.isActive ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Browse
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Interface */}
        {selectedSiteData && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '8px'
                }}>{selectedSiteData.displayName}</h2>
                <p style={{ color: '#64748b' }}>Search from millions of {selectedSiteData.category} files</p>
              </div>
              <button
                onClick={() => setSelectedSiteData(null)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Change Site
              </button>
            </div>

            <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Search for images, videos, or audio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  style={{
                    padding: '12px 24px',
                    background: isSearching || !searchQuery.trim() ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: isSearching || !searchQuery.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isSearching ? '⏳' : '🔍'} Search
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#374151',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🔧 Filters
                </button>
              </div>
            </form>

            {/* Filters */}
            {showFilters && (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="all">All Types</option>
                      <option value="image">Images</option>
                      <option value="video">Videos</option>
                      <option value="audio">Audio</option>
                    </select>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="relevance">Relevance</option>
                      <option value="newest">Newest</option>
                      <option value="popular">Most Popular</option>
                      <option value="size">File Size</option>
                    </select>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>Price Range</label>
                    <select
                      value={filters.priceRange}
                      onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="all">All Prices</option>
                      <option value="free">Free</option>
                      <option value="low">Low (1-10 pts)</option>
                      <option value="medium">Medium (11-50 pts)</option>
                      <option value="high">High (50+ pts)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* View Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <span style={{
                  fontSize: '14px',
                  color: '#64748b'
                }}>
                  {searchResults.length} results found
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: viewMode === 'grid' ? '#2563eb' : 'white',
                    color: viewMode === 'grid' ? 'white' : '#374151',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ⊞ Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: viewMode === 'list' ? '#2563eb' : 'white',
                    color: viewMode === 'list' ? 'white' : '#374151',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ☰ List
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length === 0 && searchQuery && !isSearching && (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '8px'
                }}>No results found</h3>
                <p style={{ color: '#64748b' }}>Try adjusting your search terms or filters</p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div style={{
                display: viewMode === 'grid' 
                  ? 'grid' 
                  : 'flex',
                gridTemplateColumns: viewMode === 'grid' 
                  ? 'repeat(auto-fit, minmax(250px, 1fr))' 
                  : 'none',
                flexDirection: viewMode === 'list' ? 'column' : 'row',
                gap: '24px'
              }}>
                {searchResults.map((result) => (
                  <div key={result.id} style={{
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    border: 'none'
                  }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        aspectRatio: '1',
                        background: '#f1f5f9',
                        borderRadius: '12px 12px 0 0',
                        overflow: 'hidden'
                      }}>
                        <img
                          src={result.thumbnailUrl}
                          alt={result.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px'
                      }}>
                        <span style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          color: '#374151',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {getTypeIcon(result.type)}
                          <span style={{ textTransform: 'capitalize' }}>{result.type}</span>
                        </span>
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px'
                      }}>
                        <span style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          color: '#374151'
                        }}>
                          {formatFileSize(result.sizeInBytes)}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h3 style={{
                        fontWeight: '600',
                        color: '#0f172a',
                        marginBottom: '8px',
                        fontSize: '16px',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {result.title}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#64748b',
                        marginBottom: '12px',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {result.description}
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#0f172a'
                        }}>
                          {selectedSiteData.cost} pts
                        </span>
                        <button
                          onClick={() => handleOrder(result)}
                          disabled={isOrdering === result.id || userBalance < selectedSiteData.cost}
                          style={{
                            padding: '8px 16px',
                            background: isOrdering === result.id || userBalance < selectedSiteData.cost 
                              ? '#9ca3af' 
                              : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: isOrdering === result.id || userBalance < selectedSiteData.cost 
                              ? 'not-allowed' 
                              : 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isOrdering === result.id ? '⏳' : '⬇️'} Download
                        </button>
                      </div>
                      {userBalance < selectedSiteData.cost && (
                        <p style={{
                          fontSize: '12px',
                          color: '#ef4444',
                          marginTop: '8px',
                          margin: 0
                        }}>
                          Insufficient points
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}