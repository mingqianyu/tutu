import pool from '../config/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

// ISO 8601 时间转 MySQL DATETIME 格式（UTC）
function toMySQLDatetime(isoStr: string | null | undefined): string | null {
  if (!isoStr) return null
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) {
    throw Object.assign(new Error(`无效的时间格式: ${isoStr}`), { status: 400 })
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
}

// 喂养记录类型
export type FeedingType = 'breast_milk' | 'bottle_milk' | 'formula' | 'solid_food' | 'water' | 'diaper' | 'sleep'

// 喂养记录接口
export interface FeedingRecord {
  id: number
  baby_id: number
  user_id: number
  type: FeedingType
  start_time: string
  end_time: string | null
  duration: number | null
  amount: number | null
  unit: string | null
  side: 'left' | 'right' | 'both' | null
  last_side: 'left' | 'right' | null
  left_duration: number | null
  right_duration: number | null
  food_name: string | null
  allergies: string[] | null
  diaper_status: 'pee' | 'poop' | 'poop_pee' | null
  has_rash: boolean
  note: string | null
  is_ongoing: boolean
  created_at: string
  updated_at: string
}

// 列表筛选参数
export interface FeedingRecordFilters {
  type?: FeedingType
  date?: string
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
}

// 日汇总数据
export interface DaySummary {
  type: FeedingType
  count: number
  total_amount: number | null
  total_duration: number | null
}

// 统计数据
export interface DailyStatItem {
  date: string
  type: FeedingType
  count: number
  total_amount: number | null
  total_duration: number | null
}

// 获取喂养记录列表
export async function getList(
  babyId: number,
  userId: number,
  filters: FeedingRecordFilters = {}
): Promise<{ list: FeedingRecord[]; total: number }> {
  const { type, date, start_date, end_date, page = 1, page_size = 50 } = filters

  let sql = `
    SELECT * FROM feeding_records
    WHERE baby_id = ? AND user_id = ?
  `
  const params: (string | number)[] = [babyId, userId]

  // 类型筛选
  if (type) {
    sql += ' AND type = ?'
    params.push(type)
  }

  // 日期筛选
  if (date) {
    sql += ' AND DATE(start_time) = ?'
    params.push(date)
  } else if (start_date && end_date) {
    sql += ' AND DATE(start_time) BETWEEN ? AND ?'
    params.push(start_date, end_date)
  }

  // 查询总数（使用独立 SQL 避免字符串替换脆弱性）
  let countSql = 'SELECT COUNT(*) as total FROM feeding_records WHERE baby_id = ? AND user_id = ?'
  const countParams = [...params]
  if (type) countSql += ' AND type = ?'
  if (date) countSql += ' AND DATE(start_time) = ?'
  else if (start_date && end_date) countSql += ' AND DATE(start_time) BETWEEN ? AND ?'

  const [countRows] = await pool.execute<RowDataPacket[]>(countSql, countParams)
  const total = countRows[0].total

  // 分页和排序 — 使用 query 代替 execute，避免 MySQL2 prepared statement 对 LIMIT 的兼容问题
  const limit = Number(page_size)
  const offset = (Number(page) - 1) * limit
  // NaN 防御：确保 limit 和 offset 是有效整数
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 200) : 50
  const safeOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0
  sql += ` ORDER BY start_time DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`

  const [rows] = await pool.query<RowDataPacket[]>(sql, params)

  return {
    list: rows as FeedingRecord[],
    total
  }
}

// 根据 ID 获取单条记录
export async function getById(id: number, userId: number): Promise<FeedingRecord | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM feeding_records WHERE id = ? AND user_id = ?',
    [id, userId]
  )

  return rows.length > 0 ? (rows[0] as FeedingRecord) : null
}

