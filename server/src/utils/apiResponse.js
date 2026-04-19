export const sendSuccess = (res, data, message = 'ok', status = 200) =>
  res.status(status).json({ success: true, message, data })

export const sendError = (res, error, status = 400) =>
  res.status(status).json({ success: false, error })
