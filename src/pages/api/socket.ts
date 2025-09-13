import { NextApiRequest, NextApiResponse } from 'next'
import { SocketManager } from '@/lib/socket-server'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (res.socket.server.io) {
    console.log('Socket is already running')
    res.end()
    return
  }

  console.log('Socket is initializing')
  const io = SocketManager.getInstance().initialize(res.socket.server)
  res.socket.server.io = io

  res.end()
}
