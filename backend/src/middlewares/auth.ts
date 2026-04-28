import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import type { AuthRequest, UserPayload } from '../types'

// JWT 鉴权中间件
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    res.status(401).json({ success: false, error: '未登录，请先登录' })
    return
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as UserPayload
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Token 已过期，请重新登录' })
  }
}
