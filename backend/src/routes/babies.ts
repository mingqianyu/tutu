import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth'
import { upload, validateUploadedFile } from '../middlewares/upload'
import * as babyController from '../controllers/babyController'

const router = Router()

// 所有接口需要鉴权
router.use(authMiddleware)

router.post('/', babyController.create)
router.get('/', babyController.getList)
router.get('/:id', babyController.getDetail)
router.put('/:id', babyController.update)
router.post('/:id/avatar', upload.single('file'), validateUploadedFile, babyController.uploadAvatar)
router.post('/:id/background', upload.single('file'), validateUploadedFile, babyController.uploadBackground)

export default router
