import { Router } from 'express'
import { body } from 'express-validator'
import {
  createTransaction,
  getMyTransactions,
  getAllTransactions,
  getTransaction
} from '../controllers/transaction.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/role.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { idempotency } from '../middleware/idempotency.middleware.js'

const router = Router()

const createValidators = [
  body('amount')
    .isNumeric().withMessage('Amount must be a number')
    .custom(v => v >= 1).withMessage('Min amount is 1'),
  body('method')
    .isIn(['card', 'upi', 'wallet']).withMessage('Invalid method'),
  body('description')
    .optional()
    .isLength({ max: 200 }).withMessage('Description max 200 chars'),
]

// User routes
router.post('/', verifyToken, createValidators, validate, idempotency, createTransaction)
router.get('/',     verifyToken, getMyTransactions)
router.get('/:id',  verifyToken, getTransaction)

// Admin route — all transactions
router.get('/admin/all', verifyToken, requireAdmin, getAllTransactions)

export default router
