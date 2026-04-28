import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { env } from '../config/env'

// 全局错误处理中间件
export function errorHandler(
  err: Error & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('服务器错误:', err)

  // 处理 multer 文件上传错误
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ success: false, error: '文件大小超出限制' })
      return
    }
    res.status(400).json({ success: false, error: `上传错误: ${err.message}` })
    return
  }

  const statusCode = err.status || 500
  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 && env.NODE_ENV === 'production'
      ? '服务器内部错误'
      : err.message,
  })
}
