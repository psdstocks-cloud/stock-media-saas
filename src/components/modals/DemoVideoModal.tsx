'use client'

import React, { useMemo } from 'react'
import { Modal } from '@/components/ui/modal'

interface DemoVideoModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  /**
   * If provided, embeds YouTube (nocookie) player with this video ID.
   * You can override via NEXT_PUBLIC_DEMO_VIDEO_ID.
   */
  youtubeVideoId?: string
}

const DemoVideoModal: React.FC<DemoVideoModalProps> = ({ isOpen, onClose, title = 'Product demo', youtubeVideoId }) => {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const videoId = youtubeVideoId || process.env.NEXT_PUBLIC_DEMO_VIDEO_ID || 'ysz5S6PUM-U'

  const src = useMemo(() => {
    const base = `https://www.youtube-nocookie.com/embed/${videoId}`
    const params = new URLSearchParams({
      autoplay: prefersReduced ? '0' : '1',
      rel: '0',
      modestbranding: '1'
    })
    return `${base}?${params.toString()}`
  }, [videoId, prefersReduced])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} showCloseButton>
      <div className="w-full">
        <div className="relative w-full aspect-video rounded-md overflow-hidden">
          <iframe
            title="Demo video"
            src={src}
            loading="lazy"
            allow={prefersReduced ? 'fullscreen' : 'autoplay; fullscreen'}
            className="absolute inset-0 h-full w-full"
          />
        </div>
        <p className="sr-only">Press Escape or the close button to dismiss the demo modal.</p>
      </div>
    </Modal>
  )
}

export default DemoVideoModal


