import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { createLog } from '../utils/createLog.js'

// Access token — 15 minutes
const signAccessToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '15m' })

// Refresh token — 7 days
const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

const attachCookies = (res, accessToken, refreshToken) => {
  // Access token cookie — 15 min
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 15 * 60 * 1000   // 15 minutes
  })

  // Refresh token cookie — 7 days
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
  })

  // Socket token — non-httpOnly for socket handshake
  res.cookie('socketToken', accessToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 15 * 60 * 1000
  })
}

// ─── SIGNUP ──────────────────────────────────────────────
export const signup = async (req, res) => {
  const { name, email, password } = req.body
  const user = await User.create({ name, email, password })

  const accessToken  = signAccessToken(user._id, user.role)
  const refreshToken = signRefreshToken(user._id)

  // Store refresh token in DB
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  attachCookies(res, accessToken, refreshToken)

  await createLog({
    userId: user._id, userName: user.name,
    userEmail: user.email, action: 'USER_SIGNUP'
  })

  sendSuccess(res, {
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  }, 'Account created', 201)
}

// ─── LOGIN ────────────────────────────────────────────────
export const login = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email }).select('+password +refreshToken')
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ success: false, error: 'Invalid email or password' })

  const accessToken  = signAccessToken(user._id, user.role)
  const refreshToken = signRefreshToken(user._id)

  // Rotate refresh token on every login
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  attachCookies(res, accessToken, refreshToken)

  await createLog({
    userId: user._id, userName: user.name,
    userEmail: user.email, action: 'USER_LOGIN'
  })

  sendSuccess(res, {
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  }, 'Logged in')
}

// ─── REFRESH ──────────────────────────────────────────────
export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken
  if (!token)
    return res.status(401).json({ success: false, error: 'No refresh token' })

  // Verify refresh token signature
  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid refresh token' })
  }

  // Find user + verify token matches DB (rotation check)
  const user = await User.findById(decoded.id).select('+refreshToken')
  if (!user || user.refreshToken !== token)
    return res.status(401).json({ success: false, error: 'Refresh token reuse detected' })

  // Issue new tokens (rotation — old refresh token invalidated)
  const newAccessToken  = signAccessToken(user._id, user.role)
  const newRefreshToken = signRefreshToken(user._id)

  user.refreshToken = newRefreshToken
  await user.save({ validateBeforeSave: false })

  attachCookies(res, newAccessToken, newRefreshToken)

  sendSuccess(res, {
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  }, 'Token refreshed')
}

// ─── LOGOUT ───────────────────────────────────────────────
export const logout = async (req, res) => {
  const token = req.cookies.refreshToken

  if (token) {
    // Invalidate refresh token in DB
    await User.findOneAndUpdate(
      { refreshToken: token },
      { refreshToken: null }
    )
  }

  res.clearCookie('token')
  res.clearCookie('refreshToken')
  res.clearCookie('socketToken')
  sendSuccess(res, null, 'Logged out')
}

// ─── GET ME ───────────────────────────────────────────────
export const getMe = async (req, res) => {
  sendSuccess(res, {
    user: {
      id: req.user._id, name: req.user.name,
      email: req.user.email, role: req.user.role
    }
  })
}
