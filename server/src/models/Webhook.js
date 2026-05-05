import mongoose from 'mongoose'

const webhookSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true
  },
  url:    { type: String, required: true },
  secret: { type: String, required: true },  // HMAC signing secret
  events: [{
    type: String,
    enum: ['payment.created', 'payment.success', 'payment.failed', 'payment.pending']
  }],
  isActive: { type: Boolean, default: true },
  // Stats
  totalDeliveries:  { type: Number, default: 0 },
  failedDeliveries: { type: Number, default: 0 },
  lastDeliveredAt:  { type: Date },
}, { timestamps: true })

webhookSchema.index({ userId: 1 })

export default mongoose.model('Webhook', webhookSchema)
