import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true
  },
  amount: { type: Number, required: true, min: [1, 'Min amount is 1'] },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['card', 'upi', 'wallet'],
    required: true
  },
  description: { type: String, trim: true, maxlength: 200 },

  // ─── Fraud Detection Fields ───────────────────────────
  riskScore:   { type: Number, default: 0, min: 0, max: 100 },
  riskLevel:   { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  riskFlags:   [{ type: String }],   // list of triggered rules
  fraudStatus: {
    type: String,
    enum: ['clear', 'flagged', 'blocked', 'approved', 'rejected'],
    default: 'clear'
  },
  reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt:  { type: Date },
  reviewNote:  { type: String },
}, { timestamps: true })

transactionSchema.index({ userId: 1, createdAt: -1 })
transactionSchema.index({ status: 1 })
transactionSchema.index({ createdAt: -1 })
transactionSchema.index({ fraudStatus: 1 })
transactionSchema.index({ riskLevel: 1 })

// Static: random status simulation
transactionSchema.statics.randomStatus = function () {
  const roll = Math.random()
  if (roll < 0.70) return 'success'
  if (roll < 0.90) return 'failed'
  return 'pending'
}

export default mongoose.model('Transaction', transactionSchema)
