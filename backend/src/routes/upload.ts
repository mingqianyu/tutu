import { Router, Response, NextFunction } from 'express'
import { authMiddleware } from '../middlewares/auth'
import { upload } from '../middlewares/upload'
import type { AuthRequest } from '../types'

const router = Router()

// 通用文件上传（需鉴权）
router.post(
  '/',
  authMiddleware,
  upload.single('file'),
  (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.file) {
      res.status(400).json({ success: false, error: '请选择文件' })
      return
    }

    const fileUrl = `/uploads/${req.file.filename}`
    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    })
  }
)

export default router