// 创建喂养记录
export async function create(
  babyId: number,
  userId: number,
  data: Partial<FeedingRecord>
): Promise<FeedingRecord> {
  const {
    type,
    start_time,
    end_time = null,
    duration = null,
    amount = null,
    unit = null,
    side = null,
    last_side = null,
    left_duration = null,
    right_duration = null,
    food_name = null,
    allergies = null,
    diaper_status = null,
    has_rash = false,
    note = null,
    is_ongoing = false
  } = data

  const sql = `INSERT INTO feeding_records (
    baby_id, user_id, type, start_time, end_time, duration, amount, unit,
    side, last_side, left_duration, right_duration, food_name, allergies, diaper_status, has_rash, note, is_ongoing
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

  const values: (string | number | null)[] = [
    babyId, userId, type as string, toMySQLDatetime(start_time as string)!,
    toMySQLDatetime(end_time as string | null), duration, amount, unit,
    side, last_side, left_duration, right_duration, food_name,
    allergies ? JSON.stringify(allergies) : null, diaper_status,
    has_rash ? 1 : 0, note, is_ongoing ? 1 : 0
  ]

  const [result] = await pool.execute<ResultSetHeader>(sql, values)

  const newRecord = await getById(result.insertId, userId)
  if (!newRecord) {
    throw new Error('创建记录失败')
  }

  return newRecord
}

// 更新喂养记录
export async function update(
  id: number,
  userId: number,
  data: Partial<FeedingRecord>
): Promise<FeedingRecord> {
  // 睡眠记录"宝宝醒了"：传入 end_time + is_ongoing=false 时，自动计算 duration
  if (data.end_time && data.is_ongoing === false) {
    const existing = await getById(id, userId)
    if (existing && existing.start_time) {
      const startMs = new Date(existing.start_time).getTime()
      const endMs = new Date(data.end_time as string).getTime()
      if (endMs > startMs) {
        data.duration = Math.floor((endMs - startMs) / 1000)
      }
    }
  }

  // 允许更新的字段
  const allowedFields = [
    'type', 'start_time', 'end_time', 'duration', 'amount', 'unit',
    'side', 'last_side', 'left_duration', 'right_duration', 'food_name', 'allergies',
    'diaper_status', 'has_rash', 'note', 'is_ongoing'
  ]

  // 时间字段需要转换格式
  const timeFields = new Set(['start_time', 'end_time'])

  const updates: string[] = []
  const params: (string | number | null)[] = []

  for (const field of allowedFields) {
    if (field in data) {
      updates.push(`${field} = ?`)
      const val = (data as any)[field]
      params.push(timeFields.has(field) ? toMySQLDatetime(val) : val)
    }
  }

  if (updates.length === 0) {
    throw new Error('没有需要更新的字段')
  }

  params.push(id, userId)

  await pool.execute(
    `UPDATE feeding_records SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
    params
  )

  const updatedRecord = await getById(id, userId)
  if (!updatedRecord) {
    throw Object.assign(new Error('记录不存在或无权限'), { status: 404 })
  }

  return updatedRecord
}

// 删除喂养记录
export async function remove(id: number, userId: number): Promise<void> {
  // 先验证权限
  const record = await getById(id, userId)
  if (!record) {
    throw Object.assign(new Error('记录不存在或无权限'), { status: 404 })
  }

  await pool.execute('DELETE FROM feeding_records WHERE id = ? AND user_id = ?', [id, userId])
}

// 获取日汇总数据
export async function getSummary(
  babyId: number,
  userId: number,
  date: string
): Promise<DaySummary[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      type,
      COUNT(*) as count,
      SUM(amount) as total_amount,
      SUM(duration) as total_duration
    FROM feeding_records
    WHERE baby_id = ? AND user_id = ? AND DATE(start_time) = ?
    GROUP BY type`,
    [babyId, userId, date]
  )

  return rows as DaySummary[]
}

// 获取统计数据（按天分组）
export async function getStatistics(
  babyId: number,
  userId: number,
  startDate: string,
  endDate: string
): Promise<DailyStatItem[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      DATE(start_time) as date,
      type,
      COUNT(*) as count,
      SUM(amount) as total_amount,
      SUM(duration) as total_duration
    FROM feeding_records
    WHERE baby_id = ? AND user_id = ? AND DATE(start_time) BETWEEN ? AND ?
    GROUP BY DATE(start_time), type
    ORDER BY date DESC, type`,
    [babyId, userId, startDate, endDate]
  )

  return rows as DailyStatItem[]
}

// 获取某类型最近一条记录
export async function getLastByType(
  babyId: number,
  userId: number,
  type: FeedingType
): Promise<FeedingRecord | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM feeding_records
    WHERE baby_id = ? AND user_id = ? AND type = ?
    ORDER BY start_time DESC
    LIMIT 1`,
    [babyId, userId, type]
  )

  return rows.length > 0 ? (rows[0] as FeedingRecord) : null
}
