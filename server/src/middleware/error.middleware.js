export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`)

  // Mongoose duplicate key (email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({ success: false, error: `${field} already in use` })
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({ success: false, error: errors[0] })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError')
    return res.status(401).json({ success: false, error: 'Invalid token' })
  if (err.name === 'TokenExpiredError')
    return res.status(401).json({ success: false, error: 'Token expired' })

  // Default
  res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
  })
}
