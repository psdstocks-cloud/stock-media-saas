'use client'

import React from 'react'
import { Typography } from '@/components/ui'
import { Star, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  avatar: string
  content: string
  rating: number
  plan: 'starter' | 'professional' | 'enterprise'
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Freelance Designer',
    company: 'Creative Studio',
    avatar: '/testimonials/sarah.jpg',
    content: 'The Starter Pack is perfect for my small projects. I can download exactly what I need without committing to a monthly plan.',
    rating: 5,
    plan: 'starter'
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    role: 'Marketing Director',
    company: 'TechStart Inc',
    avatar: '/testimonials/marcus.jpg',
    content: 'Professional Pack gives us everything we need for our marketing campaigns. The team sharing feature is a game-changer.',
    rating: 5,
    plan: 'professional'
  },
  {
    id: '3',
    name: 'Emily Watson',
    role: 'Creative Director',
    company: 'Design Agency Co',
    avatar: '/testimonials/emily.jpg',
    content: 'Enterprise Pack is worth every penny. The dedicated manager and custom integrations have streamlined our entire workflow.',
    rating: 5,
    plan: 'enterprise'
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Content Creator',
    company: 'Digital Media',
    avatar: '/testimonials/david.jpg',
    content: 'As a content creator, the Professional Pack gives me access to premium content that elevates my work quality significantly.',
    rating: 5,
    plan: 'professional'
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    role: 'Brand Manager',
    company: 'Fashion Brand',
    avatar: '/testimonials/lisa.jpg',
    content: 'The Starter Pack was perfect for testing the platform. Now I understand why everyone recommends upgrading to Professional.',
    rating: 5,
    plan: 'starter'
  },
  {
    id: '6',
    name: 'James Wilson',
    role: 'CEO',
    company: 'Marketing Agency',
    avatar: '/testimonials/james.jpg',
    content: 'Enterprise features have transformed how we handle client projects. The white-label options and custom integrations are incredible.',
    rating: 5,
    plan: 'enterprise'
  }
]

interface PricingTestimonialsProps {
  planType: 'starter' | 'professional' | 'enterprise'
  className?: string
}

export const PricingTestimonials: React.FC<PricingTestimonialsProps> = ({ 
  planType, 
  className 
}) => {
  const planTestimonials = testimonials.filter(t => t.plan === planType)
  const testimonial = planTestimonials[0] // Show one testimonial per plan

  if (!testimonial) return null

  return (
    <div className={cn(
      "mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/20 dark:to-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-700",
      className
    )}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {testimonial.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 mb-1">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
            ))}
          </div>
          <Typography variant="body-sm" className="text-gray-700 dark:text-gray-300 italic mb-2">
            "{testimonial.content}"
          </Typography>
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body-sm" className="font-semibold text-gray-900 dark:text-gray-100">
                {testimonial.name}
              </Typography>
              <Typography variant="body-xs" className="text-gray-600 dark:text-gray-400">
                {testimonial.role} at {testimonial.company}
              </Typography>
            </div>
            <Quote className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingTestimonials
