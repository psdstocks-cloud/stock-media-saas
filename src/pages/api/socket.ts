import { NextApiRequest, NextApiResponse } from 'next'
import { SocketManager } from '@/lib/socket-server'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const server = (res as any).socket?.server
  
  if (server?.io) {
    console.log('Socket is already running')
    res.end()
    return
  }

  console.log('Socket is initializing')
  const io = SocketManager.getInstance().initialize(server)
  if (server) {
    server.io = io
  }

  res.end()
}
