<script setup lang="ts">
import type { FeedingType } from '@/types'
import { FEEDING_TYPES, FEEDING_TYPE_LIST } from '@/data/feeding-types'

const props = defineProps<{
  show: boolean
  current: FeedingType | null
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  select: [type: FeedingType | null]
}>()

function handleSelect(type: FeedingType | null) {
  emit('select', type)
  emit('update:show', false)
}
</script>

<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :style="{ minHeight: '46%' }"
    @update:show="emit('update:show', $event)"
  >
    <div class="p-5 pb-8">
      <div class="mb-5 text-center text-[17px] font-bold text-[#2f323a]">筛选类型</div>

      <div class="grid grid-cols-3 gap-2.5">
        <!-- 全部 -->
        <button
          class="flex h-[44px] items-center justify-center rounded-full border text-[14.5px] font-medium transition-all active:scale-95"
          :class="current === null ? 'border-[#f8c8db] bg-[#fff0f5] text-[#e35d8f]' : 'border-transparent bg-[#f5f5f8] text-[#646975]'"
          @click="handleSelect(null)"
        >
          全部
        </button>

        <!-- 各类型 -->
        <button
          v-for="type in FEEDING_TYPE_LIST"
          :key="type"
          class="flex h-[44px] items-center justify-center rounded-full border text-[14.5px] font-medium transition-all active:scale-95"
          :class="current === type ? 'border-[#f8c8db] bg-[#fff0f5]' : 'border-transparent bg-[#f5f5f8]'"
          :style="current === type ? { color: FEEDING_TYPES[type].color } : { color: '#646975' }"
          @click="handleSelect(type)"
        >
          {{ FEEDING_TYPES[type].label }}
        </button>
      </div>
    </div>
  </van-popup>
</template>
