<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast, showImagePreview } from 'vant'
import { Icon } from '@iconify/vue'
import dayjs from 'dayjs'
import { useBabyStore } from '@/stores/baby'
import { useAlbumStore } from '@/stores/album'
import { getMonthAge } from '@/utils/month-age'
import type { Media, MediaType } from '@/types'

const router = useRouter()
const babyStore = useBabyStore()
const albumStore = useAlbumStore()

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'photo', label: '照片' },
  { key: 'video', label: '视频' },
] as const

// Tab 筛选：全部 / 照片 / 视频
const activeTab = ref<'all' | 'photo' | 'video'>('all')

// 按月查看开关
const monthView = ref(false)

// 上传中状态
const uploading = ref(false)

// 按日期分组
interface DayGroup {
  date: string
  label: string
  monthAge: string
  items: Media[]
}

const dayGroups = computed<DayGroup[]>(() => {
  const list = albumStore.mediaList
  const grouped: Record<string, Media[]> = {}

  for (const item of list) {
    const date = dayjs(item.taken_at).format('YYYY-MM-DD')
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(item)
  }

  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  const birthday = babyStore.currentBaby?.birthday ?? ''

  return Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => {
      let label = dayjs(date).format('M月D日')
      if (date === today) label = '今天'
      else if (date === yesterday) label = '昨天'

      return {
        date,
        label,
        monthAge: birthday ? getMonthAge(birthday) : '',
        items,
      }
    })
})

const monthlyYearGroups = computed(() => {
  const groups = [...albumStore.monthlyGroups].sort((a, b) => b.month.localeCompare(a.month))
  const bucket: Record<string, typeof groups> = {}

  for (const item of groups) {
    const year = dayjs(`${item.month}-01`).format('YYYY')
    if (!bucket[year]) bucket[year] = []
    bucket[year].push(item)
  }

  return Object.entries(bucket)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, items]) => ({ year, items }))
})

// 加载数据
async function loadData() {
  if (!babyStore.currentBaby) return

  const params: {
    baby_id: number
    type?: MediaType
    page_size?: number
  } = {
    baby_id: babyStore.currentBaby.id,
    page_size: 200,
  }

  if (activeTab.value !== 'all') {
    params.type = activeTab.value
  }

  await albumStore.fetchMediaList(params)
}

onMounted(() => {
  loadData()
  if (babyStore.currentBaby) {
    albumStore.fetchMonthly(babyStore.currentBaby.id)
  }
})

// Tab 切换时重新加载
watch(activeTab, () => loadData())

// 预览图片
function handlePreview(item: Media, groupItems: Media[]) {
  // 只预览图片
  const images = groupItems.filter((m) => m.type === 'photo')
  const urls = images.map((m) => m.url)
  const startIndex = images.findIndex((m) => m.id === item.id)

  if (item.type === 'photo') {
    showImagePreview({
      images: urls,
      startPosition: Math.max(startIndex, 0),
    })
  }
}

// 长按删除
let longPressTimer: ReturnType<typeof setTimeout> | null = null
const LONG_PRESS_DURATION = 600 // 毫秒

function onTouchStart(item: Media) {
  longPressTimer = setTimeout(() => {
    handleDelete(item)
  }, LONG_PRESS_DURATION)
}

function onTouchEnd() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

async function handleDelete(item: Media) {
  try {
    const label = item.type === 'video' ? '这个视频' : '这张照片'
    await showConfirmDialog({
      title: '删除确认',
      message: `确定要删除${label}吗？删除后无法恢复。`,
    })
    await albumStore.deleteMedia(item.id)
    showToast('已删除')
    loadData()
  } catch {
    // 取消
  }
}

// 上传文件
async function handleUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0 || !babyStore.currentBaby) return

  uploading.value = true
  try {
    await albumStore.uploadMedia(babyStore.currentBaby.id, Array.from(files))
    showToast(`上传成功 ${files.length} 个文件`)
    loadData()
  } catch {
    showToast('上传失败')
  } finally {
    uploading.value = false
    input.value = ''
  }
}

function goBack() {
  router.back()
}

function formatVideoDuration(duration: number | null): string {
  if (!duration) return '00:00'
  const minute = Math.floor(duration / 60)
  const second = String(duration % 60).padStart(2, '0')
  return `${String(minute).padStart(2, '0')}:${second}`
}

function getAgeLabel(months: number): string {
  if (months <= 0) return '未满月'
  if (months === 1) return '满月'
  return `${months}个月`
}
</script>

