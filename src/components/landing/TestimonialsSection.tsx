'use client'

import { useState, useEffect } from 'react'
import { Typography } from '@/components/ui'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

// Sample testimonials - replace with real data
const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Creative Director',
    company: 'DesignCo',
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    text: 'This platform has completely transformed how we access stock media. The point system is genius - we only pay for what we use, and the rollover feature means nothing goes to waste!',
    metric: 'Saved 60% on stock media costs',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Marketing Manager',
    company: 'TechStart Inc',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 5,
    text: 'Access to 25+ premium sites from one dashboard is incredible. No more juggling multiple subscriptions. The quality is outstanding and downloads are instant.',
    metric: 'Downloaded 500+ assets',
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    role: 'Content Creator',
    company: 'Independent',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    text: 'As a freelancer, this is perfect. I can scale up or down based on my projects. The customer support is responsive, and the platform is incredibly intuitive.',
    metric: '10x faster workflow',
  },
  {
    id: 4,
    name: 'David Park',
    role: 'Video Producer',
    company: 'MediaWorks',
    avatar: 'https://i.pravatar.cc/150?img=8',
    rating: 5,
    text: 'The variety of stock sites available is unmatched. Whether I need 4K video, music, or graphics, everything is just a few clicks away. Best investment for my business.',
    metric: 'Created 100+ projects',
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    role: 'Brand Strategist',
    company: 'Creative Studio',
    avatar: 'https://i.pravatar.cc/150?img=9',
    rating: 5,
    text: 'The smart rollover system is a game-changer. Unlike other platforms where points expire, here they actually roll over. It feels like they genuinely care about customer value.',
    metric: 'Team of 5 using daily',
  },
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const handlePrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  const current = testimonials[currentIndex]

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-orange-50 dark:from-purple-950/20 dark:to-orange-950/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Typography variant="body" className="text-[hsl(var(--muted-foreground))] font-semibold mb-2">
            TESTIMONIALS
          </Typography>
          <Typography variant="h2" className="text-3xl md:text-4xl font-bold mb-4">
            Loved by Creators Worldwide
          </Typography>
          <Typography variant="body-lg" className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            See what our 10,000+ happy customers have to say about their experience
          </Typography>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto relative">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
            {/* Quote Icon */}
            <div className="absolute top-8 right-8 opacity-10">
              <Quote className="h-24 w-24 text-orange-500" />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-6 relative z-10">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-6 w-6",
                    i < current.rating
                      ? "fill-orange-500 text-orange-500"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>

            {/* Testimonial Text */}
            <Typography variant="body-lg" className="text-[hsl(var(--foreground))] mb-8 relative z-10 italic leading-relaxed text-lg md:text-xl">
              "{current.text}"
            </Typography>

            {/* Metric */}
            <div className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-lg p-4 mb-8 relative z-10">
              <Typography variant="body" className="text-[hsl(var(--foreground))] font-semibold text-center">
                🎯 {current.metric}
              </Typography>
            </div>

            {/* Author */}
            <div className="flex items-center gap-4 relative z-10">
              <img
                src={current.avatar}
                alt={current.name}
                className="h-16 w-16 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
              />
              <div>
                <Typography variant="h4" className="font-bold text-lg">
                  {current.name}
                </Typography>
                <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
                  {current.role} at {current.company}
                </Typography>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-10"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-10"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "w-8 bg-orange-500"
                  : "w-2 bg-gray-300 dark:bg-gray-700 hover:bg-orange-300"
              )}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Trust Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          <div className="text-center">
            <Typography variant="h3" className="text-2xl font-bold text-orange-500 mb-1">
              4.8/5
            </Typography>
            <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
              Average Rating
            </Typography>
          </div>
          <div className="text-center">
            <Typography variant="h3" className="text-2xl font-bold text-orange-500 mb-1">
              1,247
            </Typography>
            <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
              Reviews
            </Typography>
          </div>
          <div className="text-center">
            <Typography variant="h3" className="text-2xl font-bold text-orange-500 mb-1">
              97%
            </Typography>
            <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
              Recommend Us
            </Typography>
          </div>
          <div className="text-center">
            <Typography variant="h3" className="text-2xl font-bold text-orange-500 mb-1">
              10K+
            </Typography>
            <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
              Happy Customers
            </Typography>
          </div>
        </div>
      </div>
    </section>
  )
}
