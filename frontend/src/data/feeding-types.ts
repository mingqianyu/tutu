import type { FeedingType } from '@/types'

// 喂养类型元数据配置
export interface FeedingTypeConfig {
  label: string
  icon: string
  color: string
}

export const FEEDING_TYPES: Record<FeedingType, FeedingTypeConfig> = {
  breast_milk: { label: '母乳', icon: 'mdi:mother-nurse', color: '#FF6B8A' },
  bottle_milk: { label: '瓶喂母乳', icon: 'mdi:baby-bottle-outline', color: '#FF8FA0' },
  formula: { label: '配方奶', icon: 'mdi:baby-bottle', color: '#FF8FA0' },
  solid_food: { label: '辅食', icon: 'mdi:food-apple-outline', color: '#FFA64D' },
  water: { label: '喝水', icon: 'mdi:cup-water', color: '#5DADE2' },
  diaper: { label: '换尿布', icon: 'mdi:emoticon-poop-outline', color: '#FFB800' },
  sleep: { label: '睡眠', icon: 'mdi:weather-night', color: '#9B7FD4' },
}

// 所有喂养类型的有序列表
export const FEEDING_TYPE_LIST: FeedingType[] = [
  'breast_milk',
  'bottle_milk',
  'formula',
  'solid_food',
  'water',
  'diaper',
  'sleep',
]
