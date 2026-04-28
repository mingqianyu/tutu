<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { DaySummary, FeedingType } from '@/types'
import { FEEDING_TYPES } from '@/data/feeding-types'
import { formatDuration } from '@/composables/useFeedingForm'

defineProps<{
  dateLabel: string
  monthAge: string
  summaryList: DaySummary[]
}>()

// 获取类型的摘要描述
function getSummaryText(item: DaySummary): string {
  const type = item.type as FeedingType
  const parts: string[] = [`${item.count}次`]

  // 有奶量的类型
  if (['bottle_milk', 'formula', 'water'].includes(type) && item.total_amount) {
    parts.push(`${item.total_amount}ml`)
  }
  // 有时长的类型（母乳、睡眠）
  if (['breast_milk', 'sleep'].includes(type) && item.total_duration) {
    parts.push(formatDuration(item.total_duration))
  }
  // 辅食有重量
  if (type === 'solid_food' && item.total_amount) {
    parts.push(`${item.total_amount}g`)
  }

  return parts.join(' ')
}
</script>

<template>
  <div class="mx-3 mt-1.5">
    <!-- 日期标题 -->
    <div class="mb-2.5 flex items-center gap-2 px-1">
      <span class="text-[30px] font-bold leading-none text-[#2f3139]">{{ dateLabel }}</span>
      <span class="pt-2 text-[16px] text-[#8e929e]">{{ monthAge }}</span>
    </div>

    <!-- 汇总卡片 -->
    <div
      v-if="summaryList.length > 0"
      class="summary-card rounded-[20px] border border-[var(--color-border-pink)] bg-white px-3.5 py-3.5"
    >
      <div class="grid grid-cols-2 gap-x-3 gap-y-2.5">
        <div
          v-for="item in summaryList"
          :key="item.type"
          class="flex items-center gap-2"
        >
          <div
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            :style="{ backgroundColor: (FEEDING_TYPES[item.type]?.color || '#ccc') + '14' }"
          >
            <Icon
              :icon="FEEDING_TYPES[item.type]?.icon || 'mdi:help'"
              class="text-[15px]"
              :style="{ color: FEEDING_TYPES[item.type]?.color }"
            />
          </div>
          <span class="truncate text-[13.5px] text-[#4f535f]">
            {{ FEEDING_TYPES[item.type]?.label }}
            <span class="ml-0.5 text-[#9ea3ae]">{{ getSummaryText(item) }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 无数据 -->
    <div
      v-else
      class="rounded-[20px] border border-[var(--color-border-pink)] bg-white p-5 text-center text-[13px] text-[#b5b9c5]"
    >
      今天还没有记录，快来添加吧
    </div>
  </div>
</template>

<style scoped>
.summary-card {
  box-shadow: var(--shadow-card);
}
</style>
