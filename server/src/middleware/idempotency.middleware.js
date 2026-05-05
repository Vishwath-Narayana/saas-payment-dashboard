import redis from '../config/redis.js'

const IDEMPOTENCY_TTL = 86400  // 24 hours in seconds

export const idempotency = async (req, res, next) => {
  const key = req.headers['idempotency-key']

  // No key provided — skip (not all endpoints need it)
  if (!key) return next()

  // Validate key format (UUID v4)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(key)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid idempotency key format. Must be UUID v4.'
    })
  }

  // Namespace key per user — prevents cross-user key collisions
  const redisKey = `idempotency:${req.user._id}:${key}`

  try {
    const cached = await redis.get(redisKey)

    if (cached) {
      // Request already processed — return cached response
      const parsed = JSON.parse(cached)
      console.log(`[IDEMPOTENCY] Returning cached response for key: ${key}`)
      return res.status(parsed.status).json({
        ...parsed.body,
        idempotent: true   // flag so client knows this was a duplicate
      })
    }

    // Not seen before — intercept response to cache it
    const originalJson = res.json.bind(res)

    res.json = async (body) => {
      // Only cache successful responses
      if (res.statusCode < 400) {
        await redis.setex(
          redisKey,
          IDEMPOTENCY_TTL,
          JSON.stringify({ status: res.statusCode, body })
        )
      }
      return originalJson(body)
    }

    next()
  } catch (err) {
    // Redis failure — don't block the request, just skip caching
    console.error('[IDEMPOTENCY] Redis error:', err.message)
    next()
  }
}
