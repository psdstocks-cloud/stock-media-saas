// src/pages/api/socket.ts

import { Server as HttpServer } from 'http'
import { Socket } from 'net'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { SocketManager } from '@/lib/socket-server'

// Define a custom type for the NextApiResponse that includes our socket server
export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: HttpServer & {
      io?: SocketIOServer
    }
  }
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO // Use the custom type here
) {
  // Check if the socket server is already running
  if (res.socket.server.io) {
    console.log('Socket is already running')
    res.end()
    return
  }

  // If not, initialize it
  console.log('Socket is initializing')
  const io = SocketManager.getInstance().initialize(res.socket.server)
  res.socket.server.io = io

  res.end()
}
