import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import Transaction from './models/Transaction.js'
import Log from './models/Log.js'
dotenv.config({ path: new URL('../.env', import.meta.url).pathname })


const METHODS = ['card', 'upi', 'wallet']
const STATUSES = ['success', 'success', 'success', 'success', 'failed', 'failed', 'pending']
// ^ weighted: 4/7 success, 2/7 failed, 1/7 pending ≈ 70/20/10

const random = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomAmount = () => Math.floor(Math.random() * 9900) + 100  // ₹100–₹10000
const randomDate = (daysAgo) => {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo))
  d.setHours(Math.floor(Math.random() * 24))
  d.setMinutes(Math.floor(Math.random() * 60))
  return d
}

const seed = async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined in .env')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  // Wipe existing data
  await User.deleteMany({})
  await Transaction.deleteMany({})
  await Log.deleteMany({})
  console.log('Cleared existing data')

  // Create admin
  // bcrypt hash inside User model's pre-save hook will handle '123456' for User.create
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: '123456',
    role: 'admin'
  })
  console.log('Admin created → admin@example.com / 123456')

  // Hash passwords for insertMany (insertMany bypasses pre-save hooks usually)
  const hashedPassword = await bcrypt.hash('123456', 12)

  // Create 5 regular users
  const users = await User.insertMany([
    { name: 'Arjun Sharma',   email: 'arjun@example.com',   password: hashedPassword },
    { name: 'Priya Patel',    email: 'priya@example.com',    password: hashedPassword },
    { name: 'Rahul Gupta',    email: 'rahul@example.com',    password: hashedPassword },
    { name: 'Sneha Reddy',    email: 'sneha@example.com',    password: hashedPassword },
    { name: 'Vikram Singh',   email: 'vikram@example.com',   password: hashedPassword },
  ])
  console.log(`${users.length} users created`)

  // Create 80 transactions spread across last 30 days
  const allUsers = [...users]
  const transactions = []

  for (let i = 0; i < 120; i++) {
    const user = random(allUsers)
    const status = random(STATUSES)
    const amount = randomAmount()
    const createdAt = randomDate(30)

    transactions.push({
      userId: user._id,
      amount,
      status,
      method: random(METHODS),
      description: `Payment #${i + 1}`,
      createdAt,
      updatedAt: createdAt
    })
  }

  await Transaction.insertMany(transactions)
  console.log(`${transactions.length} transactions created`)

  // Create logs for each transaction
  const logs = transactions.map((t, i) => ({
    userId: t.userId,
    userName: allUsers.find(u => u._id.equals(t.userId))?.name || 'Unknown',
    userEmail: allUsers.find(u => u._id.equals(t.userId))?.email || '',
    action: 'PAYMENT_CREATED',
    metadata: { amount: t.amount, method: t.method, status: t.status },
    createdAt: t.createdAt
  }))

  await Log.insertMany(logs)
  console.log(`${logs.length} logs created`)

  console.log('\n✅ Seed complete!')
  console.log('─────────────────────────────')
  console.log('Admin:  admin@example.com / 123456')
  console.log('Users:  arjun / priya / rahul / sneha / vikram @example.com / 123456')
  console.log('─────────────────────────────')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
