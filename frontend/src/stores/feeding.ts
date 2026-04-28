import { defineStore } from 'pinia'
import { ref } from 'vue'
import { showToast } from 'vant'
import type {
  FeedingRecord,
  FeedingRecordInput,
  FeedingType,
  DaySummary,
  DailyStatItem,
} from '@/types'
import request from '@/utils/request'

export const useFeedingStore = defineStore('feeding', () => {
  // state — 当前页喂养记录列表
  const records = ref<FeedingRecord[]>([])
  // 当前筛选类型（null = 全部）
  const currentFilter = ref<FeedingType | null>(null)
  // 当前查看的日期
  const currentDate = ref<string>(new Date().toISOString().slice(0, 10))
  // 加载状态
  const loading = ref(false)
  // 日汇总数据
  const daySummary = ref<DaySummary[]>([])
  // 记录总数
  const total = ref(0)

  // 获取喂养记录列表
  async function fetchRecords(params: {
    baby_id: number
    type?: FeedingType
    date?: string
    start_date?: string
    end_date?: string
    page?: number
    page_size?: number
  }): Promise<void> {
    loading.value = true
    try {
      const res = await request.get<unknown, { data: FeedingRecord[]; meta: { total: number; page: number; pageSize: number } }>(
        '/feeding-records',
        { params }
      )
      records.value = res.data ?? []
      total.value = res.meta?.total ?? 0
    } catch {
      showToast('获取喂养记录失败')
    } finally {
      loading.value = false
    }
  }

  // 创建喂养记录
  async function createRecord(data: FeedingRecordInput): Promise<FeedingRecord> {
    const res = await request.post<unknown, FeedingRecord>(
      '/feeding-records',
      data
    )
    return res
  }

  // 更新喂养记录
  async function updateRecord(
    id: number,
    data: Partial<FeedingRecordInput>
  ): Promise<FeedingRecord> {
    const res = await request.put<unknown, FeedingRecord>(
      `/feeding-records/${id}`,
      data
    )
    return res
  }

  // 删除喂养记录
  async function deleteRecord(id: number): Promise<void> {
    await request.delete(`/feeding-records/${id}`)
  }

  // 获取日汇总数据
  async function fetchSummary(babyId: number, date: string): Promise<DaySummary[]> {
    try {
      const res = await request.get<unknown, DaySummary[]>(
        '/feeding-records/summary',
        { params: { baby_id: babyId, date } }
      )
      daySummary.value = res ?? []
      return daySummary.value
    } catch {
      showToast('获取日汇总失败')
      return []
    }
  }

  // 获取某类型最近一条记录
  async function fetchLastByType(
    babyId: number,
    type: FeedingType
  ): Promise<FeedingRecord | null> {
    try {
      const res = await request.get<unknown, FeedingRecord | null>(
        `/feeding-records/last/${type}`,
        { params: { baby_id: babyId } }
      )
      return res ?? null
    } catch {
      return null
    }
  }

  // 获取统计数据
  async function fetchStatistics(
    babyId: number,
    startDate: string,
    endDate: string
  ): Promise<DailyStatItem[]> {
    try {
      const res = await request.get<unknown, DailyStatItem[]>(
        '/feeding-records/statistics',
        { params: { baby_id: babyId, start_date: startDate, end_date: endDate } }
      )
      return res ?? []
    } catch {
      showToast('获取统计数据失败')
      return []
    }
  }

  return {
    records,
    currentFilter,
    currentDate,
    loading,
    daySummary,
    total,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    fetchSummary,
    fetchLastByType,
    fetchStatistics,
  }
})
