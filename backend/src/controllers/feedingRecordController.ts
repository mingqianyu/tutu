import { Response, NextFunction } from 'express'
import type { AuthRequest } from '../types'
import * as feedingRecordService from '../services/feedingRecordService'

// 有效的喂养记录类型
const VALID_TYPES: feedingRecordService.FeedingType[] = [
  'breast_milk', 'bottle_milk', 'formula', 'solid_food', 'water', 'diaper', 'sleep'
]

// 解析并校验路由 ID 参数
function parseId(raw: string | string[]): number {
  const id = Number(Array.isArray(raw) ? raw[0] : raw)
  if (!Number.isInteger(id) || id <= 0) {
    throw Object.assign(new Error('无效的 ID 参数'), { status: 400 })
  }
  return id
}

// 获取喂养记录列表
export async function getList(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { baby_id, type, date, start_date, end_date, page, page_size } = req.query

    if (!baby_id) {
      res.status(400).json({ success: false, error: '缺少 baby_id 参数' })
      return
    }

    const result = await feedingRecordService.getList(
      Number(baby_id),
      req.user!.userId,
      {
        type: type as feedingRecordService.FeedingType | undefined,
        date: date as string | undefined,
        start_date: start_date as string | undefined,
        end_date: end_date as string | undefined,
        page: page ? Number(page) : undefined,
        page_size: page_size ? Number(page_size) : undefined
      }
    )

    res.json({
      success: true,
      data: result.list,
      meta: {
        total: result.total,
        page: Number(page) || 1,
        pageSize: Number(page_size) || 50
      }
    })
  } catch (error) {
    next(error)
  }
}

// 获取喂养记录详情
export async function getDetail(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id)
    const record = await feedingRecordService.getById(id, req.user!.userId)

    if (!record) {
      res.status(404).json({ success: false, error: '记录不存在' })
      return
    }

    res.json({ success: true, data: record })
  } catch (error) {
    next(error)
  }
}

// 创建喂养记录
export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { baby_id, type, start_time, amount, food_name } = req.body

    if (!baby_id || !type || !start_time) {
      res.status(400).json({ success: false, error: '缺少必填字段：baby_id, type, start_time' })
      return
    }

    // 类型枚举校验
    if (!VALID_TYPES.includes(type)) {
      res.status(400).json({ success: false, error: `type 必须是以下之一: ${VALID_TYPES.join(', ')}` })
      return
    }

    // 类型特定校验
    if (['bottle_milk', 'formula', 'water'].includes(type)) {
      if (amount !== undefined && amount !== null && (amount < 0 || amount > 500)) {
        res.status(400).json({ success: false, error: '容量范围需为 0-500 ml' })
        return
      }
    }

    if (type === 'solid_food') {
      if (!food_name || food_name.length < 1 || food_name.length > 50) {
        res.status(400).json({ success: false, error: '辅食名称长度需为 1-50 个字符' })
        return
      }
      if (amount !== undefined && amount !== null && (amount < 0 || amount > 1000)) {
        res.status(400).json({ success: false, error: '辅食重量范围需为 0-1000 g' })
        return
      }
    }

    const record = await feedingRecordService.create(
      Number(baby_id),
      req.user!.userId,
      req.body
    )

    res.status(201).json({ success: true, data: record })
  } catch (error) {
    next(error)
  }
}

// 更新喂养记录
export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id)

    const record = await feedingRecordService.update(id, req.user!.userId, req.body)

    res.json({ success: true, data: record })
  } catch (error) {
    const err = error as Error & { status?: number }
    if (err.status) {
      res.status(err.status).json({ success: false, error: err.message })
      return
    }
    next(error)
  }
}

// 删除喂养记录
export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id)

    await feedingRecordService.remove(id, req.user!.userId)

    res.json({ success: true, message: '删除成功' })
  } catch (error) {
    const err = error as Error & { status?: number }
    if (err.status) {
      res.status(err.status).json({ success: false, error: err.message })
      return
    }
    next(error)
  }
}

// 获取日汇总数据
export async function getSummary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { baby_id, date } = req.query

    if (!baby_id || !date) {
      res.status(400).json({ success: false, error: '缺少 baby_id 或 date 参数' })
      return
    }

    const summary = await feedingRecordService.getSummary(
      Number(baby_id),
      req.user!.userId,
      date as string
    )

    res.json({ success: true, data: summary })
  } catch (error) {
    next(error)
  }
}

// 获取统计数据
export async function getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { baby_id, start_date, end_date } = req.query

    if (!baby_id || !start_date || !end_date) {
      res.status(400).json({ success: false, error: '缺少 baby_id、start_date 或 end_date 参数' })
      return
    }

    const statistics = await feedingRecordService.getStatistics(
      Number(baby_id),
      req.user!.userId,
      start_date as string,
      end_date as string
    )

    res.json({ success: true, data: statistics })
  } catch (error) {
    next(error)
  }
}

// 获取某类型最近一条记录
export async function getLastByType(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { baby_id } = req.query
    const { type } = req.params

    if (!baby_id) {
      res.status(400).json({ success: false, error: '缺少 baby_id 参数' })
      return
    }

    const record = await feedingRecordService.getLastByType(
      Number(baby_id),
      req.user!.userId,
      type as feedingRecordService.FeedingType
    )

    res.json({ success: true, data: record })
  } catch (error) {
    next(error)
  }
}
