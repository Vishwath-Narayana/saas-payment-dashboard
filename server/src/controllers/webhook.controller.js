import crypto from 'crypto'
import Webhook from '../models/Webhook.js'
import WebhookDelivery from '../models/WebhookDelivery.js'
import { sendSuccess } from '../utils/apiResponse.js'

// Generate random secret
const generateSecret = () => crypto.randomBytes(32).toString('hex')

// ─── CREATE WEBHOOK ───────────────────────────────────────
export const createWebhook = async (req, res) => {
  const { url, events } = req.body

  // Validate URL
  try { new URL(url) } catch {
    return res.status(400).json({ success: false, error: 'Invalid URL' })
  }

  const webhook = await Webhook.create({
    userId: req.user._id,
    url,
    events: events || ['payment.created'],
    secret: generateSecret(),
  })

  sendSuccess(res, {
    webhook: {
      id:        webhook._id,
      url:       webhook.url,
      events:    webhook.events,
      secret:    webhook.secret,   // only shown once on creation
      isActive:  webhook.isActive,
      createdAt: webhook.createdAt,
    }
  }, 'Webhook created', 201)
}

// ─── GET MY WEBHOOKS ──────────────────────────────────────
export const getWebhooks = async (req, res) => {
  const webhooks = await Webhook.find({ userId: req.user._id })
    .select('-secret')  // never return secret after creation
    .sort({ createdAt: -1 })

  sendSuccess(res, { webhooks })
}

// ─── GET ONE WEBHOOK + RECENT DELIVERIES ─────────────────
export const getWebhook = async (req, res) => {
  const webhook = await Webhook.findOne({
    _id: req.params.id,
    userId: req.user._id
  }).select('-secret')

  if (!webhook)
    return res.status(404).json({ success: false, error: 'Webhook not found' })

  const deliveries = await WebhookDelivery.find({ webhookId: webhook._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('event status statusCode attempts createdAt deliveredAt')

  sendSuccess(res, { webhook, deliveries })
}

// ─── TOGGLE ACTIVE ────────────────────────────────────────
export const toggleWebhook = async (req, res) => {
  const webhook = await Webhook.findOne({
    _id: req.params.id,
    userId: req.user._id
  })

  if (!webhook)
    return res.status(404).json({ success: false, error: 'Webhook not found' })

  webhook.isActive = !webhook.isActive
  await webhook.save()

  sendSuccess(res, {
    webhook: { id: webhook._id, isActive: webhook.isActive }
  }, `Webhook ${webhook.isActive ? 'activated' : 'deactivated'}`)
}

// ─── DELETE WEBHOOK ───────────────────────────────────────
export const deleteWebhook = async (req, res) => {
  const webhook = await Webhook.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  })

  if (!webhook)
    return res.status(404).json({ success: false, error: 'Webhook not found' })

  // Delete delivery logs too
  await WebhookDelivery.deleteMany({ webhookId: req.params.id })

  sendSuccess(res, null, 'Webhook deleted')
}

// ─── ROTATE SECRET ────────────────────────────────────────
export const rotateSecret = async (req, res) => {
  const webhook = await Webhook.findOne({
    _id: req.params.id,
    userId: req.user._id
  })

  if (!webhook)
    return res.status(404).json({ success: false, error: 'Webhook not found' })

  webhook.secret = generateSecret()
  await webhook.save()

  sendSuccess(res, {
    secret: webhook.secret  // only time secret is returned again
  }, 'Secret rotated')
}

// ─── TEST WEBHOOK (manual ping) ──────────────────────────
export const testWebhook = async (req, res) => {
  const webhook = await Webhook.findOne({
    _id: req.params.id,
    userId: req.user._id
  })

  if (!webhook)
    return res.status(404).json({ success: false, error: 'Webhook not found' })

  const { triggerWebhooks } = await import('../services/webhook.service.js')

  await triggerWebhooks(req.user._id, webhook.events[0] || 'payment.created', {
    test: true,
    message: 'This is a test webhook delivery from PayDash',
    timestamp: new Date().toISOString(),
  })

  sendSuccess(res, null, 'Test webhook sent')
}
