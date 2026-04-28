import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Media, MediaType } from '@/types'
import request from '@/utils/request'

// 月度汇总项
export interface MonthlyGroup {
  month: string
  count: number
  photo_count: number
  video_count: number
  thumbnail_url: string | null
  baby_age_months: number
}

export const useAlbumStore = defineStore('album', () => {
  // state
  const mediaList = ref<Media[]>([])
  const loading = ref(false)
  const total = ref(0)
  const monthlyGroups = ref<MonthlyGroup[]>([])

  // 获取媒体列表
  async function fetchMediaList(params: {
    baby_id: number
    type?: MediaType
    month?: string
    page?: number
    page_size?: number
  }): Promise<void> {
    loading.value = true
    try {
      const res = await request.get<unknown, { data: Media[]; meta: { total: number; page: number; pageSize: number } }>('/media', { params })
      mediaList.value = res.data ?? []
      total.value = res.meta?.total ?? 0
    } finally {
      loading.value = false
    }
  }

  // 获取月度汇总
  async function fetchMonthly(babyId: number): Promise<void> {
    try {
      const res = await request.get<unknown, MonthlyGroup[]>(
        '/media/monthly',
        { params: { baby_id: babyId } }
      )
      // 后端不返回 count，需要前端计算
      monthlyGroups.value = (res ?? []).map((item) => ({
        ...item,
        count: Number(item.photo_count) + Number(item.video_count),
      }))
    } catch {
      monthlyGroups.value = []
    }
  }

  // 上传媒体
  async function uploadMedia(babyId: number, files: File[]): Promise<Media[]> {
    const formData = new FormData()
    formData.append('baby_id', String(babyId))
    for (const file of files) {
      formData.append('files', file)
    }

    const res = await request.post<unknown, Media[]>(
      '/media/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return res ?? []
  }

  // 更新备注
  async function updateMedia(id: number, note: string): Promise<void> {
    await request.put(`/media/${id}`, { note })
  }

  // 获取媒体详情
  async function fetchMediaDetail(id: number): Promise<Media | null> {
    try {
      const res = await request.get<unknown, Media>(`/media/${id}`)
      return res ?? null
    } catch {
      return null
    }
  }

  // 删除媒体
  async function deleteMedia(id: number): Promise<void> {
    await request.delete(`/media/${id}`)
  }

  return {
    mediaList,
    loading,
    total,
    monthlyGroups,
    fetchMediaList,
    fetchMediaDetail,
    fetchMonthly,
    uploadMedia,
    updateMedia,
    deleteMedia,
  }
})
