import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { signup, login, logout, getMe } from '../controllers/auth.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = Router()

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, error: errors.array()[0].msg })
  next()
}

router.post('/signup',
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  validate,
  signup
)

router.post('/login',
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
  validate,
  login
)

router.post('/logout', verifyToken, logout)
router.get('/me', verifyToken, getMe)

export default router
