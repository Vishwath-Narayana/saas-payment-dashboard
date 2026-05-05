import { Router } from 'express'
import { exportTransactionsCSV } from '../controllers/export.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/transactions/csv', verifyToken, exportTransactionsCSV)

export default router
