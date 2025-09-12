'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Download, ExternalLink, Loader2, CheckCircle, AlertCircle, Sparkles, Zap, Star } from 'lucide-react'
import FilePreview from '@/components/FilePreview'

export default function BrowseNewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  // Add timeout for loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'loading') {
        setLoadingTimeout(true)
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(timer)
  }, [status])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading' && !loadingTimeout) return
    
    if (!session) {
      router.push('/login')
      return
    }
  }, [session, status, router, loadingTimeout])

  // Load recent orders
  useEffect(() => {
    if (session?.user?.id) {
      loadRecentOrders()
    }
  }, [session?.user?.id])

  const loadRecentOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setRecentOrders(data.orders?.slice(0, 5) || [])
      }
    } catch (error) {
      console.error('Error loading recent orders:', error)
    }
  }

  const handleOrderPlaced = (orderId: string) => {
    console.log('Order placed:', orderId)
    // Reload recent orders
    loadRecentOrders()
  }

  if (status === 'loading' && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Loader2 className="w-10 h-10 animate-spin text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Loading Your Dashboard</h2>
          <p className="text-gray-300 text-lg">Please wait while we prepare everything...</p>
        </div>
      </div>
    )
  }

  if (loadingTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-3 h-3 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Authentication Timeout</h2>
          <p className="text-gray-300 text-lg mb-8">Please try logging in again to continue</p>
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Modern Header */}
        <div className="mb-12">
          <div className="flex items-center gap-6 mb-8">
            <button
              onClick={() => router.back()}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Download Media
                </h1>
              </div>
              <p className="text-gray-300 text-xl">Access premium stock content instantly with our advanced platform</p>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
              <p className="text-gray-300 text-lg leading-relaxed">
                🚀 <strong className="text-white">Paste any stock media URL</strong> to preview and download instantly. 
                We support <span className="text-yellow-300 font-semibold">40+ stock sites</span> including 
                Shutterstock, Dreamstime, Adobe Stock, and many more!
              </p>
            </div>
          </div>
        </div>

        {/* File Preview Component */}
        <div className="mb-12">
          <FilePreview 
            url={url} 
            onOrderPlaced={handleOrderPlaced}
          />
        </div>

        {/* Supported Sites */}
        <div className="relative group mb-12">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">Supported Sites</h2>
              </div>
              <p className="text-gray-300 text-xl">Access content from 40+ premium stock media platforms</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                'Shutterstock',
                'Dreamstime', 
                'Adobe Stock',
                '123RF',
                'Depositphotos',
                'Freepik',
                'Vecteezy',
                'Rawpixel',
                'Storyblocks',
                'Motion Array',
                'Artlist',
                'Epidemic Sound',
                'UI8',
                'Craftwork',
                'Icons8',
                'Flaticon'
              ].map((site) => (
                <div key={site} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 text-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-semibold text-sm">{site}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <div className="relative group mb-12">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-blue-600/20 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Recent Orders</h2>
                </div>
                <p className="text-gray-300 text-xl">Your latest downloads and orders</p>
              </div>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 shadow-lg">
                    <div className="flex items-center gap-6">
                      <div className="relative group/image">
                        <img
                          src={order.imageUrl || 'https://via.placeholder.com/60x60/4F46E5/FFFFFF?text=IMG'}
                          alt={order.title}
                          className="w-16 h-16 object-cover rounded-2xl border-2 border-white/20 group-hover/image:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-bold text-xl mb-1">{order.title}</p>
                        <p className="text-gray-300 text-sm">
                          {order.stockSite?.displayName} • {order.cost} points
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                        order.status === 'COMPLETED' 
                          ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                          : order.status === 'PROCESSING'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-400/30'
                      }`}>
                        {order.status}
                      </span>
                      {order.status === 'COMPLETED' && order.downloadUrl && (
                        <a
                          href={order.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-110 shadow-lg"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* How it Works */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">How it Works</h2>
              </div>
              <p className="text-gray-300 text-xl">Simple, fast, and secure - get your media in 3 easy steps</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-200 shadow-lg">
                  <ExternalLink className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">1. Paste URL</h3>
                <p className="text-gray-300 leading-relaxed">
                  Copy and paste any stock media URL from supported platforms
                </p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-200 shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">2. Preview & Order</h3>
                <p className="text-gray-300 leading-relaxed">
                  See the file preview, check details, and place your order
                </p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-200 shadow-lg">
                  <Download className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">3. Download</h3>
                <p className="text-gray-300 leading-relaxed">
                  Get your high-quality file instantly with a fresh download link
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}