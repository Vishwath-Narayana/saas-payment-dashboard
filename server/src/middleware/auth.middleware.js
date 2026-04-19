import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ success: false, error: 'Not authenticated' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) return res.status(401).json({ success: false, error: 'User not found' })
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' })
  }
}
