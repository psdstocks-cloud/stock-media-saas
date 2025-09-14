'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import io from 'socket.io-client'
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video, 
  Search,
  Settings,
  Users,
  MessageCircle,
  X,
  Image as ImageIcon,
  FileText,
  Download
} from 'lucide-react'
import { notificationService } from '@/lib/notification-service'
import { soundService } from '@/lib/sound-service'
import NotificationSettings from '@/components/notifications/NotificationSettings'

interface User {
  id: string
  name: string
  email: string
  image: string
  role: string
}

interface Message {
  id: string
  content: string
  type: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  createdAt: string
  user: User
  replyTo?: {
    id: string
    content: string
    user: User
  }
  statuses: Array<{
    status: string
    readAt?: string
  }>
}

interface ChatRoom {
  id: string
  name: string
  type: string
  status: string
  priority: string
  lastMessageAt: string
  participants: Array<{
    id: string
    role: string
    user: User
  }>
  messages: Message[]
  _count: {
    messages: number
    participants: number
  }
}

interface ChatInterfaceProps {
  roomId?: string
  onRoomSelect?: (room: ChatRoom) => void
}

export default function ChatInterface({ roomId, onRoomSelect }: ChatInterfaceProps) {
  const { data: session } = useSession()
  const [socket, setSocket] = useState<any | null>(null)
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize socket connection
  useEffect(() => {
    if (session?.user?.id) {
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000')
      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [session?.user?.id])

  // Setup socket event listeners
  useEffect(() => {
    if (socket && session?.user?.id) {
      socket.on('new-message', (data: any) => {
        setMessages(prev => [...prev, data.message])
        scrollToBottom()
        
        // Play receive sound if message is from another user
        if (data.message.user.id !== session.user.id) {
          soundService.playMessageReceived()
          handleNewMessageNotification(data.message)
        }
      })

      socket.on('user-typing', (data: any) => {
        if (data.userId !== session.user.id) {
          setTypingUsers(prev => {
            if (data.isTyping) {
              return [...new Set([...prev, data.userId])]
            } else {
              return prev.filter(id => id !== data.userId)
            }
          })
        }
      })

      socket.on('message-read', (data: any) => {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? {
                ...msg,
                statuses: msg.statuses.map(status => 
                  status.status === 'DELIVERED' && data.userId === session.user.id
                    ? { ...status, status: 'READ', readAt: new Date().toISOString() }
                    : status
                )
              }
            : msg
        ))
      })

      socket.on('error', (error: any) => {
        console.error('Socket error:', error)
      })
    }
  }, [socket, session?.user?.id])

  // Load chat rooms
  useEffect(() => {
    if (session?.user?.id) {
      loadRooms()
    }
  }, [session?.user?.id])

  // Load messages when room is selected
  useEffect(() => {
    if (selectedRoom && socket) {
      loadMessages(selectedRoom.id)
      socket.emit('join-room', { roomId: selectedRoom.id, userId: session?.user?.id })
    }
  }, [selectedRoom, socket, session?.user?.id])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadRooms = async () => {
    try {
      const response = await fetch('/api/chat/rooms')
      const data = await response.json()
      
      if (data.success) {
        setRooms(data.rooms)
        if (data.rooms.length > 0 && !selectedRoom) {
          setSelectedRoom(data.rooms[0])
          onRoomSelect?.(data.rooms[0])
        }
      }
    } catch (error) {
      console.error('Error loading rooms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?roomId=${roomId}`)
      const data = await response.json()
      
      if (data.success) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleNewMessageNotification = async (message: Message) => {
    // Check if notifications are enabled and user is not focused on chat
    const settings = JSON.parse(localStorage.getItem('notification-settings') || '{}')
    const isPageVisible = !document.hidden
    const isInChatPage = window.location.pathname.includes('/dashboard/chat') || 
                        window.location.pathname.includes('/admin/chat')
    
    // Don't show notification if user is actively in chat
    if (isPageVisible && isInChatPage) {
      return
    }

    // Don't show notification if do not disturb is enabled
    if (settings.doNotDisturb) {
      return
    }

    // Show notification
    await notificationService.showChatNotification({
      id: message.id,
      content: message.content,
      senderName: message.user.name,
      roomName: selectedRoom?.name,
      type: message.type
    })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !socket) return

    const messageData = {
      roomId: selectedRoom.id,
      userId: session?.user?.id,
      content: newMessage.trim(),
      type: 'TEXT'
    }

    socket.emit('send-message', messageData)
    setNewMessage('')
    
    // Play send sound
    soundService.playMessageSent()
    
    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    socket.emit('typing-stop', { roomId: selectedRoom.id, userId: session?.user?.id })
  }

  const handleTyping = () => {
    if (!selectedRoom || !socket) return

    socket.emit('typing-start', { roomId: selectedRoom.id, userId: session?.user?.id })
    setIsTyping(true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing-stop', { roomId: selectedRoom.id, userId: session?.user?.id })
      setIsTyping(false)
    }, 1000)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedRoom) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('roomId', selectedRoom.id)

      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        const messageData = {
          roomId: selectedRoom.id,
          userId: session?.user?.id,
          content: `Shared a file: ${data.file.name}`,
          type: 'FILE',
          fileUrl: data.file.url,
          fileName: data.file.name,
          fileSize: data.file.size
        }

        socket?.emit('send-message', messageData)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#333', fontSize: '16px' }}>Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Sidebar */}
      <div style={{
        width: showSidebar ? '320px' : '0',
        background: 'white',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
            Messages
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              padding: '8px',
              border: 'none',
              background: '#f3f4f6',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Search size={16} />
            </button>
            <button style={{
              padding: '8px',
              border: 'none',
              background: '#f3f4f6',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Rooms List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {rooms.map(room => (
            <div
              key={room.id}
              onClick={() => {
                setSelectedRoom(room)
                onRoomSelect?.(room)
              }}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'pointer',
                background: selectedRoom?.id === room.id ? '#eff6ff' : 'transparent',
                borderLeft: selectedRoom?.id === room.id ? '3px solid #3b82f6' : '3px solid transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  {room.name?.charAt(0) || 'C'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1f2937',
                    marginBottom: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {room.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {room.messages[0]?.content || 'No messages yet'}
                  </div>
                </div>
                <div style={{
                  fontSize: '10px',
                  color: '#9ca3af',
                  textAlign: 'right'
                }}>
                  {room.lastMessageAt && formatTime(room.lastMessageAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '16px 20px',
              background: 'white',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  style={{
                    padding: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={20} />
                </button>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                    {selectedRoom.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    {selectedRoom._count.participants} participants
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <NotificationSettings />
                <button 
                  onClick={() => {
                    alert('Voice call functionality coming soon!')
                  }}
                  style={{
                    padding: '8px',
                    border: 'none',
                    background: '#f3f4f6',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#e5e7eb'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#f3f4f6'
                  }}
                >
                  <Phone size={16} />
                </button>
                <button 
                  onClick={() => {
                    alert('More options coming soon!')
                  }}
                  style={{
                    padding: '8px',
                    border: 'none',
                    background: '#f3f4f6',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#e5e7eb'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#f3f4f6'
                  }}
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              background: '#f8fafc'
            }}>
              {messages.map(message => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    marginBottom: '16px',
                    justifyContent: message.user.id === session?.user?.id ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.user.id === session?.user?.id ? 'flex-end' : 'flex-start'
                  }}>
                    {message.user.id !== session?.user?.id && (
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        marginBottom: '4px',
                        marginLeft: '8px'
                      }}>
                        {message.user.name}
                      </div>
                    )}
                    <div style={{
                      background: message.user.id === session?.user?.id ? '#3b82f6' : 'white',
                      color: message.user.id === session?.user?.id ? 'white' : '#1f2937',
                      padding: '12px 16px',
                      borderRadius: '18px',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                      wordWrap: 'break-word'
                    }}>
                      {message.type === 'FILE' && message.fileUrl ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            {message.fileName?.includes('.jpg') || message.fileName?.includes('.png') || message.fileName?.includes('.gif') ? (
                              <ImageIcon size={16} />
                            ) : (
                              <FileText size={16} />
                            )}
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                              {message.fileName}
                            </span>
                          </div>
                          <a
                            href={message.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: message.user.id === session?.user?.id ? 'white' : '#3b82f6',
                              textDecoration: 'none',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Download size={12} />
                            Download ({formatFileSize(message.fileSize || 0)})
                          </a>
                        </div>
                      ) : (
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                          {message.content}
                        </div>
                      )}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: '#9ca3af',
                      marginTop: '4px',
                      marginLeft: message.user.id === session?.user?.id ? '0' : '8px',
                      marginRight: message.user.id === session?.user?.id ? '8px' : '0'
                    }}>
                      {formatTime(message.createdAt)}
                      {message.user.id === session?.user?.id && (
                        <span style={{ marginLeft: '4px' }}>
                          {message.statuses[0]?.status === 'READ' ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {typingUsers.length > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                  color: '#6b7280',
                  fontSize: '14px',
                  fontStyle: 'italic'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: '#e5e7eb',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: '#9ca3af',
                      borderRadius: '50%',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }} />
                  </div>
                  Someone is typing...
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div style={{
              padding: '16px 20px',
              background: 'white',
              borderTop: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '12px',
                background: '#f8fafc',
                borderRadius: '24px',
                padding: '8px 16px',
                border: '1px solid #e2e8f0'
              }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280'
                  }}
                >
                  <Paperclip size={20} />
                </button>
                <textarea
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value)
                    handleTyping()
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    resize: 'none',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    maxHeight: '100px',
                    fontFamily: 'inherit'
                  }}
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    padding: '8px',
                    border: 'none',
                    background: newMessage.trim() ? '#3b82f6' : '#e5e7eb',
                    color: newMessage.trim() ? 'white' : '#9ca3af',
                    borderRadius: '50%',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px'
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
              />
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc'
          }}>
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              <MessageCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>
                Select a conversation
              </h3>
              <p style={{ margin: '8px 0 0', fontSize: '14px' }}>
                Choose a chat room to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
