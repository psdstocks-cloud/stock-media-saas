'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from './Button'
import { MediaCard } from './MediaCard'
import { SearchBar } from './SearchBar'
import { 
  Grid, 
  List, 
  Filter, 
  Download, 
  Heart, 
  Clock, 
  TrendingUp,
  Star,
  Eye
} from 'lucide-react'

interface DashboardPreviewProps {
  className?: string
}

export function DashboardPreview({ className }: DashboardPreviewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'recent' | 'trending' | 'favorites'>('recent')

  // Mock data for preview
  const mockMedia = [
    {
      id: '1',
      site: 'unsplash',
      title: 'Modern Office Space',
      url: 'https://unsplash.com/photos/modern-office-space',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop',
      cost: 5,
      description: 'Clean modern office environment',
      tags: ['business', 'office', 'modern'],
      dimensions: { width: 300, height: 200 }
    },
    {
      id: '2',
      site: 'pexels',
      title: 'Nature Landscape',
      url: 'https://pexels.com/photo/nature-landscape',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
      cost: 3,
      description: 'Beautiful mountain landscape',
      tags: ['nature', 'landscape', 'mountains'],
      dimensions: { width: 300, height: 200 }
    },
    {
      id: '3',
      site: 'pixabay',
      title: 'Technology Abstract',
      url: 'https://pixabay.com/photo/technology-abstract',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop',
      cost: 2,
      description: 'Abstract technology background',
      tags: ['technology', 'abstract', 'digital'],
      dimensions: { width: 300, height: 200 }
    },
    {
      id: '4',
      site: 'freepik',
      title: 'Business Team',
      url: 'https://freepik.com/photo/business-team',
      imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=200&fit=crop',
      cost: 8,
      description: 'Professional business team meeting',
      tags: ['business', 'team', 'meeting'],
      dimensions: { width: 300, height: 200 }
    }
  ]

  const stats = [
    { label: 'Downloads Today', value: '12', icon: Download, color: 'text-blue-600' },
    { label: 'Favorites', value: '47', icon: Heart, color: 'text-red-600' },
    { label: 'Points Used', value: '156', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Search History', value: '23', icon: Clock, color: 'text-purple-600' }
  ]

  return (
    <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Your Dashboard</h3>
            <p className="text-gray-600">Manage your stock media library</p>
          </div>
          <Link href="/dashboard">
            <Button variant="gradient" size="sm">
              Open Dashboard
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <SearchBar 
            placeholder="Search your library..."
            showSuggestions={false}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <stat.icon size={20} className={stat.color} />
              <div>
                <div className="text-lg font-semibold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8 px-6">
          {[
            { id: 'recent', label: 'Recent Downloads', icon: Clock },
            { id: 'trending', label: 'Trending', icon: TrendingUp },
            { id: 'favorites', label: 'Favorites', icon: Heart }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* View Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {activeTab === 'recent' && '12 recent downloads'}
              {activeTab === 'trending' && '24 trending items'}
              {activeTab === 'favorites' && '47 favorite items'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Media Grid/List */}
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-4 gap-4'
            : 'space-y-3'
        }>
          {mockMedia.slice(0, viewMode === 'grid' ? 4 : 2).map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              viewMode={viewMode}
              className="transform hover:scale-105 transition-transform"
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <Filter size={16} />
                Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <Star size={16} />
                Rate
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <Eye size={16} />
                Preview
              </button>
            </div>
            
            <Link href="/dashboard/browse">
              <Button variant="outline" size="sm">
                View All Content
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
