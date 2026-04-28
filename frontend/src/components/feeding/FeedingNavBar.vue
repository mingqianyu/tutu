<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import type { FeedingType } from '@/types'
import { FEEDING_TYPES } from '@/data/feeding-types'

defineProps<{
  title: string
  currentFilter: FeedingType | null
}>()

const emit = defineEmits<{
  filter: []
  calendar: []
}>()

const router = useRouter()

function goBack() {
  router.push('/')
}

function goStats() {
  router.push('/feeding/stats')
}

// 当前筛选类型的标签
function getFilterLabel(filter: FeedingType | null): string {
  if (!filter) return '全部记录'
  return FEEDING_TYPES[filter]?.label ?? '全部记录'
}
</script>

<template>
  <div class="feeding-nav sticky top-0 z-30">
    <div class="flex h-12 items-center justify-between px-3">
      <!-- 左侧：返回 -->
      <button class="touch-btn flex items-center justify-center border-none bg-transparent transition-transform active:scale-90" @click="goBack">
        <Icon icon="mdi:chevron-left" class="text-[26px] text-[#4f525c]" />
      </button>

      <!-- 中间：筛选标题 -->
      <div class="flex items-center justify-center">
        <button
          class="touch-btn flex items-center gap-0.5 border-none bg-transparent px-0 text-[22px] font-bold leading-none text-[#2f3139] transition-transform active:scale-95"
          @click="emit('filter')"
        >
          {{ getFilterLabel(currentFilter) }}
          <Icon icon="mdi:chevron-down" class="mt-0.5 text-[18px] text-[#9b9ea8]" />
        </button>
      </div>

      <!-- 右侧图标 -->
      <div class="flex items-center gap-0.5">
        <button class="touch-btn flex items-center justify-center border-none bg-transparent transition-transform active:scale-90" @click="emit('filter')">
          <Icon icon="mdi:tune-variant" class="text-[20px] text-[#6b6f79]" />
        </button>
        <button class="touch-btn flex items-center justify-center border-none bg-transparent transition-transform active:scale-90" @click="emit('calendar')">
          <Icon icon="mdi:calendar-outline" class="text-[20px] text-[#6b6f79]" />
        </button>
        <button class="touch-btn flex items-center justify-center border-none bg-transparent transition-transform active:scale-90" @click="goStats">
          <Icon icon="mdi:chart-box-outline" class="text-[20px] text-[#6b6f79]" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feeding-nav {
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
}
</style>
