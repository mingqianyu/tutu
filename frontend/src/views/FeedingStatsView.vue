<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import dayjs from 'dayjs'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useFeedingStore } from '@/stores/feeding'
import { useBabyStore } from '@/stores/baby'
import type { DailyStatItem } from '@/types'

// 注册 ECharts 组件
use([
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
])

const router = useRouter()
const feedingStore = useFeedingStore()
const babyStore = useBabyStore()

// 时间范围 Tab
const activeTab = ref<7 | 30>(7)
const statistics = ref<DailyStatItem[]>([])
const loading = ref(false)

// 日期范围
const dateRange = computed(() => {
  const end = dayjs().format('YYYY-MM-DD')
  const start = dayjs().subtract(activeTab.value - 1, 'day').format('YYYY-MM-DD')
  return { start, end }
})

// 加载统计数据
async function loadStats() {
  if (!babyStore.currentBaby) return

  loading.value = true
  try {
    statistics.value = await feedingStore.fetchStatistics(
      babyStore.currentBaby.id,
      dateRange.value.start,
      dateRange.value.end
    )
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
})

watch(activeTab, () => {
  loadStats()
})

// 生成日期标签数组
const dateLabels = computed(() => {
  const labels: string[] = []
  for (let i = activeTab.value - 1; i >= 0; i--) {
    labels.push(dayjs().subtract(i, 'day').format('MM/DD'))
  }
  return labels
})

// 日期 key 数组（用于数据匹配）
const dateKeys = computed(() => {
  const keys: string[] = []
  for (let i = activeTab.value - 1; i >= 0; i--) {
    keys.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'))
  }
  return keys
})

// 工具函数：按日期和类型提取数据
function getDataByType(types: string[], field: 'total_amount' | 'total_duration' | 'count'): number[] {
  return dateKeys.value.map((date) => {
    const items = statistics.value.filter(
      (s) => s.date === date && types.includes(s.type)
    )
    return items.reduce((sum, item) => sum + (Number(item[field]) || 0), 0)
  })
}

// 每日奶量柱状图配置
const milkChartOption = computed(() => ({
  title: { text: '每日奶量 (ml)', textStyle: { fontSize: 14, color: '#333' }, left: 'center' },
  tooltip: { trigger: 'axis' },
  grid: { left: 50, right: 20, bottom: 30, top: 40 },
  xAxis: { type: 'category', data: dateLabels.value, axisLabel: { fontSize: 10 } },
  yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
  series: [
    {
      name: '瓶喂母乳',
      type: 'bar',
      stack: 'milk',
      data: getDataByType(['bottle_milk'], 'total_amount'),
      itemStyle: { color: '#FF8FA0' },
      barMaxWidth: 20,
    },
    {
      name: '配方奶',
      type: 'bar',
      stack: 'milk',
      data: getDataByType(['formula'], 'total_amount'),
      itemStyle: { color: '#FFBCC8' },
      barMaxWidth: 20,
    },
  ],
  legend: {
    bottom: 0,
    textStyle: { fontSize: 10 },
  },
}))

// 每日睡眠时长趋势图配置
const sleepChartOption = computed(() => {
  const durationData = getDataByType(['sleep'], 'total_duration')
  // 秒转小时
  const hoursData = durationData.map((d) => Number((d / 3600).toFixed(1)))

  return {
    title: { text: '每日睡眠 (小时)', textStyle: { fontSize: 14, color: '#333' }, left: 'center' },
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, bottom: 20, top: 40 },
    xAxis: { type: 'category', data: dateLabels.value, axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [
      {
        name: '睡眠',
        type: 'line',
        data: hoursData,
        smooth: true,
        itemStyle: { color: '#9B7FD4' },
        areaStyle: { color: 'rgba(155, 127, 212, 0.15)' },
      },
    ],
  }
})

// 每日喂养次数统计配置
const feedCountChartOption = computed(() => ({
  title: { text: '每日喂养次数', textStyle: { fontSize: 14, color: '#333' }, left: 'center' },
  tooltip: { trigger: 'axis' },
  grid: { left: 50, right: 20, bottom: 30, top: 40 },
  xAxis: { type: 'category', data: dateLabels.value, axisLabel: { fontSize: 10 } },
  yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
  series: [
    {
      name: '母乳',
      type: 'bar',
      stack: 'feed',
      data: getDataByType(['breast_milk'], 'count'),
      itemStyle: { color: '#FF6B8A' },
      barMaxWidth: 20,
    },
    {
      name: '奶瓶',
      type: 'bar',
      stack: 'feed',
      data: getDataByType(['bottle_milk', 'formula'], 'count'),
      itemStyle: { color: '#FF8FA0' },
      barMaxWidth: 20,
    },
    {
      name: '辅食',
      type: 'bar',
      stack: 'feed',
      data: getDataByType(['solid_food'], 'count'),
      itemStyle: { color: '#FFA64D' },
      barMaxWidth: 20,
    },
  ],
  legend: {
    bottom: 0,
    textStyle: { fontSize: 10 },
  },
}))

function goBack() {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-[#faf5f7] to-[#f5f0f3]">
    <!-- 顶部导航 -->
    <div class="sticky top-0 z-30 stats-nav">
      <div class="flex items-center justify-between px-4 h-12">
        <button class="p-1 bg-transparent border-none transition-transform active:scale-90" @click="goBack">
          <Icon icon="mdi:chevron-left" class="text-2xl text-gray-600" />
        </button>
        <span class="font-bold text-[16px] text-[#2f3139]">喂养统计</span>
        <div class="w-8"></div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="flex justify-center gap-3 py-3">
      <button
        class="stats-tab px-6 py-2 rounded-full text-[13px] font-medium border-none transition-all active:scale-95"
        :class="activeTab === 7 ? 'is-active' : 'bg-white text-[#7a7e89]'"
        @click="activeTab = 7"
      >
        近 7 天
      </button>
      <button
        class="stats-tab px-6 py-2 rounded-full text-[13px] font-medium border-none transition-all active:scale-95"
        :class="activeTab === 30 ? 'is-active' : 'bg-white text-[#7a7e89]'"
        @click="activeTab = 30"
      >
        近 30 天
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-20 text-[#b5b9c5] text-[13px]">
      加载中...
    </div>

    <!-- 图表区域 -->
    <div v-else class="px-4 pb-8 space-y-5">
      <!-- 每日奶量 -->
      <div class="stats-chart-card bg-white rounded-[20px] p-4">
        <VChart :option="milkChartOption" style="height: 220px" autoresize />
      </div>

      <!-- 每日睡眠 -->
      <div class="stats-chart-card bg-white rounded-[20px] p-4">
        <VChart :option="sleepChartOption" style="height: 220px" autoresize />
      </div>

      <!-- 每日喂养次数 -->
      <div class="stats-chart-card bg-white rounded-[20px] p-4">
        <VChart :option="feedCountChartOption" style="height: 220px" autoresize />
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-nav {
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
}

.stats-tab {
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
}

.stats-tab.is-active {
  background: linear-gradient(135deg, #f9a0c0, #f35f93);
  color: #fff;
  box-shadow: 0 4px 14px rgb(243 95 147 / 28%);
}

.stats-chart-card {
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
}
</style>
