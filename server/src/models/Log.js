import mongoose from 'mongoose'

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    enum: ['USER_SIGNUP', 'USER_LOGIN', 'PAYMENT_CREATED', 'PAYMENT_VIEWED'],
    required: true
  },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  // Denormalize name+email — logs shouldn't break if user deleted
  userName: String,
  userEmail: String,
}, { timestamps: true })

// Always fetch newest first
logSchema.index({ createdAt: -1 })
// Admin filter by user
logSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model('Log', logSchema)
