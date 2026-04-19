import { Router } from 'express'
import {
  getAllUsers,
  getUserDetail,
  getAllLogs,
  getOverview
} from '../controllers/admin.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/role.middleware.js'

const router = Router()

// All admin routes — must be logged in + admin role
router.use(verifyToken, requireAdmin)

router.get('/overview',       getOverview)
router.get('/users',          getAllUsers)
router.get('/users/:id',      getUserDetail)
router.get('/logs',           getAllLogs)

export default router
