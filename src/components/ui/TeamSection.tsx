'use client'

import { Users, Target, Heart, Award, Globe, Zap } from 'lucide-react'

interface TeamMember {
  name: string
  role: string
  bio: string
  avatar: string
  linkedin?: string
  twitter?: string
}

const teamMembers: TeamMember[] = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Founder',
    bio: 'Former Adobe Creative Director with 10+ years in stock media industry. Passionate about democratizing access to premium creative content.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    linkedin: '#',
    twitter: '#'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'CTO',
    bio: 'Ex-Google engineer specializing in scalable media platforms. Led the development of our proprietary content aggregation technology.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    linkedin: '#',
    twitter: '#'
  },
  {
    name: 'Emily Watson',
    role: 'Head of Design',
    bio: 'Award-winning designer with expertise in user experience. Previously at Figma and Canva, now leading our design vision.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    linkedin: '#',
    twitter: '#'
  },
  {
    name: 'David Kim',
    role: 'Head of Partnerships',
    bio: 'Strategic partnerships expert with deep connections in the creative industry. Former Shutterstock executive.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    linkedin: '#',
    twitter: '#'
  }
]

const companyStats = [
  { icon: Users, label: 'Team Members', value: '25+' },
  { icon: Globe, label: 'Countries Served', value: '50+' },
  { icon: Award, label: 'Years Combined Experience', value: '150+' },
  { icon: Zap, label: 'Media Sources', value: '500+' }
]

interface TeamSectionProps {
  variant?: 'full' | 'compact' | 'stats-only'
  className?: string
}

export function TeamSection({ variant = 'full', className }: TeamSectionProps) {
  if (variant === 'stats-only') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${className}`}>
        {companyStats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="flex justify-center mb-2">
              <stat.icon size={32} className="text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Meet Our Team</h3>
          <p className="text-gray-600">Industry experts passionate about creative content</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {teamMembers.map((member, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden">
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-semibold text-gray-900">{member.name}</h4>
              <p className="text-sm text-gray-600">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-12 ${className}`}>
      {/* Company Story */}
      <div className="text-center max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
        <div className="prose prose-lg mx-auto text-gray-600">
          <p className="text-xl leading-relaxed mb-6">
            Founded in 2020 by a team of creative industry veterans, StockMedia Pro was born from a simple belief: 
            <strong className="text-gray-900"> every creator deserves access to premium content</strong>.
          </p>
          <p className="text-lg leading-relaxed mb-6">
            After years of frustration with fragmented stock media platforms and expensive subscriptions, 
            we set out to create a unified solution that democratizes access to the world's best creative content.
          </p>
          <p className="text-lg leading-relaxed">
            Today, we're proud to serve <strong className="text-gray-900">50,000+ creators worldwide</strong> with 
            access to over <strong className="text-gray-900">500 premium stock media sources</strong> through our 
            innovative point-based system.
          </p>
        </div>
      </div>

      {/* Mission & Values */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <Target size={32} className="text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h3>
          <p className="text-gray-600">
            To democratize access to premium creative content and empower creators worldwide 
            with affordable, high-quality stock media.
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <Heart size={32} className="text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Values</h3>
          <p className="text-gray-600">
            We believe in transparency, fair pricing, and supporting the creative community 
            that makes our platform possible.
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
            <Award size={32} className="text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Impact</h3>
          <p className="text-gray-600">
            Over 2 million downloads and counting, helping creators bring their visions 
            to life with premium content.
          </p>
        </div>
      </div>

      {/* Team Members */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Meet Our Team</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-4">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform">
                  <img 
                    src={member.avatar} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h4>
              <p className="text-blue-600 font-medium mb-3">{member.role}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
              <div className="flex justify-center gap-3 mt-4">
                {member.linkedin && (
                  <a href={member.linkedin} className="text-gray-400 hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {member.twitter && (
                  <a href={member.twitter} className="text-gray-400 hover:text-blue-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Company Stats */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">By the Numbers</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {companyStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-3">
                <stat.icon size={40} className="text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
