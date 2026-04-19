import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { connectDB } from './config/db.js'
import { initSocket } from './config/socket.js'
import authRoutes from './routes/auth.routes.js'
import transactionRoutes from './routes/transaction.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'
import adminRoutes from './routes/admin.routes.js'
import { errorHandler } from './middleware/error.middleware.js'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const httpServer = createServer(app)
export const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, credentials: true }
})

// Middleware
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())

// Rate limit auth routes only
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 })

// Routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/admin', adminRoutes)

// Error handler (must be last)
app.use(errorHandler)

// Init
initSocket(io)
connectDB().then(() => {
  httpServer.listen(process.env.PORT || 5000, () =>
    console.log(`Server running on port ${process.env.PORT || 5000}`)
  )
})
