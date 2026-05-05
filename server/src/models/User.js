import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name required'], trim: true },
  email: {
    type: String, required: [true, 'Email required'],
    unique: true, lowercase: true, trim: true
  },
  password: {
    type: String, required: [true, 'Password required'],
    minlength: 6, select: false   // never returned in queries by default
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  refreshToken: { type: String, select: false },
}, { timestamps: true })

// Hash before save - removed next as it is async
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

// Instance method — compare password on login
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

export default mongoose.model('User', userSchema)
