// 通用 API 响应
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

// 用户信息
export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string | null
}

// 宝宝信息
export interface Baby {
  id: number
  user_id: number
  nickname: string
  gender: 'male' | 'female' | 'unknown'
  birthday: string
  birth_method: 'natural' | 'cesarean' | 'other'
  avatar: string | null
  background: string | null
  relation: string
  created_at: string
  updated_at: string
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

// 喂养记录
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

// 媒体类型
export type MediaType = 'photo' | 'video'

// 云相册媒体
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
  taken_at: string
  created_at: string
  updated_at: string
}

// 登录请求
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应
export interface LoginResponse {
  token: string
  user: UserInfo
  baby: Baby | null
}

// 喂养记录创建/更新请求
export interface FeedingRecordInput {
  baby_id: number
  type: FeedingType
  start_time: string
  end_time?: string | null
  duration?: number | null
  amount?: number | null
  unit?: string | null
  side?: 'left' | 'right' | 'both' | null
  last_side?: 'left' | 'right' | null
  left_duration?: number | null
  right_duration?: number | null
  food_name?: string | null
  allergies?: string[] | null
  diaper_status?: 'pee' | 'poop' | 'poop_pee' | null
  has_rash?: boolean
  note?: string | null
  is_ongoing?: boolean
}

// 日汇总数据
export interface DaySummary {
  type: FeedingType
  count: number
  total_amount: number | null
  total_duration: number | null
}

// 按天统计数据（图表用）
export interface DailyStatItem {
  date: string
  type: FeedingType
  count: number
  total_amount: number | null
  total_duration: number | null
}
