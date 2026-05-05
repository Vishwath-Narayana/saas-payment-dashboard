import Transaction from '../models/Transaction.js'
import { sendSuccess } from '../utils/apiResponse.js'

// ─── GET FLAGGED TRANSACTIONS ─────────────────────────────
export const getFlaggedTransactions = async (req, res) => {
  const { page = 1, limit = 20, riskLevel, fraudStatus = 'flagged' } = req.query

  const filter = {
    fraudStatus: fraudStatus === 'all' ? { $in: ['flagged', 'blocked', 'rejected'] } : fraudStatus
  }
  if (riskLevel) filter.riskLevel = riskLevel

  const skip = (Number(page) - 1) * Number(limit)

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ riskScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name'),
    Transaction.countDocuments(filter)
  ])

  sendSuccess(res, {
    transactions,
    pagination: {
      page: Number(page), limit: Number(limit),
      total, pages: Math.ceil(total / Number(limit))
    }
  })
}

// ─── FRAUD STATS ──────────────────────────────────────────
export const getFraudStats = async (req, res) => {
  const [stats] = await Transaction.aggregate([
    {
      $group: {
        _id: null,
        total:        { $sum: 1 },
        flagged:      { $sum: { $cond: [{ $eq: ['$fraudStatus', 'flagged'] },  1, 0] } },
        blocked:      { $sum: { $cond: [{ $eq: ['$fraudStatus', 'blocked'] },  1, 0] } },
        approved:     { $sum: { $cond: [{ $eq: ['$fraudStatus', 'approved'] }, 1, 0] } },
        rejected:     { $sum: { $cond: [{ $eq: ['$fraudStatus', 'rejected'] }, 1, 0] } },
        highRisk:     { $sum: { $cond: [{ $eq: ['$riskLevel', 'high'] },   1, 0] } },
        mediumRisk:   { $sum: { $cond: [{ $eq: ['$riskLevel', 'medium'] }, 1, 0] } },
        avgRiskScore: { $avg: '$riskScore' },
        blockedAmount:{ $sum: { $cond: [{ $eq: ['$fraudStatus', 'blocked'] }, '$amount', 0] } },
      }
    }
  ])

  sendSuccess(res, {
    stats: stats || {
      total: 0, flagged: 0, blocked: 0,
      approved: 0, rejected: 0, highRisk: 0,
      mediumRisk: 0, avgRiskScore: 0, blockedAmount: 0
    }
  })
}

// ─── REVIEW TRANSACTION (approve/reject) ──────────────────
export const reviewTransaction = async (req, res) => {
  const { action, note } = req.body  // action: 'approve' | 'reject'

  if (!['approve', 'reject'].includes(action))
    return res.status(400).json({ success: false, error: 'Action must be approve or reject' })

  const transaction = await Transaction.findById(req.params.id)
  if (!transaction)
    return res.status(404).json({ success: false, error: 'Transaction not found' })

  if (!['flagged', 'blocked'].includes(transaction.fraudStatus))
    return res.status(400).json({ success: false, error: 'Transaction is not under review' })

  transaction.fraudStatus = action === 'approve' ? 'approved' : 'rejected'
  transaction.reviewedBy  = req.user._id
  transaction.reviewedAt  = new Date()
  transaction.reviewNote  = note || ''

  // If approved → restore original status
  // If rejected → mark as failed
  if (action === 'reject') transaction.status = 'failed'

  await transaction.save()

  sendSuccess(res, { transaction }, `Transaction ${action}d`)
}

// ─── GET SINGLE TRANSACTION RISK DETAIL ──────────────────
export const getTransactionRisk = async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('reviewedBy', 'name email')

  if (!transaction)
    return res.status(404).json({ success: false, error: 'Transaction not found' })

  sendSuccess(res, {
    transaction,
    risk: {
      score:       transaction.riskScore,
      level:       transaction.riskLevel,
      flags:       transaction.riskFlags,
      fraudStatus: transaction.fraudStatus,
    }
  })
}
