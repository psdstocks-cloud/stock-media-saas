'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Download, 
  Search, 
  Calendar,
  ExternalLink,
  Filter,
  FileImage,
  FileVideo,
  File
} from 'lucide-react'

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Mock data for now
    setDownloads([])
    setLoading(false)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Download History</h1>
        <p className="text-gray-600 mt-2">
          View and manage all your downloaded assets from stock sites.
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search downloads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Download className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No downloads yet</h3>
          <p className="text-gray-500 text-center mb-4">
            Start browsing stock sites to download your first assets.
          </p>
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Browse Stock Media
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

