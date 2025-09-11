'use client'

import { ExternalLink, Calendar, Star, TrendingUp } from 'lucide-react'

interface PressMention {
  title: string
  source: string
  date: string
  excerpt: string
  url: string
  logo: string
  category: 'news' | 'review' | 'award' | 'partnership'
}

const pressMentions: PressMention[] = [
  {
    title: 'StockMedia Pro Revolutionizes Creative Content Access',
    source: 'TechCrunch',
    date: '2024-01-15',
    excerpt: 'The innovative point-based system is changing how creators access premium stock media...',
    url: '#',
    logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=50&fit=crop',
    category: 'news'
  },
  {
    title: 'Best Stock Media Platform of 2024',
    source: 'Creative Bloq',
    date: '2024-02-20',
    excerpt: 'Outstanding user experience and comprehensive content library make this our top pick...',
    url: '#',
    logo: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=100&h=50&fit=crop',
    category: 'award'
  },
  {
    title: 'How StockMedia Pro is Democratizing Creative Content',
    source: 'Forbes',
    date: '2024-03-10',
    excerpt: 'A deep dive into how the platform is making premium content accessible to all creators...',
    url: '#',
    logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=50&fit=crop',
    category: 'news'
  },
  {
    title: 'Partnership with Adobe Creative Cloud',
    source: 'Adobe Blog',
    date: '2024-04-05',
    excerpt: 'New integration brings StockMedia Pro content directly into Adobe Creative Suite...',
    url: '#',
    logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=50&fit=crop',
    category: 'partnership'
  },
  {
    title: '5-Star Review: Game-Changing Platform',
    source: 'Design Week',
    date: '2024-04-18',
    excerpt: 'The intuitive interface and vast content library exceeded all our expectations...',
    url: '#',
    logo: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=100&h=50&fit=crop',
    category: 'review'
  },
  {
    title: 'Rising Star in Creative Technology',
    source: 'Fast Company',
    date: '2024-05-12',
    excerpt: 'StockMedia Pro named one of the most innovative companies in creative technology...',
    url: '#',
    logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=50&fit=crop',
    category: 'award'
  }
]

const awards = [
  {
    title: 'Best Creative Platform 2024',
    organization: 'Design Awards',
    year: '2024',
    icon: '🏆'
  },
  {
    title: 'Innovation in Media Technology',
    organization: 'Tech Innovation Awards',
    year: '2024',
    icon: '💡'
  },
  {
    title: 'User Experience Excellence',
    organization: 'UX Design Awards',
    year: '2024',
    icon: '⭐'
  },
  {
    title: 'Startup of the Year',
    organization: 'Creative Industry Awards',
    year: '2023',
    icon: '🚀'
  }
]

interface PressSectionProps {
  variant?: 'full' | 'compact' | 'awards-only'
  className?: string
}

export function PressSection({ variant = 'full', className }: PressSectionProps) {
  if (variant === 'awards-only') {
    return (
      <div className={`space-y-6 ${className}`}>
        <h3 className="text-xl font-bold text-gray-900 text-center">Awards & Recognition</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {awards.map((award, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">{award.icon}</div>
              <h4 className="font-semibold text-sm text-gray-900 mb-1">{award.title}</h4>
              <p className="text-xs text-gray-600">{award.organization}</p>
              <p className="text-xs text-gray-500">{award.year}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`space-y-6 ${className}`}>
        <h3 className="text-xl font-bold text-gray-900 text-center">Featured In</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {pressMentions.slice(0, 6).map((mention, index) => (
            <div key={index} className="text-center">
              <div className="w-20 h-10 mx-auto mb-3 bg-white rounded border flex items-center justify-center">
                <img 
                  src={mention.logo} 
                  alt={mention.source}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <p className="text-sm text-gray-600">{mention.source}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-12 ${className}`}>
      {/* Press Mentions */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Press & Media Coverage</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pressMentions.map((mention, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <img 
                    src={mention.logo} 
                    alt={mention.source}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{mention.source}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} />
                    <span>{new Date(mention.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2">
                {mention.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {mention.excerpt}
              </p>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  mention.category === 'news' ? 'bg-blue-100 text-blue-800' :
                  mention.category === 'review' ? 'bg-green-100 text-green-800' :
                  mention.category === 'award' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {mention.category.charAt(0).toUpperCase() + mention.category.slice(1)}
                </span>
                
                <a 
                  href={mention.url}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Read More
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Awards & Recognition */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Awards & Recognition</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {awards.map((award, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl mb-4">{award.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-2">{award.title}</h4>
              <p className="text-sm text-gray-600 mb-1">{award.organization}</p>
              <p className="text-sm text-gray-500">{award.year}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Media Kit */}
      <div className="text-center bg-gray-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Media Kit</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Download our press kit, logos, and high-resolution images for media use.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Download Press Kit
          </button>
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Contact Press Team
          </button>
        </div>
      </div>
    </div>
  )
}
