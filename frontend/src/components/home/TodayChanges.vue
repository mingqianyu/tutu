<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBabyStore } from '@/stores/baby'
import { Icon } from '@iconify/vue'
import dayjs from 'dayjs'
import babyChangesData from '@/data/baby-changes'

const babyStore = useBabyStore()

// 按月龄获取变化内容列表
const changesList = computed(() => {
  const monthAge = String(babyStore.monthAgeNumber)
  const data = babyChangesData as Record<string, string[]>
  return data[monthAge] ?? data['0'] ?? []
})

// 当前显示的索引
const currentIndex = ref(0)

// 当前日期
const today = dayjs().format('M月D日')

// 当前显示的文字
const currentText = computed(() => changesList.value[currentIndex.value] || '')

function prev() {
  if (changesList.value.length === 0) return
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = changesList.value.length - 1
  }
}

function next() {
  if (changesList.value.length === 0) return
  if (currentIndex.value < changesList.value.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
}

// 随机选择一条
onMounted(() => {
  if (changesList.value.length === 0) {
    currentIndex.value = 0
    return
  }
  currentIndex.value = Math.floor(Math.random() * changesList.value.length)
})
</script>

<template>
  <div class="changes-card relative z-10 -mt-5 rounded-[20px] px-4 py-4 text-white" style="background: linear-gradient(135deg, #f0b86a 0%, #eda45a 50%, #e8964f 100%)">
    <!-- 装饰星星 -->
    <div class="absolute right-3 top-2 text-[10px] text-white/30">✦</div>
    <div class="absolute right-8 top-5 text-[7px] text-white/20">✦</div>

    <!-- 标题行 -->
    <div class="mb-3 flex items-center justify-center gap-5">
      <button class="touch-btn flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-transform active:scale-90" @click="prev">
        <Icon icon="mdi:chevron-left" class="text-lg" />
      </button>
      <span class="text-[20px] font-bold leading-none tracking-wide">今天({{ today }})</span>
      <button class="touch-btn flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-transform active:scale-90" @click="next">
        <Icon icon="mdi:chevron-right" class="text-lg" />
      </button>
    </div>

    <!-- 变化内容 -->
    <div class="rounded-xl bg-white/10 px-3 py-2.5 text-[13.5px] leading-relaxed text-white/95 backdrop-blur-sm">
      <span class="font-semibold">宝宝变化:</span> {{ currentText }}
      <Icon icon="mdi:chevron-right" class="ml-1 inline-block text-base" />
    </div>
  </div>
</template>
