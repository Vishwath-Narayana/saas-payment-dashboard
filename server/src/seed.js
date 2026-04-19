import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'

dotenv.config()

const seed = async () => {
  try {
    await connectDB()
    console.log('Seeding data...')
    // Add seeding logic here
    console.log('Data seeded successfully')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding data:', error)
    process.exit(1)
  }
}

seed()
