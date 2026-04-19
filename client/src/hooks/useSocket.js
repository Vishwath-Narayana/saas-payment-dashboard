import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

export const useSocket = (onTransaction) => {
  const { user } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user) return

    // Read socketToken from non-httpOnly cookie
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('socketToken='))
      ?.split('=')[1]

    if (!token) return

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      transports: ['websocket']
    })

    socketRef.current.on('new_transaction', (transaction) => {
      onTransaction?.(transaction)
    })

    return () => socketRef.current?.disconnect()
  }, [user])

  return socketRef.current
}
