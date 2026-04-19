import Log from '../models/Log.js'

export const createLog = async ({ userId, userName, userEmail, action, metadata = {} }) => {
  try {
    await Log.create({ userId, userName, userEmail, action, metadata })
  } catch (err) {
    // Logs must never crash the main request
    console.error('[LOG ERROR]', err.message)
  }
}
