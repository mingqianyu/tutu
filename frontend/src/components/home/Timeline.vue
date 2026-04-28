<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBabyStore } from '@/stores/baby'
import { getMonthAge } from '@/utils/month-age'
import { showImagePreview } from 'vant'
import dayjs from 'dayjs'
import type { Media } from '@/types'
import request from '@/utils/request'

const babyStore = useBabyStore()
const mediaList = ref<Media[]>([])
const loading = ref(false)

// 按日期分组
interface DayGroup {
  date: string
  label: string
  monthAge: string
  items: Media[]
}

// 使用 computed 避免模板中重复计算
const dayGroups = computed<DayGroup[]>(() => {
  const groups: Record<string, Media[]> = {}

  for (const item of mediaList.value) {
    const date = dayjs(item.taken_at).format('YYYY-MM-DD')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
  }

  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => {
      let label = dayjs(date).format('M月D日')
      if (date === today) label = '今天'
      else if (date === yesterday) label = '昨天'

      return {
        date,
        label,
        monthAge: babyStore.currentBaby ? getMonthAge(babyStore.currentBaby.birthday) : '',
        items,
      }
    })
})

onMounted(async () => {
  if (!babyStore.currentBaby) return
  loading.value = true
  try {
    // 拦截器对带 meta 的响应返回 { data, meta }
    const res = await request.get<unknown, { data: Media[]; meta: { total: number } }>('/media', {
      params: { baby_id: babyStore.currentBaby.id, page: 1, page_size: 20 },
    })
    mediaList.value = res.data ?? []
  } catch {
    // 接口异常时忽略
  } finally {
    loading.value = false
  }
})

function formatDuration(duration = 0): string {
  const minute = Math.floor(duration / 60)
  const second = String(duration % 60).padStart(2, '0')
  return `${String(minute).padStart(2, '0')}:${second}`
}

function getGridItems(items: Media[], index: number): Media[] {
  return index === 0 ? items.slice(1) : items
}

// 点击图片预览
function handlePreview(item: Media, groupItems: Media[]) {
  if (item.type !== 'photo') return
  const images = groupItems.filter((m) => m.type === 'photo')
  const urls = images.map((m) => m.url)
  const startIndex = images.findIndex((m) => m.id === item.id)
  showImagePreview({
    images: urls,
    startPosition: Math.max(startIndex, 0),
  })
}
</script>

<template>
  <div>
    <!-- 提醒条 -->
    <div class="home-card mb-4 border border-[var(--color-border)] px-4 py-3.5">
      <div class="flex items-center justify-between">
      <span class="text-[13.5px] text-[#777]">想看新照片？点击按钮告诉宝妈</span>
      <button class="pill-btn-outline px-4">想看新照片</button>
      </div>
    </div>

    <div v-if="loading" class="py-12 text-center text-sm text-[var(--color-text-secondary)]">加载中...</div>

    <!-- 时间线 -->
    <div v-else-if="dayGroups.length > 0">
      <div v-for="(group, index) in dayGroups" :key="group.date" class="mb-6">
        <!-- 日期标题 -->
        <div class="mb-2.5 flex items-center gap-2 pl-1">
          <span class="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)] shadow-[0_0_6px_rgba(243,95,147,0.4)]"></span>
          <span class="text-[26px] font-bold leading-none text-[#1f1f24]">{{ group.label }}</span>
          <span class="pt-2 text-[15px] text-[#8a8d96]">{{ group.monthAge }}</span>
        </div>

        <!-- 第一张大图 -->
        <div
          v-if="index === 0 && group.items[0]"
          class="mb-2 overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] cursor-pointer"
          @click="handlePreview(group.items[0], group.items)"
        >
          <div class="relative aspect-[16/10] w-full">
            <img
              :src="group.items[0].thumbnail_url || group.items[0].url"
              class="h-full w-full object-cover"
              alt=""
            />
            <div
              v-if="group.items[0].type === 'video'"
              class="absolute bottom-2 right-2 rounded bg-black/45 px-1.5 py-0.5 text-xs text-white"
            >
              {{ formatDuration(group.items[0].duration || 0) }}
            </div>
          </div>
        </div>

        <!-- 其余媒体网格 -->
        <div v-if="getGridItems(group.items, index).length > 0" class="grid grid-cols-3 gap-[3px] overflow-hidden rounded-2xl">
          <div
            v-for="item in getGridItems(group.items, index)"
            :key="item.id"
            class="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
            @click="handlePreview(item, group.items)"
          >
            <img
              :src="item.thumbnail_url || item.url"
              class="h-full w-full object-cover"
              alt=""
            />
            <!-- 视频时长标记 -->
            <div
              v-if="item.type === 'video'"
              class="absolute bottom-1 right-1 rounded bg-black/45 px-1 text-xs text-white"
            >
              {{ formatDuration(item.duration || 0) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="home-card mt-5 p-8 text-center">
      <div class="text-5xl mb-3 opacity-80">📸</div>
      <p class="text-[#b5b7c0] text-[13px]">还没有照片，快去上传吧</p>
    </div>
  </div>
</template>
