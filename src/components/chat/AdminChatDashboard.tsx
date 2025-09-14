'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Users, 
  MessageCircle, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Video,
  Settings,
  Archive,
  Trash2,
  Star,
  StarOff
} from 'lucide-react'
import AdminChatInterface from './AdminChatInterface'

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

interface AdminChatDashboardProps {
  onRoomSelect?: (room: ChatRoom) => void
}

export default function AdminChatDashboard({ onRoomSelect }: AdminChatDashboardProps) {
  const { data: session } = useSession()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      loadRooms()
    }
  }, [session?.user?.id])

  const loadRooms = async () => {
    try {
      const response = await fetch('/api/chat/rooms?type=SUPPORT')
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
      case 'CLOSED': return <XCircle size={16} style={{ color: '#ef4444' }} />
      default: return <Clock size={16} style={{ color: '#6b7280' }} />
    }
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.participants.some(p => p.user.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'ALL' || room.status === statusFilter
    const matchesPriority = priorityFilter === 'ALL' || room.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

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

  const getUnreadCount = (room: ChatRoom) => {
    // This would need to be calculated based on message statuses
    // For now, return a mock value
    return Math.floor(Math.random() * 5)
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
          <p style={{ color: '#333', fontSize: '16px' }}>Loading admin dashboard...</p>
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
            Admin Dashboard
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: '14px', opacity: 0.9 }}>
            Manage customer support chats
          </p>
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
            const unreadCount = getUnreadCount(room)
            const isSelected = selectedRoom?.id === room.id
            
            return (
              <div
                key={room.id}
                onClick={() => {
                  setSelectedRoom(room)
                  onRoomSelect?.(room)
                }}
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
                    {room.name?.charAt(0) || 'C'}
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
                        {room.name}
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
                  
                  {unreadCount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      {unreadCount}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AdminChatInterface 
          selectedRoom={selectedRoom} 
          onRoomUpdate={(updatedRoom) => {
            // Update the room in the rooms list
            setRooms(prev => prev.map(room => 
              room.id === updatedRoom.id ? {
                ...room,
                lastMessageAt: updatedRoom.lastMessageAt,
                _count: updatedRoom._count
              } : room
            ))
            // Update the selected room
            setSelectedRoom(prev => prev ? {
              ...prev,
              lastMessageAt: updatedRoom.lastMessageAt,
              _count: updatedRoom._count
            } : prev)
          }}
        />
      </div>
    </div>
  )
}
