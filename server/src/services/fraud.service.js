import Transaction from '../models/Transaction.js'

// ─── RULES ────────────────────────────────────────────────
// Each rule returns { score, flag } if triggered, null if not

const rules = [

  // Rule 1: Large amount
  {
    name: 'LARGE_AMOUNT',
    description: 'Transaction amount exceeds ₹50,000',
    check: async ({ amount }) => {
      if (amount > 50000) {
        const score = amount > 100000 ? 40 : 25
        return { score, flag: `Large amount: ₹${amount}` }
      }
      return null
    }
  },

  // Rule 2: Velocity — too many transactions in short time
  {
    name: 'HIGH_VELOCITY',
    description: '5+ transactions in last 10 minutes',
    check: async ({ userId }) => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
      const count = await Transaction.countDocuments({
        userId,
        createdAt: { $gte: tenMinutesAgo }
      })
      if (count >= 5) {
        const score = Math.min(count * 8, 50)
        return { score, flag: `High velocity: ${count} transactions in 10 minutes` }
      }
      return null
    }
  },

  // Rule 3: Spike — amount much higher than user's average
  {
    name: 'AMOUNT_SPIKE',
    description: 'Amount is 5x higher than user average',
    check: async ({ userId, amount }) => {
      const [result] = await Transaction.aggregate([
        { $match: { userId, status: 'success' } },
        { $group: { _id: null, avgAmount: { $avg: '$amount' } } }
      ])
      if (result && result.avgAmount > 0) {
        const ratio = amount / result.avgAmount
        if (ratio > 5) {
          const score = Math.min(ratio * 5, 35)
          return { score, flag: `Amount spike: ${ratio.toFixed(1)}x above average (avg: ₹${Math.round(result.avgAmount)})` }
        }
      }
      return null
    }
  },

  // Rule 4: Repeated failed transactions
  {
    name: 'REPEATED_FAILURES',
    description: '3+ failed transactions in last hour',
    check: async ({ userId }) => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const failCount  = await Transaction.countDocuments({
        userId,
        status:    'failed',
        createdAt: { $gte: oneHourAgo }
      })
      if (failCount >= 3) {
        const score = Math.min(failCount * 10, 40)
        return { score, flag: `Repeated failures: ${failCount} failed in last hour` }
      }
      return null
    }
  },

  // Rule 5: Odd hours (midnight to 4am)
  {
    name: 'ODD_HOURS',
    description: 'Transaction at unusual hour (12am-4am)',
    check: async () => {
      const hour = new Date().getHours()
      if (hour >= 0 && hour < 4) {
        return { score: 15, flag: `Odd hours: transaction at ${hour}:00am` }
      }
      return null
    }
  },

  // Rule 6: Round amount (potential structuring)
  {
    name: 'ROUND_AMOUNT',
    description: 'Suspiciously round large amount',
    check: async ({ amount }) => {
      if (amount >= 10000 && amount % 10000 === 0) {
        return { score: 10, flag: `Round amount structuring: ₹${amount}` }
      }
      return null
    }
  },

  // Rule 7: Daily limit exceeded
  {
    name: 'DAILY_LIMIT',
    description: 'Daily transaction total exceeds ₹2,00,000',
    check: async ({ userId, amount }) => {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const [result] = await Transaction.aggregate([
        {
          $match: {
            userId,
            status:    'success',
            createdAt: { $gte: startOfDay }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])

      const dailyTotal = (result?.total || 0) + amount
      if (dailyTotal > 200000) {
        return { score: 35, flag: `Daily limit: ₹${dailyTotal} total today` }
      }
      return null
    }
  },
]

// ─── MAIN SCORING FUNCTION ────────────────────────────────
export const assessFraudRisk = async ({ userId, amount, method }) => {
  const context = { userId, amount, method }

  // Run all rules in parallel
  const results = await Promise.allSettled(
    rules.map(rule => rule.check(context))
  )

  let totalScore = 0
  const flags    = []

  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value) {
      totalScore += result.value.score
      flags.push(result.value.flag)
    } else if (result.status === 'rejected') {
      console.error(`[FRAUD] Rule ${rules[i].name} failed:`, result.reason?.message)
    }
  })

  // Cap at 100
  totalScore = Math.min(totalScore, 100)

  // Determine risk level + fraud status
  let riskLevel   = 'low'
  let fraudStatus = 'clear'

  if (totalScore >= 70) {
    riskLevel   = 'high'
    fraudStatus = 'blocked'
  } else if (totalScore >= 40) {
    riskLevel   = 'medium'
    fraudStatus = 'flagged'
  }

  return { riskScore: totalScore, riskLevel, riskFlags: flags, fraudStatus }
}
