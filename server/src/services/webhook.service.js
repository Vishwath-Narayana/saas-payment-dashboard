import crypto from 'crypto'
import Webhook from '../models/Webhook.js'
import WebhookDelivery from '../models/WebhookDelivery.js'

const MAX_ATTEMPTS = 3
const RETRY_DELAYS = [60, 300, 900]  // 1min, 5min, 15min in seconds

// Sign payload with HMAC-SHA256
const signPayload = (secret, payload) => {
  const timestamp = Date.now()
  const body      = JSON.stringify(payload)
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex')
  return { signature: `t=${timestamp},v1=${signature}`, body }
}

// Deliver single webhook
const deliverWebhook = async (webhook, delivery, payload) => {
  const { signature, body } = signPayload(webhook.secret, payload)

  try {
    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 10000)  // 10s timeout

    const response = await fetch(webhook.url, {
      method:  'POST',
      headers: {
        'Content-Type':       'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event':     delivery.event,
        'X-Webhook-Delivery':  delivery._id.toString(),
      },
      body:   body,
      signal: controller.signal,
    })

    clearTimeout(timeout)

    const responseText = await response.text().catch(() => '')

    if (response.ok) {
      // Success
      await WebhookDelivery.findByIdAndUpdate(delivery._id, {
        status:      'success',
        statusCode:  response.status,
        response:    responseText.slice(0, 500),
        deliveredAt: new Date(),
        attempts:    delivery.attempts + 1,
      })

      await Webhook.findByIdAndUpdate(webhook._id, {
        $inc: { totalDeliveries: 1 },
        lastDeliveredAt: new Date()
      })

      console.log(`[WEBHOOK] Delivered to ${webhook.url} → ${response.status}`)
    } else {
      throw new Error(`HTTP ${response.status}: ${responseText.slice(0, 200)}`)
    }

  } catch (err) {
    const attempts = delivery.attempts + 1
    console.error(`[WEBHOOK] Failed attempt ${attempts} for ${webhook.url}: ${err.message}`)

    if (attempts >= MAX_ATTEMPTS) {
      // Max retries reached — mark failed
      await WebhookDelivery.findByIdAndUpdate(delivery._id, {
        status:    'failed',
        response:  err.message.slice(0, 500),
        attempts,
      })
      await Webhook.findByIdAndUpdate(webhook._id, {
        $inc: { failedDeliveries: 1 }
      })
    } else {
      // Schedule retry
      const delaySeconds = RETRY_DELAYS[attempts - 1] || 900
      const nextRetryAt  = new Date(Date.now() + delaySeconds * 1000)

      await WebhookDelivery.findByIdAndUpdate(delivery._id, {
        status:     'pending',
        response:   err.message.slice(0, 500),
        attempts,
        nextRetryAt,
      })
    }
  }
}

// Main function — called after payment created
export const triggerWebhooks = async (userId, event, payload) => {
  try {
    // Find all active webhooks for this user that listen to this event
    const webhooks = await Webhook.find({
      userId,
      isActive: true,
      events: event
    })

    if (webhooks.length === 0) return

    console.log(`[WEBHOOK] Triggering ${webhooks.length} webhook(s) for event: ${event}`)

    // Create delivery records + deliver in parallel
    await Promise.allSettled(
      webhooks.map(async (webhook) => {
        const delivery = await WebhookDelivery.create({
          webhookId: webhook._id,
          userId,
          event,
          payload,
          attempts: 0,
        })
        await deliverWebhook(webhook, delivery, payload)
      })
    )
  } catch (err) {
    console.error('[WEBHOOK] triggerWebhooks error:', err.message)
  }
}

// Retry worker — call this periodically
export const retryFailedWebhooks = async () => {
  const now      = new Date()
  const pending  = await WebhookDelivery.find({
    status:     'pending',
    attempts:   { $lt: MAX_ATTEMPTS },
    nextRetryAt:{ $lte: now }
  }).populate('webhookId')

  if (pending.length === 0) return

  console.log(`[WEBHOOK] Retrying ${pending.length} failed deliveries`)

  await Promise.allSettled(
    pending.map(delivery =>
      deliverWebhook(delivery.webhookId, delivery, delivery.payload)
    )
  )
}
