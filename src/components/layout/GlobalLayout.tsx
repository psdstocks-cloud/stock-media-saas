'use client'

import { ReactNode } from 'react'
import ModernChatWidget from '@/components/chat/ModernChatWidget'

interface GlobalLayoutProps {
  children: ReactNode
}

export default function GlobalLayout({ children }: GlobalLayoutProps) {
  return (
    <>
      {children}
      <ModernChatWidget position="bottom-right" theme="light" />
    </>
  )
}
