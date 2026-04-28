import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/database'
import { env } from '../config/env'
import type { User, UserPayload, Baby } from '../types'
import { RowDataPacket } from 'mysql2'

// 用户登录
export async function login(username: string, password: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM users WHERE username = ?',
    [username]
  )

  if (rows.length === 0) {
    throw Object.assign(new Error('用户名或密码错误'), { status: 401 })
  }

  const user = rows[0] as User
  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw Object.assign(new Error('用户名或密码错误'), { status: 401 })
  }

  // 生成 JWT
  const payload: UserPayload = { userId: user.id, username: user.username }
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] })

  // 查询该用户的第一个宝宝
  const [babyRows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM babies WHERE user_id = ? LIMIT 1',
    [user.id]
  )

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
    },
    baby: babyRows.length > 0 ? (babyRows[0] as Baby) : null,
  }
}

// 获取用户信息
export async function getProfile(userId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, username, nickname, avatar, created_at FROM users WHERE id = ?',
    [userId]
  )

  if (rows.length === 0) {
    throw Object.assign(new Error('用户不存在'), { status: 404 })
  }

  return rows[0]
}

// 更新用户信息
export async function updateProfile(userId: number, data: { nickname?: string; avatar?: string }) {
  const fields: string[] = []
  const values: (string | number)[] = []

  if (data.nickname !== undefined) {
    fields.push('nickname = ?')
    values.push(data.nickname)
  }
  if (data.avatar !== undefined) {
    fields.push('avatar = ?')
    values.push(data.avatar)
  }

  if (fields.length === 0) {
    throw Object.assign(new Error('没有要更新的字段'), { status: 400 })
  }

  values.push(userId)
  await pool.execute(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  )

  return getProfile(userId)
}
