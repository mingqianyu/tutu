import { Response, NextFunction } from 'express'
import type { AuthRequest } from '../types'
import * as authService from '../services/authService'

// 登录
export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      res.status(400).json({ success: false, error: '请输入用户名和密码' })
      return
    }

    if (username.length < 2 || username.length > 50) {
      res.status(400).json({ success: false, error: '用户名长度需为 2-50 个字符' })
      return
    }

    if (password.length < 6 || password.length > 50) {
      res.status(400).json({ success: false, error: '密码长度需为 6-50 个字符' })
      return
    }

    const result = await authService.login(username, password)
    res.json({ success: true, data: result })
  } catch (error) {
    const err = error as Error & { status?: number }
    if (err.status) {
      res.status(err.status).json({ success: false, error: err.message })
      return
    }
    next(error)
  }
}

// 登出（前端清除 token 即可，后端仅返回成功）
export async function logout(_req: AuthRequest, res: Response) {
  res.json({ success: true, message: '已退出登录' })
}

// 获取当前用户信息
export async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId
    const profile = await authService.getProfile(userId)
    res.json({ success: true, data: profile })
  } catch (error) {
    next(error)
  }
}

// 更新用户信息
export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId
    const result = await authService.updateProfile(userId, req.body)
    res.json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}
