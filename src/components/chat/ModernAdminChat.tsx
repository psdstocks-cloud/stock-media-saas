'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Send, 
  MessageCircle, 
  User, 
  Bot, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Video,
  MoreVertical,
  Star,
  Archive,
  Trash2,
  Settings,
  Search,
  Filter,
  Users,
  Zap,
  Paperclip,
  Smile,
  Image as ImageIcon,
  FileText,
  Download,
  Eye,
  EyeOff,
  Volume2,
  VolumeX
} from 'lucide-react'
import { chatSocket, useChatSocket, createMessage, type ChatMessage, type TypingUser } from '@/lib/websocket'

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
    user: {
      id: string
      name: string
      email: string
      image?: string
      role: string
    }
  }>
  messages: ChatMessage[]
  _count: {
    messages: number
    participants: number
  }
}

interface User {
  id: string
  name: string
  email: string
  image?: string
  role: string
  createdAt: string
  lastLoginAt?: string
}

interface ModernAdminChatProps {
  onRoomSelect?: (room: ChatRoom) => void
}

export default function ModernAdminChat({ onRoomSelect }: ModernAdminChatProps) {
  const { data: session } = useSession()
  const socket = useChatSocket()
  
  // UI State
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  
  // Chat State
  const [newMessage, setNewMessage] = useState('')
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [showFilters, setShowFilters] = useState(false)
  
  // Settings
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showUserDetails, setShowUserDetails] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
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
    if (session?.user?.id) {
      initializeChat()
    }
  }, [session?.user?.id])

  // WebSocket event handlers
  useEffect(() => {
    if (!socket) return

    const handleConnect = () => {
      console.log('Admin Chat WebSocket connected')
      setIsConnected(true)
    }

    const handleDisconnect = () => {
      console.log('Admin Chat WebSocket disconnected')
      setIsConnected(false)
    }

    const handleMessageReceived = (message: ChatMessage) => {
      setMessages(prev => [...prev, message])
      
      // Update room's last message time
      setRooms(prev => prev.map(room => 
        room.id === message.roomId 
          ? { ...room, lastMessageAt: message.createdAt, _count: { ...room._count, messages: room._count.messages + 1 } }
          : room
      ))
      
      // Play notification sound for messages from users
      if (message.userRole !== 'ADMIN' && message.userRole !== 'SUPER_ADMIN' && soundEnabled) {
        playNotificationSound()
      }
    }

    const handleUserTyping = (typingUser: TypingUser) => {
      if (typingUser.userId !== session?.user?.id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== typingUser.userId)
          return [...filtered, typingUser]
        })
      }
    }

    const handleUserStoppedTyping = (typingUser: TypingUser) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== typingUser.userId))
    }

    const handleError = (error: string) => {
      console.error('Admin Chat WebSocket error:', error)
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
      
      // Load rooms
      await loadRooms()
      
    } catch (error) {
      console.error('Error initializing admin chat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRooms = async () => {
    try {
      const response = await fetch('/api/chat/rooms?type=SUPPORT')
      const data = await response.json()
      
      if (data.success) {
        setRooms(data.rooms)
        if (data.rooms.length > 0 && !selectedRoom) {
          const firstRoom = data.rooms[0]
          setSelectedRoom(firstRoom)
          onRoomSelect?.(firstRoom)
          await loadMessages(firstRoom.id)
          socket.emit('join-room', firstRoom.id)
        }
      }
    } catch (error) {
      console.error('Error loading rooms:', error)
    }
  }

  const loadMessages = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?roomId=${roomId}`)
      const data = await response.json()
      
      if (data.messages) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const selectRoom = async (room: ChatRoom) => {
    setSelectedRoom(room)
    onRoomSelect?.(room)
    await loadMessages(room.id)
    socket.emit('join-room', room.id)
    
    // Load user details
    const user = room.participants.find(p => p.role !== 'ADMIN' && p.role !== 'SUPER_ADMIN')?.user
    if (user) {
      setSelectedUser(user as User)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !session?.user?.id || isSending) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    setIsSending(true)
    
    // Stop typing indicator
    if (isTyping) {
      socket.emit('typing-stop', selectedRoom.id)
      setIsTyping(false)
    }

    try {
      const message = createMessage({
        content: messageContent,
        userId: session.user.id,
        userName: session.user.name || 'Admin',
        userRole: session.user.role || 'ADMIN',
        roomId: selectedRoom.id
      })

      // Send via WebSocket for real-time delivery
      socket.emit('send-message', message)

      // Also send via API for persistence
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
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
    } finally {
      setIsSending(false)
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)
    
    if (!isTyping && selectedRoom) {
      setIsTyping(true)
      socket.emit('typing-start', selectedRoom.id)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && selectedRoom) {
        socket.emit('typing-stop', selectedRoom.id)
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '#ef4444'
      case 'HIGH': return '#f97316'
      case 'MEDIUM': return '#eab308'
      case 'LOW': return '#22c55e'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle size={16} style={{ color: '#22c55e' }} />
      case 'ARCHIVED': return <Archive size={16} style={{ color: '#6b7280' }} />
      case 'CLOSED': return <AlertCircle size={16} style={{ color: '#ef4444' }} />
      default: return <Clock size={16} style={{ color: '#6b7280' }} />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.participants.some(p => p.user.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'ALL' || room.status === statusFilter
    const matchesPriority = priorityFilter === 'ALL' || room.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

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
          <p style={{ color: '#333', fontSize: '16px' }}>Loading admin chat...</p>
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
        width: '400px',
        background: 'white',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
            Admin Chat Dashboard
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '14px', opacity: 0.9 }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isConnected ? '#22c55e' : '#ef4444'
            }} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6b7280'
            }} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '6px 12px',
                border: '1px solid #e2e8f0',
                background: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: '#6b7280'
              }}
            >
              <Filter size={14} />
              Filters
            </button>
            
            {showFilters && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '16px',
                right: '16px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 10
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ARCHIVED">Archived</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Priority
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    <option value="ALL">All Priority</option>
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Active Chats</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937' }}>
              {rooms.filter(r => r.status === 'ACTIVE').length}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Urgent</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444' }}>
              {rooms.filter(r => r.priority === 'URGENT').length}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Total Messages</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937' }}>
              {rooms.reduce((sum, r) => sum + r._count.messages, 0)}
            </span>
          </div>
        </div>

        {/* Rooms List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredRooms.map(room => {
            const isSelected = selectedRoom?.id === room.id
            const user = room.participants.find(p => p.role !== 'ADMIN' && p.role !== 'SUPER_ADMIN')?.user
            
            return (
              <div
                key={room.id}
                onClick={() => selectRoom(room)}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  background: isSelected ? '#eff6ff' : 'transparent',
                  borderLeft: isSelected ? '3px solid #3b82f6' : '3px solid transparent',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1f2937',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {user?.name || 'Unknown User'}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {getStatusIcon(room.status)}
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: getPriorityColor(room.priority)
                        }} />
                      </div>
                    </div>
                    
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {room.participants.length} participants
                    </div>
                    
                    <div style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>{formatTime(room.lastMessageAt)}</span>
                      <span style={{
                        background: '#3b82f6',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '2px 6px',
                        fontSize: '10px',
                        fontWeight: '500'
                      }}>
                        {room.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e2e8f0',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MessageCircle size={24} />
                  </div>
                  
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                      {selectedRoom.name}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                      <span style={{ fontSize: '14px', opacity: 0.9 }}>
                        {selectedRoom._count.participants} participants
                      </span>
                      <span style={{ fontSize: '14px', opacity: 0.9 }}>
                        {selectedRoom._count.messages} messages
                      </span>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '4px 8px',
                        borderRadius: '12px'
                      }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: getPriorityColor(selectedRoom.priority)
                        }} />
                        {selectedRoom.priority}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Phone size={16} />
                  </button>
                  <button style={{
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Video size={16} />
                  </button>
                  <button style={{
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              background: '#f8fafc'
            }}>
              {messages.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: '#6b7280',
                  padding: '40px 20px'
                }}>
                  <MessageCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '500' }}>
                    No messages yet
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    Start the conversation by sending a message
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {messages.map((message) => {
                    const isCurrentUser = message.userId === session?.user?.id
                    const isAdmin = message.userRole === 'ADMIN' || message.userRole === 'SUPER_ADMIN'
                    
                    return (
                      <div
                        key={message.id}
                        style={{
                          display: 'flex',
                          justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                          alignItems: 'flex-end',
                          gap: '12px'
                        }}
                      >
                        {!isCurrentUser && (
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: isAdmin 
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
                            {isAdmin ? <Bot size={16} /> : <User size={16} />}
                          </div>
                        )}
                        
                        <div style={{
                          maxWidth: '70%',
                          background: isCurrentUser 
                            ? 'linear-gradient(135deg, #667eea, #764ba2)'
                            : 'white',
                          color: isCurrentUser ? 'white' : '#1f2937',
                          padding: '12px 16px',
                          borderRadius: isCurrentUser 
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
                            gap: '6px',
                            fontSize: '11px',
                            opacity: 0.7
                          }}>
                            <span>{formatTime(message.createdAt)}</span>
                            {isCurrentUser && <CheckCircle size={12} style={{ color: '#22c55e' }} />}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* Typing Indicators */}
                  {typingUsers.length > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#6b7280',
                      fontSize: '14px',
                      fontStyle: 'italic'
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
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
              padding: '20px',
              borderTop: '1px solid #e2e8f0',
              background: 'white'
            }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-end'
              }}>
                <div style={{ flex: 1 }}>
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isSending}
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      maxHeight: '120px',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '22px',
                      resize: 'none',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      background: '#f8fafc',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  style={{
                    padding: '12px',
                    border: 'none',
                    background: newMessage.trim() && !isSending
                      ? 'linear-gradient(135deg, #667eea, #764ba2)'
                      : '#d1d5db',
                    borderRadius: '50%',
                    cursor: newMessage.trim() && !isSending ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    minWidth: '44px',
                    height: '44px'
                  }}
                >
                  {isSending ? (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            color: '#6b7280'
          }}>
            <div style={{ textAlign: 'center' }}>
              <MessageCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>
                Select a conversation
              </h3>
              <p style={{ margin: '8px 0 0', fontSize: '14px' }}>
                Choose a chat room to start managing conversations
              </p>
            </div>
          </div>
        )}
      </div>

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
    </div>
  )
}
