import React from 'react'
import { Globe } from 'lucide-react'

interface PlatformLogoProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12'
}

export default function PlatformLogo({ name, size = 'md', className = '' }: PlatformLogoProps) {
  // For now, return a generic globe icon with colored background
  // In production, you'd load actual platform logos
  
  const firstLetter = name.charAt(0).toUpperCase()
  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500'
  ]
  
  const colorIndex = name.charCodeAt(0) % colors.length
  const bgColor = colors[colorIndex]
  
  return (
    <div className={`${sizeClasses[size]} ${bgColor} rounded-lg flex items-center justify-center text-white font-bold ${className}`}>
      {firstLetter}
    </div>
  )
}