import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import {
  createWebhook, getWebhooks, getWebhook,
  toggleWebhook, deleteWebhook, rotateSecret, testWebhook
} from '../controllers/webhook.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = Router()

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, error: errors.array()[0].msg })
  next()
}

const createValidators = [
  body('url').isURL().withMessage('Valid URL required'),
  body('events').isArray({ min: 1 }).withMessage('At least one event required'),
]

router.use(verifyToken)  // all webhook routes protected

router.get('/',                    getWebhooks)
router.post('/', createValidators, validate, createWebhook)
router.get('/:id',                 getWebhook)
router.patch('/:id/toggle',        toggleWebhook)
router.delete('/:id',              deleteWebhook)
router.post('/:id/rotate-secret',  rotateSecret)
router.post('/:id/test',           testWebhook)

export default router
