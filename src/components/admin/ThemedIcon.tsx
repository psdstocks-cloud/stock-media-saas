'use client'

import React from 'react'

interface ThemedIconProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  className?: string
  style?: React.CSSProperties
}

export function ThemedIcon({ icon: Icon, className, style }: ThemedIconProps) {
  return <Icon className={className} style={style} />
}
