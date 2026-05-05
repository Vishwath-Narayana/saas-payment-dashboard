import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

export const useSocket = (onTransaction) => {
  const { user } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user) return

    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('socketToken='))
      ?.split('=')[1]

    // No socket token — skip silently (user logged in via different flow)
    if (!token) return

    // Prevent double connection in StrictMode
    if (socketRef.current?.connected) return

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    })

    socketRef.current.on('connect', () =>
      console.log('Socket connected')
    )

    socketRef.current.on('new_transaction', (transaction) => {
      onTransaction?.(transaction)
    })

    socketRef.current.on('connect_error', (err) => {
      console.warn('Socket connection failed:', err.message)
    })

    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [user])

  return socketRef.current
}
