<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import dayjs from 'dayjs'
import type { FeedingRecord, FeedingType } from '@/types'
import { FEEDING_TYPES } from '@/data/feeding-types'
import { formatDuration } from '@/composables/useFeedingForm'

const props = defineProps<{
  records: FeedingRecord[]
}>()

const emit = defineEmits<{
  edit: [record: FeedingRecord]
  delete: [record: FeedingRecord]
  wakeUp: [record: FeedingRecord]
}>()

// 按日期分组的记录
const groupedRecords = computed(() => {
  const groups: { date: string; label: string; items: FeedingRecord[] }[] = []
  const map = new Map<string, FeedingRecord[]>()

  for (const record of props.records) {
    const dateKey = dayjs(record.start_time).format('YYYY-MM-DD')
    if (!map.has(dateKey)) {
      map.set(dateKey, [])
    }
    map.get(dateKey)!.push(record)
  }

  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')

  for (const [date, sourceItems] of map) {
    let label = dayjs(date).format('M月D日')
    if (date === today) label = '今天'
    else if (date === yesterday) label = '昨天'

    const items = [...sourceItems].sort((a, b) => dayjs(b.start_time).valueOf() - dayjs(a.start_time).valueOf())
    groups.push({ date, label, items })
  }

  return groups.sort((a, b) => b.date.localeCompare(a.date))
})

// 获取记录的描述文字
function getRecordDesc(record: FeedingRecord): string {
  const type = record.type as FeedingType
  const parts: string[] = []

  switch (type) {
    case 'breast_milk':
      if (record.side) {
        const sideMap = { left: '左侧', right: '右侧', both: '双侧' }
        parts.push(sideMap[record.side])
      }
      if (record.duration) parts.push(formatDuration(record.duration))
      break
    case 'bottle_milk':
    case 'formula':
      if (record.amount) parts.push(`${record.amount}ml`)
      break
    case 'solid_food':
      if (record.food_name) parts.push(record.food_name)
      if (record.amount) parts.push(`${record.amount}g`)
      if (record.allergies?.length) parts.push('⚠️ 过敏')
      break
    case 'water':
      if (record.amount) parts.push(`${record.amount}ml`)
      break
    case 'diaper': {
      const statusMap = { pee: '小便', poop: '大便', poop_pee: '大小便' }
      if (record.diaper_status) parts.push(statusMap[record.diaper_status])
      if (record.has_rash) parts.push('有红屁屁')
      break
    }
    case 'sleep':
      if (record.is_ongoing) {
        parts.push('宝宝睡觉中...')
      } else if (record.duration) {
        parts.push(`睡了${formatDuration(record.duration)}`)
      }
      break
  }

  return parts.join(' ')
}

// 滑动删除：记录触摸起始位置
let touchStartX = 0

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0]?.clientX ?? 0
}

function onTouchEnd(e: TouchEvent, record: FeedingRecord) {
  const diff = touchStartX - (e.changedTouches[0]?.clientX ?? 0)
  if (diff > 80) {
    // 左滑超过 80px，触发删除确认
    emit('delete', record)
  }
}
</script>

<template>
  <div class="mt-2 px-3">
    <div v-for="group in groupedRecords" :key="group.date" class="mb-5">
      <!-- 日期分组标题 -->
      <div class="mb-2.5 px-1 text-[26px] font-bold leading-none text-[#2f3139]">
        {{ group.label }}
      </div>

      <!-- 时间轴 -->
      <div class="timeline-card relative overflow-hidden rounded-[20px] border border-[var(--color-border-pink)] bg-white px-1 py-1.5">
        <!-- 竖线 -->
        <div
          class="absolute bottom-3 left-[25px] top-3 w-[1.5px] bg-gradient-to-b from-[#f9d4e6] to-[#f3e4ee]"
        ></div>

        <div
          v-for="record in group.items"
          :key="record.id"
          class="timeline-row relative flex items-start gap-2 py-3"
          @touchstart="onTouchStart($event)"
          @touchend="onTouchEnd($event, record)"
          @click="emit('edit', record)"
        >
          <!-- 时间 -->
          <div class="w-[46px] shrink-0 pt-0.5 text-right text-[13.5px] text-[#a2a6b0]">
            {{ dayjs(record.start_time).format('HH:mm') }}
          </div>

          <!-- 圆点（带光晕） -->
          <div class="relative z-10 mt-1">
            <div
              class="h-[10px] w-[10px] shrink-0 rounded-full border-[2.5px] border-white"
              :style="{ backgroundColor: FEEDING_TYPES[record.type]?.color || '#ccc', boxShadow: `0 0 6px ${(FEEDING_TYPES[record.type]?.color || '#ccc')}40` }"
            ></div>
          </div>

          <!-- 内容 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <Icon
                :icon="FEEDING_TYPES[record.type]?.icon || 'mdi:help'"
                class="shrink-0 text-[15px]"
                :style="{ color: FEEDING_TYPES[record.type]?.color }"
              />
              <span class="text-[15px] font-medium text-[#383c45]">
                {{ FEEDING_TYPES[record.type]?.label }}
              </span>
              <span class="text-[14px] text-[#7a7f8c]">
                {{ getRecordDesc(record) }}
              </span>
            </div>

            <!-- 备注 -->
            <div v-if="record.note" class="mt-1 truncate text-[12px] text-[#b5b9c4]">
              {{ record.note }}
            </div>

            <!-- 睡眠中 — 宝宝醒了按钮 -->
            <button
              v-if="record.type === 'sleep' && record.is_ongoing"
              class="mt-2 rounded-full border-none px-4 py-1.5 text-xs font-medium text-white transition-transform active:scale-95"
              style="background: linear-gradient(135deg, #b09ae0, #9B7FD4)"
              @click.stop="emit('wakeUp', record)"
            >
              宝宝醒了
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 无记录 -->
    <div
      v-if="records.length === 0"
      class="py-20 text-center text-[13px] text-[#b5b9c5]"
    >
      暂无记录
    </div>
  </div>
</template>

<style scoped>
.timeline-card {
  box-shadow: var(--shadow-card);
}

.timeline-row {
  transition: background-color 0.15s ease;
}

.timeline-row:active {
  background-color: #fdf8fa;
}
</style>
