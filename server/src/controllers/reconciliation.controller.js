import { runReconciliation } from '../services/reconciliation.service.js'
import ReconciliationReport from '../models/ReconciliationReport.js'
import { sendSuccess } from '../utils/apiResponse.js'

// ─── RUN RECONCILIATION ───────────────────────────────────
export const runReconciliationReport = async (req, res) => {
  const { date } = req.body  // optional: YYYY-MM-DD, defaults to today

  // Validate date format if provided
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      success: false,
      error: 'Date must be in YYYY-MM-DD format'
    })
  }

  const report = await runReconciliation(date, req.user._id)
  sendSuccess(res, { report }, 'Reconciliation complete', 201)
}

// ─── GET ALL REPORTS ──────────────────────────────────────
export const getReports = async (req, res) => {
  const { page = 1, limit = 10 } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  const [reports, total] = await Promise.all([
    ReconciliationReport.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('generatedBy', 'name'),
    ReconciliationReport.countDocuments()
  ])

  sendSuccess(res, {
    reports,
    pagination: {
      page: Number(page), limit: Number(limit),
      total, pages: Math.ceil(total / Number(limit))
    }
  })
}

// ─── GET SINGLE REPORT ────────────────────────────────────
export const getReport = async (req, res) => {
  const report = await ReconciliationReport.findById(req.params.id)
    .populate('generatedBy', 'name email')

  if (!report)
    return res.status(404).json({ success: false, error: 'Report not found' })

  sendSuccess(res, { report })
}

// ─── GET REPORT BY DATE ───────────────────────────────────
export const getReportByDate = async (req, res) => {
  const report = await ReconciliationReport.findOne({ date: req.params.date })
    .populate('generatedBy', 'name email')

  if (!report)
    return res.status(404).json({ success: false, error: 'No report for this date' })

  sendSuccess(res, { report })
}

// ─── AUTO-RUN DAILY (called by scheduler) ─────────────────
export const runDailyReconciliation = async () => {
  try {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const date = yesterday.toISOString().split('T')[0]
    await runReconciliation(date, null)
    console.log(`[RECONCILIATION] Daily run complete for ${date}`)
  } catch (err) {
    console.error('[RECONCILIATION] Daily run failed:', err.message)
  }
}
