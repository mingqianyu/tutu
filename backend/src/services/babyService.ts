import pool from '../config/database'
import type { Baby } from '../types'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import fs from 'fs/promises'
import path from 'path'
import { env } from '../config/env'

// 获取宝宝列表
export async function getBabyList(userId: number): Promise<Baby[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM babies WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  )
  return rows as Baby[]
}

// 获取宝宝详情
export async function getBabyById(babyId: number, userId: number): Promise<Baby> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM babies WHERE id = ? AND user_id = ?',
    [babyId, userId]
  )

  if (rows.length === 0) {
    throw Object.assign(new Error('宝宝不存在'), { status: 404 })
  }

  return rows[0] as Baby
}

// 添加宝宝
export async function createBaby(userId: number, data: {
  nickname: string
  gender: 'male' | 'female'
  birthday: string
  birth_method?: 'natural' | 'cesarean' | 'other'
  avatar?: string
  relation?: string
}): Promise<Baby> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO babies (user_id, nickname, gender, birthday, birth_method, avatar, relation)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      data.nickname,
      data.gender || 'unknown',
      data.birthday,
      data.birth_method || 'natural',
      data.avatar || null,
      data.relation || '妈妈',
    ]
  )

  return getBabyById(result.insertId, userId)
}

// 更新宝宝信息
export async function updateBaby(babyId: number, userId: number, data: Partial<Baby>): Promise<Baby> {
  // 先验证宝宝存在且属于该用户
  await getBabyById(babyId, userId)

  const allowedFields = ['nickname', 'gender', 'birthday', 'birth_method', 'avatar', 'background', 'relation'] as const
  const fields: string[] = []
  const values: (string | number | null)[] = []

  for (const field of allowedFields) {
    const val = data[field as keyof Baby]
    if (val !== undefined) {
      fields.push(`\`${field}\` = ?`)
      values.push(val as string | number | null)
    }
  }

  if (fields.length === 0) {
    throw Object.assign(new Error('没有要更新的字段'), { status: 400 })
  }

  values.push(babyId, userId)
  await pool.execute(
    `UPDATE babies SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
    values
  )

  return getBabyById(babyId, userId)
}

// 删除旧的上传文件（异步，失败仅记录日志）
async function removeOldFile(fileUrl: string | null): Promise<void> {
  if (!fileUrl) return
  const uploadsRoot = path.resolve(process.cwd(), env.UPLOAD_DIR)
  const diskPath = path.resolve(process.cwd(), fileUrl.replace(/^\//, ''))
  // 路径穿越防护
  if (!diskPath.startsWith(uploadsRoot)) return
  await fs.unlink(diskPath).catch((err) => {
    console.error(`删除旧文件失败: ${diskPath}`, err.message)
  })
}

// 更新宝宝头像
export async function updateAvatar(babyId: number, userId: number, avatarUrl: string): Promise<Baby> {
  const existing = await getBabyById(babyId, userId)

  await pool.execute(
    'UPDATE babies SET avatar = ? WHERE id = ? AND user_id = ?',
    [avatarUrl, babyId, userId]
  )

  // 异步删除旧头像文件
  removeOldFile(existing.avatar)

  return getBabyById(babyId, userId)
}

// 更新宝宝背景图
export async function updateBackground(babyId: number, userId: number, bgUrl: string): Promise<Baby> {
  const existing = await getBabyById(babyId, userId)

  await pool.execute(
    'UPDATE babies SET background = ? WHERE id = ? AND user_id = ?',
    [bgUrl, babyId, userId]
  )

  // 异步删除旧背景图文件
  removeOldFile(existing.background)

  return getBabyById(babyId, userId)
}
