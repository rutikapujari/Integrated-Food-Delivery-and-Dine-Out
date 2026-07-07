import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSocket, disconnectSocket } from '../socket/socket'
import { updateOrderStatus } from '../redux/orderSlice'
import { addNotification } from '../redux/notificationSlice'

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const socket = isAuthenticated ? getSocket() : null

  useEffect(() => {
    if (!socket) return

    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)

    const onOrderUpdate = (data) => {
      dispatch(updateOrderStatus({ orderId: data.orderId, status: data.status }))
    }

    const onNotification = (data) => {
      dispatch(addNotification(data))
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('orderUpdate', onOrderUpdate)
    socket.on('notification', onNotification)

    if (socket.connected) setIsConnected(true)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('orderUpdate', onOrderUpdate)
      socket.off('notification', onNotification)
    }
  }, [socket, dispatch])

  const joinOrderRoom = useCallback((orderId) => {
    if (socket?.connected) {
      socket.emit('join', { room: `order:${orderId}` })
    }
  }, [socket])

  const leaveOrderRoom = useCallback((orderId) => {
    if (socket?.connected) {
      socket.emit('leave', { room: `order:${orderId}` })
    }
  }, [socket])

  return { socket, isConnected, joinOrderRoom, leaveOrderRoom }
}
