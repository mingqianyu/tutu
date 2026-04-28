import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { useFeedingStore } from '@/stores/feeding'
import { useBabyStore } from '@/stores/baby'
import type { FeedingRecord, FeedingRecordInput, FeedingType } from '@/types'

// 时长格式化（秒 → 可读字符串）
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '0分钟'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0 && minutes > 0) return `${hours}小时${minutes}分钟`
  if (hours > 0) return `${hours}小时`
  return `${minutes}分钟`
}

// 计算距离上次的时间描述
export function getTimeSinceLabel(lastTime: string | null | undefined): string {
  if (!lastTime) return ''

  const diff = dayjs().diff(dayjs(lastTime), 'minute')

  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`

  const hours = Math.floor(diff / 60)
  const minutes = diff % 60

  if (hours < 24) {
    return minutes > 0 ? `${hours}小时${minutes}分钟前` : `${hours}小时前`
  }

  const days = Math.floor(hours / 24)
  return `${days}天前`
}

// 喂养表单通用 composable
export function useFeedingForm(type: FeedingType) {
  const feedingStore = useFeedingStore()
  const babyStore = useBabyStore()

  // 上次同类型记录
  const lastRecord = ref<FeedingRecord | null>(null)
  const saving = ref(false)

  // 上次时间标签
  const lastTimeLabel = computed(() => {
    if (!lastRecord.value) return ''
    return `上次：${getTimeSinceLabel(lastRecord.value.start_time)}`
  })

  // 加载上次记录
  async function loadLastRecord(): Promise<void> {
    if (!babyStore.currentBaby) return
    try {
      lastRecord.value = await feedingStore.fetchLastByType(
        babyStore.currentBaby.id,
        type
      )
    } catch {
      // 忽略错误
    }
  }

  // 保存记录（创建或更新）
  async function handleSave(
    data: Partial<FeedingRecordInput>,
    editId?: number
  ): Promise<FeedingRecord | null> {
    if (!babyStore.currentBaby) return null

    saving.value = true
    try {
      if (editId) {
        // 更新
        return await feedingStore.updateRecord(editId, data)
      }
      // 创建
      return await feedingStore.createRecord({
        baby_id: babyStore.currentBaby.id,
        type,
        start_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        ...data,
      })
    } finally {
      saving.value = false
    }
  }

  return {
    lastRecord,
    lastTimeLabel,
    saving,
    loadLastRecord,
    handleSave,
  }
}
