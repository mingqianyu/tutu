import pool from '../config/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import fs from 'fs/promises'
import path from 'path'
import { env } from '../config/env'

// 媒体列表筛选参数
export interface MediaFilters {
  type?: 'photo' | 'video'
  month?: string // 格式：YYYY-MM
  page?: number
  page_size?: number
}

// 按月汇总项
export interface MonthlyItem {
  month: string // YYYY-MM
  photo_count: number
  video_count: number
  thumbnail_url: string | null
  baby_age_months: number
}

// 获取媒体列表
export async function getList(
  babyId: number,
  userId: number,
  filters: MediaFilters = {}
): Promise<{ list: RowDataPacket[]; total: number }> {
  const { type, month, page = 1, page_size = 50 } = filters

  let sql = 'SELECT * FROM media WHERE baby_id = ? AND user_id = ?'
  const params: (string | number)[] = [babyId, userId]

  // 类型筛选
  if (type) {
    sql += ' AND type = ?'
    params.push(type)
  }

  // 月份筛选
  if (month) {
    sql += ' AND DATE_FORMAT(taken_at, "%Y-%m") = ?'
    params.push(month)
  }

  // 查询总数
  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total')
  const [countRows] = await pool.execute<RowDataPacket[]>(countSql, params)
  const total = countRows[0].total

  // 分页和排序（使用 query 而非 execute，因为 LIMIT/OFFSET 在预处理语句中有兼容性问题）
  sql += ' ORDER BY taken_at DESC LIMIT ? OFFSET ?'
  params.push(Number(page_size), Number((page - 1) * page_size))

  const [rows] = await pool.query<RowDataPacket[]>(sql, params)

  return { list: rows, total }
}

// 根据 ID 获取单条媒体
export async function getById(
  id: number,
  userId: number
): Promise<RowDataPacket | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM media WHERE id = ? AND user_id = ?',
    [id, userId]
  )
  return rows.length > 0 ? rows[0] : null
}

// 创建媒体记录
export async function create(
  babyId: number,
  userId: number,
  data: {
    type: 'photo' | 'video'
    url: string
    thumbnail_url?: string | null
    note?: string | null
    duration?: number | null
    file_size?: number | null
    taken_at: string
  }
): Promise<RowDataPacket> {
  const {
    type,
    url,
    thumbnail_url = null,
    note = null,
    duration = null,
    file_size = null,
    taken_at,
  } = data

  const sql = `INSERT INTO media (
    baby_id, user_id, type, url, thumbnail_url, note, duration, file_size, taken_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

  const [result] = await pool.execute<ResultSetHeader>(sql, [
    babyId, userId, type, url, thumbnail_url, note, duration, file_size, taken_at,
  ])

  const record = await getById(result.insertId, userId)
  if (!record) {
    throw new Error('创建媒体记录失败')
  }

  return record
}

// 更新媒体记录（备注等）
export async function update(
  id: number,
  userId: number,
  data: { note?: string }
): Promise<RowDataPacket> {
  const updates: string[] = []
  const params: (string | number)[] = []

  if (data.note !== undefined) {
    updates.push('note = ?')
    params.push(data.note)
  }

  if (updates.length === 0) {
    throw Object.assign(new Error('没有需要更新的字段'), { status: 400 })
  }

  params.push(id, userId)

  await pool.execute(
    `UPDATE media SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
    params
  )

  const record = await getById(id, userId)
  if (!record) {
    throw Object.assign(new Error('记录不存在或无权限'), { status: 404 })
  }

  return record
}

// 删除媒体记录（同时删除磁盘文件）
export async function remove(id: number, userId: number): Promise<void> {
  // 先获取记录，用于删除磁盘文件
  const record = await getById(id, userId)
  if (!record) {
    throw Object.assign(new Error('记录不存在或无权限'), { status: 404 })
  }

  // 删除数据库记录
  await pool.execute('DELETE FROM media WHERE id = ? AND user_id = ?', [id, userId])

  // 异步删除磁盘文件（失败仅记录日志，不阻塞响应）
  const uploadsRoot = path.resolve(process.cwd(), env.UPLOAD_DIR)
  const filesToDelete = [record.url, record.thumbnail_url].filter(Boolean) as string[]
  for (const filePath of filesToDelete) {
    const diskPath = path.resolve(process.cwd(), filePath.replace(/^\//, ''))
    // 路径穿越防护：确保文件在 uploads 目录内
    if (!diskPath.startsWith(uploadsRoot)) {
      console.error(`路径穿越拦截: ${diskPath} 不在 ${uploadsRoot} 内`)
      continue
    }
    fs.unlink(diskPath).catch((err) => {
      console.error(`删除文件失败: ${diskPath}`, err.message)
    })
  }
}

// 按月汇总
export async function getMonthly(
  babyId: number,
  userId: number,
  type?: 'photo' | 'video'
): Promise<MonthlyItem[]> {
  // 先做聚合，再用子查询取缩略图，避免 only_full_group_by 问题
  let innerSql = `
    SELECT
      DATE_FORMAT(m.taken_at, '%Y-%m') as month,
      SUM(CASE WHEN m.type = 'photo' THEN 1 ELSE 0 END) as photo_count,
      SUM(CASE WHEN m.type = 'video' THEN 1 ELSE 0 END) as video_count,
      MIN(m.taken_at) as min_taken_at,
      b.birthday
    FROM media m
    JOIN babies b ON b.id = m.baby_id
    WHERE m.baby_id = ? AND m.user_id = ?
  `
  const params: (string | number)[] = [babyId, userId]

  if (type) {
    innerSql += ' AND m.type = ?'
    params.push(type)
  }

  innerSql += ' GROUP BY month, m.baby_id, m.user_id, b.birthday'

  // 子查询参数
  params.push(babyId, userId)

  const sql = `
    SELECT
      agg.month,
      agg.photo_count,
      agg.video_count,
      (
        SELECT m2.thumbnail_url FROM media m2
        WHERE m2.baby_id = ? AND m2.user_id = ?
          AND DATE_FORMAT(m2.taken_at, '%Y-%m') = agg.month
        ORDER BY m2.taken_at DESC LIMIT 1
      ) as thumbnail_url,
      TIMESTAMPDIFF(MONTH, agg.birthday, LAST_DAY(agg.min_taken_at)) as baby_age_months
    FROM (${innerSql}) agg
    ORDER BY agg.month DESC
  `

  const [rows] = await pool.execute<RowDataPacket[]>(sql, params)

  return rows as MonthlyItem[]
}
