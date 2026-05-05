import mongoose from 'mongoose'

const reconciliationReportSchema = new mongoose.Schema({
  date:       { type: String, required: true, unique: true }, // YYYY-MM-DD
  generatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  generatedAt:{ type: Date, default: Date.now },

  // Summary
  summary: {
    totalTransactions: { type: Number, default: 0 },
    totalRevenue:      { type: Number, default: 0 },
    successCount:      { type: Number, default: 0 },
    failedCount:       { type: Number, default: 0 },
    pendingCount:      { type: Number, default: 0 },
    flaggedCount:      { type: Number, default: 0 },
    blockedCount:      { type: Number, default: 0 },
  },

  // Method breakdown
  methodBreakdown: [{
    method:  String,
    count:   Number,
    revenue: Number,
  }],

  // Discrepancies found
  discrepancies: [{
    type: {
      type: String,
      enum: [
        'ORPHANED_TRANSACTION',   // userId doesn't exist
        'STUCK_PENDING',          // pending > 24hrs
        'DUPLICATE_IDEMPOTENCY',  // same idempotency key used twice
        'AMOUNT_MISMATCH',        // revenue calculation mismatch
        'HIGH_FAILURE_RATE',      // failure rate > 30%
        'SUSPICIOUS_VELOCITY',    // user with 20+ transactions in a day
      ]
    },
    severity:      { type: String, enum: ['low', 'medium', 'high'] },
    description:   String,
    affectedCount: Number,
    affectedIds:   [mongoose.Schema.Types.ObjectId],
  }],

  // Status
  status: {
    type: String,
    enum: ['clean', 'discrepancies_found', 'critical'],
    default: 'clean'
  },
  discrepancyCount: { type: Number, default: 0 },
}, { timestamps: true })

reconciliationReportSchema.index({ date: -1 })

export default mongoose.model('ReconciliationReport', reconciliationReportSchema)
