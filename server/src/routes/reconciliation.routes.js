import { Router } from 'express'
import {
  runReconciliationReport,
  getReports,
  getReport,
  getReportByDate
} from '../controllers/reconciliation.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/role.middleware.js'

const router = Router()

router.use(verifyToken, requireAdmin)

router.post('/run',          runReconciliationReport)   // manual trigger
router.get('/',              getReports)                // all reports
router.get('/date/:date',    getReportByDate)           // by date YYYY-MM-DD
router.get('/:id',           getReport)                 // by ID

export default router