<template>
  <div class="album-page min-h-screen bg-[var(--color-bg-secondary)] pb-5">
    <!-- 顶部导航 -->
    <div class="sticky top-0 z-30 album-nav">
      <div class="flex h-12 items-center justify-between px-3">
        <button class="touch-btn flex items-center justify-center border-none bg-transparent transition-transform active:scale-90" @click="goBack">
          <Icon icon="mdi:chevron-left" class="text-[26px] text-[#4c4f59]" />
        </button>
        <span class="text-[18px] font-bold text-[#2f3138]">云相册</span>
        <!-- 上传按钮 -->
        <label class="touch-btn flex cursor-pointer items-center justify-center transition-transform active:scale-90">
          <Icon
            icon="mdi:plus"
            class="text-[24px]"
            :class="uploading ? 'text-gray-300' : 'text-[#62656f]'"
          />
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            class="hidden"
            :disabled="uploading"
            @change="handleUpload"
          />
        </label>
      </div>

      <!-- Tab 筛选 -->
      <div class="flex items-center justify-between px-3 pb-1.5">
        <div class="flex gap-6">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="album-tab-btn border-none bg-transparent text-[16px]"
            :class="{ 'is-active': activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- 按月查看开关 -->
        <div class="flex items-center gap-2">
          <span class="text-[15px] text-[#5a5d66]">按月查看</span>
          <van-switch
            v-model="monthView"
            size="20px"
            active-color="#f48cab"
            inactive-color="#c9cbd2"
          />
        </div>
      </div>
    </div>

    <!-- 上传中提示 -->
    <div v-if="uploading" class="mx-3 mt-2 rounded-2xl bg-blue-50/80 p-2.5 text-center text-[13px] text-blue-500 backdrop-blur-sm">
      上传中...
    </div>

    <!-- 按月查看 -->
    <div v-if="monthView" class="mt-2 px-3">
      <div v-if="monthlyYearGroups.length > 0" class="space-y-4">
        <div
          v-for="yearGroup in monthlyYearGroups"
          :key="yearGroup.year"
        >
          <div
            v-if="yearGroup.year !== dayjs().format('YYYY')"
            class="px-1 pb-2 text-[30px] font-bold leading-none text-[#30323a]"
          >
            {{ yearGroup.year }}年
          </div>
          <div class="space-y-1.5">
            <div
              v-for="group in yearGroup.items"
              :key="group.month"
              class="album-month-row flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5"
            >
              <div class="h-[52px] w-[52px] overflow-hidden rounded-xl bg-[#f0f1f6]">
                <img
                  v-if="group.thumbnail_url"
                  :src="group.thumbnail_url"
                  class="h-full w-full object-cover"
                  alt=""
                />
                <div v-else class="flex h-full w-full items-center justify-center text-[#b7bbc5]">
                  <Icon icon="mdi:image-multiple-outline" class="text-[22px]" />
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-baseline gap-2">
                  <span class="text-[32px] font-bold leading-none text-[#2f3138]">
                    {{ dayjs(group.month + '-01').format('M月') }}
                  </span>
                  <span class="text-[15px] text-[#7a7e89]">{{ getAgeLabel(group.baby_age_months) }}</span>
                </div>
                <div class="mt-1 text-[13px] text-[#a5a9b3]">
                  {{ group.photo_count }}张照片，{{ group.video_count }}个视频
                </div>
              </div>
              <Icon icon="mdi:chevron-right" class="text-[22px] text-[#d0d3da]" />
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-20 text-[#b5b9c5] text-[13px]">暂无数据</div>
    </div>

    <!-- 日期分组列表 -->
    <div v-else class="mt-2 px-3">
      <!-- 加载状态 -->
      <div v-if="albumStore.loading" class="text-center py-20 text-[#b5b9c5] text-[13px]">
        加载中...
      </div>

      <!-- 有数据 -->
      <template v-else-if="dayGroups.length > 0">
        <div v-for="group in dayGroups" :key="group.date" class="mb-5">
          <!-- 日期标题 -->
          <div class="mb-2.5 flex items-end gap-2 px-1">
            <span class="text-[34px] font-bold leading-none text-[#2e3139]">{{ group.label }}</span>
            <span class="pb-1 text-[15px] text-[#8a8d97]">{{ group.monthAge }}</span>
          </div>

          <!-- 媒体网格 -->
          <div class="grid grid-cols-4 gap-[3px] overflow-hidden rounded-2xl">
            <div
              v-for="item in group.items"
              :key="item.id"
              class="album-grid-item aspect-square bg-[#f0f1f6] relative overflow-hidden"
              @click="handlePreview(item, group.items)"
              @touchstart.passive="onTouchStart(item)"
              @touchend.passive="onTouchEnd()"
              @touchmove.passive="onTouchEnd()"
              @contextmenu.prevent="handleDelete(item)"
            >
              <img
                :src="item.thumbnail_url || item.url"
                class="w-full h-full object-cover"
                loading="lazy"
                alt=""
              />
              <!-- 视频标记 -->
              <div
                v-if="item.type === 'video'"
                class="absolute inset-0 flex items-center justify-center"
              >
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
                  <Icon icon="mdi:play" class="text-lg text-white" />
                </div>
              </div>
              <!-- 视频时长 -->
              <div
                v-if="item.type === 'video'"
                class="absolute bottom-1 right-1 rounded-md bg-black/45 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm"
              >
                {{ formatVideoDuration(item.duration) }}
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-else class="text-center py-20">
        <div class="text-5xl mb-3 opacity-70">📸</div>
        <p class="text-[#b5b9c5] text-[13px]">还没有照片</p>
        <p class="text-[#d0d3dc] text-[12px] mt-1">点击右上角 + 上传</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.album-nav {
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
}

.album-page :deep(.van-switch__node) {
  box-shadow: 0 1px 3px rgb(0 0 0 / 18%);
}

.album-tab-btn {
  position: relative;
  height: 36px;
  color: #5a5d66;
  font-weight: 500;
  transition: color 0.25s ease;
}

.album-tab-btn.is-active {
  color: #f35f93;
  font-weight: 600;
}

.album-tab-btn.is-active::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #f9a0c0, #f35f93);
  content: "";
}

.album-month-row {
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  transition: background-color 0.15s ease;
}

.album-month-row:active {
  background-color: #fdf8fa;
}

.album-grid-item {
  transition: transform 0.15s ease;
}

.album-grid-item:active {
  transform: scale(0.97);
}
</style>
