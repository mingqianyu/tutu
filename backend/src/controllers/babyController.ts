import { Response, NextFunction } from 'express'
import type { AuthRequest } from '../types'
import * as babyService from '../services/babyService'

// 解析并校验路由 ID 参数
function parseId(raw: string | string[]): number {
  const id = Number(Array.isArray(raw) ? raw[0] : raw)
  if (!Number.isInteger(id) || id <= 0) {
    throw Object.assign(new Error('无效的 ID 参数'), { status: 400 })
  }
  return id
}

// 获取宝宝列表
export async function getList(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const list = await babyService.getBabyList(req.user!.userId)
    res.json({ success: true, data: list })
  } catch (error) {
    next(error)
  }
}

// 获取宝宝详情
export async function getDetail(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id)
    const baby = await babyService.getBabyById(id, req.user!.userId)
    res.json({ success: true, data: baby })
  } catch (error) {
    const err = error as Error & { status?: number }
    if (err.status) {
      res.status(err.status).json({ success: false, error: err.message })
      return
    }
    next(error)
  }
}

// 添加宝宝
export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { nickname, gender, birthday, birth_method, avatar, relation } = req.body

    if (!nickname || !birthday || !gender) {
      res.status(400).json({ success: false, error: '请填写宝宝小名、性别和出生日期' })
      return
    }

    if (nickname.length < 2 || nickname.length > 20) {
      res.status(400).json({ success: false, error: '宝宝小名长度需为 2-20 个字符' })
      return
    }

    if (!['male', 'female'].includes(gender)) {
      res.status(400).json({ success: false, error: '性别只能选择 male 或 female' })
      return
    }

    if (isNaN(Date.parse(birthday))) {
      res.status(400).json({ success: false, error: '出生日期格式不正确' })
      return
    }

    const baby = await babyService.createBaby(req.user!.userId, {
      nickname,
      gender,
      birthday,
      birth_method,
      avatar,
      relation,
    })

    res.status(201).json({ success: true, data: baby })
  } catch (error) {
    next(error)
  }
}

// 更新宝宝信息
export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id)

    // 输入校验（仅校验提供了的字段）
    const { nickname, gender, birthday } = req.body
    if (nickname !== undefined) {
      if (typeof nickname !== 'string' || nickname.length < 2 || nickname.length > 20) {
        res.status(400).json({ success: false, error: '宝宝小名长度需为 2-20 个字符' })
        return
      }
    }
    if (gender !== undefined && !['male', 'female'].includes(gender)) {
      res.status(400).json({ success: false, error: '性别只能选择 male 或 female' })
      return
    }
    if (birthday !== undefined && isNaN(Date.parse(birthday))) {
      res.status(400).json({ success: false, error: '出生日期格式不正确' })
      return
    }

    const baby = await babyService.updateBaby(id, req.user!.userId, req.body)
    res.json({ success: true, data: baby })
  } catch (error) {
    const err = error as Error & { status?: number }
    if (err.status) {
      res.status(err.status).json({ success: false, error: err.message })
      return
    }
    next(error)
  }
}

// 上传宝宝头像
export async function uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id)

    if (!req.file) {
      res.status(400).json({ success: false, error: '请选择文件' })
      return
    }

    const avatarUrl = `/uploads/${req.file.filename}`
    const baby = await babyService.updateAvatar(
      id,
      req.user!.userId,
      avatarUrl
    )
    res.json({ success: true, data: baby })
  } catch (error) {
    next(error)
  }
}

// 上传宝宝背景图
export async function uploadBackground(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id)

    if (!req.file) {
      res.status(400).json({ success: false, error: '请选择文件' })
      return
    }

    const bgUrl = `/uploads/${req.file.filename}`
    const baby = await babyService.updateBackground(
      id,
      req.user!.userId,
      bgUrl
    )
    res.json({ success: true, data: baby })
  } catch (error) {
    next(error)
  }
}
