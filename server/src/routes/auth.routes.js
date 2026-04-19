import { Router } from 'express'
import { body } from 'express-validator'
import { signup, login, logout, getMe } from '../controllers/auth.controller.js'
import { validate } from '../middleware/validate.middleware.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = Router()

const signupValidators = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
]

const loginValidators = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
]

router.post('/signup', signupValidators, validate, signup)
router.post('/login',  loginValidators,  validate, login)
router.post('/logout', verifyToken, logout)
router.get('/me',      verifyToken, getMe)

export default router
