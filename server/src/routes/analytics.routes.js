import { Router } from 'express'
import {
  getSummary,
  getDailyRevenue,
  getMethodBreakdown,
  getMonthlyTrends,
  getAdminStats
} from '../controllers/analytics.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/role.middleware.js'

const router = Router()

// All protected — user gets own data, admin gets all
router.get('/summary',  verifyToken, getSummary)
router.get('/daily',    verifyToken, getDailyRevenue)
router.get('/methods',  verifyToken, getMethodBreakdown)
router.get('/monthly',  verifyToken, getMonthlyTrends)

// Admin only
router.get('/admin-stats', verifyToken, requireAdmin, getAdminStats)

export default router
