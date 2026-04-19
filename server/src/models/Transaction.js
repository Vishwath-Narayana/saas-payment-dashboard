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
}, { timestamps: true })

// Compound index — userId + createdAt covers 90% of queries
transactionSchema.index({ userId: 1, createdAt: -1 })
// Status index — for filter queries
transactionSchema.index({ status: 1 })
// Admin "all transactions" sorted by date
transactionSchema.index({ createdAt: -1 })

// Static: random status simulation
transactionSchema.statics.randomStatus = function () {
  const roll = Math.random()
  if (roll < 0.70) return 'success'
  if (roll < 0.90) return 'failed'
  return 'pending'
}

export default mongoose.model('Transaction', transactionSchema)
