import jwt from 'jsonwebtoken'

export const initSocket = (io) => {
  // JWT auth on every socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Unauthorized'))
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET)
      next()
    } catch {
      next(new Error('Token invalid'))
    }
  })

  io.on('connection', (socket) => {
    // Every user gets a private room
    socket.join(`user:${socket.user.id}`)
    if (socket.user.role === 'admin') socket.join('admin')
    console.log(`Socket connected: ${socket.user.id}`)

    socket.on('disconnect', () =>
      console.log(`Socket disconnected: ${socket.user.id}`)
    )
  })
}
