import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'

// 确保上传目录存在
const uploadDir = env.UPLOAD_DIR
const thumbnailDir = path.join(uploadDir, 'thumbnails')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
if (!fs.existsSync(thumbnailDir)) {
  fs.mkdirSync(thumbnailDir, { recursive: true })
}

// 允许的文件扩展名白名单
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.webm'])

// multer 存储配置
const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadDir)
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error('不支持的文件扩展名'), '')
    }
    const name = `${Date.now()}-${crypto.randomUUID()}${ext}`
    cb(null, name)
  },
})

// 文件类型过滤
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm',
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('不支持的文件类型'))
  }
}

// 单文件上传（通用，限制 10MB）
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE, // 10MB
  },
})

// 多文件上传（云相册，限制 100MB 以支持视频）
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
export const uploadMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE,
  },
})

// Magic Bytes 签名表（用于校验文件真实类型）
const MAGIC_SIGNATURES: Record<string, { offset: number; bytes: number[] }[]> = {
  'image/jpeg': [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  'image/png': [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] }],
  'image/gif': [{ offset: 0, bytes: [0x47, 0x49, 0x46] }],
  'image/webp': [{ offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }],
  'video/mp4': [{ offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }],
  'video/quicktime': [{ offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }],
  'video/webm': [{ offset: 0, bytes: [0x1a, 0x45, 0xdf, 0xa3] }],
}

// 校验文件 magic bytes 是否与声明 MIME 类型一致
async function checkMagicBytes(filePath: string, mimetype: string): Promise<boolean> {
  const signatures = MAGIC_SIGNATURES[mimetype]
  if (!signatures) return true // 无签名定义则跳过

  const fd = await fs.promises.open(filePath, 'r')
  try {
    const buf = Buffer.alloc(16)
    await fd.read(buf, 0, 16, 0)
    return signatures.some(sig =>
      sig.bytes.every((byte, i) => buf[sig.offset + i] === byte)
    )
  } finally {
    await fd.close()
  }
}

// Multer 错误处理中间件：将 multer 错误转为友好的 JSON 响应
export function handleMulterError(err: Error, _req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: '文件大小超出限制',
      LIMIT_FILE_COUNT: '文件数量超出限制',
      LIMIT_UNEXPECTED_FILE: '不允许的字段名',
    }
    res.status(400).json({ success: false, error: messages[err.code] ?? `上传错误: ${err.code}` })
    return
  }
  if (err.message === '不支持的文件类型' || err.message === '不支持的文件扩展名') {
    res.status(400).json({ success: false, error: err.message })
    return
  }
  next(err)
}

// 上传后校验中间件：验证文件真实内容与声明类型一致（支持单文件和多文件）
export function validateUploadedFile(req: Request, res: Response, next: NextFunction) {
  // 收集所有待校验文件
  const files: Express.Multer.File[] = []
  if (req.file) files.push(req.file)
  if (Array.isArray(req.files)) files.push(...req.files)
  if (files.length === 0) return next()

  Promise.all(files.map(async (file) => {
    const valid = await checkMagicBytes(file.path, file.mimetype)
    if (!valid) {
      await fs.promises.unlink(file.path).catch(() => {})
      return file.originalname
    }
    return null
  }))
    .then(results => {
      const invalidFiles = results.filter(Boolean)
      if (invalidFiles.length > 0) {
        res.status(400).json({
          success: false,
          error: `文件内容与声明类型不匹配: ${invalidFiles.join(', ')}`,
        })
        return
      }
      next()
    })
    .catch(next)
}
