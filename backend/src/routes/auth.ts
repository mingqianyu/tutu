import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth'
import * as authController from '../controllers/authController'

const router = Router()

// 公开接口
router.post('/login', authController.login)

// 需要鉴权的接口
router.post('/logout', authMiddleware, authController.logout)
router.get('/profile', authMiddleware, authController.getProfile)
router.put('/profile', authMiddleware, authController.updateProfile)

export default router
