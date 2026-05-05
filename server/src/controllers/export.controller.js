import Transaction from '../models/Transaction.js'

export const exportTransactionsCSV = async (req, res) => {
  const { startDate, endDate, status, method } = req.query
  const isAdmin = req.user.role === 'admin'

  // Build filter
  const filter = {}
  if (!isAdmin) filter.userId = req.user._id
  if (status)   filter.status = status
  if (method)   filter.method = method
  if (startDate || endDate) {
    filter.createdAt = {}
    if (startDate) filter.createdAt.$gte = new Date(startDate)
    if (endDate)   filter.createdAt.$lte = new Date(endDate)
  }

  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .populate('userId', 'name email')
    .lean()

  if (transactions.length === 0) {
    return res.status(404).json({ success: false, error: 'No transactions found' })
  }

  // Build CSV
  const headers = isAdmin
    ? ['ID', 'User Name', 'User Email', 'Amount (₹)', 'Method', 'Status', 'Risk Level', 'Risk Score', 'Fraud Status', 'Description', 'Date']
    : ['ID', 'Amount (₹)', 'Method', 'Status', 'Risk Level', 'Description', 'Date']

  const rows = transactions.map(t => {
    const date = new Date(t.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    if (isAdmin) {
      return [
        t._id,
        t.userId?.name   || '',
        t.userId?.email  || '',
        t.amount,
        t.method,
        t.status,
        t.riskLevel   || 'low',
        t.riskScore   || 0,
        t.fraudStatus || 'clear',
        t.description || '',
        date
      ]
    }
    return [
      t._id,
      t.amount,
      t.method,
      t.status,
      t.riskLevel   || 'low',
      t.description || '',
      date
    ]
  })

  // Escape CSV values (handle commas + quotes in values)
  const escape = (val) => {
    const str = String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(escape).join(','))
  ].join('\n')

  // Set headers for file download
  const filename = `transactions-${req.user.role}-${new Date().toISOString().split('T')[0]}.csv`

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.send(csv)
}
