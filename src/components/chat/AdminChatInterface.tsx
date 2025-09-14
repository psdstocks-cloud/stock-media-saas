'use client'

import { useState, useEffect, useRef } from 'react'
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
  Zap
} from 'lucide-react'

interface Message {
  id: string
  content: string
  type: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    image?: string
    role: string
  }
  replyTo?: {
    id: string
    content: string
    user: {
      id: string
      name: string
      image?: string
    }
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
    user: {
      id: string
      name: string
      email: string
      image?: string
      role: string
    }
  }>
  messages: Message[]
  _count: {
    messages: number
    participants: number
  }
}

interface AdminChatInterfaceProps {
  selectedRoom: ChatRoom | null
  onRoomUpdate?: (room: ChatRoom) => void
}

export default function AdminChatInterface({ selectedRoom, onRoomUpdate }: AdminChatInterfaceProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages when room changes
  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id)
    } else {
      setMessages([])
    }
  }, [selectedRoom])

  // Poll for new messages
  useEffect(() => {
    if (!selectedRoom) return

    const pollMessages = async () => {
      try {
        const response = await fetch(`/api/chat/messages?roomId=${selectedRoom.id}`)
        const data = await response.json()
        
        if (data.messages) {
          setMessages(data.messages)
        }
      } catch (error) {
        console.error('Error polling messages:', error)
      }
    }

    const interval = setInterval(pollMessages, 2000) // Poll every 2 seconds
    return () => clearInterval(interval)
  }, [selectedRoom])

  const loadMessages = async (roomId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/chat/messages?roomId=${roomId}`)
      const data = await response.json()
      
      if (data.messages) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !session?.user?.id || isSending) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    setIsSending(true)
    setIsTyping(true)

    try {
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

      const data = await response.json()
      
      if (data.message) {
        setMessages(prev => [...prev, data.message])
        
        // Update room with new message
        if (onRoomUpdate) {
          const updatedRoom = {
            ...selectedRoom,
            lastMessageAt: new Date().toISOString(),
            _count: {
              ...selectedRoom._count,
              messages: selectedRoom._count.messages + 1
            }
          }
          onRoomUpdate(updatedRoom)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
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

  if (!selectedRoom) {
    return (
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
    )
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'white',
      height: '100%'
    }}>
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
                    background: selectedRoom.priority === 'URGENT' ? '#ef4444' : 
                               selectedRoom.priority === 'HIGH' ? '#f97316' : 
                               selectedRoom.priority === 'MEDIUM' ? '#eab308' : '#22c55e'
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

      {/* Participants */}
      <div style={{
        padding: '16px 20px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
          Participants
        </h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {selectedRoom.participants.map(participant => (
            <div
              key={participant.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'white',
                padding: '8px 12px',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                fontSize: '12px'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: participant.role === 'ADMIN' || participant.role === 'SUPER_ADMIN'
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '10px'
              }}>
                {participant.role === 'ADMIN' || participant.role === 'SUPER_ADMIN' ? 
                  <Bot size={12} /> : <User size={12} />}
              </div>
              <span style={{ color: '#1f2937', fontWeight: '500' }}>
                {participant.user.name}
              </span>
              <span style={{
                color: participant.role === 'ADMIN' || participant.role === 'SUPER_ADMIN' ? '#ef4444' : '#6b7280',
                fontSize: '10px',
                fontWeight: '500'
              }}>
                {participant.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        padding: '20px',
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
        ) : messages.length === 0 ? (
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
              const isCurrentUser = message.user.id === session?.user?.id
              const isAdmin = message.user.role === 'ADMIN' || message.user.role === 'SUPER_ADMIN'
              
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
                      {isCurrentUser && getStatusIcon(message.statuses[0]?.status || 'SENT')}
                    </div>
                  </div>
                </div>
              )
            })}
            
            {isTyping && (
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
                    <span>User is typing</span>
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
              onChange={(e) => setNewMessage(e.target.value)}
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
