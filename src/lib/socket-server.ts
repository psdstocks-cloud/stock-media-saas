import { Server as NetServer } from 'http'
import { NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { prisma } from './prisma'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export class SocketManager {
  private static instance: SocketManager
  private io: SocketIOServer | null = null

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager()
    }
    return SocketManager.instance
  }

  public initialize(server: NetServer): SocketIOServer {
    if (!this.io) {
      this.io = new SocketIOServer(server, {
        cors: {
          origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
          methods: ["GET", "POST"],
          credentials: true
        }
      })

      this.setupEventHandlers()
    }

    return this.io
  }

  private setupEventHandlers() {
    if (!this.io) return

    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id)

      // Join room
      socket.on('join-room', async (data: { roomId: string, userId: string }) => {
        try {
          const { roomId, userId } = data

          // Verify user is participant in the room
          const participant = await prisma.chatParticipant.findFirst({
            where: {
              roomId,
              userId
            }
          })

          if (participant) {
            socket.join(roomId)
            console.log(`User ${userId} joined room ${roomId}`)
            
            // Notify others in the room
            socket.to(roomId).emit('user-joined', {
              userId,
              socketId: socket.id
            })
          }
        } catch (error) {
          console.error('Error joining room:', error)
          socket.emit('error', { message: 'Failed to join room' })
        }
      })

      // Leave room
      socket.on('leave-room', (data: { roomId: string, userId: string }) => {
        const { roomId, userId } = data
        socket.leave(roomId)
        console.log(`User ${userId} left room ${roomId}`)
        
        // Notify others in the room
        socket.to(roomId).emit('user-left', {
          userId,
          socketId: socket.id
        })
      })

      // Send message
      socket.on('send-message', async (data: {
        roomId: string
        userId: string
        content: string
        type?: string
        fileUrl?: string
        fileName?: string
        fileSize?: number
        replyToId?: string
      }) => {
        try {
          const { roomId, userId, content, type = 'TEXT', fileUrl, fileName, fileSize, replyToId } = data

          // Verify user is participant in the room
          const participant = await prisma.chatParticipant.findFirst({
            where: {
              roomId,
              userId
            }
          })

          if (!participant) {
            socket.emit('error', { message: 'Access denied' })
            return
          }

          // Create message in database
          const message = await prisma.message.create({
            data: {
              roomId,
              userId,
              content,
              type: type as any,
              fileUrl,
              fileName,
              fileSize,
              replyToId
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  role: true
                }
              },
              replyTo: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true
                    }
                  }
                }
              }
            }
          })

          // Update room's last message time
          await prisma.chatRoom.update({
            where: { id: roomId },
            data: { lastMessageAt: new Date() }
          })

          // Create message status for all participants
          const participants = await prisma.chatParticipant.findMany({
            where: { roomId },
            select: { userId: true }
          })

          const messageStatuses = participants.map(p => ({
            messageId: message.id,
            userId: p.userId,
            status: p.userId === userId ? 'SENT' : 'DELIVERED'
          }))

          await prisma.messageStatus.createMany({
            data: messageStatuses
          })

          // Broadcast message to all users in the room
          this.io?.to(roomId).emit('new-message', {
            message,
            statuses: messageStatuses
          })

          console.log(`Message sent in room ${roomId} by user ${userId}`)

        } catch (error) {
          console.error('Error sending message:', error)
          socket.emit('error', { message: 'Failed to send message' })
        }
      })

      // Typing indicator
      socket.on('typing-start', (data: { roomId: string, userId: string }) => {
        const { roomId, userId } = data
        socket.to(roomId).emit('user-typing', { userId, isTyping: true })
      })

      socket.on('typing-stop', (data: { roomId: string, userId: string }) => {
        const { roomId, userId } = data
        socket.to(roomId).emit('user-typing', { userId, isTyping: false })
      })

      // Mark message as read
      socket.on('mark-read', async (data: { messageId: string, userId: string }) => {
        try {
          const { messageId, userId } = data

          await prisma.messageStatus.updateMany({
            where: {
              messageId,
              userId,
              status: { not: 'READ' }
            },
            data: {
              status: 'READ',
              readAt: new Date()
            }
          })

          // Get the message to find the room
          const message = await prisma.message.findUnique({
            where: { id: messageId },
            select: { roomId: true }
          })

          if (message) {
            // Notify others in the room that message was read
            this.io?.to(message.roomId).emit('message-read', {
              messageId,
              userId
            })
          }

        } catch (error) {
          console.error('Error marking message as read:', error)
        }
      })

      // Disconnect
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
      })
    })
  }

  public getIO(): SocketIOServer | null {
    return this.io
  }
}
