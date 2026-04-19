import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { createLog } from '../utils/createLog.js'

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

const attachCookie = (res, token) =>
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,                    // always true for cross-domain
    sameSite: 'none',                // required for cross-domain
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

const attachSocketToken = (res, token) =>
  res.cookie('socketToken', token, {
    httpOnly: false,
    secure: true,                    // always true
    sameSite: 'none',                // required
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

export const signup = async (req, res) => {
  const { name, email, password } = req.body
  const user = await User.create({ name, email, password })
  const token = signToken(user._id, user.role)
  attachCookie(res, token)
  attachSocketToken(res, token)
  await createLog({
    userId: user._id, userName: user.name,
    userEmail: user.email, action: 'USER_SIGNUP'
  })
  sendSuccess(res, {
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  }, 'Account created', 201)
}

export const login = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ success: false, error: 'Invalid email or password' })
  const token = signToken(user._id, user.role)
  attachCookie(res, token)
  attachSocketToken(res, token)
  await createLog({
    userId: user._id, userName: user.name,
    userEmail: user.email, action: 'USER_LOGIN'
  })
  sendSuccess(res, {
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  }, 'Logged in')
}

export const logout = async (req, res) => {
  res.clearCookie('token')
  res.clearCookie('socketToken')
  sendSuccess(res, null, 'Logged out')
}

export const getMe = async (req, res) => {
  sendSuccess(res, {
    user: {
      id: req.user._id, name: req.user.name,
      email: req.user.email, role: req.user.role
    }
  })
}
