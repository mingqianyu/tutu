import { Request } from 'express'

// 通用 API 响应格式
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    total: number
    page: number
    pageSize: number
  }
}

// JWT 用户载荷
export interface UserPayload {
  userId: number
  username: string
}

// 扩展 Express Request，附加用户信息
export interface AuthRequest extends Request {
  user?: UserPayload
}

// 用户表
export interface User {
  id: number
  username: string
  password: string
  nickname: string
  avatar: string | null
  created_at: Date
  updated_at: Date
}

// 宝宝表
export interface Baby {
  id: number
  user_id: number
  nickname: string
  gender: 'male' | 'female'
  birthday: string
  birth_method: 'natural' | 'cesarean' | 'other'
  avatar: string | null
  background: string | null
  relation: string
  created_at: Date
  updated_at: Date
}

// 喂养记录类型
export type FeedingType =
  | 'breast_milk'
  | 'bottle_milk'
  | 'formula'
  | 'solid_food'
  | 'water'
  | 'diaper'
  | 'sleep'

// 喂养记录表
export interface FeedingRecord {
  id: number
  baby_id: number
  user_id: number
  type: FeedingType
  start_time: Date
  end_time: Date | null
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
  created_at: Date
  updated_at: Date
}

// 媒体类型
export type MediaType = 'photo' | 'video'

// 云相册媒体表
export interface Media {
  id: number
  baby_id: number
  user_id: number
  type: MediaType
  url: string
  thumbnail_url: string | null
  note: string | null
  duration: number | null
  file_size: number | null
  taken_at: Date
  created_at: Date
  updated_at: Date
}
