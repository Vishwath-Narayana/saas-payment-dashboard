import Transaction from '../models/Transaction.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { createLog } from '../utils/createLog.js'
import { getIO } from '../config/socketInstance.js'

// ─── CREATE ───────────────────────────────────────────────
export const createTransaction = async (req, res) => {
  const { amount, method, description } = req.body

  const transaction = await Transaction.create({
    userId: req.user._id,
    amount,
    method,
    description,
    status: Transaction.randomStatus()   // 70% success / 20% failed / 10% pending
  })

  const populated = await transaction.populate('userId', 'name email')

  await createLog({
    userId: req.user._id,
    userName: req.user.name,
    userEmail: req.user.email,
    action: 'PAYMENT_CREATED',
    metadata: { amount, method, status: transaction.status, transactionId: transaction._id }
  })

  getIO().to(`user:${req.user._id}`).emit('new_transaction', populated)
  getIO().to('admin').emit('new_transaction', populated)
  getIO().to('admin').emit('stats_updated')

  sendSuccess(res, { transaction: populated }, 'Transaction created', 201)
}

// ─── GET MY TRANSACTIONS (user) ───────────────────────────
export const getMyTransactions = async (req, res) => {
  const {
    page = 1, limit = 10,
    status, method,
    startDate, endDate,
    search
  } = req.query

  const filter = { userId: req.user._id }

  if (status) filter.status = status
  if (method) filter.method = method
  if (startDate || endDate) {
    filter.createdAt = {}
    if (startDate) filter.createdAt.$gte = new Date(startDate)
    if (endDate)   filter.createdAt.$lte = new Date(endDate)
  }
  if (search && !isNaN(search)) {
    filter.amount = Number(search)
  }

  const skip = (Number(page) - 1) * Number(limit)

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email'),
    Transaction.countDocuments(filter)
  ])

  sendSuccess(res, {
    transactions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  })
}

// ─── GET ALL TRANSACTIONS (admin) ─────────────────────────
export const getAllTransactions = async (req, res) => {
  const {
    page = 1, limit = 10,
    status, method,
    startDate, endDate,
    userId
  } = req.query

  const filter = {}

  if (status)  filter.status = status
  if (method)  filter.method = method
  if (userId)  filter.userId = userId
  if (startDate || endDate) {
    filter.createdAt = {}
    if (startDate) filter.createdAt.$gte = new Date(startDate)
    if (endDate)   filter.createdAt.$lte = new Date(endDate)
  }

  const skip = (Number(page) - 1) * Number(limit)

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email'),
    Transaction.countDocuments(filter)
  ])

  sendSuccess(res, {
    transactions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  })
}

// ─── GET ONE ──────────────────────────────────────────────
export const getTransaction = async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('userId', 'name email')

  if (!transaction)
    return res.status(404).json({ success: false, error: 'Transaction not found' })

  if (
    req.user.role !== 'admin' &&
    transaction.userId._id.toString() !== req.user._id.toString()
  ) return res.status(403).json({ success: false, error: 'Forbidden' })

  await createLog({
    userId: req.user._id,
    userName: req.user.name,
    userEmail: req.user.email,
    action: 'PAYMENT_VIEWED',
    metadata: { transactionId: transaction._id }
  })

  sendSuccess(res, { transaction })
}
