'use client'

import { ReactNode } from 'react'
import SupportChatWidget from '@/components/chat/SupportChatWidget'

interface GlobalLayoutProps {
  children: ReactNode
}

export default function GlobalLayout({ children }: GlobalLayoutProps) {
  return (
    <>
      {children}
      <SupportChatWidget position="bottom-right" theme="light" />
    </>
  )
}
