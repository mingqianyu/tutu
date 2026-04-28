import { Response, NextFunction } from 'express'
import type { AuthRequest } from '../types'
import * as mediaService from '../services/mediaService'

// 校验并解析正整数参数
function parsePositiveInt(value: unknown, fieldName: string): number {
  const num = Number(value)
  if (!Number.isInteger(num) || num <= 0) {
    throw Object.assign(new Error(`${fieldName} 必须是正整数`), { status: 400 })
  }
  return num
}

// 安全解析可选的正整数参数（用于分页等可选场景）
function parseOptionalPositiveInt(value: unknown, fieldName: string): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return parsePositiveInt(value, fieldName)
}

// 上传媒体（多文件）
export async function uploadMedia(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { baby_id, taken_at } = req.body
    const files = req.files as Express.Multer.File[]

    if (!baby_id) {
      res.status(400).json({ success: false, error: '缺少 baby_id 参数' })
      return
    }

    const babyIdNum = parsePositiveInt(baby_id, 'baby_id')

    if (!files || files.length === 0) {
      res.status(400).json({ success: false, error: '请选择要上传的文件' })
      return
    }

    const results = []
    for (const file of files) {
      // 根据 mimetype 判断类型
      const type = file.mimetype.startsWith('video/') ? 'video' : 'photo'
      const url = `/${file.path.replace(/\\/g, '/')}`

      const record = await mediaService.create(
        babyIdNum,
        req.user!.userId,
        {
          type,
          url,
          thumbnail_url: req.body.thumbnail_url || null,
          note: req.body.note || null,
          duration: req.body.duration ? Number(req.body.duration) : null,
          file_size: file.size,
          taken_at: taken_at || new Date().toISOString().slice(0, 19).replace('T', ' '),
        }
      )
      results.push(record)
    }

    res.status(201).json({ success: true, data: results })
  } catch (error) {
    next(error)
  }
}

// 获取媒体列表
export async function getList(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { baby_id, type, month, page, page_size } = req.query

    if (!baby_id) {
      res.status(400).json({ success: false, error: '缺少 baby_id 参数' })
      return
    }

    const babyIdNum = parsePositiveInt(baby_id, 'baby_id')

    const pageNum = parseOptionalPositiveInt(page, 'page')
    const pageSizeNum = parseOptionalPositiveInt(page_size, 'page_size')

    const result = await mediaService.getList(
      babyIdNum,
      req.user!.userId,
      {
        type: type as 'photo' | 'video' | undefined,
        month: month as string | undefined,
        page: pageNum,
        page_size: pageSizeNum,
      }
    )

    res.json({
      success: true,
      data: result.list,
      meta: {
        total: result.total,
        page: pageNum ?? 1,
        pageSize: pageSizeNum ?? 50,
      },
    })
  } catch (error) {
    next(error)
  }
}

// 按月汇总
export async function getMonthly(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { baby_id, type } = req.query

    if (!baby_id) {
      res.status(400).json({ success: false, error: '缺少 baby_id 参数' })
      return
    }

    const babyIdNum = parsePositiveInt(baby_id, 'baby_id')

    const data = await mediaService.getMonthly(
      babyIdNum,
      req.user!.userId,
      type as 'photo' | 'video' | undefined
    )

    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

// 获取媒体详情
export async function getDetail(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const idNum = parsePositiveInt(req.params.id, 'id')

    const record = await mediaService.getById(idNum, req.user!.userId)

    if (!record) {
      res.status(404).json({ success: false, error: '媒体不存在' })
      return
    }

    res.json({ success: true, data: record })
  } catch (error) {
    next(error)
  }
}

// 更新媒体备注
export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const idNum = parsePositiveInt(req.params.id, 'id')

    // 仅提取允许更新的字段
    const { note } = req.body
    const record = await mediaService.update(idNum, req.user!.userId, { note })

    res.json({ success: true, data: record })
  } catch (error) {
    next(error)
  }
}

// 删除媒体
export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const idNum = parsePositiveInt(req.params.id, 'id')

    await mediaService.remove(idNum, req.user!.userId)

    res.json({ success: true, message: '删除成功' })
  } catch (error) {
    next(error)
  }
}
