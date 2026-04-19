import Transaction from '../models/Transaction.js'
import User from '../models/User.js'
import { sendSuccess } from '../utils/apiResponse.js'

// ─── SUMMARY (total revenue, count, success rate) ─────────
export const getSummary = async (req, res) => {
  const matchStage = req.user.role === 'admin' ? {} : { userId: req.user._id }

  const [result] = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: { $cond: [{ $eq: ['0', 'success'] }, '', 0] }
        },
        total:   { $sum: 1 },
        success: { $sum: { $cond: [{ $eq: ['0', 'success'] }, 1, 0] } },
        failed:  { $sum: { $cond: [{ $eq: ['0', 'failed'] },  1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['0', 'pending'] }, 1, 0] } },
      }
    }
  ])

  const data = result || { totalRevenue: 0, total: 0, success: 0, failed: 0, pending: 0 }
  const successRate = data.total > 0
    ? ((data.success / data.total) * 100).toFixed(1)
    : '0.0'

  sendSuccess(res, {
    totalRevenue: data.totalRevenue,
    totalTransactions: data.total,
    successCount: data.success,
    failedCount: data.failed,
    pendingCount: data.pending,
    successRate: parseFloat(successRate)
  })
}

// ─── DAILY REVENUE (last 30 days) ─────────────────────────
export const getDailyRevenue = async (req, res) => {
  const days = parseInt(req.query.days) || 30
  const since = new Date()
  since.setDate(since.getDate() - days)

  const matchStage = req.user.role === 'admin'
    ? { status: 'success', createdAt: { $gte: since } }
    : { userId: req.user._id, status: 'success', createdAt: { $gte: since } }

  const data = await Transaction.aggregate([
    { $match: matchStage },
    {
      $addFields: {
        createdAt: { $toDate: '$createdAt' }  // force cast to Date
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$amount' },
        count:   { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', revenue: 1, count: 1 } }
  ])

  sendSuccess(res, { daily: data })
}

// ─── METHOD BREAKDOWN (card / upi / wallet) ────────────────
export const getMethodBreakdown = async (req, res) => {
  const matchStage = req.user.role === 'admin' ? {} : { userId: req.user._id }

  const data = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id:     '$method',
        count:   { $sum: 1 },
        revenue: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, '$amount', 0] } }
      }
    },
    { $project: { _id: 0, method: '$_id', count: 1, revenue: 1 } },
    { $sort: { count: -1 } }
  ])

  sendSuccess(res, { methods: data })
}

// ─── MONTHLY TRENDS (last 6 months) ───────────────────────
export const getMonthlyTrends = async (req, res) => {
  const since = new Date()
  since.setMonth(since.getMonth() - 6)

  const matchStage = req.user.role === 'admin'
    ? { createdAt: { $gte: since } }
    : { userId: req.user._id, createdAt: { $gte: since } }

  const data = await Transaction.aggregate([
    { $match: matchStage },
    {
      $addFields: {
        createdAt: { $toDate: '$createdAt' }  // force cast to Date
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        revenue: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, '$amount', 0] } },
        total:   { $sum: 1 },
        success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
        failed:  { $sum: { $cond: [{ $eq: ['$status', 'failed'] },  1, 0] } },
      }
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, month: '$_id', revenue: 1, total: 1, success: 1, failed: 1 } }
  ])

  sendSuccess(res, { monthly: data })
}

// ─── ADMIN ONLY: user count + recent signups ───────────────
export const getAdminStats = async (req, res) => {
  const [userCount, recentUsers] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt')
  ])

  sendSuccess(res, { userCount, recentUsers })
}
