'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Typography } from '@/components/ui/typography'
import { Link as LinkIcon, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OrderClient() {
  const [urls, setUrls] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const handleGetFileInfo = async () => {
    if (!urls.trim()) {
      toast.error('Please enter at least one URL')
      return
    }

    setIsLoading(true)
    setResults([])

    try {
      // Split URLs by line and filter out empty lines
      const urlList = urls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0)

      if (urlList.length === 0) {
        toast.error('Please enter valid URLs')
        return
      }

      // Process each URL
      const promises = urlList.map(async (url) => {
        try {
          const response = await fetch('/api/stock-info', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
          })

          const data = await response.json()
          
          return {
            url,
            success: data.success,
            data: data.success ? data : null,
            error: data.success ? null : data.message
          }
        } catch (error) {
          return {
            url,
            success: false,
            data: null,
            error: 'Failed to fetch information'
          }
        }
      })

      const results = await Promise.all(promises)
      setResults(results)

      // Show summary toast
      const successCount = results.filter(r => r.success).length
      const errorCount = results.length - successCount

      if (successCount > 0) {
        toast.success(`Successfully parsed ${successCount} URL${successCount !== 1 ? 's' : ''}`)
      }
      if (errorCount > 0) {
        toast.error(`Failed to parse ${errorCount} URL${errorCount !== 1 ? 's' : ''}`)
      }

    } catch (error) {
      console.error('Error processing URLs:', error)
      toast.error('Failed to process URLs. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <Typography variant="h1" className="text-4xl font-bold text-white mb-4">
          <LinkIcon className="inline h-8 w-8 mr-3 text-purple-400" />
          Stock Media Order
        </Typography>
        <Typography variant="p" className="text-gray-300 text-lg">
          Paste stock media URLs to get file information and place orders
        </Typography>
      </div>

      {/* Main Order Form */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <LinkIcon className="h-5 w-5 mr-2" />
            Media URLs
          </CardTitle>
          <CardDescription className="text-gray-300">
            Enter one or more stock media URLs (one per line)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="https://www.shutterstock.com/image-photo/...&#10;https://www.gettyimages.com/detail/photo/...&#10;https://stock.adobe.com/images/..."
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              className="min-h-[200px] bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
              rows={8}
            />
            
            <Button
              onClick={handleGetFileInfo}
              disabled={isLoading || !urls.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Getting File Information...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Get File Information
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">
              Results ({results.length} URL{results.length !== 1 ? 's' : ''})
            </CardTitle>
            <CardDescription className="text-gray-300">
              File information for the submitted URLs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border border-white/10 rounded-lg p-4">
                  {result.success && result.data ? (
                    <div className="space-y-3">
                      {/* Success Result */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <Typography variant="small" className="text-green-400">
                            Successfully parsed
                          </Typography>
                        </div>
                        <Typography variant="small" className="text-gray-400 truncate max-w-md">
                          {result.url}
                        </Typography>
                      </div>

                      {/* Stock Info */}
                      {result.data.stockInfo && (
                        <div className="bg-white/5 rounded-lg p-4 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Typography variant="label" className="text-gray-300">Title</Typography>
                              <Typography variant="p" className="text-white font-semibold">
                                {result.data.stockInfo.title}
                              </Typography>
                            </div>
                            <div>
                              <Typography variant="label" className="text-gray-300">Source</Typography>
                              <Typography variant="p" className="text-white">
                                {result.data.stockSite?.displayName || result.data.parsedData?.source}
                              </Typography>
                            </div>
                            <div>
                              <Typography variant="label" className="text-gray-300">Points Required</Typography>
                              <Typography variant="p" className="text-white font-semibold">
                                {result.data.stockInfo.points?.toLocaleString() || 'N/A'}
                              </Typography>
                            </div>
                            <div>
                              <Typography variant="label" className="text-gray-300">Type</Typography>
                              <Typography variant="p" className="text-white">
                                {result.data.stockInfo.type || 'Unknown'}
                              </Typography>
                            </div>
                          </div>

                          {/* Preview Image */}
                          {result.data.stockInfo.thumbnailUrl && (
                            <div className="pt-3">
                              <img
                                src={result.data.stockInfo.thumbnailUrl}
                                alt={result.data.stockInfo.title}
                                className="w-full h-48 object-cover rounded-lg bg-gray-800"
                              />
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-3">
                            <Button
                              variant="outline"
                              onClick={() => window.open(result.url, '_blank')}
                              className="border-white/30 text-white hover:bg-white/10"
                            >
                              View Original
                            </Button>
                            {result.data.stockInfo.points && (
                              <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                                Place Order ({result.data.stockInfo.points.toLocaleString()} points)
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Error Result */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <Typography variant="small" className="text-red-400">
                            Failed to parse
                          </Typography>
                        </div>
                        <Typography variant="small" className="text-gray-400 truncate max-w-md">
                          {result.url}
                        </Typography>
                      </div>

                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <Typography variant="small" className="text-red-300">
                          {result.error || 'Unknown error occurred'}
                        </Typography>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supported Sites Info */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 mt-6">
        <CardHeader>
          <CardTitle className="text-white">Supported Sites</CardTitle>
          <CardDescription className="text-gray-300">
            We support URLs from these major stock media platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['Shutterstock', 'Getty Images', 'Adobe Stock', 'Unsplash', 'Pexels', 'Pixabay', '123RF', 'Dreamstime', 'iStock', 'Freepik', 'Pond5', 'Storyblocks', 'Envato Elements', 'Canva', 'Vecteezy', 'Bigstock'].map((site) => (
              <span key={site} className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-sm border border-white/20">
                {site}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
