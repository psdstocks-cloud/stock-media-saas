'use client';

import ModernChatWidget from '@/components/chat/ModernChatWidget';
import { useSession } from 'next-auth/react';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function ChatPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <LoadingSkeleton className="h-full w-full" />;
  }

  if (status === 'unauthenticated' || !session?.user) {
    return <div>Please log in to use the chat.</div>;
  }

  // ModernChatWidget uses useSession internally
  return <ModernChatWidget />;
}
