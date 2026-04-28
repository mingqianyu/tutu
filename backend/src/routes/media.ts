import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth'
import { uploadMedia, validateUploadedFile } from '../middlewares/upload'
import * as mediaController from '../controllers/mediaController'

const router = Router()

// 所有路由需要鉴权
router.use(authMiddleware)

// 上传媒体（多文件，最多 20 个）
router.post('/upload', uploadMedia.array('files', 20), validateUploadedFile, mediaController.uploadMedia)

// 获取媒体列表
router.get('/', mediaController.getList)

// 按月汇总（放在 /:id 前，避免被匹配为 id）
router.get('/monthly', mediaController.getMonthly)

// 获取媒体详情
router.get('/:id', mediaController.getDetail)

// 更新媒体备注
router.put('/:id', mediaController.update)

// 删除媒体
router.delete('/:id', mediaController.remove)

export default router
