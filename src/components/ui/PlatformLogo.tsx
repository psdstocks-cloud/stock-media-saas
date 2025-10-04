'use client'

import React from 'react'

interface PlatformLogoProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const LOGO_COLORS = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-green-500 to-green-600',
  'from-red-500 to-red-600',
  'from-orange-500 to-orange-600',
  'from-pink-500 to-pink-600',
  'from-indigo-500 to-indigo-600',
  'from-teal-500 to-teal-600',
  'from-cyan-500 to-cyan-600',
  'from-emerald-500 to-emerald-600',
  'from-lime-500 to-lime-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-violet-500 to-violet-600',
  'from-sky-500 to-sky-600',
  'from-fuchsia-500 to-fuchsia-600'
]

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-xl'
}

export default function PlatformLogo({ name, size = 'md', className = '' }: PlatformLogoProps) {
  // Generate a consistent color based on the name
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % LOGO_COLORS.length
  const colorClass = LOGO_COLORS[colorIndex]
  const sizeClass = SIZE_CLASSES[size]
  
  // Get initials (first letter of each word)
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div 
      className={`
        ${sizeClass} 
        rounded-lg 
        bg-gradient-to-br 
        ${colorClass} 
        flex 
        items-center 
        justify-center 
        text-white 
        font-bold 
        shadow-lg
        ${className}
      `}
    >
      {initials}
    </div>
  )
}
