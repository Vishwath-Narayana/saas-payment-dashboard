import mongoose from 'mongoose'

const webhookDeliverySchema = new mongoose.Schema({
  webhookId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Webhook', required: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  event:      { type: String, required: true },
  payload:    { type: mongoose.Schema.Types.Mixed },
  // Delivery result
  status:     { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
  statusCode: { type: Number },
  response:   { type: String },
  attempts:   { type: Number, default: 0 },
  nextRetryAt:{ type: Date },
  deliveredAt:{ type: Date },
}, { timestamps: true })

webhookDeliverySchema.index({ webhookId: 1, createdAt: -1 })
webhookDeliverySchema.index({ status: 1, nextRetryAt: 1 })  // for retry worker

export default mongoose.model('WebhookDelivery', webhookDeliverySchema)
