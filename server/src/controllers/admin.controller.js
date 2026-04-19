import User from '../models/User.js'
import Transaction from '../models/Transaction.js'
import Log from '../models/Log.js'
import { sendSuccess } from '../utils/apiResponse.js'

// ─── ALL USERS ─────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  const { page = 1, limit = 10, search } = req.query

  const filter = { role: 'user' }
  if (search) {
    filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  }

  const skip = (Number(page) - 1) * Number(limit)

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('name email role createdAt'),
    User.countDocuments(filter)
  ])

  sendSuccess(res, {
    users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  })
}

// ─── SINGLE USER + THEIR TRANSACTIONS ──────────────────────
export const getUserDetail = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')
  if (!user) return res.status(404).json({ success: false, error: 'User not found' })

  const [transactions, stats] = await Promise.all([
    Transaction.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10),
    Transaction.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          total:        { $sum: 1 },
          totalRevenue: { $sum: { $cond: [{ $eq: ['0', 'success'] }, '', 0] } },
          success:      { $sum: { $cond: [{ $eq: ['0', 'success'] }, 1, 0] } },
          failed:       { $sum: { $cond: [{ $eq: ['0', 'failed'] },  1, 0] } },
        }
      }
    ])
  ])

  sendSuccess(res, {
    user,
    recentTransactions: transactions,
    stats: stats[0] || { total: 0, totalRevenue: 0, success: 0, failed: 0 }
  })
}

// ─── ALL LOGS ──────────────────────────────────────────────
export const getAllLogs = async (req, res) => {
  const { page = 1, limit = 20, action, userId } = req.query

  const filter = {}
  if (action) filter.action = action
  if (userId) filter.userId = userId

  const skip = (Number(page) - 1) * Number(limit)

  const [logs, total] = await Promise.all([
    Log.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Log.countDocuments(filter)
  ])

  sendSuccess(res, {
    logs,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  })
}

// ─── SYSTEM OVERVIEW ───────────────────────────────────────
export const getOverview = async (req, res) => {
  const [
    totalUsers,
    totalTransactions,
    revenueResult,
    recentLogs
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Transaction.countDocuments(),
    Transaction.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '' } } }
    ]),
    Log.find()
      .sort({ createdAt: -1 })
      .limit(10)
  ])

  sendSuccess(res, {
    totalUsers,
    totalTransactions,
    totalRevenue: revenueResult[0]?.total || 0,
    recentLogs
  })
}
