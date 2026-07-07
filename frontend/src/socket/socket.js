import { io } from 'socket.io-client'
import { SOCKET_URL } from '../utils/constants'

let socket = null

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('token')
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    })
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
