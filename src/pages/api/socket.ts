import { NextApiRequest, NextApiResponse } from 'next'
import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
    return res.end()
  }

  console.log('Socket is initializing')
  const io = new SocketIOServer(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  res.socket.server.io = io

  io.use(async (socket, next) => {
    try {
      // Get session from socket handshake
      const session = await getServerSession(req, res, authOptions)
      
      if (!session?.user?.id) {
        return next(new Error('Authentication required'))
      }

      // Attach user info to socket
      socket.data.userId = session.user.id
      socket.data.userName = session.user.name
      socket.data.userRole = session.user.role
      
      next()
    } catch (error) {
      console.error('Socket authentication error:', error)
      next(new Error('Authentication failed'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`User ${socket.data.userName} connected with socket ${socket.id}`)

    // Join room
    socket.on('join-room', async (roomId: string) => {
      try {
        // Verify user has access to this room
        const participant = await prisma.chatParticipant.findFirst({
          where: {
            roomId: roomId,
            userId: socket.data.userId
          }
        })

        if (!participant) {
          socket.emit('error', 'Access denied to this room')
          return
        }

        await socket.join(roomId)
        console.log(`User ${socket.data.userName} joined room ${roomId}`)
        
        // Notify others in the room
        socket.to(roomId).emit('user-joined', {
          userId: socket.data.userId,
          userName: socket.data.userName,
          roomId: roomId
        })
      } catch (error) {
        console.error('Error joining room:', error)
        socket.emit('error', 'Failed to join room')
      }
    })

    // Leave room
    socket.on('leave-room', async (roomId: string) => {
      try {
        await socket.leave(roomId)
        console.log(`User ${socket.data.userName} left room ${roomId}`)
        
        // Notify others in the room
        socket.to(roomId).emit('user-left', {
          userId: socket.data.userId,
          userName: socket.data.userName,
          roomId: roomId
        })
      } catch (error) {
        console.error('Error leaving room:', error)
      }
    })

    // Send message
    socket.on('send-message', async (messageData) => {
      try {
        const { content, type, fileUrl, fileName, fileSize, roomId } = messageData

        // Verify user has access to this room
        const participant = await prisma.chatParticipant.findFirst({
          where: {
            roomId: roomId,
            userId: socket.data.userId
          }
        })

        if (!participant) {
          socket.emit('error', 'Access denied to this room')
          return
        }

        // Create message in database
        const message = await prisma.message.create({
          data: {
            roomId: roomId,
            userId: socket.data.userId,
            content: content,
            type: type || 'TEXT',
            fileUrl: fileUrl,
            fileName: fileName,
            fileSize: fileSize
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
            }
          }
        })

        // Update room's last message time
        await prisma.chatRoom.update({
          where: { id: roomId },
          data: { lastMessageAt: new Date() }
        })

        // Create message status for all participants
        const roomParticipants = await prisma.chatParticipant.findMany({
          where: { roomId: roomId },
          select: { userId: true }
        })

        await prisma.messageStatus.createMany({
          data: roomParticipants.map(p => ({
            messageId: message.id,
            userId: p.userId,
            status: p.userId === socket.data.userId ? 'SENT' : 'DELIVERED'
          }))
        })

        // Emit message to all users in the room
        const messageWithStatus = {
          id: message.id,
          content: message.content,
          type: message.type,
          fileUrl: message.fileUrl,
          fileName: message.fileName,
          fileSize: message.fileSize,
          userId: message.user.id,
          userName: message.user.name || 'Unknown',
          userRole: message.user.role,
          roomId: message.roomId,
          createdAt: message.createdAt.toISOString(),
          status: 'SENT'
        }

        io.to(roomId).emit('message-received', messageWithStatus)

        console.log(`Message sent by ${socket.data.userName} in room ${roomId}`)
      } catch (error) {
        console.error('Error sending message:', error)
        socket.emit('error', 'Failed to send message')
      }
    })

    // Typing indicators
    socket.on('typing-start', (roomId: string) => {
      socket.to(roomId).emit('user-typing', {
        userId: socket.data.userId,
        userName: socket.data.userName,
        roomId: roomId
      })
    })

    socket.on('typing-stop', (roomId: string) => {
      socket.to(roomId).emit('user-stopped-typing', {
        userId: socket.data.userId,
        userName: socket.data.userName,
        roomId: roomId
      })
    })

    // Mark message as read
    socket.on('mark-read', async (messageId: string, roomId: string) => {
      try {
        await prisma.messageStatus.updateMany({
          where: {
            messageId: messageId,
            userId: socket.data.userId
          },
          data: {
            status: 'READ',
            readAt: new Date()
          }
        })

        // Notify sender that message was read
        socket.to(roomId).emit('message-status-updated', messageId, 'READ', socket.data.userId)
      } catch (error) {
        console.error('Error marking message as read:', error)
      }
    })

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.data.userName} disconnected: ${reason}`)
    })

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.data.userName}:`, error)
    })
  })

  res.end()
}

export default SocketHandler