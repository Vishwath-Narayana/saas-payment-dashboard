import Transaction from '../models/Transaction.js'
import User from '../models/User.js'
import ReconciliationReport from '../models/ReconciliationReport.js'

// Run full reconciliation for a given date
export const runReconciliation = async (date, userId) => {
  const targetDate = date || new Date().toISOString().split('T')[0]

  const startOfDay = new Date(`${targetDate}T00:00:00.000Z`)
  const endOfDay   = new Date(`${targetDate}T23:59:59.999Z`)

  console.log(`[RECONCILIATION] Running for ${targetDate}`)

  const discrepancies = []

  // ─── 1. Get all transactions for the day ──────────────
  const transactions = await Transaction.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  }).lean()

  // ─── 2. Summary stats ─────────────────────────────────
  const summary = {
    totalTransactions: transactions.length,
    totalRevenue:      0,
    successCount:      0,
    failedCount:       0,
    pendingCount:      0,
    flaggedCount:      0,
    blockedCount:      0,
  }

  transactions.forEach(t => {
    if (t.status === 'success')  { summary.successCount++; summary.totalRevenue += t.amount }
    if (t.status === 'failed')    summary.failedCount++
    if (t.status === 'pending')   summary.pendingCount++
    if (t.fraudStatus === 'flagged') summary.flaggedCount++
    if (t.fraudStatus === 'blocked') summary.blockedCount++
  })

  // ─── 3. Method breakdown ──────────────────────────────
  const methodMap = {}
  transactions.forEach(t => {
    if (!methodMap[t.method]) methodMap[t.method] = { count: 0, revenue: 0 }
    methodMap[t.method].count++
    if (t.status === 'success') methodMap[t.method].revenue += t.amount
  })
  const methodBreakdown = Object.entries(methodMap).map(([method, data]) => ({
    method, ...data
  }))

  // ─── CHECK 1: Orphaned transactions ───────────────────
  const userIds   = [...new Set(transactions.map(t => t.userId.toString()))]
  const existingUsers = await User.find({ _id: { $in: userIds } }).select('_id').lean()
  const existingIds   = new Set(existingUsers.map(u => u._id.toString()))

  const orphaned = transactions.filter(t => !existingIds.has(t.userId.toString()))
  if (orphaned.length > 0) {
    discrepancies.push({
      type:          'ORPHANED_TRANSACTION',
      severity:      'high',
      description:   `${orphaned.length} transaction(s) belong to deleted/non-existent users`,
      affectedCount: orphaned.length,
      affectedIds:   orphaned.map(t => t._id),
    })
  }

  // ─── CHECK 2: Stuck pending transactions ──────────────
  const twoHoursAgo  = new Date(Date.now() - 2 * 60 * 60 * 1000)
  const stuckPending = transactions.filter(t =>
    t.status === 'pending' && new Date(t.createdAt) < twoHoursAgo
  )
  if (stuckPending.length > 0) {
    discrepancies.push({
      type:          'STUCK_PENDING',
      severity:      'medium',
      description:   `${stuckPending.length} transaction(s) stuck in pending for > 2 hours`,
      affectedCount: stuckPending.length,
      affectedIds:   stuckPending.map(t => t._id),
    })
  }

  // ─── CHECK 3: High failure rate ───────────────────────
  if (summary.totalTransactions > 10) {
    const failureRate = (summary.failedCount / summary.totalTransactions) * 100
    if (failureRate > 30) {
      discrepancies.push({
        type:          'HIGH_FAILURE_RATE',
        severity:      failureRate > 50 ? 'high' : 'medium',
        description:   `High failure rate: ${failureRate.toFixed(1)}% of transactions failed (threshold: 30%)`,
        affectedCount: summary.failedCount,
        affectedIds:   [],
      })
    }
  }

  // ─── CHECK 4: Suspicious velocity per user ────────────
  const userTransactionCount = {}
  transactions.forEach(t => {
    const uid = t.userId.toString()
    userTransactionCount[uid] = (userTransactionCount[uid] || 0) + 1
  })

  const suspiciousUsers = Object.entries(userTransactionCount)
    .filter(([, count]) => count >= 20)

  if (suspiciousUsers.length > 0) {
    discrepancies.push({
      type:          'SUSPICIOUS_VELOCITY',
      severity:      'high',
      description:   `${suspiciousUsers.length} user(s) made 20+ transactions today`,
      affectedCount: suspiciousUsers.length,
      affectedIds:   suspiciousUsers.map(([uid]) => uid),
    })
  }

  // ─── CHECK 5: Revenue mismatch verification ───────────
  const [aggResult] = await Transaction.aggregate([
    { $match: { status: 'success', createdAt: { $gte: startOfDay, $lte: endOfDay } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ])
  const aggregatedRevenue = aggResult?.total || 0
  const calculatedRevenue = summary.totalRevenue

  if (Math.abs(aggregatedRevenue - calculatedRevenue) > 0.01) {
    discrepancies.push({
      type:          'AMOUNT_MISMATCH',
      severity:      'high',
      description:   `Revenue mismatch: calculated ₹${calculatedRevenue} vs aggregated ₹${aggregatedRevenue}`,
      affectedCount: 1,
      affectedIds:   [],
    })
  }

  // ─── Determine overall status ─────────────────────────
  let status = 'clean'
  if (discrepancies.length > 0) {
    const hasHigh = discrepancies.some(d => d.severity === 'high')
    status = hasHigh ? 'critical' : 'discrepancies_found'
  }

  // ─── Save or update report ────────────────────────────
  const report = await ReconciliationReport.findOneAndUpdate(
    { date: targetDate },
    {
      date: targetDate,
      generatedBy: userId,
      generatedAt: new Date(),
      summary,
      methodBreakdown,
      discrepancies,
      status,
      discrepancyCount: discrepancies.length,
    },
    { upsert: true, new: true }
  )

  console.log(`[RECONCILIATION] Done. Status: ${status}. Discrepancies: ${discrepancies.length}`)
  return report
}
