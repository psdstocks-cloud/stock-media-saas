'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2, 
  Maximize2,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Bot,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  FileText,
  Link,
  Download
} from 'lucide-react'
import { chatSocket, useChatSocket, createMessage, type ChatMessage, type TypingUser } from '@/lib/websocket'

interface ModernChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left'
  theme?: 'light' | 'dark'
}

export default function ModernChatWidget({ 
  position = 'bottom-right',
  theme = 'light'
}: ModernChatWidgetProps) {
  const { data: session, status } = useSession()
  const socket = useChatSocket()
  
  // UI State
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Settings
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Initialize chat when user is authenticated
  useEffect(() => {
    if (status === 'loading') return
    
    if (session?.user?.id) {
      initializeChat()
    }
  }, [session, status])

  // WebSocket event handlers
  useEffect(() => {
    if (!socket) return

    const handleConnect = () => {
      console.log('Chat WebSocket connected')
      setIsConnected(true)
    }

    const handleDisconnect = () => {
      console.log('Chat WebSocket disconnected')
      setIsConnected(false)
    }

    const handleMessageReceived = (message: ChatMessage) => {
      setMessages(prev => [...prev, message])
      
      // Play notification sound for messages from others
      if (message.userId !== session?.user?.id && soundEnabled) {
        playNotificationSound()
      }
      
      // Update unread count
      if (message.userId !== session?.user?.id) {
        setUnreadCount(prev => prev + 1)
      }
    }

    const handleUserTyping = (typingUser: TypingUser) => {
      if (typingUser.userId !== session?.user?.id) {
        setTypingUsers(prev => {
          const filtered = (prev || []).filter(u => u.userId !== typingUser.userId)
          return [...filtered, typingUser]
        })
      }
    }

    const handleUserStoppedTyping = (typingUser: TypingUser) => {
      setTypingUsers(prev => (prev || []).filter(u => u.userId !== typingUser.userId))
    }

    const handleError = (error: string) => {
      console.error('Chat WebSocket error:', error)
    }

    // Register event listeners
    socket.on('connected', handleConnect)
    socket.on('disconnected', handleDisconnect)
    socket.on('message-received', handleMessageReceived)
    socket.on('user-typing', handleUserTyping)
    socket.on('user-stopped-typing', handleUserStoppedTyping)
    socket.on('error', handleError)

    return () => {
      socket.off('connected', handleConnect)
      socket.off('disconnected', handleDisconnect)
      socket.off('message-received', handleMessageReceived)
      socket.off('user-typing', handleUserTyping)
      socket.off('user-stopped-typing', handleUserStoppedTyping)
      socket.off('error', handleError)
    }
  }, [socket, session?.user?.id, soundEnabled])

  const initializeChat = async () => {
    try {
      setIsLoading(true)
      
      // Connect to WebSocket
      await socket.connect()
      
      // Get or create support room
      const response = await fetch('/api/chat/rooms?type=SUPPORT')
      const data = await response.json()
      
      if (data.success && data.rooms && data.rooms.length > 0) {
        const room = data.rooms[0]
        setCurrentRoom(room.id)
        await loadMessages(room.id)
        socket.emit('join-room', room.id)
      } else {
        // Create new support room
        await createSupportRoom()
      }
      
    } catch (error) {
      console.error('Error initializing chat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createSupportRoom = async () => {
    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Support Chat - ${new Date().toLocaleDateString()}`,
          type: 'SUPPORT',
          priority: 'MEDIUM'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setCurrentRoom(data.room.id)
        socket.emit('join-room', data.room.id)
      }
    } catch (error) {
      console.error('Error creating support room:', error)
    }
  }

  const loadMessages = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?roomId=${roomId}`)
      const data = await response.json()
      
      if (data.messages) {
        setMessages(data.messages)
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentRoom || !session?.user?.id) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    
    // Stop typing indicator
    if (isTyping) {
      socket.emit('typing-stop', currentRoom)
      setIsTyping(false)
    }

    try {
      const message = createMessage({
        content: messageContent,
        userId: session.user.id,
        userName: session.user.name || 'User',
        userRole: session.user.role || 'USER',
        roomId: currentRoom
      })

      // Send via WebSocket for real-time delivery
      socket.emit('send-message', message)

      // Also send via API for persistence
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: currentRoom,
          userId: session.user.id,
          content: messageContent,
          type: 'TEXT'
        })
      })

      if (!response.ok) {
        console.error('Failed to send message via API')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)
    
    if (!isTyping && currentRoom) {
      setIsTyping(true)
      socket.emit('typing-start', currentRoom)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && currentRoom) {
        socket.emit('typing-stop', currentRoom)
        setIsTyping(false)
      }
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentRoom || !session?.user?.id) return

    // Handle file upload logic here
    console.log('File upload:', file)
  }

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      console.log('Could not play notification sound:', error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT': return <CheckCircle size={12} style={{ color: '#6b7280' }} />
      case 'DELIVERED': return <CheckCircle size={12} style={{ color: '#3b82f6' }} />
      case 'READ': return <CheckCircle size={12} style={{ color: '#22c55e' }} />
      default: return <Clock size={12} style={{ color: '#6b7280' }} />
    }
  }

  const isCurrentUser = (userId: string) => userId === session?.user?.id
  const isAdmin = (userRole: string) => userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'

  if (status === 'loading') {
    return null
  }

  if (!session?.user?.id) {
    return null
  }

  return (
    <>
      {/* Chat Widget */}
      <div style={{
        position: 'fixed',
        [position === 'bottom-right' ? 'right' : 'left']: '20px',
        bottom: '20px',
        zIndex: 1000,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Chat Button */}
        {!isOpen && (
          <button
            onClick={() => {
              setIsOpen(true)
              setUnreadCount(0)
            }}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.3)'
            }}
          >
            <MessageCircle size={24} />
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </button>
        )}

        {/* Chat Window */}
        {isOpen && (
          <div style={{
            width: isMinimized ? '300px' : '380px',
            height: isMinimized ? '60px' : '500px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: isMinimized ? 'pointer' : 'default'
            }}
            onClick={() => isMinimized && setIsMinimized(false)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                    Support Chat
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', opacity: 0.9 }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: isConnected ? '#22c55e' : '#ef4444'
                    }} />
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div style={{
                  flex: 1,
                  padding: '16px',
                  overflowY: 'auto',
                  background: '#f8fafc'
                }}>
                  {isLoading ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: '#6b7280'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        border: '3px solid #e2e8f0',
                        borderTop: '3px solid #667eea',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                    </div>
                  ) : (messages || []).length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      color: '#6b7280',
                      padding: '20px'
                    }}>
                      <MessageCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                      <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '500' }}>
                        Welcome to Support Chat
                      </h4>
                      <p style={{ margin: 0, fontSize: '14px' }}>
                        How can we help you today?
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(messages || []).map((message) => {
                        const isCurrentUserMessage = isCurrentUser(message.userId)
                        const isAdminMessage = isAdmin(message.userRole)
                        
                        return (
                          <div
                            key={message.id}
                            style={{
                              display: 'flex',
                              justifyContent: isCurrentUserMessage ? 'flex-end' : 'flex-start',
                              alignItems: 'flex-end',
                              gap: '8px'
                            }}
                          >
                            {!isCurrentUserMessage && (
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: isAdminMessage 
                                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                  : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: '600',
                                flexShrink: 0
                              }}>
                                {isAdminMessage ? <Bot size={16} /> : <User size={16} />}
                              </div>
                            )}
                            
                            <div style={{
                              maxWidth: '70%',
                              background: isCurrentUserMessage 
                                ? 'linear-gradient(135deg, #667eea, #764ba2)'
                                : 'white',
                              color: isCurrentUserMessage ? 'white' : '#1f2937',
                              padding: '12px 16px',
                              borderRadius: isCurrentUserMessage 
                                ? '20px 20px 4px 20px'
                                : '20px 20px 20px 4px',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                              position: 'relative'
                            }}>
                              <div style={{ fontSize: '14px', lineHeight: '1.4', marginBottom: '4px' }}>
                                {message.content}
                              </div>
                              
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: '4px',
                                fontSize: '11px',
                                opacity: 0.7
                              }}>
                                <span>{formatTime(message.createdAt)}</span>
                                {isCurrentUserMessage && getStatusIcon(message.status)}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      
                      {/* Typing Indicators */}
                      {(typingUsers || []).length > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#6b7280',
                          fontSize: '14px',
                          fontStyle: 'italic'
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            <User size={16} />
                          </div>
                          <div style={{
                            background: 'white',
                            padding: '12px 16px',
                            borderRadius: '20px 20px 20px 4px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>{typingUsers[0].userName} is typing</span>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                <div style={{
                                  width: '4px',
                                  height: '4px',
                                  borderRadius: '50%',
                                  background: '#6b7280',
                                  animation: 'pulse 1.4s infinite'
                                }} />
                                <div style={{
                                  width: '4px',
                                  height: '4px',
                                  borderRadius: '50%',
                                  background: '#6b7280',
                                  animation: 'pulse 1.4s infinite 0.2s'
                                }} />
                                <div style={{
                                  width: '4px',
                                  height: '4px',
                                  borderRadius: '50%',
                                  background: '#6b7280',
                                  animation: 'pulse 1.4s infinite 0.4s'
                                }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div style={{
                  padding: '16px',
                  background: 'white',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'flex-end'
                  }}>
                    <div style={{ flex: 1 }}>
                      <textarea
                        ref={inputRef}
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        style={{
                          width: '100%',
                          minHeight: '40px',
                          maxHeight: '120px',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '20px',
                          resize: 'none',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          outline: 'none',
                          background: '#f8fafc'
                        }}
                      />
                    </div>
                    
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isLoading}
                      style={{
                        padding: '10px',
                        border: 'none',
                        background: newMessage.trim() 
                          ? 'linear-gradient(135deg, #667eea, #764ba2)'
                          : '#d1d5db',
                        borderRadius: '50%',
                        cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  )
}
