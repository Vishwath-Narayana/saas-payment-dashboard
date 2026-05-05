import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { connectDB } from './config/db.js'
import './config/redis.js'
import { initSocket } from './config/socket.js'
import { initIO } from './config/socketInstance.js'
import authRoutes from './routes/auth.routes.js'
import transactionRoutes from './routes/transaction.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'
import adminRoutes from './routes/admin.routes.js'
import webhookRoutes from './routes/webhook.routes.js'
import { errorHandler } from './middleware/error.middleware.js'
import { retryFailedWebhooks } from './services/webhook.service.js'

const app = express()
const httpServer = createServer(app)
const io = initIO(httpServer)

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
}))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/webhooks', webhookRoutes)

// Error handler (must be last)
app.use(errorHandler)

// Init
initSocket(io)
connectDB()
  .then(() => {
    httpServer.listen(process.env.PORT || 5001, () =>
      console.log(`Server running on port ${process.env.PORT || 5001}`)
    )

    // Retry failed webhooks every 5 minutes
    setInterval(retryFailedWebhooks, 5 * 60 * 1000)
    console.log('Webhook retry worker started')
  })
  .catch((err) => {
    console.error('STARTUP ERROR:', err.message)
    console.error(err.stack)
    process.exit(1)
  })

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message)
  console.error(err.stack)
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message)
  console.error(err.stack)
  process.exit(1)
})

