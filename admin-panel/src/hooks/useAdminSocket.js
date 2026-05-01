import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://parkent-express.duckdns.org'

/**
 * Admin panel uchun socket hook
 * Dashboard real-time yangilanishi, yangi vendor/driver/order bildirishnomalar
 */
export const useAdminSocket = ({ onNewOrder, onNewVendor, onNewDriver, onOrderUpdate } = {}) => {
  const socketRef = useRef(null)

  const connect = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token || socketRef.current?.connected) return

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      console.log('Admin socket ulandi')
    })

    // Yangi buyurtma
    socket.on('order:new', (data) => {
      onNewOrder?.(data)
    })

    // Buyurtma holati o'zgardi
    socket.on('order:update', (data) => {
      onOrderUpdate?.(data)
    })

    socket.on('order:status:changed', (data) => {
      onOrderUpdate?.(data)
    })

    // Yangi vendor ariza berdi
    socket.on('vendor:new_registration', (data) => {
      onNewVendor?.(data)
    })

    // Yangi driver ariza berdi
    socket.on('driver:new_registration', (data) => {
      onNewDriver?.(data)
    })

    // Umumiy bildirishnoma
    socket.on('notification', (data) => {
      console.log('Admin notification:', data)
    })

    socket.on('connect_error', (err) => {
      console.warn('Admin socket xatosi:', err.message)
    })
  }, [onNewOrder, onNewVendor, onNewDriver, onOrderUpdate])

  useEffect(() => {
    connect()
    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  return socketRef.current
}
