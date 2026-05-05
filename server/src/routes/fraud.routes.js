import { Router } from 'express'
import {
  getFlaggedTransactions,
  getFraudStats,
  reviewTransaction,
  getTransactionRisk
} from '../controllers/fraud.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/role.middleware.js'

const router = Router()

router.use(verifyToken, requireAdmin)  // all fraud routes = admin only

router.get('/stats',              getFraudStats)
router.get('/flagged',            getFlaggedTransactions)
router.get('/transactions/:id',   getTransactionRisk)
router.post('/review/:id',        reviewTransaction)

export default router
