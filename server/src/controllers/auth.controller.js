import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { createLog } from '../utils/createLog.js'

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

const attachCookie = (res, token) =>
  res.cookie('token', token, {
    httpOnly: true,                                    // JS can't read it
    secure: process.env.NODE_ENV === 'production',     // HTTPS only in prod
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000                   // 7 days ms
  })

// Also attach a non-httpOnly cookie for Socket.IO handshake
const attachSocketToken = (res, token) =>
  res.cookie('socketToken', token, {
    httpOnly: false,                                   // Socket client reads this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

// ─── SIGNUP ──────────────────────────────────────────────
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const user = await User.create({ name, email, password })
  const token = signToken(user._id, user.role)

  attachCookie(res, token)
  attachSocketToken(res, token)

  await createLog({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    action: 'USER_SIGNUP',
    metadata: { email }
  })

  sendSuccess(res, {
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  }, 'Account created', 201)
})

// ─── LOGIN ────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // select:false on password — must explicitly request it
  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ success: false, error: 'Invalid email or password' })

  const token = signToken(user._id, user.role)

  attachCookie(res, token)
  attachSocketToken(res, token)

  await createLog({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    action: 'USER_LOGIN',
    metadata: { email }
  })

  sendSuccess(res, {
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  }, 'Logged in')
})

// ─── LOGOUT ───────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token')
  res.clearCookie('socketToken')
  sendSuccess(res, null, 'Logged out')
})

// ─── GET ME (verify session) ──────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  // req.user already attached by verifyToken middleware
  sendSuccess(res, {
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  })
})
